
window.PQ_COURSE = (function(){
  const worlds = [
  {
    "id": "w1",
    "title": "Gurmukhi Foundations",
    "emoji": "🔤",
    "theme": "letters",
    "objective": "Recognize Gurmukhi letters, letter names, sounds, and simple words.",
    "color": "#33b85a"
  },
  {
    "id": "w2",
    "title": "Greetings & Respect",
    "emoji": "🙏",
    "theme": "greetings",
    "objective": "Say hello, ask simple questions, and use respectful Punjabi.",
    "color": "#4f8cff"
  },
  {
    "id": "w3",
    "title": "Family & Home",
    "emoji": "🏠",
    "theme": "family",
    "objective": "Talk about family members, rooms, and things at home.",
    "color": "#ff8a00"
  },
  {
    "id": "w4",
    "title": "Food & Kitchen",
    "emoji": "🥭",
    "theme": "food",
    "objective": "Ask for food and describe simple meals.",
    "color": "#ffbe0b"
  },
  {
    "id": "w5",
    "title": "Colors, Numbers & Shapes",
    "emoji": "🎨",
    "theme": "numbers",
    "objective": "Use colors, counting, sizes, and shapes.",
    "color": "#8b5cf6"
  },
  {
    "id": "w6",
    "title": "Feelings & Needs",
    "emoji": "💬",
    "theme": "feelings",
    "objective": "Say how you feel and ask for help.",
    "color": "#fb7185"
  },
  {
    "id": "w7",
    "title": "School & Friends",
    "emoji": "🎒",
    "theme": "school",
    "objective": "Use Punjabi for school, friends, books, and play.",
    "color": "#0ea5e9"
  },
  {
    "id": "w8",
    "title": "Daily Routines & Actions",
    "emoji": "☀️",
    "theme": "daily",
    "objective": "Talk about everyday actions and routines.",
    "color": "#22c55e"
  },
  {
    "id": "w9",
    "title": "Animals & Nature",
    "emoji": "🐯",
    "theme": "nature",
    "objective": "Name animals, plants, weather, and outdoor things.",
    "color": "#84cc16"
  },
  {
    "id": "w10",
    "title": "Sikh Words & Values",
    "emoji": "🪯",
    "theme": "sikh",
    "objective": "Learn basic Sikh vocabulary and respectful phrases.",
    "color": "#a855f7"
  },
  {
    "id": "w11",
    "title": "Punjabi Culture & Festivals",
    "emoji": "🎉",
    "theme": "culture",
    "objective": "Talk about festivals, clothing, music, and Punjabi traditions.",
    "color": "#f97316"
  },
  {
    "id": "w12",
    "title": "Conversations & Story World",
    "emoji": "📚",
    "theme": "conversation",
    "objective": "Read stories and complete real-life Punjabi conversations.",
    "color": "#14b8a6"
  }
];
  const vocab = [
  {
    "id": "v001",
    "theme": "greetings",
    "gurmukhi": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    "translit": "sat sri akaal",
    "english": "hello, respectful Sikh greeting",
    "emoji": "🙏",
    "pos": "phrase",
    "note": "Often used when greeting family or at the Gurdwara.",
    "malwai": ""
  },
  {
    "id": "v002",
    "theme": "greetings",
    "gurmukhi": "ਨਮਸਤੇ",
    "translit": "namaste",
    "english": "hello",
    "emoji": "👋",
    "pos": "phrase",
    "note": "Common greeting in many Indian languages.",
    "malwai": ""
  },
  {
    "id": "v003",
    "theme": "greetings",
    "gurmukhi": "ਧੰਨਵਾਦ",
    "translit": "dhannvaad",
    "english": "thank you",
    "emoji": "🙌",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v004",
    "theme": "greetings",
    "gurmukhi": "ਕਿਰਪਾ ਕਰਕੇ",
    "translit": "kirpa karke",
    "english": "please",
    "emoji": "🤲",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v005",
    "theme": "greetings",
    "gurmukhi": "ਮਾਫ਼ ਕਰਨਾ",
    "translit": "maaf karna",
    "english": "sorry / excuse me",
    "emoji": "🙂",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v006",
    "theme": "greetings",
    "gurmukhi": "ਹਾਂ",
    "translit": "haan",
    "english": "yes",
    "emoji": "✅",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v007",
    "theme": "greetings",
    "gurmukhi": "ਨਹੀਂ",
    "translit": "nahi",
    "english": "no",
    "emoji": "❌",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v008",
    "theme": "greetings",
    "gurmukhi": "ਠੀਕ ਹੈ",
    "translit": "theek hai",
    "english": "okay",
    "emoji": "👍",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v009",
    "theme": "greetings",
    "gurmukhi": "ਫਿਰ ਮਿਲਾਂਗੇ",
    "translit": "fir milaange",
    "english": "see you again",
    "emoji": "👋",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v010",
    "theme": "greetings",
    "gurmukhi": "ਜੀ",
    "translit": "ji",
    "english": "respect word",
    "emoji": "✨",
    "pos": "word",
    "note": "Add ji to show respect.",
    "malwai": ""
  },
  {
    "id": "v011",
    "theme": "greetings",
    "gurmukhi": "ਕੀ ਹਾਲ ਹੈ?",
    "translit": "ki haal hai?",
    "english": "how are you?",
    "emoji": "😊",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v012",
    "theme": "greetings",
    "gurmukhi": "ਮੈਂ ਠੀਕ ਹਾਂ",
    "translit": "main theek haan",
    "english": "I am okay",
    "emoji": "😊",
    "pos": "phrase",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v013",
    "theme": "family",
    "gurmukhi": "ਮੰਮੀ",
    "translit": "mummy",
    "english": "mom",
    "emoji": "👩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v014",
    "theme": "family",
    "gurmukhi": "ਡੈਡੀ",
    "translit": "daddy",
    "english": "dad",
    "emoji": "👨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v015",
    "theme": "family",
    "gurmukhi": "ਮਾਤਾ ਜੀ",
    "translit": "maata ji",
    "english": "mother, respectful",
    "emoji": "👩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v016",
    "theme": "family",
    "gurmukhi": "ਪਿਤਾ ਜੀ",
    "translit": "pita ji",
    "english": "father, respectful",
    "emoji": "👨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v017",
    "theme": "family",
    "gurmukhi": "ਭਰਾ",
    "translit": "bhra",
    "english": "brother",
    "emoji": "👦",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v018",
    "theme": "family",
    "gurmukhi": "ਭੈਣ",
    "translit": "bhain",
    "english": "sister",
    "emoji": "👧",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v019",
    "theme": "family",
    "gurmukhi": "ਦਾਦਾ ਜੀ",
    "translit": "dada ji",
    "english": "paternal grandfather",
    "emoji": "👴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v020",
    "theme": "family",
    "gurmukhi": "ਦਾਦੀ ਜੀ",
    "translit": "dadi ji",
    "english": "paternal grandmother",
    "emoji": "👵",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v021",
    "theme": "family",
    "gurmukhi": "ਨਾਨਾ ਜੀ",
    "translit": "nana ji",
    "english": "maternal grandfather",
    "emoji": "👴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v022",
    "theme": "family",
    "gurmukhi": "ਨਾਨੀ ਜੀ",
    "translit": "nani ji",
    "english": "maternal grandmother",
    "emoji": "👵",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v023",
    "theme": "family",
    "gurmukhi": "ਮਾਮਾ ਜੀ",
    "translit": "mama ji",
    "english": "maternal uncle",
    "emoji": "👨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v024",
    "theme": "family",
    "gurmukhi": "ਮਾਸੀ ਜੀ",
    "translit": "maasi ji",
    "english": "maternal aunt",
    "emoji": "👩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v025",
    "theme": "family",
    "gurmukhi": "ਚਾਚਾ ਜੀ",
    "translit": "chacha ji",
    "english": "paternal uncle",
    "emoji": "👨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v026",
    "theme": "family",
    "gurmukhi": "ਚਾਚੀ ਜੀ",
    "translit": "chachi ji",
    "english": "paternal aunt",
    "emoji": "👩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v027",
    "theme": "family",
    "gurmukhi": "ਭੂਆ ਜੀ",
    "translit": "bhua ji",
    "english": "father’s sister",
    "emoji": "👩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v028",
    "theme": "family",
    "gurmukhi": "ਪਰਿਵਾਰ",
    "translit": "parivaar",
    "english": "family",
    "emoji": "👨‍👩‍👧‍👦",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v029",
    "theme": "family",
    "gurmukhi": "ਘਰ",
    "translit": "ghar",
    "english": "home",
    "emoji": "🏠",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v030",
    "theme": "family",
    "gurmukhi": "ਕਮਰਾ",
    "translit": "kamra",
    "english": "room",
    "emoji": "🚪",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v031",
    "theme": "family",
    "gurmukhi": "ਰਸੋਈ",
    "translit": "rasoi",
    "english": "kitchen",
    "emoji": "🍳",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v032",
    "theme": "family",
    "gurmukhi": "ਦਰਵਾਜ਼ਾ",
    "translit": "darwaaza",
    "english": "door",
    "emoji": "🚪",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v033",
    "theme": "family",
    "gurmukhi": "ਬਿਸਤਰਾ",
    "translit": "bistra",
    "english": "bed",
    "emoji": "🛏️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v034",
    "theme": "family",
    "gurmukhi": "ਕੁਰਸੀ",
    "translit": "kursi",
    "english": "chair",
    "emoji": "🪑",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v035",
    "theme": "family",
    "gurmukhi": "ਮੇਜ਼",
    "translit": "mez",
    "english": "table",
    "emoji": "🪵",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v036",
    "theme": "family",
    "gurmukhi": "ਖਿੜਕੀ",
    "translit": "khirki",
    "english": "window",
    "emoji": "🪟",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v037",
    "theme": "family",
    "gurmukhi": "ਬੱਤੀ",
    "translit": "batti",
    "english": "light",
    "emoji": "💡",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v038",
    "theme": "food",
    "gurmukhi": "ਪਾਣੀ",
    "translit": "paani",
    "english": "water",
    "emoji": "💧",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v039",
    "theme": "food",
    "gurmukhi": "ਦੁੱਧ",
    "translit": "dudh",
    "english": "milk",
    "emoji": "🥛",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v040",
    "theme": "food",
    "gurmukhi": "ਰੋਟੀ",
    "translit": "roti",
    "english": "roti",
    "emoji": "🫓",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v041",
    "theme": "food",
    "gurmukhi": "ਦਾਲ",
    "translit": "daal",
    "english": "lentils",
    "emoji": "🥣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v042",
    "theme": "food",
    "gurmukhi": "ਚਾਵਲ",
    "translit": "chaaval",
    "english": "rice",
    "emoji": "🍚",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v043",
    "theme": "food",
    "gurmukhi": "ਸਬਜ਼ੀ",
    "translit": "sabzi",
    "english": "vegetables",
    "emoji": "🥦",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v044",
    "theme": "food",
    "gurmukhi": "ਦਹੀਂ",
    "translit": "dahi",
    "english": "yogurt",
    "emoji": "🥣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v045",
    "theme": "food",
    "gurmukhi": "ਫਲ",
    "translit": "phal",
    "english": "fruit",
    "emoji": "🍊",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v046",
    "theme": "food",
    "gurmukhi": "ਸੇਬ",
    "translit": "seb",
    "english": "apple",
    "emoji": "🍎",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v047",
    "theme": "food",
    "gurmukhi": "ਕੇਲਾ",
    "translit": "kela",
    "english": "banana",
    "emoji": "🍌",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v048",
    "theme": "food",
    "gurmukhi": "ਅੰਬ",
    "translit": "amb",
    "english": "mango",
    "emoji": "🥭",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v049",
    "theme": "food",
    "gurmukhi": "ਅੰਗੂਰ",
    "translit": "angoor",
    "english": "grapes",
    "emoji": "🍇",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v050",
    "theme": "food",
    "gurmukhi": "ਗਾਜਰ",
    "translit": "gaajar",
    "english": "carrot",
    "emoji": "🥕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v051",
    "theme": "food",
    "gurmukhi": "ਆਲੂ",
    "translit": "aaloo",
    "english": "potato",
    "emoji": "🥔",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v052",
    "theme": "food",
    "gurmukhi": "ਮਟਰ",
    "translit": "matar",
    "english": "peas",
    "emoji": "🟢",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v053",
    "theme": "food",
    "gurmukhi": "ਚਾਹ",
    "translit": "chaah",
    "english": "tea",
    "emoji": "🍵",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v054",
    "theme": "food",
    "gurmukhi": "ਜੂਸ",
    "translit": "juice",
    "english": "juice",
    "emoji": "🧃",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v055",
    "theme": "food",
    "gurmukhi": "ਮਿੱਠਾ",
    "translit": "mittha",
    "english": "sweet",
    "emoji": "🍬",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v056",
    "theme": "food",
    "gurmukhi": "ਗਰਮ",
    "translit": "garam",
    "english": "hot",
    "emoji": "🔥",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v057",
    "theme": "food",
    "gurmukhi": "ਠੰਢਾ",
    "translit": "thanda",
    "english": "cold",
    "emoji": "🧊",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v058",
    "theme": "food",
    "gurmukhi": "ਹੋਰ",
    "translit": "hor",
    "english": "more",
    "emoji": "➕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v059",
    "theme": "food",
    "gurmukhi": "ਬਸ",
    "translit": "bas",
    "english": "enough",
    "emoji": "🛑",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v060",
    "theme": "food",
    "gurmukhi": "ਸਵਾਦ",
    "translit": "swaad",
    "english": "taste",
    "emoji": "😋",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v061",
    "theme": "food",
    "gurmukhi": "ਚਮਚਾ",
    "translit": "chamcha",
    "english": "spoon",
    "emoji": "🥄",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v062",
    "theme": "food",
    "gurmukhi": "ਥਾਲੀ",
    "translit": "thaali",
    "english": "plate",
    "emoji": "🍽️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v063",
    "theme": "numbers",
    "gurmukhi": "ਇੱਕ",
    "translit": "ikk",
    "english": "one",
    "emoji": "1️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v064",
    "theme": "numbers",
    "gurmukhi": "ਦੋ",
    "translit": "do",
    "english": "two",
    "emoji": "2️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v065",
    "theme": "numbers",
    "gurmukhi": "ਤਿੰਨ",
    "translit": "tinn",
    "english": "three",
    "emoji": "3️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v066",
    "theme": "numbers",
    "gurmukhi": "ਚਾਰ",
    "translit": "chaar",
    "english": "four",
    "emoji": "4️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v067",
    "theme": "numbers",
    "gurmukhi": "ਪੰਜ",
    "translit": "panj",
    "english": "five",
    "emoji": "5️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v068",
    "theme": "numbers",
    "gurmukhi": "ਛੇ",
    "translit": "chhe",
    "english": "six",
    "emoji": "6️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v069",
    "theme": "numbers",
    "gurmukhi": "ਸੱਤ",
    "translit": "satt",
    "english": "seven",
    "emoji": "7️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v070",
    "theme": "numbers",
    "gurmukhi": "ਅੱਠ",
    "translit": "atth",
    "english": "eight",
    "emoji": "8️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v071",
    "theme": "numbers",
    "gurmukhi": "ਨੌਂ",
    "translit": "nau",
    "english": "nine",
    "emoji": "9️⃣",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v072",
    "theme": "numbers",
    "gurmukhi": "ਦਸ",
    "translit": "das",
    "english": "ten",
    "emoji": "🔟",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v073",
    "theme": "numbers",
    "gurmukhi": "ਲਾਲ",
    "translit": "laal",
    "english": "red",
    "emoji": "🔴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v074",
    "theme": "numbers",
    "gurmukhi": "ਨੀਲਾ",
    "translit": "neela",
    "english": "blue",
    "emoji": "🔵",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v075",
    "theme": "numbers",
    "gurmukhi": "ਪੀਲਾ",
    "translit": "peela",
    "english": "yellow",
    "emoji": "🟡",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v076",
    "theme": "numbers",
    "gurmukhi": "ਹਰਾ",
    "translit": "hara",
    "english": "green",
    "emoji": "🟢",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v077",
    "theme": "numbers",
    "gurmukhi": "ਕਾਲਾ",
    "translit": "kaala",
    "english": "black",
    "emoji": "⚫",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v078",
    "theme": "numbers",
    "gurmukhi": "ਚਿੱਟਾ",
    "translit": "chitta",
    "english": "white",
    "emoji": "⚪",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v079",
    "theme": "numbers",
    "gurmukhi": "ਗੁਲਾਬੀ",
    "translit": "gulabi",
    "english": "pink",
    "emoji": "🌸",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v080",
    "theme": "numbers",
    "gurmukhi": "ਸੰਤਰੀ",
    "translit": "santari",
    "english": "orange",
    "emoji": "🟠",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v081",
    "theme": "numbers",
    "gurmukhi": "ਵੱਡਾ",
    "translit": "vadda",
    "english": "big",
    "emoji": "🐘",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v082",
    "theme": "numbers",
    "gurmukhi": "ਛੋਟਾ",
    "translit": "chhota",
    "english": "small",
    "emoji": "🐭",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v083",
    "theme": "numbers",
    "gurmukhi": "ਗੋਲ",
    "translit": "gol",
    "english": "round",
    "emoji": "⭕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v084",
    "theme": "numbers",
    "gurmukhi": "ਲੰਮਾ",
    "translit": "lamma",
    "english": "long / tall",
    "emoji": "📏",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v085",
    "theme": "numbers",
    "gurmukhi": "ਨਵਾਂ",
    "translit": "navaan",
    "english": "new",
    "emoji": "✨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v086",
    "theme": "numbers",
    "gurmukhi": "ਪੁਰਾਣਾ",
    "translit": "puraana",
    "english": "old",
    "emoji": "📜",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v087",
    "theme": "feelings",
    "gurmukhi": "ਖੁਸ਼",
    "translit": "khush",
    "english": "happy",
    "emoji": "😄",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v088",
    "theme": "feelings",
    "gurmukhi": "ਉਦਾਸ",
    "translit": "udaas",
    "english": "sad",
    "emoji": "😔",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v089",
    "theme": "feelings",
    "gurmukhi": "ਥੱਕਿਆ",
    "translit": "thakkiya",
    "english": "tired, masculine",
    "emoji": "😴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v090",
    "theme": "feelings",
    "gurmukhi": "ਥੱਕੀ",
    "translit": "thakki",
    "english": "tired, feminine",
    "emoji": "😴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v091",
    "theme": "feelings",
    "gurmukhi": "ਭੁੱਖ",
    "translit": "bhukh",
    "english": "hunger",
    "emoji": "🍽️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v092",
    "theme": "feelings",
    "gurmukhi": "ਪਿਆਸ",
    "translit": "pyaas",
    "english": "thirst",
    "emoji": "💧",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v093",
    "theme": "feelings",
    "gurmukhi": "ਡਰ",
    "translit": "dar",
    "english": "fear",
    "emoji": "😟",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v094",
    "theme": "feelings",
    "gurmukhi": "ਦਰਦ",
    "translit": "dard",
    "english": "pain",
    "emoji": "🤕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v095",
    "theme": "feelings",
    "gurmukhi": "ਮਦਦ",
    "translit": "madad",
    "english": "help",
    "emoji": "🆘",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v096",
    "theme": "feelings",
    "gurmukhi": "ਆਰਾਮ",
    "translit": "aaraam",
    "english": "rest",
    "emoji": "🛌",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v097",
    "theme": "feelings",
    "gurmukhi": "ਜਲਦੀ",
    "translit": "jaldi",
    "english": "quickly",
    "emoji": "⚡",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v098",
    "theme": "feelings",
    "gurmukhi": "ਹੌਲੀ",
    "translit": "hauli",
    "english": "slowly",
    "emoji": "🐢",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v099",
    "theme": "feelings",
    "gurmukhi": "ਚੰਗਾ",
    "translit": "changa",
    "english": "good",
    "emoji": "👍",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v100",
    "theme": "feelings",
    "gurmukhi": "ਮਾੜਾ",
    "translit": "maara",
    "english": "bad",
    "emoji": "👎",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v101",
    "theme": "feelings",
    "gurmukhi": "ਸੌਖਾ",
    "translit": "saukha",
    "english": "easy",
    "emoji": "🙂",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v102",
    "theme": "feelings",
    "gurmukhi": "ਔਖਾ",
    "translit": "aukha",
    "english": "hard",
    "emoji": "🧩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v103",
    "theme": "feelings",
    "gurmukhi": "ਖੇਡ",
    "translit": "khed",
    "english": "play / game",
    "emoji": "🎮",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v104",
    "theme": "feelings",
    "gurmukhi": "ਹਾਸਾ",
    "translit": "haasa",
    "english": "laugh",
    "emoji": "😂",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v105",
    "theme": "feelings",
    "gurmukhi": "ਰੋਣਾ",
    "translit": "rona",
    "english": "cry",
    "emoji": "😢",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v106",
    "theme": "feelings",
    "gurmukhi": "ਗੁੱਸਾ",
    "translit": "gussa",
    "english": "anger",
    "emoji": "😠",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v107",
    "theme": "school",
    "gurmukhi": "ਸਕੂਲ",
    "translit": "school",
    "english": "school",
    "emoji": "🏫",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v108",
    "theme": "school",
    "gurmukhi": "ਕਿਤਾਬ",
    "translit": "kitaab",
    "english": "book",
    "emoji": "📘",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v109",
    "theme": "school",
    "gurmukhi": "ਕਾਪੀ",
    "translit": "kaapi",
    "english": "notebook",
    "emoji": "📓",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v110",
    "theme": "school",
    "gurmukhi": "ਪੈਨਸਿਲ",
    "translit": "pencil",
    "english": "pencil",
    "emoji": "✏️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v111",
    "theme": "school",
    "gurmukhi": "ਅਧਿਆਪਕ",
    "translit": "adhiaapak",
    "english": "teacher",
    "emoji": "👩‍🏫",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v112",
    "theme": "school",
    "gurmukhi": "ਦੋਸਤ",
    "translit": "dost",
    "english": "friend",
    "emoji": "🧑‍🤝‍🧑",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v113",
    "theme": "school",
    "gurmukhi": "ਕਲਾਸ",
    "translit": "class",
    "english": "class",
    "emoji": "🏫",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v114",
    "theme": "school",
    "gurmukhi": "ਘੰਟੀ",
    "translit": "ghanti",
    "english": "bell",
    "emoji": "🔔",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v115",
    "theme": "school",
    "gurmukhi": "ਬੈਗ",
    "translit": "bag",
    "english": "bag",
    "emoji": "🎒",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v116",
    "theme": "school",
    "gurmukhi": "ਹੋਮਵਰਕ",
    "translit": "homework",
    "english": "homework",
    "emoji": "📝",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v117",
    "theme": "school",
    "gurmukhi": "ਪੜ੍ਹਨਾ",
    "translit": "parhna",
    "english": "to read / study",
    "emoji": "📖",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v118",
    "theme": "school",
    "gurmukhi": "ਲਿਖਣਾ",
    "translit": "likhna",
    "english": "to write",
    "emoji": "✍️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v119",
    "theme": "school",
    "gurmukhi": "ਸੁਣਨਾ",
    "translit": "sunna",
    "english": "to listen",
    "emoji": "👂",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v120",
    "theme": "school",
    "gurmukhi": "ਬੋਲਣਾ",
    "translit": "bolna",
    "english": "to speak",
    "emoji": "🗣️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v121",
    "theme": "school",
    "gurmukhi": "ਸਵਾਲ",
    "translit": "sawaal",
    "english": "question",
    "emoji": "❓",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v122",
    "theme": "school",
    "gurmukhi": "ਜਵਾਬ",
    "translit": "jawaab",
    "english": "answer",
    "emoji": "✅",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v123",
    "theme": "school",
    "gurmukhi": "ਖੇਡਣਾ",
    "translit": "khedna",
    "english": "to play",
    "emoji": "⚽",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v124",
    "theme": "school",
    "gurmukhi": "ਛੁੱਟੀ",
    "translit": "chhutti",
    "english": "break / holiday",
    "emoji": "🎈",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v125",
    "theme": "school",
    "gurmukhi": "ਪਾਠ",
    "translit": "paath",
    "english": "lesson",
    "emoji": "📚",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v126",
    "theme": "school",
    "gurmukhi": "ਨਕਸ਼ਾ",
    "translit": "naksha",
    "english": "map",
    "emoji": "🗺️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v127",
    "theme": "daily",
    "gurmukhi": "ਉੱਠਣਾ",
    "translit": "utthna",
    "english": "to wake up",
    "emoji": "🌅",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v128",
    "theme": "daily",
    "gurmukhi": "ਸੌਣਾ",
    "translit": "sauna",
    "english": "to sleep",
    "emoji": "🌙",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v129",
    "theme": "daily",
    "gurmukhi": "ਖਾਣਾ",
    "translit": "khaana",
    "english": "to eat",
    "emoji": "🍽️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v130",
    "theme": "daily",
    "gurmukhi": "ਪੀਣਾ",
    "translit": "peena",
    "english": "to drink",
    "emoji": "🥤",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v131",
    "theme": "daily",
    "gurmukhi": "ਆਉਣਾ",
    "translit": "aauna",
    "english": "to come",
    "emoji": "➡️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v132",
    "theme": "daily",
    "gurmukhi": "ਜਾਣਾ",
    "translit": "jaana",
    "english": "to go",
    "emoji": "🚶",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v133",
    "theme": "daily",
    "gurmukhi": "ਬੈਠਣਾ",
    "translit": "baithna",
    "english": "to sit",
    "emoji": "🪑",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v134",
    "theme": "daily",
    "gurmukhi": "ਖੜ੍ਹਾ ਹੋਣਾ",
    "translit": "kharha hona",
    "english": "to stand",
    "emoji": "🧍",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v135",
    "theme": "daily",
    "gurmukhi": "ਵੇਖਣਾ",
    "translit": "vekhna",
    "english": "to see",
    "emoji": "👀",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v136",
    "theme": "daily",
    "gurmukhi": "ਧੋਣਾ",
    "translit": "dhona",
    "english": "to wash",
    "emoji": "🧼",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v137",
    "theme": "daily",
    "gurmukhi": "ਨਹਾਉਣਾ",
    "translit": "nahauna",
    "english": "to bathe",
    "emoji": "🚿",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v138",
    "theme": "daily",
    "gurmukhi": "ਪਾਉਣਾ",
    "translit": "pauna",
    "english": "to wear / put on",
    "emoji": "👕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v139",
    "theme": "daily",
    "gurmukhi": "ਲੈਣਾ",
    "translit": "laina",
    "english": "to take",
    "emoji": "🤲",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v140",
    "theme": "daily",
    "gurmukhi": "ਦੇਣਾ",
    "translit": "dena",
    "english": "to give",
    "emoji": "🎁",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v141",
    "theme": "daily",
    "gurmukhi": "ਖੋਲ੍ਹਣਾ",
    "translit": "kholhna",
    "english": "to open",
    "emoji": "🔓",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v142",
    "theme": "daily",
    "gurmukhi": "ਬੰਦ ਕਰਨਾ",
    "translit": "band karna",
    "english": "to close / turn off",
    "emoji": "🔒",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v143",
    "theme": "daily",
    "gurmukhi": "ਚੱਲਣਾ",
    "translit": "challna",
    "english": "to walk",
    "emoji": "🚶",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v144",
    "theme": "daily",
    "gurmukhi": "ਦੌੜਣਾ",
    "translit": "daurna",
    "english": "to run",
    "emoji": "🏃",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v145",
    "theme": "daily",
    "gurmukhi": "ਪਕਾਉਣਾ",
    "translit": "pakauna",
    "english": "to cook",
    "emoji": "🍳",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v146",
    "theme": "daily",
    "gurmukhi": "ਸਾਫ਼ ਕਰਨਾ",
    "translit": "saaf karna",
    "english": "to clean",
    "emoji": "🧹",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v147",
    "theme": "nature",
    "gurmukhi": "ਕੁੱਤਾ",
    "translit": "kutta",
    "english": "dog",
    "emoji": "🐶",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v148",
    "theme": "nature",
    "gurmukhi": "ਬਿੱਲੀ",
    "translit": "billi",
    "english": "cat",
    "emoji": "🐱",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v149",
    "theme": "nature",
    "gurmukhi": "ਗਾਂ",
    "translit": "gaan",
    "english": "cow",
    "emoji": "🐄",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v150",
    "theme": "nature",
    "gurmukhi": "ਘੋੜਾ",
    "translit": "ghora",
    "english": "horse",
    "emoji": "🐴",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v151",
    "theme": "nature",
    "gurmukhi": "ਪੰਛੀ",
    "translit": "panchhi",
    "english": "bird",
    "emoji": "🐦",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v152",
    "theme": "nature",
    "gurmukhi": "ਮੱਛੀ",
    "translit": "machhi",
    "english": "fish",
    "emoji": "🐟",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v153",
    "theme": "nature",
    "gurmukhi": "ਸ਼ੇਰ",
    "translit": "sher",
    "english": "lion",
    "emoji": "🦁",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v154",
    "theme": "nature",
    "gurmukhi": "ਬਾਘ",
    "translit": "baagh",
    "english": "tiger",
    "emoji": "🐯",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v155",
    "theme": "nature",
    "gurmukhi": "ਹਾਥੀ",
    "translit": "haathi",
    "english": "elephant",
    "emoji": "🐘",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v156",
    "theme": "nature",
    "gurmukhi": "ਖਰਗੋਸ਼",
    "translit": "khargosh",
    "english": "rabbit",
    "emoji": "🐰",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v157",
    "theme": "nature",
    "gurmukhi": "ਰੁੱਖ",
    "translit": "rukh",
    "english": "tree",
    "emoji": "🌳",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v158",
    "theme": "nature",
    "gurmukhi": "ਫੁੱਲ",
    "translit": "phull",
    "english": "flower",
    "emoji": "🌼",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v159",
    "theme": "nature",
    "gurmukhi": "ਪੱਤਾ",
    "translit": "patta",
    "english": "leaf",
    "emoji": "🍃",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v160",
    "theme": "nature",
    "gurmukhi": "ਮੀਂਹ",
    "translit": "meenh",
    "english": "rain",
    "emoji": "🌧️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v161",
    "theme": "nature",
    "gurmukhi": "ਧੁੱਪ",
    "translit": "dhup",
    "english": "sunshine",
    "emoji": "☀️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v162",
    "theme": "nature",
    "gurmukhi": "ਹਵਾ",
    "translit": "hawa",
    "english": "air / wind",
    "emoji": "🌬️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v163",
    "theme": "nature",
    "gurmukhi": "ਅਸਮਾਨ",
    "translit": "asmaan",
    "english": "sky",
    "emoji": "🌌",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v164",
    "theme": "nature",
    "gurmukhi": "ਤਾਰਾ",
    "translit": "taara",
    "english": "star",
    "emoji": "⭐",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v165",
    "theme": "nature",
    "gurmukhi": "ਚੰਦ",
    "translit": "chand",
    "english": "moon",
    "emoji": "🌙",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v166",
    "theme": "nature",
    "gurmukhi": "ਦਰਿਆ",
    "translit": "dariya",
    "english": "river",
    "emoji": "🏞️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v167",
    "theme": "sikh",
    "gurmukhi": "ਗੁਰਦੁਆਰਾ",
    "translit": "gurdwara",
    "english": "Sikh place of worship",
    "emoji": "🛕",
    "pos": "word",
    "note": "A place where Sikhs gather, pray, and do seva.",
    "malwai": ""
  },
  {
    "id": "v168",
    "theme": "sikh",
    "gurmukhi": "ਲੰਗਰ",
    "translit": "langar",
    "english": "free community meal",
    "emoji": "🍲",
    "pos": "word",
    "note": "Food served to everyone with equality.",
    "malwai": ""
  },
  {
    "id": "v169",
    "theme": "sikh",
    "gurmukhi": "ਸੇਵਾ",
    "translit": "seva",
    "english": "selfless service",
    "emoji": "🤲",
    "pos": "word",
    "note": "Helping others without expecting reward.",
    "malwai": ""
  },
  {
    "id": "v170",
    "theme": "sikh",
    "gurmukhi": "ਕੀਰਤਨ",
    "translit": "kirtan",
    "english": "devotional singing",
    "emoji": "🎶",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v171",
    "theme": "sikh",
    "gurmukhi": "ਅਰਦਾਸ",
    "translit": "ardaas",
    "english": "prayer",
    "emoji": "🙏",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v172",
    "theme": "sikh",
    "gurmukhi": "ਕੜਾ",
    "translit": "kara",
    "english": "steel bracelet",
    "emoji": "⭕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v173",
    "theme": "sikh",
    "gurmukhi": "ਕਿਰਪਾਨ",
    "translit": "kirpan",
    "english": "Sikh article of faith",
    "emoji": "🛡️",
    "pos": "word",
    "note": "Teach respectfully as an article of faith, not as play.",
    "malwai": ""
  },
  {
    "id": "v174",
    "theme": "sikh",
    "gurmukhi": "ਦਸਤਾਰ",
    "translit": "dastaar",
    "english": "turban",
    "emoji": "🧕",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v175",
    "theme": "sikh",
    "gurmukhi": "ਗੁਰੂ",
    "translit": "guru",
    "english": "spiritual teacher",
    "emoji": "📖",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v176",
    "theme": "sikh",
    "gurmukhi": "ਗੁਰਬਾਣੀ",
    "translit": "gurbani",
    "english": "Guru’s words",
    "emoji": "📜",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v177",
    "theme": "sikh",
    "gurmukhi": "ਵਾਹਿਗੁਰੂ",
    "translit": "Waheguru",
    "english": "Wonderful Enlightener",
    "emoji": "✨",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v178",
    "theme": "sikh",
    "gurmukhi": "ੴ",
    "translit": "ik oankaar",
    "english": "One Creator",
    "emoji": "🪯",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v179",
    "theme": "sikh",
    "gurmukhi": "ਚੜ੍ਹਦੀ ਕਲਾ",
    "translit": "chardi kala",
    "english": "high spirits / positive resilience",
    "emoji": "🌟",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v180",
    "theme": "sikh",
    "gurmukhi": "ਸਰਬੱਤ ਦਾ ਭਲਾ",
    "translit": "sarbat da bhala",
    "english": "well-being of all",
    "emoji": "🌍",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v181",
    "theme": "sikh",
    "gurmukhi": "ਪ੍ਰਸਾਦ",
    "translit": "prasaad",
    "english": "blessed sweet offering",
    "emoji": "🍯",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v182",
    "theme": "sikh",
    "gurmukhi": "ਨਿਸ਼ਾਨ ਸਾਹਿਬ",
    "translit": "nishan sahib",
    "english": "Sikh flag",
    "emoji": "🚩",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v183",
    "theme": "culture",
    "gurmukhi": "ਪੰਜਾਬ",
    "translit": "Punjab",
    "english": "Punjab",
    "emoji": "🌾",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v184",
    "theme": "culture",
    "gurmukhi": "ਪੰਜਾਬੀ",
    "translit": "Punjabi",
    "english": "Punjabi",
    "emoji": "🗣️",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v185",
    "theme": "culture",
    "gurmukhi": "ਵੈਸਾਖੀ",
    "translit": "Vaisakhi",
    "english": "Vaisakhi festival",
    "emoji": "🌾",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v186",
    "theme": "culture",
    "gurmukhi": "ਲੋਹੜੀ",
    "translit": "Lohri",
    "english": "Lohri festival",
    "emoji": "🔥",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v187",
    "theme": "culture",
    "gurmukhi": "ਦਿਵਾਲੀ",
    "translit": "Diwali",
    "english": "festival of lights",
    "emoji": "🪔",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v188",
    "theme": "culture",
    "gurmukhi": "ਭੰਗੜਾ",
    "translit": "bhangra",
    "english": "Punjabi dance",
    "emoji": "🕺",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v189",
    "theme": "culture",
    "gurmukhi": "ਗਿੱਧਾ",
    "translit": "giddha",
    "english": "Punjabi folk dance",
    "emoji": "💃",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v190",
    "theme": "culture",
    "gurmukhi": "ਢੋਲ",
    "translit": "dhol",
    "english": "Punjabi drum",
    "emoji": "🥁",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v191",
    "theme": "culture",
    "gurmukhi": "ਸੂਟ",
    "translit": "suit",
    "english": "Punjabi suit",
    "emoji": "👗",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v192",
    "theme": "culture",
    "gurmukhi": "ਪਰਾਂਦਾ",
    "translit": "paranda",
    "english": "hair accessory",
    "emoji": "🎀",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v193",
    "theme": "culture",
    "gurmukhi": "ਪਿੰਡ",
    "translit": "pind",
    "english": "village",
    "emoji": "🏡",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v194",
    "theme": "culture",
    "gurmukhi": "ਖੇਤ",
    "translit": "khet",
    "english": "field",
    "emoji": "🌾",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v195",
    "theme": "culture",
    "gurmukhi": "ਮੇਲਾ",
    "translit": "mela",
    "english": "fair",
    "emoji": "🎪",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v196",
    "theme": "culture",
    "gurmukhi": "ਰਿਸ਼ਤੇਦਾਰ",
    "translit": "rishtedaar",
    "english": "relatives",
    "emoji": "👨‍👩‍👧‍👦",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v197",
    "theme": "culture",
    "gurmukhi": "ਮਿੱਠਾਈ",
    "translit": "mithai",
    "english": "sweets",
    "emoji": "🍬",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v198",
    "theme": "culture",
    "gurmukhi": "ਲੱਸੀ",
    "translit": "lassi",
    "english": "yogurt drink",
    "emoji": "🥛",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v199",
    "theme": "culture",
    "gurmukhi": "ਮੱਕੀ ਦੀ ਰੋਟੀ",
    "translit": "makki di roti",
    "english": "corn roti",
    "emoji": "🌽",
    "pos": "word",
    "note": "",
    "malwai": ""
  },
  {
    "id": "v200",
    "theme": "culture",
    "gurmukhi": "ਸਰੋਂ ਦਾ ਸਾਗ",
    "translit": "saron da saag",
    "english": "mustard greens",
    "emoji": "🥬",
    "pos": "word",
    "note": "",
    "malwai": ""
  }
];
  const phrases = [
  {
    "id": "p001",
    "theme": "greetings",
    "gurmukhi": "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?",
    "translit": "tusi kiven ho?",
    "english": "How are you?",
    "emoji": "🙂",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p002",
    "theme": "greetings",
    "gurmukhi": "ਮੈਂ ਠੀਕ ਹਾਂ।",
    "translit": "main theek haan.",
    "english": "I am okay.",
    "emoji": "😊",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p003",
    "theme": "greetings",
    "gurmukhi": "ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?",
    "translit": "tuhada naam ki hai?",
    "english": "What is your name?",
    "emoji": "🏷️",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p004",
    "theme": "greetings",
    "gurmukhi": "ਮੇਰਾ ਨਾਮ ਸੁਜਾਨ ਹੈ।",
    "translit": "mera naam Sujaan hai.",
    "english": "My name is Sujaan.",
    "emoji": "🏷️",
    "gender": "m",
    "note": ""
  },
  {
    "id": "p005",
    "theme": "greetings",
    "gurmukhi": "ਮੇਰਾ ਨਾਮ ਗੁਨਤਾਸ ਹੈ।",
    "translit": "mera naam Guntaas hai.",
    "english": "My name is Guntaas.",
    "emoji": "🏷️",
    "gender": "f",
    "note": ""
  },
  {
    "id": "p006",
    "theme": "food",
    "gurmukhi": "ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ।",
    "translit": "mainu paani chaahida hai.",
    "english": "I want water.",
    "emoji": "💧",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p007",
    "theme": "food",
    "gurmukhi": "ਮੈਨੂੰ ਭੁੱਖ ਲੱਗੀ ਹੈ।",
    "translit": "mainu bhukh laggi hai.",
    "english": "I am hungry.",
    "emoji": "🍽️",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p008",
    "theme": "food",
    "gurmukhi": "ਮੈਨੂੰ ਹੋਰ ਰੋਟੀ ਚਾਹੀਦੀ ਹੈ।",
    "translit": "mainu hor roti chaahidi hai.",
    "english": "I want more roti.",
    "emoji": "🫓",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p009",
    "theme": "food",
    "gurmukhi": "ਦੁੱਧ ਠੰਢਾ ਹੈ।",
    "translit": "dudh thanda hai.",
    "english": "The milk is cold.",
    "emoji": "🥛",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p010",
    "theme": "food",
    "gurmukhi": "ਦਾਲ ਗਰਮ ਹੈ।",
    "translit": "daal garam hai.",
    "english": "The daal is hot.",
    "emoji": "🥣",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p011",
    "theme": "family",
    "gurmukhi": "ਇਹ ਮੇਰੀ ਮੰਮੀ ਹੈ।",
    "translit": "eh meri mummy hai.",
    "english": "This is my mom.",
    "emoji": "👩",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p012",
    "theme": "family",
    "gurmukhi": "ਇਹ ਮੇਰੇ ਡੈਡੀ ਹਨ।",
    "translit": "eh mere daddy han.",
    "english": "This is my dad.",
    "emoji": "👨",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p013",
    "theme": "family",
    "gurmukhi": "ਮੈਂ ਘਰ ਜਾ ਰਿਹਾ ਹਾਂ।",
    "translit": "main ghar ja riha haan.",
    "english": "I am going home.",
    "emoji": "🏠",
    "gender": "m",
    "note": ""
  },
  {
    "id": "p014",
    "theme": "family",
    "gurmukhi": "ਮੈਂ ਘਰ ਜਾ ਰਹੀ ਹਾਂ।",
    "translit": "main ghar ja rahi haan.",
    "english": "I am going home.",
    "emoji": "🏠",
    "gender": "f",
    "note": ""
  },
  {
    "id": "p015",
    "theme": "feelings",
    "gurmukhi": "ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ।",
    "translit": "mainu madad chaahidi hai.",
    "english": "I need help.",
    "emoji": "🆘",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p016",
    "theme": "feelings",
    "gurmukhi": "ਮੈਨੂੰ ਨੀਂਦ ਆ ਰਹੀ ਹੈ।",
    "translit": "mainu neend aa rahi hai.",
    "english": "I am sleepy.",
    "emoji": "😴",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p017",
    "theme": "feelings",
    "gurmukhi": "ਮੈਨੂੰ ਬਾਥਰੂਮ ਜਾਣਾ ਹੈ।",
    "translit": "mainu bathroom jaana hai.",
    "english": "I need to go to the bathroom.",
    "emoji": "🚻",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p018",
    "theme": "feelings",
    "gurmukhi": "ਮੈਂ ਖੁਸ਼ ਹਾਂ।",
    "translit": "main khush haan.",
    "english": "I am happy.",
    "emoji": "😄",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p019",
    "theme": "feelings",
    "gurmukhi": "ਮੈਂ ਉਦਾਸ ਹਾਂ।",
    "translit": "main udaas haan.",
    "english": "I am sad.",
    "emoji": "😔",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p020",
    "theme": "school",
    "gurmukhi": "ਮੈਂ ਕਿਤਾਬ ਪੜ੍ਹ ਰਿਹਾ ਹਾਂ।",
    "translit": "main kitaab parh riha haan.",
    "english": "I am reading a book.",
    "emoji": "📘",
    "gender": "m",
    "note": ""
  },
  {
    "id": "p021",
    "theme": "school",
    "gurmukhi": "ਮੈਂ ਕਿਤਾਬ ਪੜ੍ਹ ਰਹੀ ਹਾਂ।",
    "translit": "main kitaab parh rahi haan.",
    "english": "I am reading a book.",
    "emoji": "📘",
    "gender": "f",
    "note": ""
  },
  {
    "id": "p022",
    "theme": "school",
    "gurmukhi": "ਮੇਰਾ ਦੋਸਤ ਸਕੂਲ ਵਿੱਚ ਹੈ।",
    "translit": "mera dost school vich hai.",
    "english": "My friend is at school.",
    "emoji": "🏫",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p023",
    "theme": "daily",
    "gurmukhi": "ਕਿਰਪਾ ਕਰਕੇ ਬੈਠੋ।",
    "translit": "kirpa karke baitho.",
    "english": "Please sit.",
    "emoji": "🪑",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p024",
    "theme": "daily",
    "gurmukhi": "ਦਰਵਾਜ਼ਾ ਖੋਲ੍ਹੋ।",
    "translit": "darwaaza kholho.",
    "english": "Open the door.",
    "emoji": "🚪",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p025",
    "theme": "daily",
    "gurmukhi": "ਬੱਤੀ ਬੰਦ ਕਰੋ।",
    "translit": "batti band karo.",
    "english": "Turn off the light.",
    "emoji": "💡",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p026",
    "theme": "nature",
    "gurmukhi": "ਮੀਂਹ ਪੈ ਰਿਹਾ ਹੈ।",
    "translit": "meenh pai riha hai.",
    "english": "It is raining.",
    "emoji": "🌧️",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p027",
    "theme": "nature",
    "gurmukhi": "ਫੁੱਲ ਸੋਹਣਾ ਹੈ।",
    "translit": "phull sohna hai.",
    "english": "The flower is beautiful.",
    "emoji": "🌼",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p028",
    "theme": "sikh",
    "gurmukhi": "ਮੈਂ ਗੁਰਦੁਆਰੇ ਜਾ ਰਿਹਾ ਹਾਂ।",
    "translit": "main gurdware ja riha haan.",
    "english": "I am going to the Gurdwara.",
    "emoji": "🛕",
    "gender": "m",
    "note": ""
  },
  {
    "id": "p029",
    "theme": "sikh",
    "gurmukhi": "ਮੈਂ ਗੁਰਦੁਆਰੇ ਜਾ ਰਹੀ ਹਾਂ।",
    "translit": "main gurdware ja rahi haan.",
    "english": "I am going to the Gurdwara.",
    "emoji": "🛕",
    "gender": "f",
    "note": ""
  },
  {
    "id": "p030",
    "theme": "sikh",
    "gurmukhi": "ਸੇਵਾ ਕਰਨਾ ਚੰਗਾ ਹੈ।",
    "translit": "seva karna changa hai.",
    "english": "Doing seva is good.",
    "emoji": "🤲",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p031",
    "theme": "culture",
    "gurmukhi": "ਵੈਸਾਖੀ ਦਾ ਮੇਲਾ ਹੈ।",
    "translit": "Vaisakhi da mela hai.",
    "english": "There is a Vaisakhi fair.",
    "emoji": "🎪",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p032",
    "theme": "culture",
    "gurmukhi": "ਢੋਲ ਵੱਜ ਰਿਹਾ ਹੈ।",
    "translit": "dhol vajj riha hai.",
    "english": "The dhol is playing.",
    "emoji": "🥁",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p033",
    "theme": "conversation",
    "gurmukhi": "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ ਹਾਂ।",
    "translit": "main Punjabi sikh riha haan.",
    "english": "I am learning Punjabi.",
    "emoji": "📚",
    "gender": "m",
    "note": ""
  },
  {
    "id": "p034",
    "theme": "conversation",
    "gurmukhi": "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਹੀ ਹਾਂ।",
    "translit": "main Punjabi sikh rahi haan.",
    "english": "I am learning Punjabi.",
    "emoji": "📚",
    "gender": "f",
    "note": ""
  },
  {
    "id": "p035",
    "theme": "conversation",
    "gurmukhi": "ਕੀ ਤੁਸੀਂ ਫਿਰ ਦੱਸ ਸਕਦੇ ਹੋ?",
    "translit": "ki tusi fir dass sakde ho?",
    "english": "Can you say it again?",
    "emoji": "🔁",
    "gender": "both",
    "note": ""
  },
  {
    "id": "p036",
    "theme": "conversation",
    "gurmukhi": "ਮੈਨੂੰ ਸਮਝ ਆ ਗਿਆ।",
    "translit": "mainu samajh aa giya.",
    "english": "I understood.",
    "emoji": "✅",
    "gender": "both",
    "note": ""
  }
];
  const lessons = [];
  const worldThemes = {
  "w1": [
    "letters",
    "greetings",
    "food"
  ],
  "w2": [
    "greetings"
  ],
  "w3": [
    "family"
  ],
  "w4": [
    "food"
  ],
  "w5": [
    "numbers"
  ],
  "w6": [
    "feelings"
  ],
  "w7": [
    "school"
  ],
  "w8": [
    "daily"
  ],
  "w9": [
    "nature"
  ],
  "w10": [
    "sikh"
  ],
  "w11": [
    "culture"
  ],
  "w12": [
    "conversation",
    "greetings",
    "family",
    "food",
    "school",
    "sikh"
  ]
};
  const lessonKinds = ["Words", "Listen", "Read", "Speak", "Build", "Review", "Mini Story", "Conversation", "Word Power", "Checkpoint"];
  function byTheme(theme){ return vocab.filter(v => v.theme === theme); }
  function phrasesByTheme(theme){ return phrases.filter(p => p.theme === theme); }
  function pick(arr, index, count){
    if(!arr.length) return [];
    const out=[];
    for(let i=0;i<count;i++) out.push(arr[(index+i)%arr.length]);
    return out;
  }
  function lessonTitle(world, n){
    const kind = lessonKinds[(n-1) % lessonKinds.length];
    if(n % 25 === 0) return `${world.title} Mastery Check`;
    if(n % 10 === 0) return `${world.title} Checkpoint ${Math.ceil(n/10)}`;
    return `${world.title}: ${kind} ${n}`;
  }
  function buildLesson(world, n, globalIndex){
    const themes = worldThemes[world.id] || [world.theme];
    let pool = themes.flatMap(t => byTheme(t));
    let phrasePool = themes.flatMap(t => phrasesByTheme(t));
    if(world.id === 'w1') pool = vocab.slice(0, 28).concat(byTheme('food').slice(0,6));
    if(!phrasePool.length) phrasePool = phrases;
    const words = pick(pool, globalIndex*3, n % 5 === 0 ? 7 : 5);
    const lessonPhrases = pick(phrasePool, globalIndex*2, 3);
    const letters = pick(window.PQ_ALPHABET || [], globalIndex, 4);
    const skill = (n % 5 === 0) ? 'checkpoint' : ['recognition','listening','speaking','reading','sentence'][n % 5];
    const difficulty = Math.min(5, Math.floor((globalIndex)/60)+1);
    return {
      id: `${world.id}-l${String(n).padStart(2,'0')}`,
      worldId: world.id,
      number: n,
      globalIndex,
      levelLabel: `World ${worlds.indexOf(world)+1} · Lesson ${n}`,
      title: lessonTitle(world, n),
      subtitle: n % 10 === 0 ? 'A mixed practice checkpoint.' : world.objective,
      estimatedMinutes: n % 10 === 0 ? 7 : 4,
      skill,
      difficulty,
      xp: n % 10 === 0 ? 40 : 25,
      coins: n % 10 === 0 ? 16 : 10,
      emoji: n % 10 === 0 ? '🏆' : world.emoji,
      words,
      phrases: lessonPhrases,
      letters,
      objectives: [
        `Practice ${world.title.toLowerCase()}`,
        skill === 'speaking' ? 'Say Punjabi out loud' : 'Read Punjabi in Gurmukhi',
        'Review older words before they fade'
      ]
    };
  }
  let g=0;
  worlds.forEach(world => {
    for(let n=1;n<=26;n++) lessons.push(buildLesson(world, n, g++));
  });
  return { worlds, vocab, phrases, lessons, lessonCount: lessons.length };
})();
