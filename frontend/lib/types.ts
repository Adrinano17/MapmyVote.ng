export interface Ward {
  id: string
  name: string
  code: string
  created_at: string
}

export interface PollingUnit {
  id: string
  name: string
  code: string
  address: string | null
  ward_id: string
  latitude: number | null
  longitude: number | null
  registered_voters: number
  created_at: string
  updated_at: string
  ward?: Ward
}

export interface SearchResult {
  polling_units: PollingUnit[]
  wards: Ward[]
}

export type Language = "en" | "yo" | "pcm"

export interface Translations {
  // Navigation & Header
  home: string
  mapView: string
  about: string
  search: string

  // Hero Section
  heroTitle: string
  heroSubtitle: string
  browseMap: string
  voiceSearch: string
  lgaLabel: string

  // Stats
  wards: string
  pollingUnits: string
  languages: string
  availability: string

  // Browse by Ward
  browseByWard: string
  browseByWardSubtitle: string
  noWardsFound: string
  noWardsSubtitle: string

  // How It Works
  howItWorks: string
  howItWorksSubtitle: string
  step1Title: string
  step1Desc: string
  step2Title: string
  step2Desc: string
  step3Title: string
  step3Desc: string

  // Search
  searchPrompt: string
  searchButton: string
  searching: string
  resultsFor: string
  noResults: string
  noResultsSubtitle: string
  tryAgain: string

  // Polling Unit Details
  pollingUnitDetails: string
  registeredVoters: string
  location: string
  votingHours: string
  coordinates: string
  latitude: string
  longitude: string
  getDirections: string
  share: string
  backTo: string

  // Map
  filterByWard: string
  allWards: string
  pollingUnitsInWard: string
  viewDetails: string

  // Voice & AI Assistant
  welcome: string
  resultsFound: string
  directions: string
  listeningPrompt: string
  stopListening: string
  startListening: string
  speakNow: string

  // AI Assistant specific
  aiAssistantName: string
  aiGreeting: string
  aiAskForHelp: string
  aiSearching: string
  aiFoundResult: string
  aiNoResult: string
  aiNavigationStart: string
  aiNavigationProgress: string
  aiEncouragement1: string
  aiEncouragement2: string
  aiEncouragement3: string
  aiArrival: string
  aiAskQuestion: string
  aiTypePlaceholder: string

  // Footer
  footerTagline: string
  quickLinks: string
  support: string
  faq: string
  contact: string
  reportIssue: string
  allRightsReserved: string

  // Errors
  voiceNotSupported: string
  locationError: string
  mapNotAvailable: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Header
    home: "Home",
    mapView: "Map View",
    about: "About",
    search: "Search",

    // Hero Section
    heroTitle: "Find Your Polling Unit",
    heroSubtitle:
      "Locate your assigned voting location in Ibadan North LGA. Search by name, ward, or use voice commands in English, Yoruba, Pidgin, Hausa, or Igbo.",
    browseMap: "Browse Map",
    voiceSearch: "Voice Search",
    lgaLabel: "Ibadan North Local Government Area",

    // Stats
    wards: "Wards",
    pollingUnits: "Polling Units",
    languages: "Languages",
    availability: "Availability",

    // Browse by Ward
    browseByWard: "Browse by Ward",
    browseByWardSubtitle: "Select a ward to view all polling units within it",
    noWardsFound: "No wards found",
    noWardsSubtitle: "Please run the database setup scripts to populate ward data.",

    // How It Works
    howItWorks: "How It Works",
    howItWorksSubtitle: "Three easy ways to find your polling unit",
    step1Title: "Search",
    step1Desc: "Enter your polling unit name, voter ID, or ward in the search box",
    step2Title: "Locate",
    step2Desc: "View your polling unit on the interactive map with exact coordinates",
    step3Title: "Navigate",
    step3Desc: "Get turn-by-turn directions to your voting location",

    // Search
    searchPrompt: "Enter polling unit name, voter ID, or ward...",
    searchButton: "Search",
    searching: "Searching...",
    resultsFor: "Results for",
    noResults: "No results found",
    noResultsSubtitle: "Try a different search term or browse by ward",
    tryAgain: "Try Again",

    // Polling Unit Details
    pollingUnitDetails: "Polling Unit Details",
    registeredVoters: "Registered Voters",
    location: "Location",
    votingHours: "Voting Hours",
    coordinates: "Coordinates",
    latitude: "Latitude",
    longitude: "Longitude",
    getDirections: "Get Directions",
    share: "Share",
    backTo: "Back to",

    // Map
    filterByWard: "Filter by Ward",
    allWards: "All Wards",
    pollingUnitsInWard: "polling units in this ward",
    viewDetails: "View Details",

