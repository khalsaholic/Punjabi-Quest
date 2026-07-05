(function(){
  'use strict';

  const STORAGE_KEY = 'punjabiQuest.v1.2.state';
  const LEGACY_STORAGE_KEYS = ['punjabiQuest.v1.1.state', 'punjabiQuest.v1.state'];
  const TODAY = () => new Date().toISOString().slice(0,10);
  const DAY = 24 * 60 * 60 * 1000;

  const APP = document.getElementById('app');
  const DATA = window.PQ_COURSE;
  const ALPHABET = window.PQ_ALPHABET || [];
  const VOWELS = window.PQ_VOWELS || [];
  const STORIES = window.PQ_STORIES || [];
  const CONVERSATIONS = window.PQ_CONVERSATIONS || [];
  const FEED = window.PQ_FEED || [];
  const MISSIONS = window.PQ_MISSIONS || [];

  const PAPA_JI = {
    name: 'Papa Ji',
    guide: 'assets/characters/papa-ji-guide.png',
    correct: 'assets/characters/papa-ji-correct.png',
    incorrect: 'assets/characters/papa-ji-incorrect.png',
    complete: 'assets/characters/papa-ji-complete.png',
    listening: 'assets/characters/papa-ji-listening.png',
    thinking: 'assets/characters/papa-ji-thinking.png',
    battle: 'assets/characters/papa-ji-battle.png',
    review: 'assets/characters/papa-ji-review.png'
  };

  function deepClone(obj){ return typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)); }

  const DEFAULT_PROFILES = {
    sujaan: {
      id: 'sujaan', name: 'Sujaan', avatar: '🐯', className: 'sujaan', pin: '0815', isGuest: false,
      createdAt: TODAY(), progress: emptyProgress()
    },
    guntaas: {
      id: 'guntaas', name: 'Guntaas', avatar: '🌸', className: 'guntaas', pin: '0731', isGuest: false,
      createdAt: TODAY(), progress: emptyProgress()
    },
    guest: {
      id: 'guest', name: 'Guest', avatar: '✨', className: 'guest', pin: '', isGuest: true,
      createdAt: TODAY(), progress: emptyProgress(true)
    }
  };

  let state = loadState();
  let activeProfile = null;
  let activeTab = 'learn';
  let selectedWorldId = 'w1';
  let lessonSession = null;
  let storySession = null;
  let convoSession = null;
  let battleSession = null;
  let speechVoices = [];
  let traceCtx = null;
  let traceDrawing = false;
  let activeRecognition = null;
  let lastSpeechHeard = '';
  let cloud = {
    configured: false,
    initialized: false,
    online: navigator.onLine,
    user: null,
    auth: null,
    db: null,
    messaging: null,
    unsubscribe: null,
    saveTimer: null,
    lastSyncedAt: null,
    status: 'Local only',
    suppressSave: false,
    initialRemoteHandled: false,
    pushToken: null,
    persistence: 'localStorage'
  };

  function emptyProgress(guest=false){
    return {
      xp: 0,
      coins: 0,
      streak: 0,
      bestStreak: 0,
      lastPracticeDate: null,
      weeklyGoal: 5,
      completedLessons: [],
      lessonScores: {},
      knownItems: {},
      reviewItems: {},
      mistakes: [],
      completedStories: [],
      completedConversations: [],
      completedMissions: [],
      badges: [],
      skillStats: {},
      settings: {
        showTransliteration: false,
        showEnglish: false,
        slowAudio: false,
        voiceURI: '',
        speechRate: 0.86,
        reducedMotion: false,
        highContrast: false
      },
      temporaryGuest: guest
    };
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        parsed.version = parsed.version || '1.2.2';
        parsed.deviceId = parsed.deviceId || getDeviceId();
        parsed.parentPin = parsed.parentPin || '';
        parsed.updatedAt = parsed.updatedAt || new Date().toISOString();
        parsed.profiles = parsed.profiles || {};
        for(const [id, p] of Object.entries(DEFAULT_PROFILES)){
          if(!parsed.profiles[id]) parsed.profiles[id] = p;
          parsed.profiles[id].progress = mergeProgress(parsed.profiles[id].progress || {});
        }
        return parsed;
      }
    } catch(err){ console.warn('Could not load progress', err); }
    return migrateLegacyState() || { version: '1.2.2', selectedProfileId: null, profiles: deepClone(DEFAULT_PROFILES), parentPin: '', updatedAt: new Date().toISOString(), deviceId: getDeviceId() };
  }

  function mergeProgress(p){
    return Object.assign(emptyProgress(), p, {
      settings: Object.assign(emptyProgress().settings, p.settings || {}),
      completedLessons: p.completedLessons || [],
      lessonScores: p.lessonScores || {},
      knownItems: p.knownItems || {},
      reviewItems: p.reviewItems || {},
      mistakes: p.mistakes || [],
      completedStories: p.completedStories || [],
      completedConversations: p.completedConversations || [],
      completedMissions: p.completedMissions || [],
      badges: p.badges || [],
      skillStats: p.skillStats || {}
    });
  }

  function saveState(options={}){
    try {
      state.version = '1.2.2';
      state.updatedAt = new Date().toISOString();
      state.deviceId = state.deviceId || getDeviceId();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if(!options.localOnly && !cloud.suppressSave) queueCloudSave();
    }
    catch(err){ toast('Progress could not save on this device.'); }
  }

  function init(){
    setupVoices();
    initConnectivityWatch();
    initCloud();
    if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(() => {}); }
    document.addEventListener('click', handlePunjabiAudioClick, true);
    if(state.selectedProfileId && state.profiles[state.selectedProfileId]) {
      activeProfile = state.profiles[state.selectedProfileId];
      selectedWorldId = getCurrentWorldId(activeProfile.progress);
      renderApp();
    } else {
      renderProfileSelector();
    }
  }


  function handlePunjabiAudioClick(e){
    const el = e.target.closest && e.target.closest('.punjabi, [lang="pa"]');
    if(!el || !APP.contains(el)) return;
    if(e.target.closest('[data-choice], [data-tile], .story-token, [data-speak], [data-slow]')) return;
    const text = (el.dataset.speak || el.textContent || '').trim();
    if(!text) return;
    // Let the normal button/choice behavior continue, but also make Punjabi tappable everywhere.
    setTimeout(() => speak(text), 0);
  }

  function setupVoices(){
    const update = () => { speechVoices = window.speechSynthesis ? speechSynthesis.getVoices() : []; };
    if('speechSynthesis' in window){
      update();
      speechSynthesis.onvoiceschanged = update;
    }
  }

  function h(str){
    return String(str ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function renderProfileSelector(){
    const profiles = Object.values(state.profiles);
    APP.innerHTML = `
      <main class="center-page">
        <section class="auth-card">
          <div class="brand-row">
            <div class="logo-lockup">
              <div class="logo punjabi">ਪ</div>
              <div>
                <div class="eyebrow">Punjabi Quest v1.2.2 · Guided by Papa Ji</div>
                <h1>Choose your player</h1>
                <p class="muted">Read, speak, listen, earn XP, and build Punjabi power.</p>
              </div>
            </div>
            <button class="btn secondary" data-action="sound-test">🔊 Test audio</button>
          </div>
          ${papaWelcomeHtml()}
          <div class="grid profile-grid">
            ${profiles.map(p => `
              <button class="profile-tile" data-profile="${h(p.id)}">
                <div>
                  <div class="avatar ${h(p.className || '')}">${h(p.avatar)}</div>
                  <h3>${h(p.name)}</h3>
                  <p class="muted">${p.isGuest ? 'Temporary practice' : 'PIN protected progress'}</p>
                </div>
                <span class="lock-dot">${p.isGuest ? '✨ No PIN' : '🔒 PIN required'}</span>
              </button>
            `).join('')}
          </div>
          <div class="cloud-card" style="margin-top:14px">
            <div><strong>☁️ Cloud sync:</strong> ${cloudStatusText()}</div>
            <div class="button-row"><button class="btn secondary" data-cloud-login>${cloud.user ? 'Cloud account' : 'Parent login'}</button></div>
          </div>
        </section>
      </main>`;
    APP.querySelectorAll('[data-profile]').forEach(btn => btn.addEventListener('click', () => chooseProfile(btn.dataset.profile)));
    APP.querySelector('[data-action="sound-test"]').addEventListener('click', () => speak('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਪੰਜਾਬੀ ਕਵੈਸਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।'));
    APP.querySelector('[data-cloud-login]')?.addEventListener('click', showCloudLoginModal);
  }

  function chooseProfile(id){
    const p = state.profiles[id];
    if(!p) return;
    if(p.pin){ showPinModal(p); }
    else selectProfile(p.id);
  }

  function showPinModal(profile){
    const modal = createModal(`
      <div class="eyebrow">Player PIN</div>
      <h2>${h(profile.avatar)} ${h(profile.name)}</h2>
      <p class="muted">Enter the 4-digit PIN to open this progress profile.</p>
      <div class="pin-row">
        <input class="text-input" id="pinInput" inputmode="numeric" maxlength="4" type="password" placeholder="••••" aria-label="PIN" />
        <button class="btn primary" id="pinSubmit">Open</button>
      </div>
      <div class="button-row"><button class="btn secondary" data-close-modal>Cancel</button></div>
    `);
    const input = modal.querySelector('#pinInput');
    const submit = () => {
      if(input.value === profile.pin){ closeModal(); selectProfile(profile.id); }
      else toast('PIN did not match. Try again.');
    };
    input.focus();
    input.addEventListener('keydown', e => { if(e.key === 'Enter') submit(); });
    modal.querySelector('#pinSubmit').addEventListener('click', submit);
  }

  function selectProfile(id){
    activeProfile = state.profiles[id];
    state.selectedProfileId = id;
    selectedWorldId = getCurrentWorldId(activeProfile.progress);
    saveState();
    renderApp();
  }

  function renderApp(){
    if(!activeProfile){ renderProfileSelector(); return; }
    const p = activeProfile.progress;
    applyAccessibilitySettings();
    APP.innerHTML = `
      <header class="topbar">
        <div class="topbar-inner">
          <div class="player-chip">
            <div class="avatar ${h(activeProfile.className || '')}">${h(activeProfile.avatar)}</div>
            <div>
              <div>${h(activeProfile.name)}</div>
              <div class="small">${getCurrentWorldTitle(p)} · ${DATA.lessonCount} lesson path</div>
            </div>
          </div>
          <div class="stat-row">
            <span class="stat-pill">🔥 ${p.streak || 0}</span>
            <span class="stat-pill">⭐ ${p.xp || 0} XP</span>
            <span class="stat-pill">💎 ${p.coins || 0}</span>
            <span class="stat-pill">❤️ 5</span>
            <button class="stat-pill cloud-pill" data-cloud-status title="Cloud sync status">${cloudStatusIcon()} ${h(cloudStatusShort())}</button>
          </div>
        </div>
      </header>
      <main class="app-layout" id="mainView"></main>
      <nav class="tabs" aria-label="Main navigation">
        ${tabButton('learn','🛤️','Learn')}
        ${tabButton('daily','⚡','Daily')}
        ${tabButton('practice','🎯','Review')}
        ${tabButton('alphabet','🔤','Letters')}
        ${tabButton('stories','📚','Stories')}
        ${tabButton('speak','🗣️','Speak')}
        ${tabButton('battle','☬','Battle')}
        ${tabButton('parent','📊','Parent')}
      </nav>`;
    APP.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => { activeTab = btn.dataset.tab; renderCurrentTab(); }));
    APP.querySelector('[data-cloud-status]')?.addEventListener('click', showCloudLoginModal);
    renderCurrentTab();
  }

  function tabButton(tab, icon, label){
    return `<button class="tab ${activeTab===tab?'active':''}" data-tab="${tab}"><span class="icon">${icon}</span><span>${label}</span></button>`;
  }

  function renderCurrentTab(){
    const main = document.getElementById('mainView');
    if(!main) return;
    APP.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === activeTab));
    if(activeTab === 'learn') renderLearn(main);
    if(activeTab === 'daily') renderDaily(main);
    if(activeTab === 'practice') renderPractice(main);
    if(activeTab === 'alphabet') renderAlphabet(main);
    if(activeTab === 'stories') renderStories(main);
    if(activeTab === 'speak') renderSpeak(main);
    if(activeTab === 'battle') renderBattle(main);
    if(activeTab === 'parent') renderParent(main);
  }

  function getCurrentLesson(progress){
    const completed = new Set(progress.completedLessons || []);
    return DATA.lessons.find(l => !completed.has(l.id)) || DATA.lessons[DATA.lessons.length - 1];
  }
  function getCurrentWorldId(progress){ return getCurrentLesson(progress).worldId; }
  function getCurrentWorldTitle(progress){ return DATA.worlds.find(w => w.id === getCurrentWorldId(progress))?.title || 'Punjabi Quest'; }
  function isLessonUnlocked(lesson, progress){
    if(lesson.globalIndex === 0) return true;
    const prev = DATA.lessons[lesson.globalIndex - 1];
    return progress.completedLessons.includes(prev.id) || progress.completedLessons.includes(lesson.id);
  }
  function isLessonCurrent(lesson, progress){ return getCurrentLesson(progress).id === lesson.id; }

  function renderLearn(main){
    const p = activeProfile.progress;
    const current = getCurrentLesson(p);
    const world = DATA.worlds.find(w => w.id === selectedWorldId) || DATA.worlds[0];
    const worldLessons = DATA.lessons.filter(l => l.worldId === world.id);
    main.innerHTML = `
      <section class="hero">
        <div class="hero-card">
          <div class="eyebrow">Punjabi Quest</div>
          <h1>Ready for 5 minutes of Punjabi?</h1>
          <p class="muted">Today’s best next step is chosen from the course path and review history.</p>
          <div class="button-row">
            <button class="btn primary big" data-start="${h(current.id)}">Start next lesson</button>
            <button class="btn secondary big" data-action="due-review">Review due words</button>
            <button class="btn mango big" data-action="daily-challenge">Daily Challenge</button>
          </div>
          ${papaInlineHtml('guide', 'Papa Ji says: start with the next lesson, or review weak words to make them stronger.')}
        </div>
        <div class="hero-side">
          <div class="recommend-card">
            <div class="eyebrow" style="color:#bcffb2">Recommended</div>
            <h2>${h(current.emoji)} ${h(current.title)}</h2>
            <p class="muted">${h(current.subtitle)}</p>
            <p class="small">${h(current.estimatedMinutes)} minutes · +${current.xp} XP · ${dueReviewItems().length} review items due</p>
          </div>
          <div class="panel" style="margin:0;">
            <strong>Progress:</strong> ${p.completedLessons.length} of ${DATA.lessonCount} lessons completed.
            <div class="bar" style="margin-top:10px"><span style="width:${Math.round((p.completedLessons.length/DATA.lessonCount)*100)}%"></span></div>
          </div>
        </div>
      </section>
      <section>
        <div class="eyebrow">World map</div>
        <h2>Choose a Punjabi path</h2>
        <div class="world-selector">
          ${DATA.worlds.map(w => `<button class="world-pill ${w.id===world.id?'active':''}" data-world="${h(w.id)}">${h(w.emoji)} ${h(w.title)}</button>`).join('')}
        </div>
        <div class="lesson-path">
          ${worldLessons.map(lesson => lessonNode(lesson,p)).join('')}
        </div>
      </section>`;
    main.querySelectorAll('[data-world]').forEach(btn => btn.addEventListener('click', () => { selectedWorldId = btn.dataset.world; renderLearn(main); }));
    main.querySelectorAll('[data-start]').forEach(btn => btn.addEventListener('click', () => startLesson(btn.dataset.start)));
    main.querySelector('[data-action="due-review"]')?.addEventListener('click', () => startReviewSession());
    main.querySelector('[data-action="daily-challenge"]')?.addEventListener('click', () => startDailyChallenge());
  }

  function lessonNode(lesson, p){
    const done = p.completedLessons.includes(lesson.id);
    const current = isLessonCurrent(lesson, p);
    const unlocked = isLessonUnlocked(lesson, p);
    return `<article class="lesson-node ${done?'done':''} ${current?'current':''} ${unlocked?'':'locked'}">
      <div class="lesson-badge">${done?'✓':lesson.emoji}</div>
      <div>
        <div class="eyebrow">${h(lesson.levelLabel)}</div>
        <div class="lesson-title">${h(lesson.title)}</div>
        <p class="muted" style="margin-bottom:6px">${h(lesson.subtitle)}</p>
        <div class="lesson-meta">${lesson.words.length} words · ${lesson.phrases.length} phrases · ${lesson.letters.length} letters</div>
      </div>
      ${unlocked ? `<button class="btn ${current?'primary':'secondary'}" data-start="${h(lesson.id)}">${done?'Review':'Play'}</button>` : '<span class="locked-tag">Locked</span>'}
    </article>`;
  }

  function startLesson(lessonId){
    const lesson = DATA.lessons.find(l => l.id === lessonId);
    if(!lesson) return;
    if(!isLessonUnlocked(lesson, activeProfile.progress)){ toast('Finish the earlier lesson first.'); return; }
    lessonSession = {
      mode: 'lesson', lesson, index: 0, hearts: 5, xp: 0, coins: 0,
      correct: 0, wrong: 0, selected: null, built: [], checked: false,
      exercises: buildExercises(lesson)
    };
    renderLessonScreen();
  }

  function buildExercises(lesson){
    const ex=[];
    const words = lesson.words;
    const phrases = lesson.phrases;
    const letters = lesson.letters;
    const randomVocab = DATA.vocab;
    const gender = activeProfile.id === 'guntaas' ? 'f' : 'm';
    const usablePhrases = phrases.filter(p => p.gender === 'both' || p.gender === gender || !p.gender);
    const phraseList = usablePhrases.length ? usablePhrases : phrases;
    words.slice(0,3).forEach(w => ex.push({type:'chooseMeaning', item:w, prompt:'What does this Punjabi word mean?', target:w.english, choices:makeChoices(w.english, randomVocab.map(v=>v.english))}));
    if(words[3]) ex.push({type:'choosePunjabi', item:words[3], prompt:'Choose the Punjabi word.', target:words[3].gurmukhi, choices:makeChoices(words[3].gurmukhi, randomVocab.map(v=>v.gurmukhi))});
    if(letters[0]) ex.push({type:'letterName', item:letters[0], prompt:'What is the name of this Gurmukhi letter?', target:letters[0].name, choices:makeChoices(letters[0].name, ALPHABET.map(a=>a.name))});
    if(words[4]) ex.push({type:'listenChoose', item:words[4], prompt:'Listen and choose the Punjabi word.', target:words[4].gurmukhi, choices:makeChoices(words[4].gurmukhi, randomVocab.map(v=>v.gurmukhi))});
    if(phraseList[0]) ex.push({type:'tileSentence', item:phraseList[0], prompt:'Build the Punjabi sentence.', target:phraseList[0].gurmukhi});
    if(phraseList[1]) ex.push({type:'speakPhrase', item:phraseList[1], prompt:'Speak this Punjabi phrase.', target:phraseList[1].gurmukhi});
    if(lesson.number % 5 === 0 && phraseList[2]) ex.push({type:'typePunjabi', item:phraseList[2], prompt:'Type or copy the Punjabi phrase you hear.', target:phraseList[2].gurmukhi});
    if(lesson.number % 10 === 0){
      const due = dueReviewItems().slice(0,3);
      due.forEach(item => ex.push(reviewToExercise(item)));
    }

    const cumulative = getCumulativeLessonContent(lesson);
    if(cumulative.phrases.length || cumulative.words.length){
      ex.push(buildProfileDialogueExercise(lesson, cumulative));
    }
    if(cumulative.words.length >= 3){
      const oldWord = shuffle(cumulative.words)[0];
      if(oldWord && !words.some(w => w.id === oldWord.id)) ex.push({type:'chooseMeaning', item:oldWord, prompt:'Review an earlier Punjabi word.', target:oldWord.english, choices:makeChoices(oldWord.english, randomVocab.map(v=>v.english))});
    }
    return shuffle(ex).slice(0, lesson.number % 10 === 0 ? 10 : 8);
  }


  function getCumulativeLessonContent(currentLesson){
    const maxIndex = typeof currentLesson?.globalIndex === 'number' ? currentLesson.globalIndex : DATA.lessons.length;
    const completed = new Set(activeProfile?.progress?.completedLessons || []);
    const lessonPool = DATA.lessons.filter(l => completed.has(l.id) || l.globalIndex <= maxIndex);
    return {
      words: uniqueObjects(lessonPool.flatMap(l => l.words || []), x => x.id || x.gurmukhi),
      phrases: uniqueObjects(lessonPool.flatMap(l => l.phrases || []), x => x.id || x.gurmukhi),
      letters: uniqueObjects(lessonPool.flatMap(l => l.letters || []), x => x.letter || x.id)
    };
  }

  function buildProfileDialogueExercise(lesson, cumulative){
    const name = activeProfile?.name || 'Learner';
    const gender = activeProfile?.id === 'guntaas' ? 'f' : 'm';
    const phrase = shuffle((cumulative.phrases || []).filter(p => !p.gender || p.gender === 'both' || p.gender === gender))[0] || lesson.phrases?.[0];
    const fallbackChoices = DATA.phrases.filter(p => !p.gender || p.gender === 'both' || p.gender === gender).map(p => p.gurmukhi);
    const target = phrase?.gurmukhi || 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ।';
    const speaker = dialogueSpeakerForLesson(lesson);
    const prompt = dialoguePromptForLesson(lesson, speaker);
    return { type:'profileDialogue', item: phrase, speaker, promptLine: prompt.pa, promptTr: prompt.tr, promptEn: prompt.en, prompt:'Choose your reply in Punjabi.', target, choices:makeChoices(target, fallbackChoices) };
  }

  function dialogueSpeakerForLesson(lesson){
    const theme = lesson?.theme || DATA.worlds.find(w => w.id === lesson?.worldId)?.theme || '';
    if(theme === 'family') return 'Dadi Ji';
    if(theme === 'school') return 'Teacher';
    if(theme === 'food') return 'Mummy';
    if(theme === 'sikh') return 'Seva Uncle';
    if(theme === 'culture') return 'Bhua Ji';
    return 'Friend';
  }

  function dialoguePromptForLesson(lesson, speaker){
    const theme = lesson?.theme || DATA.worlds.find(w => w.id === lesson?.worldId)?.theme || '';
    if(theme === 'school') return {pa:'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਤੂੰ ਸਕੂਲ ਜਾਂਦਾ ਹੈਂ?', tr:'Sat Sri Akaal. Tu school jaanda hain?', en:'Hello. Do you go to school?'};
    if(theme === 'food') return {pa:'ਤੈਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ?', tr:'Tainu ki chaahida hai?', en:'What do you want?'};
    if(theme === 'family') return {pa:'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਬੱਚੇ। ਤੂੰ ਕਿਵੇਂ ਹੈਂ?', tr:'Sat Sri Akaal, bachche. Tu kiven hain?', en:'Hello, child. How are you?'};
    return {pa:'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਤੂੰ ਕਿਵੇਂ ਹੈਂ?', tr:'Sat Sri Akaal. Tu kiven hain?', en:'Hello. How are you?'};
  }

  function reviewToExercise(ri){
    return { type:'chooseMeaning', item:ri, prompt:'Review: what does this mean?', target:ri.english, choices:makeChoices(ri.english, DATA.vocab.map(v=>v.english).concat(DATA.phrases.map(p=>p.english))) };
  }

  function makeChoices(correct, pool){
    const set = new Set([correct]);
    const shuffled = shuffle(pool.filter(x => x && x !== correct));
    for(const x of shuffled){ if(set.size >= 4) break; set.add(x); }
    return shuffle(Array.from(set));
  }
  function shuffle(arr){ return [...arr].sort(() => Math.random() - 0.5); }

  function renderLessonScreen(){
    const s = lessonSession;
    const ex = s.exercises[s.index];
    const total = s.exercises.length;
    APP.innerHTML = `<main class="lesson-screen ${activeProfile.progress.settings.showTransliteration?'show-translit':''}">
      <div class="lesson-top">
        <button class="btn ghost round" data-action="exit-lesson">×</button>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((s.index/total)*100)}%"></div></div>
        <span class="stat-pill">❤️ ${s.hearts}</span>
      </div>
      <section class="lesson-card" id="exerciseCard"></section>
    </main>`;
    APP.querySelector('[data-action="exit-lesson"]').addEventListener('click', () => confirmExitLesson());
    renderExercise(ex);
  }

  function renderExercise(ex){
    const card = document.getElementById('exerciseCard');
    lessonSession.selected = null;
    lessonSession.built = [];
    lessonSession.checked = false;
    lessonSession.speechAttempts = 0;
    lessonSession.speechActive = false;
    lastSpeechHeard = '';
    let body = '';
    if(ex.type === 'chooseMeaning') body = chooseMeaningHtml(ex);
    if(ex.type === 'choosePunjabi') body = choosePunjabiHtml(ex);
    if(ex.type === 'listenChoose') body = listenChooseHtml(ex);
    if(ex.type === 'letterName') body = letterNameHtml(ex);
    if(ex.type === 'tileSentence') body = tileSentenceHtml(ex);
    if(ex.type === 'speakPhrase') body = speakPhraseHtml(ex);
    if(ex.type === 'typePunjabi') body = typePunjabiHtml(ex);
    if(ex.type === 'profileDialogue') body = profileDialogueHtml(ex);
    card.innerHTML = body + feedbackHtml();
    bindExerciseEvents(ex);
    if(ex.type === 'listenChoose') setTimeout(() => speak(getItemPunjabi(ex.item)), 300);
  }

  function promptBlock(ex, center=false){
    return `<div>
      <div class="eyebrow">Question ${lessonSession.index+1} of ${lessonSession.exercises.length}</div>
      <h2>${h(ex.prompt)}</h2>
      ${center ? '' : papaInlineHtml('guide', 'Papa Ji says: try the Gurmukhi first. Use Listen or Show transliteration only when you need help.')}
      ${center ? '' : `<p class="muted">Transliteration is hidden by default. Use help only when needed.</p>`}
    </div>`;
  }
  function itemHelp(item){
    return `<div class="translit">${h(item.translit || item.tr || '')}</div><div class="translation">${h(item.english || item.en || '')}</div>`;
  }
  function audioButtons(text){
    return `<div class="audio-row"><button class="btn secondary" data-speak="${h(text)}">🔊 Listen</button><button class="btn secondary" data-slow="${h(text)}">🐢 Slow</button><button class="btn ghost" data-toggle-translit>Show Transliteration</button><button class="btn ghost" data-toggle-translation>Show Translation</button></div>`;
  }

  function papaImage(kind='guide', alt='Papa Ji'){
    const src = PAPA_JI[kind] || PAPA_JI.guide;
    return `<img class="papa-img papa-${h(kind)}" src="${h(src)}" alt="${h(alt)}" loading="lazy">`;
  }

  function papaWelcomeHtml(){
    return `<div class="papa-welcome">
      <div class="papa-portrait">${papaImage('guide', 'Papa Ji, the Punjabi Quest guide')}</div>
      <div>
        <div class="eyebrow">Meet your guide</div>
        <h3>Papa Ji is here to help.</h3>
        <p class="muted">He gives warm tips, cheers for correct answers, gently helps with mistakes, and celebrates every lesson Sujaan and Guntaas complete.</p>
      </div>
    </div>`;
  }

  function papaInlineHtml(kind='guide', message=''){
    const clean = String(message || '').replace(/^Papa Ji\s*(says:|says|:)\s*/i, '');
    return `<div class="papa-inline papa-inline-${h(kind)}">
      <div class="papa-mini">${papaImage(kind, `Papa Ji ${kind}`)}</div>
      <div><strong>Papa Ji says:</strong> ${h(clean)}</div>
    </div>`;
  }

  function papaFeedbackHtml(kind, title, message, extra=''){
    return `<div class="papa-feedback">
      <div class="papa-feedback-art">${papaImage(kind, `Papa Ji ${title}`)}</div>
      <div class="papa-feedback-copy"><strong>${h(title)}</strong><p>${h(message)}</p>${extra}</div>
    </div>`;
  }
  function chooseMeaningHtml(ex){
    return `${promptBlock(ex)}<div class="prompt punjabi" lang="pa">${h(ex.item.gurmukhi || ex.item.text)}</div>${audioButtons(getItemPunjabi(ex.item))}<div class="choice-grid">${ex.choices.map(c=>`<button class="choice" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }
  function choosePunjabiHtml(ex){
    return `${promptBlock(ex)}<div class="prompt">${h(ex.item.english)}</div><div class="choice-grid">${ex.choices.map(c=>`<button class="choice punjabi" lang="pa" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }
  function listenChooseHtml(ex){
    return `${promptBlock(ex)}<div class="prompt" style="text-align:center">Tap listen, then choose what you heard.</div>${audioButtons(getItemPunjabi(ex.item))}<div class="choice-grid">${ex.choices.map(c=>`<button class="choice punjabi" lang="pa" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }
  function letterNameHtml(ex){
    return `${promptBlock(ex)}<div class="prompt punjabi" lang="pa">${h(ex.item.letter)}</div><p class="muted" style="text-align:center">Sound: <strong>${h(ex.item.sound)}</strong> · Word: <span lang="pa">${h(ex.item.word)}</span></p>${audioButtons(`${ex.item.letter}. ${ex.item.word}`)}<div class="choice-grid">${ex.choices.map(c=>`<button class="choice" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }
  function tileSentenceHtml(ex){
    const words = ex.target.replace(/[।?]/g,'').split(/\s+/).filter(Boolean);
    const bank = shuffle(words);
    return `${promptBlock(ex)}<div class="prompt">${h(ex.item.english)}</div>${audioButtons(ex.target)}<div class="answer-bank" id="answerBank"></div><div class="word-bank">${bank.map((w,i)=>`<button class="tile punjabi" lang="pa" data-tile-index="${i}" data-tile="${h(w)}">${h(w)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn secondary" data-action="clear-tiles">Clear</button><button class="btn primary" data-action="check">Check</button></div>`;
  }

  function profileDialogueHtml(ex){
    const learner = activeProfile?.name || 'Learner';
    return `${promptBlock(ex)}<div class="dialogue-line app"><strong>${h(ex.speaker)}:</strong><p class="punjabi" lang="pa">${h(ex.promptLine)}</p><p class="translit">${h(ex.promptTr)}</p><p class="translation">${h(ex.promptEn)}</p></div><div class="dialogue-line user"><strong>${h(learner)}:</strong><p class="muted">Choose your Punjabi reply.</p></div>${audioButtons(ex.promptLine)}<div class="choice-grid">${ex.choices.map(c=>`<button class="choice punjabi" lang="pa" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }

  function speakPhraseHtml(ex){
    return `${promptBlock(ex)}<div class="prompt punjabi" lang="pa">${h(ex.target)}</div>${itemHelp(ex.item)}${audioButtons(ex.target)}<div class="panel speaking-panel" style="box-shadow:none;background:#fbfff9"><strong>Speaking practice:</strong> listen first, then press <strong>Speak</strong>. The button changes to <strong>Check</strong> while the microphone is active.<div class="button-row" style="margin-top:12px"><button class="btn blue" data-action="listen-mic">🎤 Speak</button></div><p id="speechResult" class="speech-result">Heard: —</p><p class="small">You get up to 3 tries. Listen again before retrying if needed.</p></div><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check" disabled>Check</button></div>`;
  }
  function typePunjabiHtml(ex){
    return `${promptBlock(ex)}<div class="prompt" style="text-align:center">Listen, then type or copy the Punjabi phrase.</div>${audioButtons(ex.target)}<input class="text-input punjabi" lang="pa" id="typedAnswer" placeholder="Type Punjabi here"/><div class="lesson-bottom"><button class="btn ghost" data-action="skip">Skip</button><button class="btn primary" data-action="check">Check</button></div>`;
  }
  function feedbackHtml(){ return `<div id="feedback" class="feedback"></div>`; }

  function bindExerciseEvents(ex){
    APP.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.speak)));
    APP.querySelectorAll('[data-slow]').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.slow, {slow:true})));
    APP.querySelectorAll('[data-toggle-translit]').forEach(btn => btn.addEventListener('click', () => { const root=APP.querySelector('.lesson-screen') || APP.querySelector('#mainView') || APP; root.classList.toggle('show-translit'); btn.textContent = root.classList.contains('show-translit') ? 'Hide Transliteration' : 'Show Transliteration'; }));
    APP.querySelectorAll('[data-toggle-translation]').forEach(btn => btn.addEventListener('click', () => { const root=APP.querySelector('.lesson-screen') || APP.querySelector('#mainView') || APP; root.classList.toggle('show-translation'); btn.textContent = root.classList.contains('show-translation') ? 'Hide Translation' : 'Show Translation'; }));
    APP.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => {
      APP.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
      btn.classList.add('selected'); lessonSession.selected = btn.dataset.choice; if(btn.classList.contains('punjabi')) speak(btn.dataset.choice);
    }));
    APP.querySelectorAll('[data-tile]').forEach(btn => btn.addEventListener('click', () => {
      if(btn.classList.contains('used')) return;
      btn.classList.add('used');
      lessonSession.built.push(btn.dataset.tile);
      renderBuiltTiles();
    }));
    APP.querySelector('[data-action="clear-tiles"]')?.addEventListener('click', () => { lessonSession.built = []; APP.querySelectorAll('[data-tile]').forEach(b=>b.classList.remove('used')); renderBuiltTiles(); });
    APP.querySelector('[data-action="listen-mic"]')?.addEventListener('click', () => handleSpeechButton(ex));
    APP.querySelector('[data-action="check"]')?.addEventListener('click', () => checkExercise(ex));
    APP.querySelector('[data-action="skip"]')?.addEventListener('click', () => { markAnswer(ex, false, true); });
  }

  function renderBuiltTiles(){
    const bank = document.getElementById('answerBank');
    if(!bank) return;
    bank.innerHTML = lessonSession.built.map((w,i)=>`<button class="tile punjabi" data-remove-tile="${i}" lang="pa">${h(w)}</button>`).join('');
    bank.querySelectorAll('[data-remove-tile]').forEach(btn => btn.addEventListener('click', () => {
      const index = Number(btn.dataset.removeTile);
      const word = lessonSession.built[index];
      lessonSession.built.splice(index,1);
      const tile = Array.from(APP.querySelectorAll('[data-tile]')).find(t => t.dataset.tile === word && t.classList.contains('used'));
      if(tile) tile.classList.remove('used');
      renderBuiltTiles();
    }));
  }

  function checkExercise(ex){
    if(lessonSession.checked){ nextExercise(); return; }
    if(ex.type === 'speakPhrase') { evaluateSpeechExercise(ex); return; }
    let answer = lessonSession.selected;
    if(ex.type === 'tileSentence') answer = lessonSession.built.join(' ') + (/[।?]$/.test(ex.target) ? ex.target.slice(-1) : '');
    if(ex.type === 'typePunjabi') answer = document.getElementById('typedAnswer')?.value || '';
    const correct = normalize(answer) === normalize(ex.target) || (ex.type === 'speakPhrase' && lessonSession.selected === ex.target);
    markAnswer(ex, correct, false, answer);
  }

  function markAnswer(ex, correct, skipped=false, answer=''){
    lessonSession.checked = true;
    playAnswerSound(correct);
    if(correct){ lessonSession.correct++; lessonSession.xp += 5; strengthenItem(ex.item || ex, true); }
    else { lessonSession.wrong++; lessonSession.hearts = Math.max(1, lessonSession.hearts - 1); strengthenItem(ex.item || ex, false); addMistake(ex, answer, skipped); }
    const fb = document.getElementById('feedback');
    if(fb){
      fb.className = `feedback show ${correct?'good':'bad'}`;
      fb.innerHTML = correct
        ? papaFeedbackHtml('correct', 'Yay!', `Punjabi Power +5 XP. ${getCorrectFeedback()}`)
        : papaFeedbackHtml('incorrect', 'Oh No!', getIncorrectFeedback(), `<p>Correct answer: <span class="punjabi" lang="pa">${h(ex.target)}</span></p><p class="small">This will come back in review.</p>`);
    }
    APP.querySelectorAll('.choice').forEach(c => {
      if(normalize(c.dataset.choice) === normalize(ex.target)) c.classList.add('correct');
      else if(c.classList.contains('selected') && !correct) c.classList.add('wrong');
    });
    const check = APP.querySelector('[data-action="check"]');
    if(check){ check.disabled = false; check.textContent = lessonSession.index === lessonSession.exercises.length - 1 ? 'Finish' : 'Continue'; }
  }

  function nextExercise(){
    lessonSession.index++;
    if(lessonSession.index >= lessonSession.exercises.length){ completeLesson(); }
    else renderLessonScreen();
  }

  function completeLesson(){
    const p = activeProfile.progress;
    const lesson = lessonSession.lesson;
    const accuracy = lessonSession.correct / Math.max(1, lessonSession.correct + lessonSession.wrong);
    const baseXp = lesson.xp + lessonSession.xp + (accuracy >= .9 ? 10 : 0);
    const coins = lesson.coins + (accuracy >= .9 ? 5 : 0);
    p.xp += baseXp;
    p.coins += coins;
    const isCourseLesson = lessonSession.mode === 'lesson';
    if(isCourseLesson && !p.completedLessons.includes(lesson.id)) p.completedLessons.push(lesson.id);
    p.lessonScores[lesson.id] = { accuracy, completedAt: new Date().toISOString(), wrong: lessonSession.wrong, correct: lessonSession.correct, mode: lessonSession.mode, awardedXp: baseXp, awardedCoins: coins };
    updateStreak(p);
    updateBadges(p, lesson, accuracy);
    saveState();
    const next = isCourseLesson ? DATA.lessons[lesson.globalIndex + 1] : getCurrentLesson(p);
    APP.innerHTML = `<main class="center-page"><section class="auth-card" style="text-align:center">
      <div class="papa-complete-hero">${papaImage('complete', 'Papa Ji celebrating lesson completion')}</div>
      <div class="eyebrow">Lesson complete</div>
      <h1>Congratulations!</h1>
      <p class="muted"><strong>Papa Ji says:</strong> Fantastic work. You completed <strong>${h(lesson.title)}</strong>.</p>
      <div class="stat-row" style="justify-content:center;margin:18px 0"><span class="stat-pill">⭐ +${baseXp} XP</span><span class="stat-pill">💎 +${coins}</span><span class="stat-pill">🎯 ${Math.round(accuracy*100)}%</span><span class="stat-pill">🔥 ${p.streak}</span></div>
      <p>Punjabi Power is growing.</p>
      <div class="button-row" style="justify-content:center">
        ${next ? `<button class="btn primary big" data-start="${h(next.id)}">${isCourseLesson ? 'Next lesson' : 'Continue course'}</button>` : ''}
        <button class="btn secondary big" data-home>Lesson map</button>
        <button class="btn mango big" data-review>Mistake review</button>
      </div>
    </section></main>`;
    confetti();
    APP.querySelector('[data-start]')?.addEventListener('click', e => startLesson(e.currentTarget.dataset.start));
    APP.querySelector('[data-home]')?.addEventListener('click', () => { lessonSession=null; activeTab='learn'; renderApp(); });
    APP.querySelector('[data-review]')?.addEventListener('click', () => startReviewSession());
  }

  function updateStreak(p){
    const today = TODAY();
    if(p.lastPracticeDate === today) return;
    if(p.lastPracticeDate){
      const diff = Math.round((new Date(today) - new Date(p.lastPracticeDate)) / DAY);
      p.streak = diff === 1 ? (p.streak || 0) + 1 : 1;
    } else p.streak = 1;
    p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
    p.lastPracticeDate = today;
  }

  function updateBadges(p, lesson, accuracy){
    const add = (id,label) => { if(!p.badges.some(b=>b.id===id)) p.badges.push({id,label,earnedAt:TODAY()}); };
    add('first_lesson','First Punjabi Lesson');
    if(p.completedLessons.length >= 5) add('five_lessons','5 Lesson Star');
    if(p.completedLessons.length >= 25) add('world_one','World Finisher');
    if(accuracy >= .95) add('accuracy_star','Accuracy Star');
    if(lesson.skill === 'speaking') add('speaking_courage','Speaking Courage');
    if(p.streak >= 3) add('three_day','3-Day Streak');
    if(p.streak >= 7) add('seven_day','7-Day Streak');
  }

  function strengthenItem(item, correct){
    if(!item) return;
    const id = item.id || item.gurmukhi || item.text || item.target;
    const p = activeProfile.progress;
    const current = p.reviewItems[id] || {
      id, gurmukhi: item.gurmukhi || item.pa || item.text || item.target || '', english: item.english || item.en || '', translit: item.translit || item.tr || '',
      successes: 0, errors: 0, lastSeen: null, nextDue: TODAY(), interval: 1, kind: item.pos || 'item'
    };
    current.lastSeen = TODAY();
    if(correct){
      current.successes += 1;
      current.interval = Math.min(30, current.interval === 1 ? 3 : Math.round(current.interval * 1.8));
      current.nextDue = datePlus(current.interval);
      p.knownItems[id] = Object.assign({}, current, {strength: Math.min(100, (current.successes * 18) - (current.errors * 9) + 30)});
    } else {
      current.errors += 1;
      current.interval = 1;
      current.nextDue = TODAY();
    }
    p.reviewItems[id] = current;
  }

  function addMistake(ex, answer, skipped){
    const p = activeProfile.progress;
    p.mistakes.unshift({
      when: new Date().toISOString(),
      lessonId: lessonSession?.lesson?.id || 'review',
      type: ex.type,
      prompt: ex.prompt,
      target: ex.target,
      answer: answer || lessonSession.selected || '',
      skipped: !!skipped,
      item: ex.item || null
    });
    p.mistakes = p.mistakes.slice(0, 100);
  }

  function datePlus(days){ return new Date(Date.now() + days*DAY).toISOString().slice(0,10); }

  function dueReviewItems(){
    const p = activeProfile?.progress || emptyProgress();
    return Object.values(p.reviewItems || {}).filter(i => !i.nextDue || i.nextDue <= TODAY()).sort((a,b) => (b.errors||0) - (a.errors||0));
  }

  function startReviewSession(){
    const due = dueReviewItems();
    const recent = activeProfile.progress.mistakes.map(m => m.item).filter(Boolean);
    const source = due.length ? due : recent.length ? recent.slice(0,8) : DATA.vocab.slice(0,8);
    const fakeLesson = { id:'review', title:'Personal Review', xp:20, coins:8, worldId:selectedWorldId, globalIndex:-1, estimatedMinutes:5 };
    lessonSession = { mode:'review', lesson:fakeLesson, index:0, hearts:5, xp:0, coins:0, correct:0, wrong:0, selected:null, built:[], checked:false, exercises:source.slice(0,10).map(item => reviewToExercise(item)) };
    renderLessonScreen();
  }


  function renderDaily(main){
    const completedCount = activeProfile.progress.completedLessons.length;
    const available = getCompletedLessonContent();
    main.innerHTML = `<section class="hero-card daily-card"><div class="eyebrow">Daily Challenge</div><h1>Mix yesterday’s Punjabi with today’s power</h1><p class="muted">Daily Challenge only uses completed lessons. It mixes old words, sentences, listening, and speaking in new ways.</p>${papaInlineHtml('review', completedCount ? 'review completed lessons, then use old Punjabi in new combinations.' : 'complete your first lesson to unlock Daily Challenge.')}<div class="button-row"><button class="btn primary big" data-action="start-daily" ${completedCount ? '' : 'disabled'}>Start Daily Challenge</button><button class="btn secondary big" data-action="due-review">Review due words</button></div><p class="small">Unlocked content: ${completedCount} completed lessons · ${available.words.length} words · ${available.phrases.length} phrases</p></section>`;
    main.querySelector('[data-action="start-daily"]')?.addEventListener('click', startDailyChallenge);
    main.querySelector('[data-action="due-review"]')?.addEventListener('click', startReviewSession);
  }

  function getCompletedLessonContent(){
    const completed = new Set(activeProfile?.progress?.completedLessons || []);
    const lessons = DATA.lessons.filter(l => completed.has(l.id));
    return {
      lessons,
      words: uniqueObjects(lessons.flatMap(l => l.words || []), x => x.id || x.gurmukhi),
      phrases: uniqueObjects(lessons.flatMap(l => l.phrases || []), x => x.id || x.gurmukhi),
      letters: uniqueObjects(lessons.flatMap(l => l.letters || []), x => x.letter || x.id)
    };
  }

  function startDailyChallenge(){
    const available = getCompletedLessonContent();
    if(!available.lessons.length){ toast('Complete one lesson first.'); activeTab='learn'; renderApp(); return; }
    const fakeLesson = { id:'daily-'+TODAY(), title:'Daily Challenge', xp:35, coins:12, worldId:selectedWorldId, globalIndex:-1, estimatedMinutes:6 };
    const exercises = [];
    const words = shuffle(available.words).slice(0,5);
    words.slice(0,2).forEach(w => exercises.push({type:'chooseMeaning', item:w, prompt:'Daily mix: what does this mean?', target:w.english, choices:makeChoices(w.english, available.words.map(v=>v.english).concat(DATA.vocab.map(v=>v.english)))}));
    if(words[2]) exercises.push({type:'choosePunjabi', item:words[2], prompt:'Daily mix: choose the Punjabi word.', target:words[2].gurmukhi, choices:makeChoices(words[2].gurmukhi, available.words.map(v=>v.gurmukhi))});
    if(words[3]) exercises.push({type:'listenChoose', item:words[3], prompt:'Daily listening: choose what you heard.', target:words[3].gurmukhi, choices:makeChoices(words[3].gurmukhi, available.words.map(v=>v.gurmukhi))});
    const phrases = shuffle(available.phrases).slice(0,4);
    if(phrases[0]) exercises.push({type:'tileSentence', item:phrases[0], prompt:'Daily sentence builder.', target:phrases[0].gurmukhi});
    if(phrases[1]) exercises.push({type:'speakPhrase', item:phrases[1], prompt:'Daily speaking challenge.', target:phrases[1].gurmukhi});
    if(available.lessons[0]) exercises.push(buildProfileDialogueExercise(available.lessons[available.lessons.length-1], available));
    const due = dueReviewItems().slice(0,3); due.forEach(item => exercises.push(reviewToExercise(item)));
    lessonSession = { mode:'daily', lesson:fakeLesson, index:0, hearts:5, xp:0, coins:0, correct:0, wrong:0, selected:null, built:[], checked:false, exercises:shuffle(exercises).slice(0,10) };
    renderLessonScreen();
  }

  function renderPractice(main){
    const due = dueReviewItems();
    const p = activeProfile.progress;
    main.innerHTML = `<section class="hero-card">
      <div class="eyebrow">Review</div><h1>Repair weak words</h1>
      <p class="muted">The app tracks mistakes and brings back weak words using a simple spaced review schedule.</p>
      <div class="button-row"><button class="btn primary big" data-action="start-review">Start review</button><button class="btn secondary big" data-action="flashcards">Flashcards</button></div>
    </section>
    <section class="card-grid" style="margin-top:16px">
      <div class="action-card"><div><div class="big-icon">🎯</div><h3>${due.length} due now</h3><p class="muted">Review words and phrases due today.</p></div></div>
      <div class="action-card"><div><div class="big-icon">🧠</div><h3>${Object.keys(p.reviewItems).length} memory items</h3><p class="muted">Words, phrases, and letters saved to memory.</p></div></div>
      <div class="action-card"><div><div class="big-icon">🛠️</div><h3>${p.mistakes.length} recent mistakes</h3><p class="muted">Mistakes become targeted practice, not punishment.</p></div></div>
    </section>
    <section class="panel"><h2>Due review list</h2>${reviewTable(due.slice(0,20))}</section>`;
    main.querySelector('[data-action="start-review"]').addEventListener('click', startReviewSession);
    main.querySelector('[data-action="flashcards"]').addEventListener('click', () => renderFlashcards(main));
  }

  function reviewTable(items){
    if(!items.length) return '<p class="muted">No due items yet. Finish a few lessons and mistakes will appear here.</p>';
    return `<table class="table"><thead><tr><th>Punjabi</th><th>Meaning</th><th>Errors</th><th>Due</th></tr></thead><tbody>${items.map(i => `<tr><td class="punjabi" lang="pa">${h(i.gurmukhi)}</td><td>${h(i.english)}</td><td>${i.errors||0}</td><td>${h(i.nextDue||'today')}</td></tr>`).join('')}</tbody></table>`;
  }

  function renderFlashcards(main){
    const items = Object.values(activeProfile.progress.reviewItems);
    const deck = items.length ? items : DATA.vocab.slice(0,20);
    main.innerHTML = `<section class="panel"><div class="button-row"><button class="btn secondary" data-back>Back</button><button class="btn primary" data-shuffle>Shuffle</button></div><h1>Flashcards</h1><p class="muted">Tap a card to show help.</p><div class="card-grid">${shuffle(deck).slice(0,18).map(i => `<button class="letter-card" data-flip><div class="big-letter punjabi" lang="pa" style="font-size:48px">${h(i.gurmukhi)}</div><div class="hidden-translation"><strong>${h(i.english)}</strong><br><span class="translit visible">${h(i.translit)}</span></div><div class="button-row" style="margin-top:10px;justify-content:center"><span class="btn secondary" data-speak="${h(i.gurmukhi)}">🔊</span></div></button>`).join('')}</div></section>`;
    main.querySelector('[data-back]').addEventListener('click', () => renderPractice(main));
    main.querySelector('[data-shuffle]').addEventListener('click', () => renderFlashcards(main));
    main.querySelectorAll('[data-flip]').forEach(card => card.addEventListener('click', e => { if(e.target.matches('[data-speak]')) return; card.classList.toggle('show-english'); }));
    main.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); speak(btn.dataset.speak); }));
  }

  function renderAlphabet(main){
    main.innerHTML = `<section class="hero-card"><div class="eyebrow">Punjabi Alphabet</div><h1>Gurmukhi Gym</h1><p class="muted">Each letter card includes the letter, letter name, sound, audio, and a sample word. Letter names and sounds are taught separately.</p><div class="button-row"><button class="btn primary" data-action="letter-quiz">Letter quiz</button><button class="btn secondary" data-action="vowel-cards">Vowel marks</button></div></section>
    <section class="panel trace-wrap"><div><h2>Trace practice</h2><p class="muted">Pick a letter, trace it with your finger or mouse, then clear and try again.</p><select class="text-input" id="traceLetter">${ALPHABET.map(a=>`<option value="${h(a.letter)}">${h(a.letter)} · ${h(a.name)}</option>`).join('')}</select><div class="button-row" style="margin-top:12px"><button class="btn secondary" data-action="clear-trace">Clear</button><button class="btn primary" data-action="speak-trace">Listen</button></div></div><div class="trace-canvas-wrap"><div class="trace-guide punjabi" id="traceGuide">${h(ALPHABET[0]?.letter || 'ਪ')}</div><canvas id="traceCanvas" width="560" height="560"></canvas></div></section>
    <section class="alphabet-grid">${ALPHABET.map(letterCard).join('')}</section>`;
    bindAlphabetEvents(main);
  }

  function letterCard(a){
    return `<article class="letter-card"><div class="big-letter punjabi" lang="pa">${h(a.letter)}</div><h3>${h(a.name)}</h3><p><strong>Sound:</strong> ${h(a.sound)}</p><p><span class="punjabi" lang="pa">${h(a.word)}</span> · ${h(a.meaning)} ${h(a.emoji)}</p><p class="translit visible">${h(a.wordTranslit)}</p><div class="button-row"><button class="btn secondary" data-speak="${h(a.word)}">🔊 Word</button><button class="btn ghost" data-speak="${h(a.namePunjabi || a.name)}">Name</button><button class="btn ghost" data-speak="${h(a.sound)}">Sound</button></div></article>`;
  }

  function bindAlphabetEvents(main){
    main.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); speak(btn.dataset.speak); }));
    main.querySelector('[data-action="letter-quiz"]').addEventListener('click', startAlphabetQuiz);
    main.querySelector('[data-action="vowel-cards"]').addEventListener('click', () => renderVowels(main));
    const sel = main.querySelector('#traceLetter');
    sel.addEventListener('change', () => { document.getElementById('traceGuide').textContent = sel.value; clearTrace(); });
    main.querySelector('[data-action="clear-trace"]').addEventListener('click', clearTrace);
    main.querySelector('[data-action="speak-trace"]').addEventListener('click', () => { const a = ALPHABET.find(x => x.letter === sel.value); speak(a ? `${a.namePunjabi || a.name}. ${a.sound}. ${a.word}` : sel.value); });
    setupTraceCanvas();
  }

  function renderVowels(main){
    main.innerHTML = `<section class="panel"><div class="button-row"><button class="btn secondary" data-back>Back</button></div><h1>Vowel marks</h1><p class="muted">Practice the sound each mark adds to a letter.</p><div class="alphabet-grid">${VOWELS.map(v => `<article class="letter-card"><div class="big-letter punjabi">${h(v.mark)}</div><h3>${h(v.name)}</h3><p><strong>Sound:</strong> ${h(v.sound)}</p><p class="punjabi" style="font-size:32px">${h(v.example)}</p><p class="translit visible">${h(v.translit)}</p><button class="btn secondary" data-speak="${h(v.example)}">🔊 Listen</button></article>`).join('')}</div></section>`;
    main.querySelector('[data-back]').addEventListener('click', () => renderAlphabet(main));
    main.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.speak)));
  }

  function startAlphabetQuiz(){
    const lesson = { id:'alphabetQuiz', title:'Alphabet Quiz', xp:20, coins:8, worldId:'w1', globalIndex:-1, estimatedMinutes:4 };
    const letters = shuffle(ALPHABET).slice(0,10);
    lessonSession = { mode:'alphabet', lesson, index:0, hearts:5, xp:0, coins:0, correct:0, wrong:0, selected:null, checked:false, exercises:letters.map(a => ({type:'letterName', item:a, prompt:'Choose the letter name.', target:a.name, choices:makeChoices(a.name, ALPHABET.map(x=>x.name))})) };
    renderLessonScreen();
  }

  function setupTraceCanvas(){
    const canvas = document.getElementById('traceCanvas');
    if(!canvas) return;
    traceCtx = canvas.getContext('2d');
    traceCtx.lineWidth = 18;
    traceCtx.lineCap = 'round';
    traceCtx.strokeStyle = '#33b85a';
    const pos = e => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return { x: (touch.clientX - rect.left) * (canvas.width / rect.width), y: (touch.clientY - rect.top) * (canvas.height / rect.height) };
    };
    const start = e => { traceDrawing = true; const p = pos(e); traceCtx.beginPath(); traceCtx.moveTo(p.x,p.y); e.preventDefault(); };
    const move = e => { if(!traceDrawing) return; const p = pos(e); traceCtx.lineTo(p.x,p.y); traceCtx.stroke(); e.preventDefault(); };
    const end = () => { traceDrawing = false; };
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, {passive:false}); canvas.addEventListener('touchmove', move, {passive:false}); canvas.addEventListener('touchend', end);
  }
  function clearTrace(){ const canvas=document.getElementById('traceCanvas'); if(canvas && traceCtx) traceCtx.clearRect(0,0,canvas.width,canvas.height); }

  function renderStories(main){
    main.innerHTML = `<section class="hero-card"><div class="eyebrow">Stories</div><h1>Interactive Punjabi Stories</h1><p class="muted">Read short stories, tap words, listen aloud, and answer questions. Transliteration is hidden until needed.</p></section><section class="card-grid" style="margin-top:16px">${STORIES.map(story => `<article class="story-card"><div class="big-icon">${h(story.emoji)}</div><h3>${h(story.title)}</h3><p class="muted">Level ${story.level} · ${h(story.theme)}</p><button class="btn primary" data-story="${h(story.id)}">Read story</button></article>`).join('')}</section>`;
    main.querySelectorAll('[data-story]').forEach(btn => btn.addEventListener('click', () => startStory(btn.dataset.story)));
  }

  function startStory(id){
    const story = STORIES.find(s => s.id === id);
    if(!story) return;
    storySession = { story, qIndex:0, correct:0 };
    renderStoryScreen();
  }

  function renderStoryScreen(showQuiz=false){
    const s = storySession.story;
    APP.innerHTML = `<main class="lesson-screen ${activeProfile.progress.settings.showTransliteration?'show-translit':''}"><section class="lesson-card">
      <div class="button-row"><button class="btn secondary" data-exit-story>Back</button><button class="btn primary" data-speak-story>🔊 Read aloud</button><button class="btn ghost" data-toggle-translit>Show transliteration</button><button class="btn ghost" data-toggle-translation>Show Translation</button></div>
      <div class="eyebrow">Story Quest</div><h1>${h(s.emoji)} ${h(s.title)}</h1>
      ${s.lines.map(line => `<div class="story-line"><p class="punjabi" lang="pa" style="font-size:28px">${tokenizeLine(line.pa)}</p><p class="translit">${h(line.tr)}</p><p class="hidden-translation muted">${h(line.en)}</p></div>`).join('')}
      <div class="button-row"><button class="btn primary big" data-start-story-quiz>Start quiz</button></div>
      <p class="small">Tap underlined words to hear them. Translation can be hidden or shown.</p>
    </section></main>`;
    APP.querySelector('[data-exit-story]').addEventListener('click', () => { storySession=null; activeTab='stories'; renderApp(); });
    APP.querySelector('[data-speak-story]').addEventListener('click', () => speak(s.lines.map(l=>l.pa).join(' ')));
    APP.querySelector('[data-toggle-translit]').addEventListener('click', e => { APP.querySelector('.lesson-screen').classList.toggle('show-translit'); e.currentTarget.textContent = APP.querySelector('.lesson-screen').classList.contains('show-translit') ? 'Hide transliteration' : 'Show transliteration'; });
    APP.querySelector('[data-toggle-translation]').addEventListener('click', e => { APP.querySelector('.lesson-card').classList.toggle('show-translation'); e.currentTarget.textContent = APP.querySelector('.lesson-card').classList.contains('show-translation') ? 'Hide Translation' : 'Show Translation'; });
    APP.querySelector('[data-start-story-quiz]').addEventListener('click', renderStoryQuiz);
    APP.querySelectorAll('.story-token').forEach(tok => tok.addEventListener('click', () => speak(tok.textContent)));
  }

  function tokenizeLine(line){
    return line.split(/(\s+)/).map(t => /\s+/.test(t) ? t : `<span class="story-token">${h(t)}</span>`).join('');
  }

  function renderStoryQuiz(){
    const s = storySession.story;
    const q = s.quiz[storySession.qIndex];
    if(!q){ completeStory(); return; }
    APP.innerHTML = `<main class="lesson-screen"><section class="lesson-card"><div class="eyebrow">Story question ${storySession.qIndex+1} of ${s.quiz.length}</div><h1>${h(q.q)}</h1><div class="choice-grid">${q.choices.map(c => `<button class="choice" data-choice="${h(c)}">${h(c)}</button>`).join('')}</div><div id="feedback" class="feedback"></div><div class="lesson-bottom"><button class="btn secondary" data-back-story>Back to story</button><button class="btn primary" data-check-story>Check</button></div></section></main>`;
    let selected = '';
    APP.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => { selected=btn.dataset.choice; APP.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }));
    APP.querySelector('[data-check-story]').addEventListener('click', () => {
      const correct = selected === q.a;
      playAnswerSound(correct);
      if(correct) storySession.correct++;
      const fb = document.getElementById('feedback');
      fb.className = `feedback show ${correct?'good':'bad'}`;
      fb.innerHTML = correct
        ? papaFeedbackHtml('correct', 'Yay!', 'Great reading. You understood the story question.')
        : papaFeedbackHtml('incorrect', 'Oh No!', 'That one was tricky, but Papa Ji will help you review it.', `<p>Correct answer: ${h(q.a)}</p>`);
      setTimeout(() => { storySession.qIndex++; renderStoryQuiz(); }, 900);
    });
    APP.querySelector('[data-back-story]').addEventListener('click', renderStoryScreen);
  }

  function completeStory(){
    const p = activeProfile.progress;
    const s = storySession.story;
    if(!p.completedStories.includes(s.id)) p.completedStories.push(s.id);
    p.xp += 20; p.coins += 8; updateStreak(p); saveState(); confetti();
    toast(`Story complete: +20 XP`);
    storySession=null; activeTab='stories'; renderApp();
  }

  function renderSpeak(main){
    main.innerHTML = `<section class="hero-card"><div class="eyebrow">Speaking and Missions</div><h1>Talk like real life</h1><p class="muted">Practice scripted conversations, family missions, and a small Punjabi reading feed.</p></section>
    <section class="panel"><h2>Conversation Partner</h2><div class="card-grid">${CONVERSATIONS.map(c => `<article class="conversation-card"><div class="big-icon">${h(c.emoji)}</div><h3>${h(c.title)}</h3><p class="muted">${h(c.level)} · speaks Punjabi first</p><button class="btn primary" data-convo="${h(c.id)}">Start</button></article>`).join('')}</div></section>
    <section class="panel"><h2>Family Conversation Missions</h2><div class="card-grid">${MISSIONS.map(m => `<article class="mission-card"><div class="big-icon">${h(m.emoji)}</div><h3>${h(m.title)}</h3><p>${h(m.task)}</p><p class="punjabi" lang="pa">${h(m.pa)}</p><button class="btn secondary" data-speak="${h(m.pa)}">🔊 Listen</button> <button class="btn primary" data-mission="${h(m.id)}">Mark done</button></article>`).join('')}</div></section>
    <section class="panel"><h2>Punjabi Reading Feed</h2><div class="card-grid">${FEED.map(f => `<article class="feed-card"><div class="big-icon">${h(f.emoji)}</div><h3>${h(f.title)}</h3><p class="punjabi" lang="pa" style="font-size:24px">${h(f.pa)}</p><p class="translit visible">${h(f.tr)}</p><details><summary>Show meaning</summary><p>${h(f.en)}</p></details><button class="btn secondary" data-speak="${h(f.pa)}">🔊 Read aloud</button></article>`).join('')}</div></section>`;
    main.querySelectorAll('[data-convo]').forEach(btn => btn.addEventListener('click', () => startConversation(btn.dataset.convo)));
    main.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.speak)));
    main.querySelectorAll('[data-mission]').forEach(btn => btn.addEventListener('click', () => completeMission(btn.dataset.mission)));
  }

  function completeMission(id){
    const mission = MISSIONS.find(m => m.id === id); if(!mission) return;
    const p = activeProfile.progress;
    if(!p.completedMissions.includes(id)){
      p.completedMissions.push(id); p.xp += mission.reward; p.coins += Math.round(mission.reward/3); updateStreak(p); saveState(); confetti(); toast(`Mission complete: +${mission.reward} XP`);
    } else toast('Mission already marked complete.');
  }

  function startConversation(id){
    const convo = CONVERSATIONS.find(c => c.id === id); if(!convo) return;
    convoSession = { convo, index:0, correct:0 };
    renderConversationTurn();
  }

  function renderConversationTurn(){
    const c = convoSession.convo;
    const turn = c.turns[convoSession.index];
    if(!turn){ completeConversation(); return; }
    APP.innerHTML = `<main class="lesson-screen show-translit"><section class="lesson-card">
      <div class="button-row"><button class="btn secondary" data-exit-convo>Back</button><button class="btn primary" data-speak="${h(turn.app)}">🔊 Listen</button></div>
      <div class="eyebrow">Conversation ${convoSession.index+1} of ${c.turns.length}</div><h1>${h(c.emoji)} ${h(c.title)}</h1>
      <div class="dialogue-line app"><strong>${h(convoSession.convo.speaker || 'Friend')}:</strong><p class="punjabi" lang="pa" style="font-size:30px">${h(turn.app)}</p><p class="translit">${h(turn.tr)}</p><p class="translation">${h(turn.en)}</p></div>
      ${papaInlineHtml('guide', 'Choose the reply that sounds natural for this conversation.')}
      <h2>Choose the best reply</h2><div class="choice-grid">${turn.choices.map(ch => `<button class="choice" data-choice="${h(ch.pa)}" data-correct="${ch.correct?'1':'0'}"><span class="punjabi" lang="pa">${h(ch.pa)}</span><br><span class="small">${h(ch.en)}</span></button>`).join('')}</div>
      <div id="feedback" class="feedback"></div><div class="lesson-bottom"><button class="btn blue" data-action="speak-answer">🎤 Say answer</button><button class="btn primary" data-action="check-convo">Check</button></div>
    </section></main>`;
    let selected = null;
    APP.querySelector('[data-exit-convo]').addEventListener('click', () => { convoSession=null; activeTab='speak'; renderApp(); });
    APP.querySelector('[data-speak]').addEventListener('click', () => speak(turn.app));
    APP.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => { selected = btn; APP.querySelectorAll('.choice').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); }));
    APP.querySelector('[data-action="speak-answer"]').addEventListener('click', () => startSpeechRecognition({target: turn.choices.find(x=>x.correct)?.pa || ''}));
    APP.querySelector('[data-action="check-convo"]').addEventListener('click', () => {
      const correct = selected && selected.dataset.correct === '1';
      if(correct) convoSession.correct++;
      const fb = document.getElementById('feedback');
      fb.className = `feedback show ${correct?'good':'bad'}`;
      fb.innerHTML = correct
        ? papaFeedbackHtml('correct', 'Yay!', 'Perfect reply. This fits the conversation.')
        : papaFeedbackHtml('incorrect', 'Oh No!', 'this reply fits better here.', `<p>Best reply: <span class="punjabi">${h(turn.choices.find(x=>x.correct)?.pa || '')}</span></p>`);
      setTimeout(() => { convoSession.index++; renderConversationTurn(); }, 1100);
    });
    setTimeout(() => speak(turn.app), 250);
  }

  function completeConversation(){
    const p = activeProfile.progress;
    const c = convoSession.convo;
    if(!p.completedConversations.includes(c.id)) p.completedConversations.push(c.id);
    p.xp += 25; p.coins += 10; updateStreak(p); saveState(); confetti();
    convoSession=null; toast('Conversation complete: +25 XP'); activeTab='speak'; renderApp();
  }


  function renderBattle(main){
    if(!cloud.configured){
      main.innerHTML = `<section class="hero-card"><div class="eyebrow">Live Battle Mode</div><h1>☬ Battle Mode needs Firebase</h1><p class="muted">Live battles use Firebase cloud sync so two devices can see the same scoreboard in real time.</p><div class="button-row"><button class="btn primary" data-cloud-login>Parent login</button></div></section>`;
      main.querySelector('[data-cloud-login]').addEventListener('click', showCloudLoginModal);
      return;
    }
    if(!cloud.user){
      main.innerHTML = `<section class="hero battle-hero"><div class="hero-card"><div class="eyebrow">Live Battle Mode</div><h1>☬ Sign in to start a family battle</h1><p class="muted">Sujaan and Guntaas can compete from two different devices. Scores update live through Firebase.</p>${papaInlineHtml('guide', 'Papa Ji says: sign in with the parent account first, then create or join a battle code.') }<div class="button-row"><button class="btn primary big" data-cloud-login>Parent login</button></div></div><div class="battle-symbol-card"><div class="battle-symbols"><span>☬</span><span>🛡️</span><span>⚔️</span></div><h3>Khanda Shield Challenge</h3><p class="muted">Correct answer: +1. Incorrect answer: -1. First to 10 wins.</p></div></section>`;
      main.querySelector('[data-cloud-login]').addEventListener('click', showCloudLoginModal);
      return;
    }
    if(battleSession?.data){ renderBattleMatch(main); return; }
    if(battleSession?.code && !battleSession?.data){
      main.innerHTML = `<section class="hero-card"><div class="eyebrow">Live Battle Mode</div><h1>Loading battle ${h(battleSession.code)}...</h1><p class="muted">Waiting for Firebase.</p></section>`;
      return;
    }
    main.innerHTML = `<section class="hero battle-hero">
      <div class="hero-card">
        <div class="eyebrow">Live Battle Mode</div>
        <h1>☬ Khanda Shield Challenge</h1>
        <p class="muted">Two players join the same live match from two devices. Each player gets questions matched to their own progress, but both compete on one scoreboard.</p>
        ${papaInlineHtml('guide', `${activeProfile.name} is ready. Create a match on one device, then join with the same code on the second device.`)}
        <div class="battle-rules">
          <span>✅ Correct: +1</span><span>💪 Incorrect: -1</span><span>🏆 First to 10 wins</span>
        </div>
        <div class="button-row"><button class="btn primary big" data-battle-create>Create battle</button><button class="btn secondary big" data-battle-refresh>Refresh</button></div>
      </div>
      <div class="battle-symbol-card">
        <div class="battle-symbols"><span>☬</span><span>🛡️</span><span>⚔️</span></div>
        <h3>Join a battle</h3>
        <p class="muted">Type the code from the other device.</p>
        <input class="text-input battle-code-input" id="battleCodeInput" maxlength="6" placeholder="Battle code" />
        <button class="btn mango big" style="width:100%;margin-top:10px" data-battle-join>Join battle</button>
      </div>
    </section>
    <section class="panel"><h2>Respectful battle energy</h2><p class="muted">The kirpan, khanda, and shield graphics are used as respectful Sikh-inspired symbols of courage, learning, and protection. Battle Mode is friendly competition only.</p></section>`;
    main.querySelector('[data-battle-create]').addEventListener('click', createBattleMatch);
    main.querySelector('[data-battle-join]').addEventListener('click', () => joinBattleMatch(document.getElementById('battleCodeInput')?.value || ''));
    main.querySelector('[data-battle-refresh]').addEventListener('click', () => renderBattle(main));
  }

  function battlePlayerInfo(){
    return { id: activeProfile.id, name: activeProfile.name, avatar: activeProfile.avatar, className: activeProfile.className || '', deviceId: state.deviceId || getDeviceId(), joinedAt: new Date().toISOString(), lessonCount: activeProfile.progress.completedLessons.length };
  }

  function makeBattleCode(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for(let i=0;i<5;i++) out += chars[Math.floor(Math.random()*chars.length)];
    return out;
  }

  async function createBattleMatch(){
    if(!cloud.user || !cloud.db){ showCloudLoginModal(); return; }
    const code = makeBattleCode();
    const ref = cloudDocRef().collection('battles').doc(code);
    const pid = activeProfile.id;
    const data = { code, status:'waiting', targetScore:10, createdBy: state.deviceId || getDeviceId(), createdAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp(), players:{}, scores:{}, winner:null, winnerName:null, lastAnswer:null, theme:'khanda-shield' };
    data.players[pid] = battlePlayerInfo();
    data.scores[pid] = 0;
    try { await ref.set(data, {merge:true}); openBattleSession(code); toast(`Battle created: ${code}`); }
    catch(err){ console.warn(err); toast('Could not create battle. Check Firestore rules.'); }
  }

  async function joinBattleMatch(rawCode){
    if(!cloud.user || !cloud.db){ showCloudLoginModal(); return; }
    const code = String(rawCode || '').trim().toUpperCase();
    if(!code){ toast('Enter a battle code.'); return; }
    const ref = cloudDocRef().collection('battles').doc(code);
    const pid = activeProfile.id;
    try {
      await cloud.db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if(!snap.exists) throw new Error('missing-battle');
        const data = snap.data() || {};
        if(data.status === 'complete') throw new Error('battle-complete');
        const players = Object.assign({}, data.players || {});
        const scores = Object.assign({}, data.scores || {});
        const existingIds = Object.keys(players);
        if(!players[pid] && existingIds.length >= 2) throw new Error('battle-full');
        players[pid] = battlePlayerInfo();
        if(scores[pid] == null) scores[pid] = 0;
        const status = Object.keys(players).length >= 2 ? 'active' : 'waiting';
        tx.set(ref, {players, scores, status, updatedAt:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
      });
      openBattleSession(code); toast(`Joined battle ${code}`);
    } catch(err){
      const msg = String(err?.message || '');
      if(msg.includes('missing-battle')) toast('No battle found with that code.');
      else if(msg.includes('battle-full')) toast('That battle already has two players.');
      else if(msg.includes('battle-complete')) toast('That battle already finished. Start a rematch.');
      else { console.warn(err); toast('Could not join battle. Check Firestore rules.'); }
    }
  }

  function openBattleSession(code){
    if(battleSession?.unsubscribe) battleSession.unsubscribe();
    const ref = cloudDocRef().collection('battles').doc(code);
    battleSession = { code, ref, data:null, currentQuestion:null, locked:false, unsubscribe:null };
    battleSession.unsubscribe = ref.onSnapshot(snap => {
      battleSession.data = snap.exists ? snap.data() : null;
      if(activeTab === 'battle') renderCurrentTab();
    }, err => { console.warn('Battle listener failed', err); toast('Live battle sync failed. Check Firestore rules.'); });
    activeTab = 'battle';
    renderApp();
  }

  function renderBattleMatch(main){
    const data = battleSession.data || {};
    const players = data.players || {};
    const scores = data.scores || {};
    const playerList = Object.values(players);
    const target = data.targetScore || 10;
    const pid = activeProfile.id;
    const meInBattle = !!players[pid];
    if(!meInBattle){
      main.innerHTML = `<section class="hero-card"><div class="eyebrow">Live Battle</div><h1>Battle ${h(battleSession.code)}</h1><p class="muted">This device is using ${h(activeProfile.name)}, who is not in this battle yet.</p><button class="btn primary" data-battle-join-self>Join as ${h(activeProfile.name)}</button></section>`;
      main.querySelector('[data-battle-join-self]').addEventListener('click', () => joinBattleMatch(battleSession.code));
      return;
    }
    if(data.status === 'complete'){
      const winnerId = data.winner;
      const winner = players[winnerId] || {name:data.winnerName || 'Winner', avatar:'🏆'};
      main.innerHTML = `<section class="center-page" style="min-height:auto;padding:10px 0"><div class="auth-card battle-complete"><div class="battle-symbols"><span>☬</span><span>🏆</span><span>🛡️</span></div><div class="eyebrow">Battle complete</div><h1>${h(winner.avatar || '🏆')} ${h(winner.name)} wins!</h1><p class="muted">Papa Ji says: great effort from both learners. Rematch keeps Punjabi Power growing.</p>${battleScoreboardHtml(players, scores, target)}<div class="button-row" style="justify-content:center;margin-top:16px"><button class="btn primary big" data-battle-rematch>Start rematch</button><button class="btn secondary big" data-battle-leave>Leave battle</button></div></div></section>`;
      main.querySelector('[data-battle-rematch]').addEventListener('click', rematchBattle);
      main.querySelector('[data-battle-leave]').addEventListener('click', leaveBattle);
      return;
    }
    if(playerList.length < 2 || data.status === 'waiting'){
      main.innerHTML = `<section class="hero-card"><div class="eyebrow">Waiting for opponent</div><h1>Battle code: <span class="battle-code">${h(battleSession.code)}</span></h1><p class="muted">Open Punjabi Quest on the second device, choose the other player, go to Battle, and enter this code.</p>${battleScoreboardHtml(players, scores, target)}<div class="button-row"><button class="btn secondary" data-battle-copy>Copy code</button><button class="btn ghost" data-battle-leave>Leave battle</button></div></section>`;
      main.querySelector('[data-battle-copy]').addEventListener('click', () => navigator.clipboard?.writeText(battleSession.code).then(()=>toast('Battle code copied.')).catch(()=>toast(battleSession.code)));
      main.querySelector('[data-battle-leave]').addEventListener('click', leaveBattle);
      return;
    }
    if(!battleSession.currentQuestion) battleSession.currentQuestion = makeBattleQuestion(activeProfile);
    const q = battleSession.currentQuestion;
    main.innerHTML = `<section class="battle-arena">
      <div class="battle-header-card">
        <div><div class="eyebrow">Live Battle · Code ${h(battleSession.code)}</div><h1>☬ First to ${target}</h1><p class="muted">Your questions match your own level. The scoreboard is shared live.</p></div>
        <button class="btn ghost" data-battle-leave>Leave</button>
      </div>
      ${battleScoreboardHtml(players, scores, target)}
      <div class="lesson-card battle-question-card">
        ${papaInlineHtml('guide', 'Papa Ji says: stay calm, read the Gurmukhi, then strike with the right answer.')}
        <div class="battle-symbols small-symbols"><span>☬</span><span>🛡️</span><span>⚔️</span></div>
        <div class="eyebrow">${h(activeProfile.name)}'s question</div>
        <h2>${h(q.prompt)}</h2>
        <div class="prompt ${q.displayLang === 'pa' ? 'punjabi' : ''}" ${q.displayLang === 'pa' ? 'lang="pa"' : ''}>${h(q.display)}</div>
        <div class="audio-row"><button class="btn secondary" data-speak="${h(q.listen || q.display)}">🔊 Listen</button></div>
        <div class="choice-grid battle-choice-grid">${q.choices.map(c => `<button class="choice" data-battle-choice="${h(c)}">${h(c)}</button>`).join('')}</div>
        <div id="battleFeedback" class="feedback"></div>
      </div>
    </section>`;
    main.querySelector('[data-battle-leave]').addEventListener('click', leaveBattle);
    main.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speak(btn.dataset.speak)));
    main.querySelectorAll('[data-battle-choice]').forEach(btn => btn.addEventListener('click', () => submitBattleAnswer(btn.dataset.battleChoice)));
  }

  function battleScoreboardHtml(players, scores, target){
    const entries = Object.values(players || {});
    return `<div class="battle-scoreboard">${entries.map(p => {
      const score = scores?.[p.id] || 0;
      const pct = Math.max(0, Math.min(100, (score / target) * 100));
      return `<div class="battle-player-card ${p.id === activeProfile?.id ? 'me' : ''}"><div class="battle-player-top"><span class="battle-avatar ${h(p.className || '')}">${h(p.avatar || '⭐')}</span><div><strong>${h(p.name)}</strong><p class="small">${p.id === activeProfile?.id ? 'This device' : 'Opponent'}</p></div><span class="battle-score">${score}</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
    }).join('')}</div>`;
  }

  function makeBattleQuestion(profile){
    const progress = profile.progress || emptyProgress();
    const currentLesson = getCurrentLesson(progress);
    const completed = progress.completedLessons.length;
    const due = Object.values(progress.reviewItems || {}).filter(i => !i.nextDue || i.nextDue <= TODAY());
    const lessonWords = (currentLesson?.words || []).concat(DATA.vocab.slice(Math.max(0, completed - 6), completed + 18));
    const lessonPhrases = (currentLesson?.phrases || []).concat(DATA.phrases.slice(Math.max(0, completed - 6), completed + 16));
    let item;
    if(due.length && Math.random() < 0.35) item = shuffle(due)[0];
    else if(completed > 35 && lessonPhrases.length && Math.random() < 0.45) item = shuffle(lessonPhrases)[0];
    else item = shuffle(lessonWords.filter(Boolean))[0] || shuffle(DATA.vocab)[0];
    const isPhrase = !!(item.pa || (item.gurmukhi && String(item.gurmukhi).includes(' ')));
    const gurmukhi = item.gurmukhi || item.pa || item.text || '';
    const english = item.english || item.en || '';
    const translit = item.translit || item.tr || '';
    if(completed > 20 && Math.random() < 0.45 && !isPhrase){
      return { id:item.id || gurmukhi, item, prompt:'Choose the Punjabi word.', display:english, displayLang:'en', target:gurmukhi, listen:gurmukhi, choices:makeChoices(gurmukhi, DATA.vocab.map(v=>v.gurmukhi)) };
    }
    if(completed > 70 && isPhrase){
      return { id:item.id || gurmukhi, item, prompt:'What does this Punjabi sentence mean?', display:gurmukhi, displayLang:'pa', target:english, listen:gurmukhi, choices:makeChoices(english, DATA.phrases.map(p=>p.english).concat(DATA.vocab.map(v=>v.english))) };
    }
    return { id:item.id || gurmukhi, item, prompt:'What does this mean?', display:gurmukhi, displayLang:'pa', target:english, listen:gurmukhi, choices:makeChoices(english, DATA.vocab.map(v=>v.english).concat(DATA.phrases.map(p=>p.english))) };
  }

  async function submitBattleAnswer(choice){
    if(!battleSession || battleSession.locked || !battleSession.currentQuestion) return;
    battleSession.locked = true;
    const q = battleSession.currentQuestion;
    const correct = normalize(choice) === normalize(q.target);
    const delta = correct ? 1 : -1;
    const pid = activeProfile.id;
    const target = battleSession.data?.targetScore || 10;
    trackBattleLearning(q, correct, choice);
    const fb = document.getElementById('battleFeedback');
    if(fb){
      fb.className = `feedback show ${correct ? 'good' : 'bad'}`;
      fb.innerHTML = correct ? papaFeedbackHtml('correct', 'Yay!', '+1 point. Khanda Shield power!') : papaFeedbackHtml('incorrect', 'Oh No!', '-1 point, but keep going.', `<p>Correct answer: <strong>${h(q.target)}</strong></p>`);
    }
    APP.querySelectorAll('[data-battle-choice]').forEach(btn => { btn.disabled = true; if(normalize(btn.dataset.battleChoice) === normalize(q.target)) btn.classList.add('correct'); else if(btn.dataset.battleChoice === choice) btn.classList.add('wrong'); });
    try {
      await cloud.db.runTransaction(async tx => {
        const snap = await tx.get(battleSession.ref);
        if(!snap.exists) throw new Error('missing-battle');
        const data = snap.data() || {};
        if(data.status === 'complete') return;
        const scores = Object.assign({}, data.scores || {});
        scores[pid] = (Number(scores[pid]) || 0) + delta;
        const update = { scores, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), lastAnswer:{profileId:pid, name:activeProfile.name, correct, delta, at:new Date().toISOString(), target:q.target} };
        if(scores[pid] >= target){ update.status = 'complete'; update.winner = pid; update.winnerName = activeProfile.name; update.completedAt = firebase.firestore.FieldValue.serverTimestamp(); }
        tx.set(battleSession.ref, update, {merge:true});
      });
    } catch(err){ console.warn(err); toast('Score could not update. Check connection.'); }
    setTimeout(() => { if(battleSession){ battleSession.currentQuestion = null; battleSession.locked = false; if(activeTab === 'battle') renderCurrentTab(); } }, correct ? 650 : 1200);
  }

  function trackBattleLearning(q, correct, answer){
    strengthenItem(q.item || q, correct);
    if(!correct){
      const p = activeProfile.progress;
      p.mistakes.unshift({when:new Date().toISOString(), lessonId:'live-battle', type:'battle', prompt:q.prompt, target:q.target, answer:answer || '', skipped:false, item:q.item || null});
      p.mistakes = p.mistakes.slice(0,100);
    }
    updateStreak(activeProfile.progress);
    saveState();
  }

  async function rematchBattle(){
    if(!battleSession?.ref || !battleSession?.data) return;
    const players = battleSession.data.players || {};
    const scores = {};
    Object.keys(players).forEach(id => scores[id] = 0);
    try {
      await battleSession.ref.set({scores, status:Object.keys(players).length >= 2 ? 'active' : 'waiting', winner:null, winnerName:null, lastAnswer:null, rematchAt:firebase.firestore.FieldValue.serverTimestamp(), updatedAt:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
      battleSession.currentQuestion = null; battleSession.locked = false; toast('Rematch started.');
    } catch(err){ console.warn(err); toast('Could not start rematch.'); }
  }

  function leaveBattle(){
    if(battleSession?.unsubscribe) battleSession.unsubscribe();
    battleSession = null;
    activeTab = 'battle';
    renderApp();
  }

  function renderParent(main){
    const p = activeProfile.progress;
    const completePct = Math.round((p.completedLessons.length / DATA.lessonCount) * 100);
    const due = dueReviewItems();
    const strongest = Object.values(p.knownItems).sort((a,b)=>(b.strength||0)-(a.strength||0)).slice(0,8);
    const weak = Object.values(p.reviewItems).sort((a,b)=>(b.errors||0)-(a.errors||0)).slice(0,8);
    main.innerHTML = `<section class="hero-card"><div class="eyebrow">Parent Dashboard</div><h1>${h(activeProfile.name)}'s Punjabi progress</h1><p class="muted">Progress saves locally first, then syncs to Firebase when cloud sync is configured and the parent is signed in.</p><div class="button-row"><button class="btn secondary" data-switch>Switch player</button><button class="btn primary" data-export>Export progress</button><label class="btn secondary">Import progress<input type="file" accept="application/json" data-import hidden></label></div></section>
    <section class="dashboard-grid" style="margin-top:16px">
      <div class="dashboard-card span-4"><h3>Course progress</h3><h2>${completePct}%</h2><div class="bar"><span style="width:${completePct}%"></span></div><p class="small">${p.completedLessons.length} of ${DATA.lessonCount} lessons</p></div>
      <div class="dashboard-card span-4"><h3>Habit</h3><h2>🔥 ${p.streak || 0}</h2><p class="muted">Best streak: ${p.bestStreak || 0}</p></div>
      <div class="dashboard-card span-4"><h3>Practice</h3><h2>${Object.keys(p.reviewItems).length}</h2><p class="muted">memory items · ${due.length} due now</p></div>
      <div class="dashboard-card span-6"><h3>Badges</h3><div class="badge-list">${p.badges.length ? p.badges.map(b=>`<span class="badge-chip">🏅 ${h(b.label)}</span>`).join('') : '<p class="muted">No badges yet.</p>'}</div></div>
      <div class="dashboard-card span-6"><h3>Settings</h3>${settingsForm()}</div>
      <div class="dashboard-card span-6"><h3>Strong words</h3>${reviewTable(strongest)}</div>
      <div class="dashboard-card span-6"><h3>Needs review</h3>${reviewTable(weak)}</div>
      <div class="dashboard-card span-12"><h3>Cloud sync and backups</h3>${cloudToolsHtml()}</div>
      <div class="dashboard-card span-12"><h3>Profile tools</h3>${profileToolsHtml()}</div>
    </section>`;
    bindParentEvents(main);
  }

  function settingsForm(){
    const s = activeProfile.progress.settings;
    return `<label><input type="checkbox" data-setting="showTransliteration" ${s.showTransliteration?'checked':''}> Show transliteration by default</label><br><br>
      <label><input type="checkbox" data-setting="highContrast" ${s.highContrast?'checked':''}> High contrast mode</label><br><br>
      <label><input type="checkbox" data-setting="reducedMotion" ${s.reducedMotion?'checked':''}> Reduced motion</label><br><br>
      <label>Speech speed <input type="range" min="0.55" max="1" step="0.05" value="${s.speechRate}" data-range="speechRate"></label><br><br>
      <button class="btn secondary" data-audio-settings>Audio setup</button>`;
  }

  function profileToolsHtml(){
    if(activeProfile.isGuest){
      return `<p class="muted">Guest progress is temporary. Save it as a new profile to keep it separate.</p><div class="grid" style="max-width:440px"><input class="text-input" id="newProfileName" placeholder="New profile name"><input class="text-input" id="newProfilePin" placeholder="4-digit PIN" inputmode="numeric" maxlength="4"><button class="btn primary" data-save-guest>Save Guest as profile</button></div>`;
    }
    const completed = (activeProfile.progress.completedLessons || []).map(id => DATA.lessons.find(l => l.id === id)).filter(Boolean);
    return `<div class="grid" style="max-width:620px">
      <div class="button-row"><button class="btn secondary" data-set-parent-pin>${state.parentPin ? 'Change parent PIN' : 'Create parent PIN'}</button></div>
      <p class="small">Lesson reset is parent protected. The PIN is never displayed.</p>
      <select class="text-input" id="resetLessonSelect">
        <option value="">Choose completed lesson to reset</option>
        ${completed.map(l => `<option value="${h(l.id)}">${h(l.levelLabel)} · ${h(l.title)}</option>`).join('')}
      </select>
      <div class="button-row"><button class="btn danger" data-reset-lesson ${completed.length?'':'disabled'}>Reset selected lesson</button><button class="btn danger" data-reset-profile>Reset this profile</button></div>
    </div>`;
  }

  function bindParentEvents(main){
    main.querySelector('[data-switch]').addEventListener('click', () => { state.selectedProfileId=null; activeProfile=null; saveState(); renderProfileSelector(); });
    main.querySelector('[data-export]').addEventListener('click', exportProgress);
    main.querySelector('[data-import]').addEventListener('change', importProgress);
    main.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('change', () => { activeProfile.progress.settings[input.dataset.setting] = input.checked; saveState(); applyAccessibilitySettings(); toast('Setting saved.'); }));
    main.querySelectorAll('[data-range]').forEach(input => input.addEventListener('input', () => { activeProfile.progress.settings[input.dataset.range] = Number(input.value); saveState(); }));
    main.querySelector('[data-audio-settings]').addEventListener('click', showAudioSettings);
    main.querySelector('[data-save-guest]')?.addEventListener('click', saveGuestAsProfile);
    main.querySelector('[data-reset-profile]')?.addEventListener('click', resetProfile);
    main.querySelector('[data-set-parent-pin]')?.addEventListener('click', setParentPin);
    main.querySelector('[data-reset-lesson]')?.addEventListener('click', resetSelectedLesson);
    main.querySelector('[data-cloud-login]')?.addEventListener('click', showCloudLoginModal);
    main.querySelector('[data-cloud-backup]')?.addEventListener('click', () => createCloudBackup(true));
    main.querySelector('[data-cloud-push]')?.addEventListener('click', enablePushNotifications);
    main.querySelector('[data-cloud-signout]')?.addEventListener('click', signOutCloud);
  }


  function cloudToolsHtml(){
    const configured = cloud.configured;
    const user = cloud.user;
    const last = cloud.lastSyncedAt ? new Date(cloud.lastSyncedAt).toLocaleString() : 'Not synced yet';
    return `<div class="cloud-panel">
      <div class="cloud-row"><span class="cloud-dot ${user?'on':configured?'warn':'off'}"></span><div><strong>${h(cloudStatusText())}</strong><p class="small">${user ? `Parent account: ${h(user.email || 'Signed in')} · ${h(cloudProviderLabel())}<br>` : ''}Last sync: ${h(last)} · Device: ${h((state.deviceId||'device').slice(0,10))}</p></div></div>
      <p class="muted">Cloud sync uses one parent email account and keeps Sujaan, Guntaas, and Guest progress together across iPad and laptop. Local progress still works offline.</p>
      <div class="button-row">
        <button class="btn primary" data-cloud-login>${user ? 'Manage cloud account' : 'Parent login'}</button>
        <button class="btn secondary" data-cloud-backup ${user?'':'disabled'}>Create backup now</button>
        <button class="btn secondary" data-cloud-push ${user?'':'disabled'}>Enable reminders</button>
        ${user ? '<button class="btn ghost" data-cloud-signout>Sign out</button>' : ''}
      </div>
      ${configured ? '' : '<p class="small"><strong>Setup needed:</strong> edit js/firebase-config.js with your Firebase web config and set enabled: true.</p>'}
      <p class="small">Push reminder note: the app can register this device for Firebase Cloud Messaging. True scheduled push reminders need messages sent from Firebase Console or a future optional backend. On iPad, Web Push requires the site to be added to the Home Screen.</p>
    </div>`;
  }

  function getDeviceId(){
    try {
      let id = localStorage.getItem('punjabiQuest.deviceId');
      if(!id){ id = 'dev-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36); localStorage.setItem('punjabiQuest.deviceId', id); }
      return id;
    } catch(err){ return 'dev-' + Date.now().toString(36); }
  }

  function migrateLegacyState(){
    for(const key of LEGACY_STORAGE_KEYS){
      try {
        const raw = localStorage.getItem(key);
        if(!raw) continue;
        const parsed = JSON.parse(raw);
        parsed.version = '1.2.0';
        parsed.updatedAt = new Date().toISOString();
        parsed.deviceId = parsed.deviceId || getDeviceId();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      } catch(err){}
    }
    return null;
  }

  function initConnectivityWatch(){
    window.addEventListener('online', () => { cloud.online = true; cloud.status = cloud.user ? 'Online, syncing' : cloudStatusShort(); queueCloudSave(200); toast('Back online.'); });
    window.addEventListener('offline', () => { cloud.online = false; cloud.status = 'Offline, saving locally'; toast('Offline mode. Progress will sync later.'); });
  }

  function firebaseConfigReady(){
    const cfg = window.PQ_FIREBASE_CONFIG;
    const fc = cfg?.firebaseConfig || {};
    return !!(cfg?.enabled && fc.apiKey && !String(fc.apiKey).startsWith('YOUR_') && fc.projectId && !String(fc.projectId).startsWith('YOUR_'));
  }

  function initCloud(){
    cloud.configured = firebaseConfigReady();
    if(!cloud.configured){ cloud.status = 'Local only, Firebase not configured'; return; }
    if(!window.firebase){ cloud.status = 'Firebase SDK not loaded'; return; }
    try {
      if(!firebase.apps.length) firebase.initializeApp(window.PQ_FIREBASE_CONFIG.firebaseConfig);
      cloud.auth = firebase.auth();
      cloud.db = firebase.firestore();
      if(cloud.db && cloud.db.enablePersistence){
        cloud.db.enablePersistence({synchronizeTabs:true}).then(() => { cloud.persistence = 'Firestore offline cache'; }).catch(err => {
          cloud.persistence = err?.code === 'failed-precondition' ? 'local cache, one tab at a time' : 'localStorage fallback';
        });
      }
      try { cloud.messaging = firebase.messaging && firebase.messaging(); } catch(err){ cloud.messaging = null; }
      cloud.initialized = true;
      cloud.status = 'Ready for parent login';
      cloud.auth.onAuthStateChanged(user => {
        cloud.user = user || null;
        if(user){ startCloudListener(); }
        else { stopCloudListener(); cloud.status = cloud.configured ? 'Ready for parent login' : 'Local only'; }
        if(!lessonSession && APP.innerHTML) {
          if(activeProfile) renderApp(); else renderProfileSelector();
        }
      });
    } catch(err){
      console.warn('Cloud init failed', err);
      cloud.status = 'Cloud setup error';
    }
  }

  function startCloudListener(){
    if(!cloud.db || !cloud.user) return;
    stopCloudListener();
    cloud.status = 'Signed in, syncing';
    const doc = cloudDocRef();
    cloud.unsubscribe = doc.onSnapshot(snapshot => {
      if(!cloud.user) return;
      if(!snapshot.exists){ uploadStateToCloud({makeBackup:true}); return; }
      const remote = snapshot.data()?.state;
      if(!remote) return;
      cloud.suppressSave = true;
      state = mergeStates(state, remote);
      state.deviceId = state.deviceId || getDeviceId();
      activeProfile = state.selectedProfileId ? state.profiles[state.selectedProfileId] : activeProfile;
      saveState({localOnly:true});
      cloud.suppressSave = false;
      cloud.lastSyncedAt = snapshot.data()?.clientUpdatedAt || snapshot.data()?.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString();
      cloud.status = cloud.online ? 'Synced' : 'Offline, using cache';
      if(!cloud.initialRemoteHandled){
        cloud.initialRemoteHandled = true;
        uploadStateToCloud({makeBackup:false});
      }
      if(!lessonSession && !storySession && !convoSession && !battleSession){ if(activeProfile) renderApp(); }
    }, err => {
      console.warn('Cloud listener failed', err);
      cloud.status = 'Cloud sync error';
      toast('Cloud sync needs attention. Check Firebase setup.');
    });
  }

  function stopCloudListener(){
    if(cloud.unsubscribe){ cloud.unsubscribe(); cloud.unsubscribe = null; }
    cloud.initialRemoteHandled = false;
  }

  function cloudDocRef(){
    return cloud.db.collection('families').doc(cloud.user.uid);
  }

  function cloudBackupRef(dateKey=TODAY()){
    return cloudDocRef().collection('backups').doc(dateKey);
  }

  function queueCloudSave(delay=900){
    if(!cloud.user || !cloud.db || !cloud.configured) return;
    clearTimeout(cloud.saveTimer);
    cloud.status = cloud.online ? 'Syncing...' : 'Offline, queued';
    cloud.saveTimer = setTimeout(() => uploadStateToCloud({makeBackup:false}), delay);
  }

  async function uploadStateToCloud({makeBackup=false}={}){
    if(!cloud.user || !cloud.db || !cloud.configured) return;
    try {
      const payload = {
        state: deepClone(state),
        clientUpdatedAt: new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        deviceId: state.deviceId || getDeviceId(),
        appVersion: '1.2.1'
      };
      await cloudDocRef().set(payload, {merge:true});
      cloud.lastSyncedAt = payload.clientUpdatedAt;
      cloud.status = 'Synced';
      await maybeCreateDailyBackup();
      if(makeBackup) await createCloudBackup(false);
    } catch(err){
      console.warn('Cloud upload failed', err);
      cloud.status = 'Cloud save pending';
    }
  }

  async function maybeCreateDailyBackup(){
    if(!cloud.user || !cloud.db) return;
    const key = TODAY();
    if(state.lastCloudBackupDate === key) return;
    try {
      await cloudBackupRef(key).set({state:deepClone(state), backedUpAt:firebase.firestore.FieldValue.serverTimestamp(), clientBackedUpAt:new Date().toISOString(), automatic:true}, {merge:true});
      state.lastCloudBackupDate = key;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(err){ console.warn('Daily backup failed', err); }
  }

  async function createCloudBackup(showToast=true){
    if(!cloud.user || !cloud.db){ showCloudLoginModal(); return; }
    try {
      const key = TODAY() + '-' + new Date().toISOString().slice(11,19).replace(/:/g,'');
      await cloudDocRef().collection('backups').doc(key).set({state:deepClone(state), backedUpAt:firebase.firestore.FieldValue.serverTimestamp(), clientBackedUpAt:new Date().toISOString(), automatic:false});
      if(showToast) toast('Cloud backup created.');
    } catch(err){ if(showToast) toast('Could not create cloud backup.'); }
  }

  function showCloudLoginModal(){
    if(!cloud.configured){
      createModal(`<div class="eyebrow">Cloud setup needed</div><h2>Firebase is not configured yet</h2><p class="muted">Open <strong>js/firebase-config.js</strong>, paste your Firebase Web app config, and set <strong>enabled: true</strong>. After that, reload the site and sign in with the parent account.</p><div class="button-row"><button class="btn secondary" data-close-modal>Close</button></div>`);
      return;
    }
    if(cloud.user){
      createModal(`<div class="eyebrow">Cloud account</div><h2>Signed in</h2><p class="muted">${h(cloud.user.email || 'Parent account')} · ${h(cloudProviderLabel())}</p><p><strong>Status:</strong> ${h(cloudStatusText())}</p><p class="small">Last sync: ${h(cloud.lastSyncedAt ? new Date(cloud.lastSyncedAt).toLocaleString() : 'Not synced yet')}</p><div class="button-row"><button class="btn primary" id="cloudBackupNow">Create backup now</button><button class="btn secondary" id="cloudPushNow">Enable reminders</button><button class="btn danger" id="cloudSignOut">Sign out</button><button class="btn ghost" data-close-modal>Close</button></div>`);
      document.getElementById('cloudBackupNow').addEventListener('click', () => createCloudBackup(true));
      document.getElementById('cloudPushNow').addEventListener('click', enablePushNotifications);
      document.getElementById('cloudSignOut').addEventListener('click', signOutCloud);
      return;
    }
    const modal = createModal(`<div class="eyebrow">Parent login</div><h2>Turn on cloud sync</h2><p class="muted">Use one parent account for the family. This syncs Sujaan, Guntaas, Battle Mode, and backups across devices.</p><button class="btn google-login" id="cloudGoogle">Continue with Google</button><div class="or-divider"><span>or use email/password</span></div><div class="grid"><input class="text-input" id="cloudEmail" type="email" autocomplete="email" placeholder="Parent email"><input class="text-input" id="cloudPassword" type="password" autocomplete="current-password" placeholder="Password, at least 6 characters"></div><div class="button-row" style="margin-top:14px"><button class="btn primary" id="cloudSignIn">Sign in</button><button class="btn secondary" id="cloudCreate">Create account</button><button class="btn ghost" data-close-modal>Cancel</button></div><p class="small">Enable Google and Email/Password in Firebase Authentication. If an account already exists with the same email, Punjabi Quest will help link it.</p>`);
    const email = modal.querySelector('#cloudEmail');
    const pass = modal.querySelector('#cloudPassword');
    modal.querySelector('#cloudGoogle').addEventListener('click', signInWithGoogleCloud);
    modal.querySelector('#cloudSignIn').addEventListener('click', () => signInCloud(email.value.trim(), pass.value));
    modal.querySelector('#cloudCreate').addEventListener('click', () => createCloudAccount(email.value.trim(), pass.value));
  }

  async function signInCloud(email, password){
    if(!email || !password){ toast('Enter email and password.'); return; }
    try {
      await cloud.auth.signInWithEmailAndPassword(email, password);
      closeModal(); toast('Cloud sync signed in.');
    } catch(err){ toast(firebaseAuthMessage(err)); }
  }

  async function createCloudAccount(email, password){
    if(!email || !password || password.length < 6){ toast('Use an email and a password with at least 6 characters.'); return; }
    try {
      if(cloud.user && cloud.user.email && cloud.user.email.toLowerCase() === email.toLowerCase()){
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);
        await cloud.user.linkWithCredential(credential);
        closeModal(); toast('Email/password linked to this parent account.');
      } else {
        await cloud.auth.createUserWithEmailAndPassword(email, password);
        closeModal(); toast('Cloud account created. Sync starting.');
      }
      queueCloudSave(100);
    } catch(err){ toast(firebaseAuthMessage(err)); }
  }

  async function signInWithGoogleCloud(){
    if(!cloud.auth){ toast('Firebase Auth is not ready yet.'); return; }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await cloud.auth.signInWithPopup(provider);
      closeModal();
      toast('Signed in with Google. Cloud sync starting.');
      queueCloudSave(100);
    } catch(err){
      if(err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment'){
        try { await cloud.auth.signInWithRedirect(provider); }
        catch(redirectErr){ toast(firebaseAuthMessage(redirectErr)); }
        return;
      }
      if(err?.code === 'auth/account-exists-with-different-credential'){
        showGoogleLinkPasswordModal(err);
        return;
      }
      toast(firebaseAuthMessage(err));
    }
  }

  function showGoogleLinkPasswordModal(err){
    const email = err.email || '';
    const pendingCredential = firebase.auth.GoogleAuthProvider.credentialFromError(err);
    const modal = createModal(`<div class="eyebrow">Link parent account</div><h2>This email already exists</h2><p class="muted">${h(email)} already has an email/password login. Enter that password once and Punjabi Quest will link Google Sign-In to the same parent account.</p><input class="text-input" id="linkPassword" type="password" autocomplete="current-password" placeholder="Existing password"><div class="button-row" style="margin-top:14px"><button class="btn primary" id="linkGoogleNow">Link Google</button><button class="btn ghost" data-close-modal>Cancel</button></div>`);
    const input = modal.querySelector('#linkPassword');
    modal.querySelector('#linkGoogleNow').addEventListener('click', async () => {
      if(!input.value){ toast('Enter the existing password.'); return; }
      try {
        const result = await cloud.auth.signInWithEmailAndPassword(email, input.value);
        if(pendingCredential) await result.user.linkWithCredential(pendingCredential);
        closeModal(); toast('Google Sign-In linked. Cloud sync starting.'); queueCloudSave(100);
      } catch(linkErr){ toast(firebaseAuthMessage(linkErr)); }
    });
  }

  function cloudProviderLabel(){
    const providerIds = (cloud.user?.providerData || []).map(p => p.providerId);
    if(providerIds.includes('google.com')) return 'Google Sign-In';
    if(providerIds.includes('password')) return 'Email/Password';
    return 'Parent account';
  }

  async function signOutCloud(){
    try { if(battleSession?.unsubscribe) battleSession.unsubscribe(); battleSession = null; await cloud.auth.signOut(); closeModal(); toast('Signed out of cloud sync. Local progress remains saved.'); }
    catch(err){ toast('Could not sign out.'); }
  }

  function firebaseAuthMessage(err){
    const code = err?.code || '';
    if(code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) return 'Email or password did not match.';
    if(code.includes('email-already-in-use')) return 'That email already has an account. Use Sign in.';
    if(code.includes('weak-password')) return 'Password must be at least 6 characters.';
    if(code.includes('popup-closed-by-user')) return 'Google sign-in was closed before it finished.';
    if(code.includes('account-exists-with-different-credential')) return 'This email already exists. Link the existing account to Google.';
    if(code.includes('operation-not-allowed')) return 'Enable the selected sign-in method in Firebase Authentication.';
    return 'Cloud login failed. Check Firebase setup.';
  }

  async function enablePushNotifications(){
    if(!cloud.user){ showCloudLoginModal(); return; }
    if(!('Notification' in window)){ toast('Notifications are not supported on this browser.'); return; }
    try {
      const permission = await Notification.requestPermission();
      if(permission !== 'granted'){ toast('Notifications were not allowed.'); return; }
      if('serviceWorker' in navigator){ await navigator.serviceWorker.register('./sw.js'); }
      const vapidKey = window.PQ_FIREBASE_CONFIG?.vapidKey || '';
      if(cloud.messaging && vapidKey && !String(vapidKey).startsWith('YOUR_')){
        const reg = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
        const token = await cloud.messaging.getToken({vapidKey, serviceWorkerRegistration: reg});
        cloud.pushToken = token;
        await cloudDocRef().collection('devices').doc(state.deviceId || getDeviceId()).set({token, userAgent:navigator.userAgent, updatedAt:firebase.firestore.FieldValue.serverTimestamp(), enabled:true}, {merge:true});
        toast('Push reminders are registered for this device.');
      } else {
        new Notification('Punjabi Quest reminders enabled', {body:'The app can show local reminders while open. Add Firebase VAPID key for remote push.', icon:'./assets/icons/icon.svg'});
        toast('Local notification permission saved. Add VAPID key for Firebase push.');
      }
    } catch(err){
      console.warn('Push setup failed', err);
      toast('Push setup was not completed on this device.');
    }
  }

  function cloudStatusText(){
    if(!cloud.configured) return 'Local only, Firebase not configured';
    if(!cloud.online) return 'Offline, saving locally';
    if(cloud.user) return cloud.status || 'Signed in, syncing';
    return 'Ready for parent login';
  }
  function cloudStatusShort(){
    if(!cloud.configured) return 'Local';
    if(!cloud.online) return 'Offline';
    if(cloud.user) return cloud.status === 'Synced' ? 'Synced' : 'Cloud';
    return 'Login';
  }
  function cloudStatusIcon(){
    if(!cloud.configured) return '💾';
    if(!cloud.online) return '📴';
    if(cloud.user) return cloud.status === 'Synced' ? '☁️' : '🔄';
    return '☁️';
  }

  function mergeStates(local, remote){
    const merged = Object.assign({}, remote || {}, local || {});
    merged.version = '1.2.1';
    merged.deviceId = local.deviceId || getDeviceId();
    merged.selectedProfileId = local.selectedProfileId || remote?.selectedProfileId || null;
    merged.updatedAt = maxIso(local.updatedAt, remote?.updatedAt) || new Date().toISOString();
    merged.profiles = {};
    const ids = new Set([...Object.keys(remote?.profiles || {}), ...Object.keys(local.profiles || {})]);
    ids.forEach(id => { merged.profiles[id] = mergeProfile(local.profiles?.[id], remote?.profiles?.[id]); });
    for(const [id,p] of Object.entries(DEFAULT_PROFILES)){
      if(!merged.profiles[id]) merged.profiles[id] = deepClone(p);
      merged.profiles[id].progress = mergeProgress(merged.profiles[id].progress || {});
    }
    return merged;
  }

  function mergeProfile(local, remote){
    if(!local) return deepClone(remote);
    if(!remote) return deepClone(local);
    const out = Object.assign({}, remote, local);
    out.progress = mergeProfileProgress(local.progress || {}, remote.progress || {});
    return out;
  }

  function mergeProfileProgress(local, remote){
    const out = mergeProgress(Object.assign({}, remote, local));
    out.xp = Math.max(local.xp||0, remote.xp||0);
    out.coins = Math.max(local.coins||0, remote.coins||0);
    out.streak = Math.max(local.streak||0, remote.streak||0);
    out.bestStreak = Math.max(local.bestStreak||0, remote.bestStreak||0);
    out.lastPracticeDate = maxIso(local.lastPracticeDate, remote.lastPracticeDate);
    out.completedLessons = unique([...(remote.completedLessons||[]), ...(local.completedLessons||[])]);
    out.completedStories = unique([...(remote.completedStories||[]), ...(local.completedStories||[])]);
    out.completedConversations = unique([...(remote.completedConversations||[]), ...(local.completedConversations||[])]);
    out.completedMissions = unique([...(remote.completedMissions||[]), ...(local.completedMissions||[])]);
    out.badges = uniqueObjects([...(remote.badges||[]), ...(local.badges||[])], b=>b.id || b.label);
    out.mistakes = uniqueObjects([...(local.mistakes||[]), ...(remote.mistakes||[])], m=>(m.when||'') + '|' + (m.target||'')).slice(0,100);
    out.lessonScores = Object.assign({}, remote.lessonScores||{}, local.lessonScores||{});
    out.knownItems = mergeItemMap(remote.knownItems||{}, local.knownItems||{});
    out.reviewItems = mergeItemMap(remote.reviewItems||{}, local.reviewItems||{});
    out.skillStats = Object.assign({}, remote.skillStats||{}, local.skillStats||{});
    out.settings = Object.assign(emptyProgress().settings, remote.settings||{}, local.settings||{});
    return out;
  }

  function mergeItemMap(a,b){
    const out = Object.assign({}, a);
    for(const [id,item] of Object.entries(b)){
      if(!out[id]) out[id] = item;
      else out[id] = ((item.errors||0)+(item.successes||0) >= (out[id].errors||0)+(out[id].successes||0)) ? Object.assign({}, out[id], item) : Object.assign({}, item, out[id]);
    }
    return out;
  }
  function unique(arr){ return Array.from(new Set(arr.filter(Boolean))); }
  function uniqueObjects(arr, keyFn){ const seen=new Set(), out=[]; arr.forEach(x=>{ const k=keyFn(x); if(k && !seen.has(k)){ seen.add(k); out.push(x); }}); return out; }
  function maxIso(a,b){ if(!a) return b || null; if(!b) return a; return new Date(a) >= new Date(b) ? a : b; }

  function exportProgress(){
    const data = JSON.stringify({ exportedAt:new Date().toISOString(), profile: activeProfile }, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `punjabi-quest-${activeProfile.name.toLowerCase()}-progress.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importProgress(e){
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if(data.profile && data.profile.id){ state.profiles[data.profile.id] = data.profile; selectProfile(data.profile.id); toast('Progress imported.'); }
      } catch(err){ toast('Import failed.'); }
    };
    reader.readAsText(file);
  }

  function saveGuestAsProfile(){
    const name = document.getElementById('newProfileName').value.trim();
    const pin = document.getElementById('newProfilePin').value.trim();
    if(!name || !/^\d{4}$/.test(pin)){ toast('Enter a name and a 4-digit PIN.'); return; }
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now().toString(36);
    state.profiles[id] = { id, name, avatar:'🌟', className:'guest', pin, isGuest:false, createdAt:TODAY(), progress: deepClone(activeProfile.progress) };
    state.profiles[id].progress.temporaryGuest = false;
    selectProfile(id);
  }


  function setParentPin(){
    const modal = createModal(`<div class="eyebrow">Parent PIN</div><h2>${state.parentPin ? 'Change' : 'Create'} parent PIN</h2><p class="muted">Use a private 4-digit PIN for parent-only lesson reset controls. The PIN will not be shown anywhere in the app.</p><input class="text-input" id="parentPinNew" inputmode="numeric" maxlength="4" type="password" placeholder="New 4-digit PIN"><div class="button-row" style="margin-top:14px"><button class="btn primary" id="saveParentPin">Save PIN</button><button class="btn ghost" data-close-modal>Cancel</button></div>`);
    modal.querySelector('#saveParentPin').addEventListener('click', () => {
      const val = modal.querySelector('#parentPinNew').value.trim();
      if(!/^\d{4}$/.test(val)){ toast('Enter a 4-digit PIN.'); return; }
      state.parentPin = val;
      saveState(); closeModal(); renderApp(); toast('Parent PIN saved.');
    });
  }

  function requireParentPin(onSuccess){
    if(!state.parentPin){ toast('Create a parent PIN first.'); setParentPin(); return; }
    const modal = createModal(`<div class="eyebrow">Parent protected</div><h2>Enter parent PIN</h2><p class="muted">This action changes student progress.</p><input class="text-input" id="parentPinCheck" inputmode="numeric" maxlength="4" type="password" placeholder="Parent PIN"><div class="button-row" style="margin-top:14px"><button class="btn danger" id="confirmParentPin">Continue</button><button class="btn ghost" data-close-modal>Cancel</button></div>`);
    modal.querySelector('#confirmParentPin').addEventListener('click', () => {
      if(modal.querySelector('#parentPinCheck').value.trim() !== state.parentPin){ toast('Parent PIN did not match.'); return; }
      closeModal(); onSuccess();
    });
  }

  function resetSelectedLesson(){
    const lessonId = document.getElementById('resetLessonSelect')?.value;
    if(!lessonId){ toast('Choose a completed lesson first.'); return; }
    const lesson = DATA.lessons.find(l => l.id === lessonId);
    if(!lesson) return;
    requireParentPin(() => {
      const p = activeProfile.progress;
      const score = p.lessonScores[lessonId] || {};
      p.completedLessons = (p.completedLessons || []).filter(id => id !== lessonId);
      p.xp = Math.max(0, (p.xp || 0) - Number(score.awardedXp || lesson.xp || 0));
      p.coins = Math.max(0, (p.coins || 0) - Number(score.awardedCoins || lesson.coins || 0));
      delete p.lessonScores[lessonId];
      p.mistakes = (p.mistakes || []).filter(m => m.lessonId !== lessonId);
      const lessonItems = [...(lesson.words||[]), ...(lesson.phrases||[])];
      lessonItems.forEach(item => { const id = item.id || item.gurmukhi || item.pa; delete p.knownItems[id]; delete p.reviewItems[id]; });
      saveState(); renderApp(); toast(`${lesson.title} reset to unattempted.`);
    });
  }

  function resetProfile(){
    createModal(`<h2>Reset ${h(activeProfile.name)}?</h2><p class="muted">This clears lessons, XP, coins, reviews, and badges for this profile. If cloud sync is on, the reset also syncs to your family cloud account.</p><div class="button-row"><button class="btn danger" id="confirmReset">Reset</button><button class="btn secondary" data-close-modal>Cancel</button></div>`);
    document.getElementById('confirmReset').addEventListener('click', () => requireParentPin(() => { activeProfile.progress = emptyProgress(activeProfile.isGuest); saveState(); closeModal(); renderApp(); }));
  }

  function showAudioSettings(){
    const voices = speechVoices || [];
    createModal(`<div class="eyebrow">Audio setup</div><h2>Spoken Punjabi</h2><p class="muted">The app uses any Punjabi-capable voice on this device. If there is no Punjabi voice, it falls back to the closest available voice.</p><select class="text-input" id="voiceSelect"><option value="">Auto select best voice</option>${voices.map(v=>`<option value="${h(v.voiceURI)}" ${activeProfile.progress.settings.voiceURI===v.voiceURI?'selected':''}>${h(v.name)} · ${h(v.lang)}</option>`).join('')}</select><div class="button-row" style="margin-top:14px"><button class="btn primary" id="saveVoice">Save</button><button class="btn secondary" id="testVoice">Test Punjabi</button><button class="btn ghost" data-close-modal>Close</button></div><p class="small">Tip: on iPad, Punjabi voice availability depends on installed system voices.</p>`);
    document.getElementById('saveVoice').addEventListener('click', () => { activeProfile.progress.settings.voiceURI = document.getElementById('voiceSelect').value; saveState(); toast('Voice setting saved.'); });
    document.getElementById('testVoice').addEventListener('click', () => speak('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। ਮੈਨੂੰ ਪੰਜਾਬੀ ਆਉਂਦੀ ਹੈ।'));
  }


  function playAnswerSound(correct){
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if(!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = correct ? 'sine' : 'triangle';
      osc.frequency.value = correct ? 660 : 180;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (correct ? 0.16 : 0.24));
      osc.start(); osc.stop(ctx.currentTime + (correct ? 0.18 : 0.26));
    } catch(err){}
  }

  function handleSpeechButton(ex){
    const btn = APP.querySelector('[data-action="listen-mic"]');
    if(lessonSession.speechActive){
      if(activeRecognition) { try { activeRecognition.stop(); } catch(e){} }
      lessonSession.speechActive = false;
      if(btn) btn.textContent = '🎤 Speak';
      const check = APP.querySelector('[data-action="check"]'); if(check) check.disabled = false;
      return;
    }
    startSpeechRecognition(ex);
  }

  function evaluateSpeechExercise(ex){
    const heard = lastSpeechHeard || lessonSession.selected || '';
    const correct = isSpeechMatch(heard, ex.target);
    const out = document.getElementById('speechResult');
    if(out){
      out.textContent = heard ? `Heard: ${heard}` : 'Heard: —';
      out.classList.toggle('speech-correct', correct);
      out.classList.toggle('speech-incorrect', !correct);
    }
    if(correct){ markAnswer(ex, true, false, heard); return; }
    lessonSession.speechAttempts = (lessonSession.speechAttempts || 0) + 1;
    playAnswerSound(false);
    if(lessonSession.speechAttempts < 3){
      const fb = document.getElementById('feedback');
      if(fb){ fb.className='feedback show bad'; fb.innerHTML = papaFeedbackHtml('incorrect', 'Oh No!', 'Listen once more, then try speaking again.'); }
      const check = APP.querySelector('[data-action="check"]'); if(check){ check.disabled = true; check.textContent = 'Check'; }
      return;
    }
    markAnswer(ex, false, false, heard);
  }

  function isSpeechMatch(heard, target){
    const hrd = normalize(heard);
    const tgt = normalize(target);
    if(!hrd || !tgt) return false;
    if(hrd === tgt || hrd.includes(tgt) || tgt.includes(hrd)) return true;
    const hWords = new Set(hrd.split(' ').filter(Boolean));
    const tWords = tgt.split(' ').filter(Boolean);
    if(!tWords.length) return false;
    const hits = tWords.filter(w => hWords.has(w)).length;
    return hits / tWords.length >= 0.75;
  }

  function speak(text, opts={}){
    if(!('speechSynthesis' in window)){ toast('Speech audio is not available in this browser.'); return; }
    const utter = new SpeechSynthesisUtterance(text);
    const settings = activeProfile?.progress?.settings || emptyProgress().settings;
    const selected = settings.voiceURI ? speechVoices.find(v => v.voiceURI === settings.voiceURI) : null;
    const best = selected || speechVoices.find(v => /^pa/i.test(v.lang)) || speechVoices.find(v => /hi-IN|ur|en-IN/i.test(v.lang)) || speechVoices[0];
    if(best) utter.voice = best;
    utter.lang = best?.lang || 'pa-IN';
    utter.rate = opts.slow ? 0.62 : (settings.speechRate || 0.86);
    utter.pitch = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  function startSpeechRecognition(ex){
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const out = document.getElementById('speechResult');
    const micBtn = APP.querySelector('[data-action="listen-mic"]');
    if(!Recognition){
      if(out){ out.textContent = 'Speech recognition is not supported in this browser. Please try on Chrome or use another device.'; out.classList.add('speech-incorrect'); }
      toast('Speech recognition not supported in this browser.'); return;
    }
    try {
      if(activeRecognition){ try{ activeRecognition.stop(); }catch(e){} }
      const rec = new Recognition();
      activeRecognition = rec;
      rec.lang = 'pa-IN'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 3;
      lessonSession.speechActive = true;
      lastSpeechHeard = '';
      if(out){ out.textContent = 'Listening...'; out.classList.remove('speech-correct','speech-incorrect'); }
      if(micBtn) micBtn.textContent = '✅ Check';
      const check = APP.querySelector('[data-action="check"]'); if(check) check.disabled = true;
      rec.onresult = ev => {
        let heard = '';
        for(let i=0; i<ev.results.length; i++) heard += ' ' + ev.results[i][0].transcript;
        heard = heard.trim();
        lastSpeechHeard = heard;
        lessonSession.selected = heard;
        const correct = isSpeechMatch(heard, ex.target || '');
        if(out){
          out.textContent = `Heard: ${heard || '—'}`;
          out.classList.toggle('speech-correct', correct);
          out.classList.toggle('speech-incorrect', !!heard && !correct);
        }
      };
      rec.onerror = () => { if(out){ out.textContent = 'Could not hear clearly. Listen again and try Speak.'; out.classList.add('speech-incorrect'); } };
      rec.onend = () => { lessonSession.speechActive = false; if(micBtn) micBtn.textContent = '🎤 Speak'; const checkBtn = APP.querySelector('[data-action="check"]'); if(checkBtn && lastSpeechHeard) checkBtn.disabled = false; };
      rec.start();
    } catch(err){ toast('Microphone could not start.'); }
  }

  function normalize(str){
    return String(str || '').toLowerCase().replace(/[।.?!,;:'"“”‘’\-]/g,'').replace(/\s+/g,' ').trim();
  }
  function getItemPunjabi(item){ return item?.gurmukhi || item?.pa || item?.text || item?.target || ''; }
  function getCorrectFeedback(){ return shuffle(['Shabash from Papa Ji!', 'Chardi Kala energy!', 'Great focus.', 'You are getting stronger.', 'That Punjabi sounded powerful.', 'Excellent reading.', 'Papa Ji is proud of your effort.', 'You unlocked more Punjabi power.', 'Fantastic work, keep going.', 'That answer was strong and clear.', 'Waheguru gave you a sharp mind, keep practicing.', 'You remembered it well.'])[0]; }
  function getIncorrectFeedback(){ return shuffle(['No worries. Mistakes help us learn.', 'Try again with calm focus.', 'Almost there. Listen once more and try again.', 'Papa Ji is here to help you fix it.', 'This one will come back in review.', 'Good effort. Let us make it stronger.', 'Take a breath and read the Gurmukhi again.', 'Every mistake builds Punjabi power.', 'You are learning, not failing.', 'Listen carefully and try the next one.', 'The answer is tricky, but you can handle it.', 'Keep going with Chardi Kala energy.'])[0]; }
  function getEncouragement(){ return getCorrectFeedback(); }

  function confirmExitLesson(){
    createModal(`<h2>Leave lesson?</h2><p class="muted">Current lesson question progress will not be saved, but your completed lessons stay saved.</p><div class="button-row"><button class="btn danger" id="exitConfirm">Leave</button><button class="btn secondary" data-close-modal>Stay</button></div>`);
    document.getElementById('exitConfirm').addEventListener('click', () => { closeModal(); lessonSession=null; renderApp(); });
  }

  function createModal(html){
    closeModal();
    const tpl = document.getElementById('modal-template');
    const node = tpl.content.cloneNode(true);
    node.querySelector('.modal-card').innerHTML = html;
    document.body.appendChild(node);
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
    return document.querySelector('.modal-backdrop');
  }
  function closeModal(){ document.querySelector('.modal-backdrop')?.remove(); }
  function toast(msg){
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>t.remove(), 2400);
  }
  function confetti(){
    if(activeProfile?.progress?.settings?.reducedMotion) return;
    const wrap = document.createElement('div'); wrap.className='confetti'; document.body.appendChild(wrap);
    const colors = ['#33b85a','#ffbe0b','#ff8a00','#2294ff','#8b5cf6'];
    for(let i=0;i<80;i++){
      const piece = document.createElement('i');
      piece.style.left = Math.random()*100 + 'vw';
      piece.style.background = colors[i%colors.length];
      piece.style.animationDelay = Math.random()*300 + 'ms';
      piece.style.transform = `rotate(${Math.random()*180}deg)`;
      wrap.appendChild(piece);
    }
    setTimeout(()=>wrap.remove(), 1500);
  }

  function applyAccessibilitySettings(){
    const s = activeProfile?.progress?.settings || {};
    document.documentElement.style.setProperty('--bg', s.highContrast ? '#ffffff' : '#f7fff2');
    document.body.classList.toggle('reduced-motion', !!s.reducedMotion);
  }

  window.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeModal();
  });

  init();
})();