    // Voice & AI Assistant
    welcome: "Welcome to MapMyVote Nigeria. Find your polling unit easily.",
    resultsFound: "We found your polling unit.",
    directions: "Tap to get directions to your polling unit.",
    listeningPrompt: "Listening... Speak now",
    stopListening: "Stop listening",
    startListening: "Start voice search",
    speakNow: "Speak now...",

    // AI Assistant specific
    aiAssistantName: "Ìrànlọ́wọ́",
    aiGreeting:
      "Hello! I'm Ìrànlọ́wọ́, your voting assistant. I'll help you find your polling unit and guide you there. How can I assist you today?",
    aiAskForHelp: "Ask me anything about finding your polling unit!",
    aiSearching: "Let me search for your polling unit...",
    aiFoundResult: "Great news! I found your polling unit:",
    aiNoResult: "I couldn't find that polling unit. Could you try with a different name or ward?",
    aiNavigationStart: "Let's get you to your polling unit! I'll guide you step by step.",
    aiNavigationProgress: "You're doing great! About {minutes} minutes remaining to your destination.",
    aiEncouragement1: "Keep going! Your vote matters, and you're almost there!",
    aiEncouragement2: "You're making great progress! Every step brings you closer to exercising your civic duty.",
    aiEncouragement3: "Almost there! Remember, your vote is your voice in democracy.",
    aiArrival:
      "You've arrived at your polling unit! Thank you for exercising your right to vote. Make sure to have your voter's card ready.",
    aiAskQuestion: "What would you like to know?",
    aiTypePlaceholder: "Type your question or use voice...",

    // Footer
    footerTagline: "Empowering Nigerian voters with accessible polling information",
    quickLinks: "Quick Links",
    support: "Support",
    faq: "FAQ",
    contact: "Contact Us",
    reportIssue: "Report an Issue",
    allRightsReserved: "All rights reserved",

    // Errors
    voiceNotSupported: "Voice search is not supported in your browser.",
    locationError: "Unable to get your location. Please enable location services.",
    mapNotAvailable: "Map coordinates not available",
  },

  yo: {
    // Navigation & Header
    home: "Ilé",
    mapView: "Wo Maapu",
    about: "Nípa Wa",
    search: "Wá",

    // Hero Section
    heroTitle: "Wá Ibi Ìdìbò Rẹ",
    heroSubtitle:
      "Wá ibi tí wọ́n yàn fún ọ láti dìbò ní Ibadan North LGA. Wá nípa orúkọ, wọ́dù, tàbí lo ohùn ní Gẹ̀ẹ́sì, Yorùbá, tàbí Pidgin.",
    browseMap: "Wo Maapu",
    voiceSearch: "Wá Pẹ̀lú Ohùn",
    lgaLabel: "Ìjọba Ìbílẹ̀ Ibadan Àríwá",

    // Stats
    wards: "Àwọn Wọ́dù",
    pollingUnits: "Ibi Ìdìbò",
    languages: "Àwọn Èdè",
    availability: "Wíwà",

    // Browse by Ward
    browseByWard: "Wo Nípa Wọ́dù",
    browseByWardSubtitle: "Yan wọ́dù kan láti wo gbogbo ibi ìdìbò nínú rẹ̀",
    noWardsFound: "A kò rí wọ́dù kankan",
    noWardsSubtitle: "Jọ̀wọ́ ṣe àtẹ̀jáde àwọn ìwé àṣẹ láti fi dátà wọ́dù sí.",

    // How It Works
    howItWorks: "Bí Ó Ṣe Ń Ṣiṣẹ́",
    howItWorksSubtitle: "Ọ̀nà mẹ́ta tí ó rọrùn láti wá ibi ìdìbò rẹ",
    step1Title: "Wá",
    step1Desc: "Tẹ orúkọ ibi ìdìbò rẹ, ID oníbò, tàbí wọ́dù sínú àpótí wíwá",
    step2Title: "Rí Ibẹ̀",
    step2Desc: "Wo ibi ìdìbò rẹ lórí maapu pẹ̀lú àwọn àmì tó péye",
    step3Title: "Lọ Síbẹ̀",
    step3Desc: "Gba ìtọ́sọ́nà sí ibi tí ò ti máa dìbò",

    // Search
    searchPrompt: "Tẹ orúkọ ibi ìdìbò, ID oníbò, tàbí wọ́dù...",
    searchButton: "Wá",
    searching: "Ń wá...",
    resultsFor: "Àbájáde fún",
    noResults: "A kò rí nǹkankan",
    noResultsSubtitle: "Gbìyànjú ọ̀rọ̀ wíwá mìíràn tàbí wo nípa wọ́dù",
    tryAgain: "Gbìyànjú Lẹ́ẹ̀kan Sí",

    // Polling Unit Details
    pollingUnitDetails: "Àlàyé Ibi Ìdìbò",
    registeredVoters: "Àwọn Oníbò Tí Wọ́n Forúkọ Sílẹ̀",
    location: "Ibi",
    votingHours: "Àkókò Ìdìbò",
    coordinates: "Àwọn Ipò",
    latitude: "Latitude",
    longitude: "Longitude",
    getDirections: "Gba Ìtọ́sọ́nà",
    share: "Pín",
    backTo: "Padà sí",

    // Map
    filterByWard: "Ṣàyẹ̀wò Nípa Wọ́dù",
    allWards: "Gbogbo Wọ́dù",
    pollingUnitsInWard: "ibi ìdìbò ní wọ́dù yìí",
    viewDetails: "Wo Àlàyé",

    // Voice & AI Assistant
    welcome: "Ẹ kú àbọ̀ sí MapMyVote Nigeria. Wá ibi ìdìbò rẹ lọ́nà rọrùn.",
    resultsFound: "A ti rí ibi ìdìbò rẹ.",
    directions: "Tẹ láti gba ìtọ́sọ́nà sí ibi ìdìbò rẹ.",
    listeningPrompt: "Ń tẹ́tí sí... Sọ̀rọ̀ báyìí",
    stopListening: "Dá títẹ́tísí dúró",
    startListening: "Bẹ̀rẹ̀ wíwá pẹ̀lú ohùn",
    speakNow: "Sọ̀rọ̀ báyìí...",

    // AI Assistant specific
    aiAssistantName: "Ìrànlọ́wọ́",
    aiGreeting:
      "Ẹ kú àbọ̀! Mo jẹ́ Ìrànlọ́wọ́, olùrànlọ́wọ́ ìdìbò rẹ. Màá ràn ọ́ lọ́wọ́ láti wá ibi ìdìbò rẹ kí n sì tọ́ ọ síbẹ̀. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́ lónìí?",
    aiAskForHelp: "Béèrè ohunkóhun nípa wíwá ibi ìdìbò rẹ!",
    aiSearching: "Jẹ́ kí n wá ibi ìdìbò rẹ...",
    aiFoundResult: "Ìròyìn rere! Mo ti rí ibi ìdìbò rẹ:",
    aiNoResult: "Mi ò lè rí ibi ìdìbò yẹn. Ṣé o lè gbìyànjú pẹ̀lú orúkọ tàbí wọ́dù mìíràn?",
    aiNavigationStart: "Jẹ́ kí a mú ọ lọ sí ibi ìdìbò rẹ! Màá tọ́ ọ ní ìgbésẹ̀ kan lẹ́yìn ìgbésẹ̀ kan.",
    aiNavigationProgress: "O ń ṣe dáadáa! Nǹkan bí ìṣẹ́jú {minutes} kù sí ibi tí o ń lọ.",
    aiEncouragement1: "Máa lọ! Ìbò rẹ ṣe pàtàkì, o ti fẹ́rẹ̀ẹ́ dé!",
    aiEncouragement2: "O ń ṣe dáadáa gan-an! Ìgbésẹ̀ kọ̀ọ̀kan ń mú ọ súnmọ́ ẹ̀tọ́ ọmọ ìlú rẹ.",
    aiEncouragement3: "O ti fẹ́rẹ̀ẹ́ dé! Rántí pé ìbò rẹ ni ohùn rẹ nínú ìjọba àwọn ènìyàn.",
    aiArrival: "O ti dé ibi ìdìbò rẹ! O ṣeun fún lílo ẹ̀tọ́ rẹ láti dìbò. Rii dájú pé káàdì oníbò rẹ wà ní ọwọ́.",
    aiAskQuestion: "Kí ni o fẹ́ mọ̀?",
    aiTypePlaceholder: "Tẹ ìbéèrè rẹ tàbí lo ohùn...",

    // Footer
    footerTagline: "Fífún àwọn oníbò Nigeria lágbára pẹ̀lú àlàyé ibi ìdìbò tí ó rọrùn láti rí",
    quickLinks: "Àwọn Àjápọ̀ Kíákíá",
    support: "Àtìlẹ́yìn",
    faq: "Àwọn Ìbéèrè Tí A Sábà Béèrè",
    contact: "Kàn Sí Wa",
    reportIssue: "Jábọ̀ Ìṣòro",
    allRightsReserved: "Gbogbo ẹ̀tọ́ ni a pamọ́",

    // Errors
    voiceNotSupported: "Wíwá pẹ̀lú ohùn kò ṣiṣẹ́ nínú browser rẹ.",
    locationError: "A kò lè rí ibi tí o wà. Jọ̀wọ́ gba àwọn iṣẹ́ ibi láààyè.",
    mapNotAvailable: "Àwọn àmì maapu kò sí",
  },

  pcm: {
    // Navigation & Header
    home: "Home",
    mapView: "See Map",
    about: "About Us",
    search: "Search",

    // Hero Section
    heroTitle: "Find Where You Go Vote",
    heroSubtitle:
      "Find di place wey dem assign you to vote for Ibadan North LGA. Search by name, ward, or use voice for English, Yoruba, Pidgin, Hausa, or Igbo.",
    browseMap: "Check Map",
    voiceSearch: "Talk to Search",
    lgaLabel: "Ibadan North Local Government",

    // Stats
    wards: "Wards",
    pollingUnits: "Polling Units",
    languages: "Languages",
    availability: "Availability",

    // Browse by Ward
    browseByWard: "Check by Ward",
    browseByWardSubtitle: "Pick one ward make you see all di polling units wey dey inside",
    noWardsFound: "We no find any ward",
    noWardsSubtitle: "Abeg run di database setup scripts make you get ward data.",

    // How It Works
    howItWorks: "How E Dey Work",
    howItWorksSubtitle: "Three easy way to find where you go vote",
    step1Title: "Search",
    step1Desc: "Type your polling unit name, voter ID, or ward for di search box",
    step2Title: "Locate",
    step2Desc: "See your polling unit for di map with correct location",
    step3Title: "Navigate",
    step3Desc: "Get direction wey go show you road to your voting place",

    // Search
    searchPrompt: "Type polling unit name, voter ID, or ward...",
    searchButton: "Search",
    searching: "Dey search...",
    resultsFor: "Result for",
    noResults: "We no fit find anything",
    noResultsSubtitle: "Try different word or check by ward",
    tryAgain: "Try Again",

    // Polling Unit Details
    pollingUnitDetails: "Polling Unit Info",
    registeredVoters: "People Wey Register",
    location: "Location",
    votingHours: "Voting Time",
    coordinates: "Coordinates",
    latitude: "Latitude",
    longitude: "Longitude",
    getDirections: "Show Me Road",
    share: "Share",
    backTo: "Go Back to",

    // Map
    filterByWard: "Filter by Ward",
    allWards: "All Wards",
    pollingUnitsInWard: "polling units dey dis ward",
    viewDetails: "See Details",

    // Voice & AI Assistant
    welcome: "Welcome to MapMyVote Nigeria. Find where you go vote easy easy.",
    resultsFound: "We don find your polling unit.",
    directions: "Tap make we show you road to your polling unit.",
    listeningPrompt: "Dey listen... Talk now",
    stopListening: "Stop to dey listen",
    startListening: "Start voice search",
    speakNow: "Talk now...",

    // AI Assistant specific
    aiAssistantName: "Ìrànlọ́wọ́",
    aiGreeting:
      "Hello! Na me be Ìrànlọ́wọ́, your voting helper. I go help you find your polling unit and carry you go there. Wetin you want make I help you with today?",
    aiAskForHelp: "Ask me anything about how to find where you go vote!",
    aiSearching: "Make I search for your polling unit...",
    aiFoundResult: "Good news! I don find your polling unit:",
    aiNoResult: "I no fit find dat polling unit. You fit try with different name or ward?",
    aiNavigationStart: "Make we carry you go your polling unit! I go show you step by step.",
    aiNavigationProgress: "You dey do well! About {minutes} minutes remain reach where you dey go.",
    aiEncouragement1: "Continue dey go! Your vote important, you don almost reach!",
    aiEncouragement2: "You dey move well well! Every step dey bring you closer to do your citizen duty.",
    aiEncouragement3: "You don almost reach! Remember say your vote na your voice for democracy.",
    aiArrival: "You don reach your polling unit! Thank you say you come vote. Make sure say your voter card dey ready.",
    aiAskQuestion: "Wetin you want know?",
    aiTypePlaceholder: "Type your question or use voice...",

    // Footer
    footerTagline: "Helping Nigerian voters find polling information easy easy",
    quickLinks: "Quick Links",
    support: "Support",
    faq: "FAQ",
    contact: "Contact Us",
    reportIssue: "Report Problem",
    allRightsReserved: "All rights reserved",

    // Errors
    voiceNotSupported: "Voice search no dey work for your browser.",
    locationError: "We no fit get your location. Abeg turn on location services.",
    mapNotAvailable: "Map location no dey available",
  },
}
