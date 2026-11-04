import { useState, useEffect, useRef, useCallback } from "react"

// ─── Types ──────────────────────────────────────────────────────────
type Screen =
  | "splash"
  | "onboarding"
  | "home"
  | "menu"
  | "confirm"
  | "answer"
  | "uncertain"
  | "summary"
  | "chat"
  | "history"
  | "settings"
  | "serviceDetail"

type Language = "mr" | "hi" | "en"
type ServiceId = "market" | "land" | "scheme" | "other"

interface CallRecord {
  id: string
  service: ServiceId
  question: string
  answer: string
  date: string
  duration: string
}

interface ChatMessage {
  id: string
  user: boolean
  text: string
  duration: string
  timestamp: number
}

// ─── Constants ──────────────────────────────────────────────────────
const A = "/assets/"
const icons = {
  home: A + "6a63f.svg",
  back: A + "70bba.svg",
  phone: A + "40c55.svg",
  chat: A + "b3ffd.svg",
  play: A + "378b2.svg",
  mic: A + "d14dc.svg",
  hangup: A + "21ebe.svg",
  market: A + "c0f84.svg",
  records: A + "ce3b2.svg",
  scheme: A + "78142.svg",
  landmark: A + "36dce.svg",
  sound: A + "128d1.svg",
  userMic: A + "55ea0.svg",
  retry: A + "2bc0f.svg",
  answerPlay: A + "a9cb1.svg",
  help: A + "92672.svg",
  location: A + "b38f1.svg",
  message: A + "22437.svg",
  sprout: A + "15b6d.svg",
  arrow: A + "0b6f0.svg",
  document: A + "0b85a.svg",
  share: A + "9297f.svg",
  notePlay: A + "916a1.svg",
  chatShare: A + "4432f.svg",
  noteMic: A + "199e0.svg",
}

const wave = [7, 12, 19, 10, 24, 15, 9, 20, 13, 7, 15, 10, 20, 12, 6]

const LANGUAGES: Record<Language, { label: string; flag: string }> = {
  mr: { label: "मराठी", flag: "🇮🇳" },
  hi: { label: "हिंदी", flag: "🇮🇳" },
  en: { label: "English", flag: "🇬🇧" },
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  mr: {
    greeting: "नमस्कार!",
    howHelp: "कशी मदत करू?",
    justSpeak: "फक्त बोला. मराठीत टाइप करायची गरज नाही.",
    call: "कॉल करा",
    callDesc: "फोनवर बोलल्यासारखं विचारा",
    chatAction: "चॅट करा",
    chatDesc: "आवाजाची नोट पाठवा, उत्तर ऐका",
    disclaimer: "माहिती व मार्गदर्शनासाठी. अर्ज व कागदपत्रांसाठी संबंधित अधिकृत सेवा वापरा.",
    listenOptions: "हे पर्याय ऐका",
    listenTap: "मराठीत ऐकण्यासाठी दाबा",
    tagline: "तुमच्या भाषेत, तुमच्या सोयीने",
    easyMode: "सोपी आवृत्ती",
    history: "इतिहास",
    settings: "सेटिंग्ज",
    noHistory: "अजून कोणताही कॉल किंवा चॅट नाही",
    noHistoryDesc: "तुमचे कॉल आणि चॅट येथे दिसतील",
    callSummary: "कॉल संपला · सारांश",
    yourSummary: "तुमच्या कॉलचा सारांश",
    readListenShare: "वाचा, ऐका किंवा कुटुंबाला पाठवा.",
    listenFull: "संपूर्ण सारांश ऐका",
    yourQuestion: "तुमचा प्रश्न",
    answerSample: "उत्तर · उदाहरणातील भाव",
    nextStep: "पुढचं पाऊल",
    documents: "सोबत न्यायची कागदपत्रं",
    shareFamily: "कुटुंबासोबत शेअर करा",
    goHome: "मुख्यपृष्ठावर जा",
    callActive: "कॉल सुरू आहे",
    endCall: "कॉल संपवा",
    selectTopic: "कॉल · विषय निवडा",
    whatHelp: "कशासाठी मदत हवी?",
    pressOrSpeak: 'नंबर दाबा किंवा बोला. उदा. बाजारभावासाठी "एक".',
    speakNumber: "नंबर बोला",
    orPresAbove: "किंवा वरचा पर्याय दाबा",
    sameAudio: "हेच पर्याय तुम्हाला ऐकू येतील.",
    chatTitle: "बोलून चॅट करा",
    chatSubtitle: "प्रत्येक उत्तर ऐकता आणि वाचता येईल.",
    sendNote: "बोलून नोट पाठवा",
    noteSent: "नोट पाठवली",
    noTyping: "टाइप करायची गरज नाही. दुरुस्तीही बोलून पाठवा.",
    shareSummaryFamily: "सारांश व कुटुंबाला शेअर",
    onboardTitle1: "तुमच्या भाषेत बोला",
    onboardDesc1: "मराठीत विचारा, मराठीत उत्तर ऐका. टाइप करायची गरज नाही.",
    onboardTitle2: "सरकारी माहिती सहज मिळवा",
    onboardDesc2: "बाजारभाव, जमिनीच्या नोंदी, योजना — सर्व एका ठिकाणी.",
    onboardTitle3: "कुटुंबाला शेअर करा",
    onboardDesc3: "उत्तराचा सारांश WhatsApp वर कुटुंबाला पाठवा.",
    skip: "वगळा",
    next: "पुढे",
    start: "सुरू करा",
    back: "मागे",
    searchHelp: "मदत शोधा...",
    marketPrice: "बाजारभाव",
    marketPriceDesc: "पिकांचा मंडी भाव",
    landRecords: "७/१२ मार्गदर्शन",
    landRecordsDesc: "जमिनीच्या नोंदी समजून घ्या",
    govSchemes: "सरकारी योजना",
    govSchemesDesc: "योजनांसाठी मदत",
    otherQuestions: "इतर प्रश्न",
    otherQuestionsDesc: "योजना आणि सेवांबद्दल",
    language: "भाषा",
    fontSize: "अक्षरांचा आकार",
    small: "छोटा",
    medium: "मध्यम",
    large: "मोठा",
    darkMode: "डार्क मोड",
    notifications: "सूचना",
    about: "माय बोली बद्दल",
    version: "आवृत्ती",
    clearHistory: "इतिहास साफ करा",
    confirmClear: "सर्व इतिहास साफ करायचा?",
    yes: "हो",
    no: "नाही",
  },
  hi: {
    greeting: "नमस्ते!",
    howHelp: "कैसे मदद करें?",
    justSpeak: "बस बोलिए। टाइप करने की ज़रूरत नहीं।",
    call: "कॉल करें",
    callDesc: "फ़ोन पर बात करके पूछें",
    chatAction: "चैट करें",
    chatDesc: "आवाज़ नोट भेजें, जवाब सुनें",
    disclaimer: "जानकारी और मार्गदर्शन के लिए।",
    listenOptions: "ये विकल्प सुनें",
    listenTap: "हिंदी में सुनने के लिए दबाएं",
    tagline: "आपकी भाषा में, आपकी सुविधा से",
    easyMode: "आसान संस्करण",
    history: "इतिहास",
    settings: "सेटिंग्स",
    noHistory: "अभी तक कोई कॉल या चैट नहीं",
    noHistoryDesc: "आपके कॉल और चैट यहां दिखेंगे",
    callSummary: "कॉल खत्म · सारांश",
    yourSummary: "आपकी कॉल का सारांश",
    readListenShare: "पढ़ें, सुनें या परिवार को भेजें।",
    listenFull: "पूरा सारांश सुनें",
    yourQuestion: "आपका सवाल",
    answerSample: "जवाब · नमूना भाव",
    nextStep: "अगला कदम",
    documents: "साथ ले जाने के कागज़ात",
    shareFamily: "परिवार के साथ शेयर करें",
    goHome: "होम पेज पर जाएं",
    callActive: "कॉल चालू है",
    endCall: "कॉल समाप्त करें",
    selectTopic: "कॉल · विषय चुनें",
    whatHelp: "किसके लिए मदद चाहिए?",
    pressOrSpeak: "नंबर दबाएं या बोलें।",
    speakNumber: "नंबर बोलें",
    orPresAbove: "या ऊपर का विकल्प दबाएं",
    sameAudio: "यही विकल्प आपको सुनाई देंगे।",
    chatTitle: "बोलकर चैट करें",
    chatSubtitle: "हर जवाब सुन और पढ़ सकते हैं।",
    sendNote: "बोलकर नोट भेजें",
    noteSent: "नोट भेजी",
    noTyping: "टाइप करने की ज़रूरत नहीं।",
    shareSummaryFamily: "सारांश परिवार को शेयर",
    onboardTitle1: "अपनी भाषा में बोलें",
    onboardDesc1: "हिंदी में पूछें, हिंदी में जवाब सुनें।",
    onboardTitle2: "सरकारी जानकारी आसानी से पाएं",
    onboardDesc2: "बाज़ार भाव, ज़मीन रिकॉर्ड, योजनाएं।",
    onboardTitle3: "परिवार को शेयर करें",
    onboardDesc3: "WhatsApp पर परिवार को सारांश भेजें।",
    skip: "छोड़ें",
    next: "आगे",
    start: "शुरू करें",
    back: "पीछे",
    searchHelp: "मदद खोजें...",
    marketPrice: "बाज़ार भाव",
    marketPriceDesc: "फ़सलों का मंडी भाव",
    landRecords: "7/12 मार्गदर्शन",
    landRecordsDesc: "ज़मीन के रिकॉर्ड समझें",
    govSchemes: "सरकारी योजनाएं",
    govSchemesDesc: "योजनाओं के लिए मदद",
    otherQuestions: "अन्य प्रश्न",
    otherQuestionsDesc: "योजनाओं और सेवाओं के बारे में",
    language: "भाषा",
    fontSize: "अक्षर का आकार",
    small: "छोटा",
    medium: "मध्यम",
    large: "बड़ा",
    darkMode: "डार्क मोड",
    notifications: "सूचनाएं",
    about: "माय बोली के बारे में",
    version: "संस्करण",
    clearHistory: "इतिहास साफ़ करें",
    confirmClear: "सारा इतिहास साफ़ करें?",
    yes: "हां",
    no: "नहीं",
  },
  en: {
    greeting: "Hello!",
    howHelp: "How can I help?",
    justSpeak: "Just speak. No need to type.",
    call: "Make a Call",
    callDesc: "Ask like you're on the phone",
    chatAction: "Start Chat",
    chatDesc: "Send voice notes, hear answers",
    disclaimer: "For information and guidance only. Use official services for applications.",
    listenOptions: "Listen to options",
    listenTap: "Tap to hear in your language",
    tagline: "In your language, at your convenience",
    easyMode: "Easy Mode",
    history: "History",
    settings: "Settings",
    noHistory: "No calls or chats yet",
    noHistoryDesc: "Your calls and chats will appear here",
    callSummary: "Call ended · Summary",
    yourSummary: "Your call summary",
    readListenShare: "Read, listen, or share with family.",
    listenFull: "Listen to full summary",
    yourQuestion: "Your question",
    answerSample: "Answer · Sample price",
    nextStep: "Next step",
    documents: "Documents to carry",
    shareFamily: "Share with family",
    goHome: "Go to home",
    callActive: "Call in progress",
    endCall: "End call",
    selectTopic: "Call · Select topic",
    whatHelp: "What do you need help with?",
    pressOrSpeak: "Press a number or speak. E.g., say 'one' for market prices.",
    speakNumber: "Speak the number",
    orPresAbove: "Or press an option above",
    sameAudio: "You'll hear these same options.",
    chatTitle: "Chat by speaking",
    chatSubtitle: "Every answer can be heard and read.",
    sendNote: "Send voice note",
    noteSent: "Note sent",
    noTyping: "No need to type. Corrections can be spoken too.",
    shareSummaryFamily: "Share summary with family",
    onboardTitle1: "Speak in your language",
    onboardDesc1: "Ask in Marathi, hear answers in Marathi. No typing needed.",
    onboardTitle2: "Get government info easily",
    onboardDesc2: "Market prices, land records, schemes — all in one place.",
    onboardTitle3: "Share with family",
    onboardDesc3: "Send the answer summary to family on WhatsApp.",
    skip: "Skip",
    next: "Next",
    start: "Get Started",
    back: "Back",
    searchHelp: "Search help...",
    marketPrice: "Market Prices",
    marketPriceDesc: "Crop mandi prices",
    landRecords: "7/12 Guide",
    landRecordsDesc: "Understand land records",
    govSchemes: "Govt. Schemes",
    govSchemesDesc: "Help with schemes",
    otherQuestions: "Other Questions",
    otherQuestionsDesc: "About schemes & services",
    language: "Language",
    fontSize: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    about: "About माय बोली",
    version: "Version",
    clearHistory: "Clear History",
    confirmClear: "Clear all history?",
    yes: "Yes",
    no: "No",
  },
}

// ─── Helpers & Hooks ────────────────────────────────────────────────
function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

function useCallTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (active) {
      interval.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      if (interval.current) clearInterval(interval.current)
      setSeconds(0)
    }
    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [active])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function haptic() {
  if (navigator.vibrate) navigator.vibrate(10)
}

// ─── Shared Components ──────────────────────────────────────────────
function Icon({ src, size = 24, alt = "" }: { src: string; size?: number; alt?: string }) {
  return <img src={src} width={size} height={size} alt={alt} draggable={false} />
}

function Header({
  subtitle,
  isHome = false,
  onBack,
  lang,
  onHistoryClick,
  onSettingsClick,
}: {
  subtitle: string
  isHome?: boolean
  onBack: () => void
  lang: Language
  onHistoryClick?: () => void
  onSettingsClick?: () => void
}) {
  const t = TRANSLATIONS[lang]
  return (
    <header className="app-header">
      <button className="nav-icon" onClick={onBack} aria-label={isHome ? "मुख्यपृष्ठ" : "मागे जा"}>
        <Icon src={isHome ? icons.home : icons.back} size={44} />
      </button>
      <div className="identity">
        <strong>माय बोली</strong>
        <span>{subtitle}</span>
      </div>
      {isHome ? (
        <div className="header-actions">
          {onHistoryClick && (
            <button className="header-btn" onClick={onHistoryClick} aria-label={t.history}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          )}
          {onSettingsClick && (
            <button className="header-btn" onClick={onSettingsClick} aria-label={t.settings}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <span className="easy-pill">{t.easyMode}</span>
      )}
    </header>
  )
}

function Waveform({ orange = false, active = false }: { orange?: boolean; active?: boolean }) {
  return (
    <span className={`wave ${orange ? "orange" : ""} ${active ? "active" : ""}`} aria-hidden="true">
      {wave.map((height, i) => (
        <i key={i} style={{ height, ["--i" as string]: i }} />
      ))}
    </span>
  )
}

function AudioCard({
  title,
  detail,
  icon = icons.play,
}: {
  title: string
  detail: string
  icon?: string
}) {
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    haptic()
    if (playing) {
      setPlaying(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setPlaying(true)
      // Simulate audio playback ending
      timerRef.current = setTimeout(() => setPlaying(false), 5000)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <button className={`audio-card ${playing ? "playing" : ""}`} onClick={handleClick}>
      <span className="audio-icon">
        {playing ? (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="14" y="14" width="7" height="20" rx="2" fill="#743b1e" />
            <rect x="27" y="14" width="7" height="20" rx="2" fill="#743b1e" />
          </svg>
        ) : (
          <Icon src={icon} size={48} />
        )}
      </span>
      <span>
        <strong>{playing ? "ऐकत आहात…" : title}</strong>
        <small>{playing ? "थांबवण्यासाठी पुन्हा दाबा" : detail}</small>
      </span>
      {playing && (
        <span className="audio-progress-ring">
          <Waveform active />
        </span>
      )}
    </button>
  )
}

function CallStatus({ time, lang }: { time: string; lang: Language }) {
  const t = TRANSLATIONS[lang]
  return (
    <div className="call-status">
      <span>
        <i className="pulse-dot" /> {t.callActive}
      </span>
      <span className="call-timer">{time}</span>
    </div>
  )
}

function CallDock({
  title,
  detail,
  onVoice,
  onEnd,
  lang,
}: {
  title: string
  detail: string
  onVoice: () => void
  onEnd: () => void
  lang: Language
}) {
  const t = TRANSLATIONS[lang]
  const [listening, setListening] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleVoice = () => {
    haptic()
    if (listening) {
      setListening(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      onVoice()
    } else {
      setListening(true)
      // Simulate listening for 3 seconds then auto-submit
      timerRef.current = setTimeout(() => {
        setListening(false)
        onVoice()
      }, 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <footer className="dock">
      <button className={`voice-action ${listening ? "listening" : ""}`} onClick={handleVoice}>
        <span className="mic-icon-wrap">
          <Icon src={icons.mic} size={48} />
          {listening && <span className="mic-ripple" />}
        </span>
        <span>
          <strong>{listening ? "मी ऐकत आहे…" : title}</strong>
          <small>{detail}</small>
        </span>
      </button>
      <button className="end-call" onClick={() => { haptic(); onEnd() }}>
        <Icon src={icons.hangup} size={19} /> {t.endCall}
      </button>
    </footer>
  )
}

function BottomNav({
  active,
  onNavigate,
  lang,
}: {
  active: "home" | "history" | "settings"
  onNavigate: (screen: Screen) => void
  lang: Language
}) {
  const t = TRANSLATIONS[lang]
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button
        className={`bottom-nav-item ${active === "home" ? "active" : ""}`}
        onClick={() => onNavigate("home")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>{lang === "en" ? "Home" : "होम"}</span>
      </button>
      <button
        className={`bottom-nav-item ${active === "history" ? "active" : ""}`}
        onClick={() => onNavigate("history")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{t.history}</span>
      </button>
      <button
        className={`bottom-nav-item ${active === "settings" ? "active" : ""}`}
        onClick={() => onNavigate("settings")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span>{t.settings}</span>
      </button>
    </nav>
  )
}

function SummaryItem({
  icon,
  title,
  children,
  last = false,
}: {
  icon: string
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={`summary-item ${last ? "last" : ""}`}>
      <Icon src={icon} size={22} />
      <span>
        <strong>{title}</strong>
        <p>{children}</p>
      </span>
    </div>
  )
}

function VoiceNote({
  user,
  duration,
  text,
}: {
  user: boolean
  duration: string
  text: string
}) {
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePlay = () => {
    haptic()
    if (playing) {
      setPlaying(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setPlaying(true)
      timerRef.current = setTimeout(() => setPlaying(false), 4000)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <article className={`voice-note ${user ? "user" : "agent"}`}>
      <button onClick={handlePlay} aria-label="आवाजाची नोट ऐका">
        {playing ? (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="12" y="12" width="7" height="20" rx="2" fill={user ? "#743b1e" : "#8a4623"} />
            <rect x="25" y="12" width="7" height="20" rx="2" fill={user ? "#743b1e" : "#8a4623"} />
          </svg>
        ) : (
          <Icon src={icons.notePlay} size={44} />
        )}
      </button>
      <div className="note-meta">
        <span>
          <Waveform active={playing} />
          <small>{duration}</small>
        </span>
        <small>{user ? "तुम्ही · आवाजाची नोट" : "माय बोली · मराठीत उत्तर"}</small>
      </div>
      <p>{text}</p>
      {!user && duration === "०:२४" && (
        <small className="note-context">
          नमुना अहवाल: १५ जून २०२६
          <br />
          हे सध्याचे पडताळलेले भाव नाहीत. विक्रीआधी अधिकृत AGMARKNET किंवा बाजार समितीचा
          दिनांकित अहवाल तपासा.
        </small>
      )}
    </article>
  )
}

function PageTransition({ children, screen }: { children: React.ReactNode; screen: string }) {
  const [visible, setVisible] = useState(false)
  const prevScreen = useRef(screen)

  useEffect(() => {
    if (prevScreen.current !== screen) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 30)
      prevScreen.current = screen
      return () => clearTimeout(t)
    } else {
      setVisible(true)
    }
  }, [screen])

  return <div className={`page-transition ${visible ? "entered" : ""}`}>{children}</div>
}

// ─── Screen Components ──────────────────────────────────────────────

function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2400)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className="splash-screen"
      onClick={onDone}
      role="button"
      tabIndex={0}
      aria-label="सुरू करण्यासाठी टॅप करा"
    >
      <div className="splash-frame">
        <img src="/image.png" alt="माय बोली" className="splash-image" />
      </div>
      <div className="splash-progress-track">
        <div className="splash-progress-fill" />
      </div>
    </div>
  )
}

function Onboarding({ onDone, lang }: { onDone: () => void; lang: Language }) {
  const t = TRANSLATIONS[lang]
  const [step, setStep] = useState(0)
  const slides = [
    {
      icon: "🎙️",
      title: t.onboardTitle1,
      desc: t.onboardDesc1,
      color: "#b2754c",
    },
    {
      icon: "🏛️",
      title: t.onboardTitle2,
      desc: t.onboardDesc2,
      color: "#c08761",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: t.onboardTitle3,
      desc: t.onboardDesc3,
      color: "#b2754c",
    },
  ]

  return (
    <div className="onboarding-screen">
      <button className="onboarding-skip" onClick={onDone}>
        {t.skip}
      </button>
      <div className="onboarding-slides">
        <div className="onboarding-slide">
          <div className="onboarding-icon" style={{ background: slides[step].color + "15" }}>
            <span style={{ fontSize: 56 }}>{slides[step].icon}</span>
          </div>
          <h1>{slides[step].title}</h1>
          <p>{slides[step].desc}</p>
        </div>
      </div>
      <div className="onboarding-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`onboarding-dot ${i === step ? "active" : ""}`}
            onClick={() => setStep(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
      <div className="onboarding-actions">
        {step < slides.length - 1 ? (
          <button className="onboarding-next" onClick={() => setStep(step + 1)}>
            {t.next}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : (
          <button className="onboarding-start" onClick={onDone}>
            {t.start}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function Home({
  go,
  lang,
  onHistoryClick,
  onSettingsClick,
}: {
  go: (s: Screen) => void
  lang: Language
  onHistoryClick: () => void
  onSettingsClick: () => void
}) {
  const t = TRANSLATIONS[lang]

  return (
    <>
      <Header
        subtitle={lang === "mr" ? "कॉल किंवा चॅट · मराठी" : lang === "hi" ? "कॉल या चैट · हिंदी" : "Call or Chat"}
        isHome
        onBack={() => go("home")}
        lang={lang}
        onHistoryClick={onHistoryClick}
        onSettingsClick={onSettingsClick}
      />
      <main className="content home-content">
        <section className="welcome">
          <strong>{t.greeting}</strong>
          <h1>{t.howHelp}</h1>
          <p>{t.justSpeak}</p>
        </section>
        <button className="choice primary" onClick={() => { haptic(); go("menu") }}>
          <span className="choice-icon">
            <Icon src={icons.phone} size={34} />
          </span>
          <span>
            <strong>{t.call}</strong>
            <small>{t.callDesc}</small>
          </span>
          <svg className="choice-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button className="choice" onClick={() => { haptic(); go("chat") }}>
          <span className="choice-icon">
            <Icon src={icons.chat} size={34} />
          </span>
          <span>
            <strong>{t.chatAction}</strong>
            <small>{t.chatDesc}</small>
          </span>
          <svg className="choice-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <p className="muted">{t.disclaimer}</p>

        {/* Quick access service cards */}
        <section className="quick-services">
          <h2 className="section-title">
            {lang === "mr" ? "लोकप्रिय सेवा" : lang === "hi" ? "लोकप्रिय सेवाएं" : "Popular Services"}
          </h2>
          <div className="quick-service-grid">
            {[
              { icon: icons.market, label: t.marketPrice, color: "#ffffff" },
              { icon: icons.records, label: t.landRecords, color: "#ffffff" },
              { icon: icons.scheme, label: t.govSchemes, color: "#ffffff" },
              { icon: icons.landmark, label: t.otherQuestions, color: "#ffffff" },
            ].map((svc, i) => (
              <button
                key={i}
                className="quick-service-card"
                style={{ background: svc.color }}
                onClick={() => { haptic(); go("menu") }}
              >
                <Icon src={svc.icon} size={32} />
                <small>{svc.label}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="dock welcome-dock">
        <AudioCard title={t.listenOptions} detail={t.listenTap} />
        <p>{t.tagline}</p>
      </footer>
      <BottomNav active="home" onNavigate={go} lang={lang} />
    </>
  )
}

const services: [string, string, string, string, ServiceId][] = [
  ["1", icons.market, "बाजारभाव", "पिकांचा मंडी भाव", "market"],
  ["2", icons.records, "७/१२ मार्गदर्शन", "जमिनीच्या नोंदी समजून घ्या", "land"],
  ["3", icons.scheme, "सरकारी योजना", "योजनांसाठी मदत", "scheme"],
  ["4", icons.landmark, "इतर प्रश्न", "योजना आणि सेवांबद्दल", "other"],
]

function Menu({ go, lang, callTime }: { go: (s: Screen) => void; lang: Language; callTime: string }) {
  const t = TRANSLATIONS[lang]
  const localizedServices = services.map(([num, icon, , , id]) => {
    const titleKey = id === "market" ? "marketPrice" : id === "land" ? "landRecords" : id === "scheme" ? "govSchemes" : "otherQuestions"
    const descKey = id === "market" ? "marketPriceDesc" : id === "land" ? "landRecordsDesc" : id === "scheme" ? "govSchemesDesc" : "otherQuestionsDesc"
    return [num, icon, t[titleKey], t[descKey], id] as const
  })

  return (
    <>
      <Header subtitle={t.selectTopic} onBack={() => go("home")} lang={lang} />
      <main className="content">
        <CallStatus time={callTime} lang={lang} />
        <section className="intro">
          <h1>{t.whatHelp}</h1>
          <p>{t.pressOrSpeak}</p>
        </section>
        <div className="service-list">
          {localizedServices.map(([number, icon, title, detail], index) => (
            <button
              key={number}
              className="service"
              onClick={() => { haptic(); go(index === 0 ? "confirm" : "uncertain") }}
            >
              <b>{number}</b>
              <span className="service-icon">
                <Icon src={icon} size={index === 3 ? 28 : 46} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
              <svg className="service-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#743b1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ))}
        </div>
        <p className="reassurance">
          <Icon src={icons.sound} size={22} /> {t.sameAudio}
        </p>
      </main>
      <CallDock
        title={t.speakNumber}
        detail={t.orPresAbove}
        onVoice={() => go("confirm")}
        onEnd={() => go("home")}
        lang={lang}
      />
    </>
  )
}

function Confirm({ go, lang, callTime }: { go: (s: Screen) => void; lang: Language; callTime: string }) {
  return (
    <>
      <Header subtitle="कॉल · बाजारभाव" onBack={() => go("menu")} lang={lang} />
      <main className="content">
        <CallStatus time={callTime} lang={lang} />
        <section className="previous-turn">
          <p>नमस्कार! मी माय बोली.</p>
          <strong>कांद्याचा भाव सांगते. कोणत्या बाजाराचा भाव हवा?</strong>
        </section>
        <div className="transcript">
          <Icon src={icons.userMic} size={24} />
          <span>
            <small>तुम्ही म्हणालात</small>
            <strong>"लासलगाव"</strong>
          </span>
        </div>
        <section className="confirmation">
          <h1>लासलगाव, बरोबर?</h1>
          <Waveform orange active />
          <strong>तुमच्या उत्तराची वाट पाहते…</strong>
        </section>
        <section className="guidance">
          <h2>
            <Icon src={icons.retry} size={20} /> चूक झाली? बोलून बदला.
          </h2>
          <p>"नाही, लासलगाव, नाशिक."</p>
          <small>
            नाव, ठिकाण किंवा आकडा दुरुस्त करा. प्रत्येक उत्तर पुन्हा ऐकवून खात्री करू.
          </small>
        </section>
        <p className="muted">तुम्ही निवडलं: कांदा · लाल</p>
      </main>
      <CallDock
        title='"हो" किंवा दुरुस्ती बोला'
        detail="माईक सुरू आहे · मी ऐकत आहे"
        onVoice={() => go("answer")}
        onEnd={() => go("summary")}
        lang={lang}
      />
    </>
  )
}

function Answer({ go, lang, callTime }: { go: (s: Screen) => void; lang: Language; callTime: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2))
    }, 120)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Header subtitle="कॉल · उत्तर ऐका" onBack={() => go("confirm")} lang={lang} />
      <main className="content">
        <CallStatus time={callTime} lang={lang} />
        <section className="intro answer-intro">
          <h1>तुमचा बाजारभाव</h1>
          <p>
            लासलगाव, नाशिक
            <br />
            कांदा · लाल
          </p>
        </section>
        <section className="price-card">
          <span>उदाहरणातील भाव</span>
          <small>सर्वसाधारण भाव</small>
          <strong>₹१,८५०</strong>
          <p>प्रति क्विंटल</p>
          <div className="price-range">
            <div className="price-range-item">
              <small>किमान</small>
              <b>₹१,६००</b>
            </div>
            <div className="price-range-divider" />
            <div className="price-range-item">
              <small>कमाल</small>
              <b>₹२,१००</b>
            </div>
          </div>
          <hr />
          <p>नमुना अहवाल दिनांक: १५ जून २०२६</p>
        </section>
        <AudioCard
          title="उत्तर ऐकत आहात"
          detail="०:१२ / ०:२४ · मराठी"
          icon={icons.answerPlay}
        />
        <div className="progress">
          <i style={{ width: `${progress}%` }} />
        </div>
        <section className="source">
          <strong>अधिकृत संदर्भ: AGMARKNET</strong>
          <p>
            हे नमुना आकडे आहेत; सध्याचे पडताळलेले भाव नाहीत. खरा भाव AGMARKNET किंवा
            बाजार समितीच्या दिनांकित अहवालात तपासा.
          </p>
        </section>
      </main>
      <CallDock
        title="पुन्हा ऐकायचं? बोला"
        detail='"पुन्हा सांगा" किंवा नवा प्रश्न विचारा'
        onVoice={() => {}}
        onEnd={() => go("summary")}
        lang={lang}
      />
    </>
  )
}

function Uncertain({ go, lang, callTime }: { go: (s: Screen) => void; lang: Language; callTime: string }) {
  const [found, setFound] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSearch = () => {
    haptic()
    setSearching(true)
    setTimeout(() => {
      setSearching(false)
      setFound(true)
    }, 1500)
  }

  return (
    <>
      <Header subtitle="कॉल · स्थानिक मदत" onBack={() => go("menu")} lang={lang} />
      <main className="content">
        <CallStatus time={callTime} lang={lang} />
        <section className="uncertain-card">
          <Icon src={icons.help} size={36} />
          <h1>मला याची खात्री नाही.</h1>
          <p>पडताळलेली माहिती मिळाली नाही. अंदाजाने उत्तर देणार नाही.</p>
        </section>
        <AudioCard title="हा संदेश पुन्हा ऐका" detail="मराठी · ०:१८" />
        <section className="local-help">
          <h2>प्रत्यक्ष मदत मिळवा</h2>
          <div className="office">
            <Icon src={icons.landmark} size={32} />
            <span>
              <strong>सेतू / CSC केंद्र</strong>
              <small>जमिनीच्या नोंदींसाठी तलाठी कार्यालय</small>
            </span>
          </div>
          {found && (
            <div className="found-centers">
              <div className="center-card">
                <div className="center-badge">📍</div>
                <div>
                  <strong>सेतू केंद्र, नाशिक रोड</strong>
                  <small>अंतर: ~२ किमी · सोम-शुक्र ९:३०-५:३०</small>
                </div>
              </div>
              <div className="center-card">
                <div className="center-badge">📍</div>
                <div>
                  <strong>CSC केंद्र, पंचवटी</strong>
                  <small>अंतर: ~४ किमी · सोम-शनि ९:००-६:००</small>
                </div>
              </div>
            </div>
          )}
          <h2>तुमचं गाव कोणतं?</h2>
          <p>
            {found
              ? "तुमच्या परिसरातील अधिकृत केंद्रांची माहिती तयार आहे."
              : "गाव कळल्यावर जवळची मदत शोधू. अजून कोणतंही केंद्र निवडलेलं नाही."}
          </p>
        </section>
        <button className={`outline-action ${searching ? "loading" : ""}`} onClick={handleSearch} disabled={searching}>
          {searching ? (
            <>
              <span className="spinner" /> शोधत आहे...
            </>
          ) : (
            <>
              <Icon src={icons.location} size={24} />{" "}
              {found ? "जवळची केंद्रं सापडली ✓" : "जवळची मदत शोधा"}
            </>
          )}
        </button>
      </main>
      <CallDock
        title="तुमच्या गावाचं नाव बोला"
        detail="जवळची मदत शोधण्यासाठी"
        onVoice={() => { handleSearch() }}
        onEnd={() => go("summary")}
        lang={lang}
      />
    </>
  )
}

function Summary({ go, share, lang }: { go: (s: Screen) => void; share: () => void; lang: Language }) {
  const t = TRANSLATIONS[lang]
  return (
    <>
      <Header subtitle={t.callSummary} onBack={() => go("home")} lang={lang} />
      <main className="content">
        <section className="intro">
          <h1>{t.yourSummary}</h1>
          <p>{t.readListenShare}</p>
        </section>
        <AudioCard
          title={t.listenFull}
          detail={lang === "mr" ? "प्रश्न, उत्तर आणि पुढचं पाऊल · ०:४०" : "Question, answer and next step · 0:40"}
        />
        <section className="summary-card">
          <SummaryItem icon={icons.message} title={t.yourQuestion}>
            लासलगाव, नाशिक येथे लाल कांद्याचा भाव किती?
          </SummaryItem>
          <SummaryItem icon={icons.sprout} title={t.answerSample}>
            <b>₹१,८५० प्रति क्विंटल</b>
            <small>
              कांदा · लाल
              <br />
              नमुना अहवाल: १५ जून २०२६
            </small>
          </SummaryItem>
          <SummaryItem icon={icons.arrow} title={t.nextStep}>
            विक्रीआधी AGMARKNET किंवा बाजार समितीचा दिनांकित अहवाल तपासा.
          </SummaryItem>
          <SummaryItem icon={icons.document} title={t.documents} last>
            भाव विचारण्यासाठी कोणतीही कागदपत्रं लागत नाहीत.
          </SummaryItem>
        </section>
        <p className="muted">
          हे फक्त नमुना आकडे आहेत. सध्याचे अधिकृत भाव पडताळलेले नाहीत.
        </p>
      </main>
      <footer className="dock summary-dock">
        <button className="share-button" onClick={share}>
          <Icon src={icons.share} size={24} /> {t.shareFamily}
        </button>
        <button className="home-link" onClick={() => go("home")}>
          {t.goHome}
        </button>
      </footer>
    </>
  )
}

const defaultNotes: ChatMessage[] = [
  {
    id: "1",
    user: true,
    duration: "०:०६",
    text: "लासलगाव, नाशिक येथे लाल कांद्याचा भाव किती?",
    timestamp: Date.now() - 120000,
  },
  { id: "2", user: false, duration: "०:०४", text: "लासलगाव, बरोबर?", timestamp: Date.now() - 100000 },
  { id: "3", user: true, duration: "०:०२", text: "हो, बरोबर.", timestamp: Date.now() - 80000 },
  {
    id: "4",
    user: false,
    duration: "०:२४",
    text: "लाल कांदा · लासलगाव, नाशिक\nउदाहरणातील भाव: ₹१,८५० प्रति क्विंटल.",
    timestamp: Date.now() - 60000,
  },
]

function Chat({ go, share, lang }: { go: (s: Screen) => void; share: () => void; lang: Language }) {
  const t = TRANSLATIONS[lang]
  const [messages, setMessages] = useState<ChatMessage[]>(defaultNotes)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startRecording = () => {
    haptic()
    setRecording(true)
    setRecordingTime(0)
    recordingTimer.current = setInterval(() => {
      setRecordingTime((t) => t + 1)
    }, 1000)
  }

  const stopRecording = () => {
    setRecording(false)
    if (recordingTimer.current) clearInterval(recordingTimer.current)

    // Simulate sending a message
    const userMsg: ChatMessage = {
      id: generateId(),
      user: true,
      duration: `०:${recordingTime.toString().padStart(2, "0")}` || "०:०२",
      text: "धन्यवाद.",
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Simulate bot response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: generateId(),
        user: false,
        duration: "०:०५",
        text: "आणखी काही मदत हवी असल्यास विचारा!",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 1500)
  }

  return (
    <>
      <Header subtitle={lang === "mr" ? "चॅट · बोला आणि ऐका" : "Chat · Speak & Listen"} onBack={() => go("home")} lang={lang} />
      <main className="content chat-content">
        <section className="intro">
          <h1>{t.chatTitle}</h1>
          <p>{t.chatSubtitle}</p>
        </section>
        <div className="conversation">
          {messages.map((note) => (
            <VoiceNote key={note.id} user={note.user} duration={note.duration} text={note.text} />
          ))}
          {recording && (
            <div className="recording-indicator">
              <span className="recording-dot" />
              <Waveform active />
              <small>
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
              </small>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <button className="outline-action" onClick={share}>
          <Icon src={icons.chatShare} size={24} /> {t.shareSummaryFamily}
        </button>
      </main>
      <footer className="dock chat-dock">
        {recording ? (
          <div className="recording-controls">
            <button className="cancel-recording" onClick={() => {
              setRecording(false)
              if (recordingTimer.current) clearInterval(recordingTimer.current)
            }}>
              ✕
            </button>
            <div className="recording-status">
              <span className="recording-dot" />
              <span>रेकॉर्ड होत आहे… {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</span>
            </div>
            <button className="send-recording" onClick={stopRecording}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        ) : (
          <button className="note-button" onClick={startRecording}>
            <Icon src={icons.noteMic} size={24} /> {t.sendNote}
          </button>
        )}
        <p>{t.noTyping}</p>
      </footer>
    </>
  )
}

function History({
  go,
  lang,
  records,
  onClear,
}: {
  go: (s: Screen) => void
  lang: Language
  records: CallRecord[]
  onClear: () => void
}) {
  const t = TRANSLATIONS[lang]
  const [confirmClear, setConfirmClear] = useState(false)

  return (
    <>
      <Header subtitle={t.history} onBack={() => go("home")} lang={lang} />
      <main className="content">
        <section className="intro">
          <h1>{t.history}</h1>
        </section>
        {records.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c4ad9b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h2>{t.noHistory}</h2>
            <p>{t.noHistoryDesc}</p>
          </div>
        ) : (
          <>
            <div className="history-list">
              {records.map((record) => (
                <button key={record.id} className="history-card" onClick={() => go("summary")}>
                  <div className="history-icon">
                    <Icon src={icons[record.service === "market" ? "market" : record.service === "land" ? "records" : record.service === "scheme" ? "scheme" : "landmark"]} size={28} />
                  </div>
                  <div className="history-info">
                    <strong>{record.question}</strong>
                    <small>{record.date} · {record.duration}</small>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#743b1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>
            {confirmClear ? (
              <div className="confirm-bar">
                <p>{t.confirmClear}</p>
                <div className="confirm-actions">
                  <button className="confirm-no" onClick={() => setConfirmClear(false)}>{t.no}</button>
                  <button className="confirm-yes" onClick={() => { onClear(); setConfirmClear(false) }}>{t.yes}</button>
                </div>
              </div>
            ) : (
              <button className="outline-action danger" onClick={() => setConfirmClear(true)}>
                🗑️ {t.clearHistory}
              </button>
            )}
          </>
        )}
      </main>
      <BottomNav active="history" onNavigate={go} lang={lang} />
    </>
  )
}

function Settings({
  go,
  lang,
  setLang,
  fontSize,
  setFontSize,
  darkMode,
  setDarkMode,
}: {
  go: (s: Screen) => void
  lang: Language
  setLang: (l: Language) => void
  fontSize: "small" | "medium" | "large"
  setFontSize: (s: "small" | "medium" | "large") => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}) {
  const t = TRANSLATIONS[lang]

  return (
    <>
      <Header subtitle={t.settings} onBack={() => go("home")} lang={lang} />
      <main className="content">
        <section className="intro">
          <h1>{t.settings}</h1>
        </section>

        <div className="settings-group">
          <h2 className="settings-label">{t.language}</h2>
          <div className="language-picker">
            {(Object.keys(LANGUAGES) as Language[]).map((l) => (
              <button
                key={l}
                className={`lang-option ${l === lang ? "active" : ""}`}
                onClick={() => { haptic(); setLang(l) }}
              >
                <span>{LANGUAGES[l].flag}</span>
                <span>{LANGUAGES[l].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-label">{t.fontSize}</h2>
          <div className="font-size-picker">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                className={`font-size-option ${size === fontSize ? "active" : ""}`}
                onClick={() => { haptic(); setFontSize(size) }}
              >
                <span style={{ fontSize: size === "small" ? 14 : size === "medium" ? 18 : 22 }}>
                  {size === "small" ? "अ" : size === "medium" ? "अ" : "अ"}
                </span>
                <small>{t[size]}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-toggle-row">
            <div>
              <strong>{t.darkMode}</strong>
              <small>{lang === "mr" ? "डोळ्यांना आराम" : lang === "hi" ? "आंखों को आराम" : "Easy on the eyes"}</small>
            </div>
            <button
              className={`toggle-switch ${darkMode ? "on" : ""}`}
              onClick={() => { haptic(); setDarkMode(!darkMode) }}
              role="switch"
              aria-checked={darkMode}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-label">{t.about}</h2>
          <div className="about-card">
            <div className="about-logo">
              <svg width="48" height="48" viewBox="0 0 80 80" fill="none">
                <rect width="80" height="80" rx="20" fill="#b2754c" />
                <text x="40" y="55" textAnchor="middle" fill="white" fontSize="42" fontWeight="700" fontFamily="'Noto Sans Devanagari:Bold', sans-serif">म</text>
              </svg>
            </div>
            <div>
              <strong>माय बोली</strong>
              <small>{t.version} 1.0.0</small>
              <p className="about-desc">
                {lang === "mr"
                  ? "ग्रामीण भारतासाठी मराठी आवाज सहाय्यक. बाजारभाव, जमिनीच्या नोंदी, सरकारी योजना — सर्व तुमच्या भाषेत."
                  : lang === "hi"
                    ? "ग्रामीण भारत के लिए मराठी आवाज़ सहायक।"
                    : "Marathi voice assistant for rural India. Market prices, land records, government schemes — all in your language."}
              </p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav active="settings" onNavigate={go} lang={lang} />
    </>
  )
}

// ─── App Root ───────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash")
  const [toast, setToast] = useState("")
  const [hasOnboarded, setHasOnboarded] = useLocalStorage("mayboli-onboarded", false)
  const [lang, setLang] = useLocalStorage<Language>("mayboli-lang", "mr")
  const [fontSize, setFontSize] = useLocalStorage<"small" | "medium" | "large">("mayboli-fontsize", "medium")
  const [darkMode, setDarkMode] = useLocalStorage("mayboli-darkmode", false)
  const [callRecords, setCallRecords] = useLocalStorage<CallRecord[]>("mayboli-history", [
    {
      id: "demo1",
      service: "market",
      question: "लासलगाव कांदा भाव",
      answer: "₹१,८५० प्रति क्विंटल",
      date: "१५ जून २०२६",
      duration: "१:१२",
    },
    {
      id: "demo2",
      service: "scheme",
      question: "पीएम किसान योजना माहिती",
      answer: "पात्रता आणि अर्ज प्रक्रिया",
      date: "१४ जून २०२६",
      duration: "२:०५",
    },
  ])

  const callActive = ["menu", "confirm", "answer", "uncertain"].includes(screen)
  const callTime = useCallTimer(callActive)

  const go = useCallback((next: Screen) => {
    haptic()
    setScreen(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const share = useCallback(async () => {
    const text =
      "माय बोली सारांश: लासलगाव, नाशिक — लाल कांदा, उदाहरणातील भाव ₹१,८५० प्रति क्विंटल."
    try {
      if (navigator.share) await navigator.share({ title: "माय बोली सारांश", text })
      else await navigator.clipboard.writeText(text)
      setToast(lang === "mr" ? "सारांश शेअर करण्यासाठी तयार आहे" : "Summary ready to share")
    } catch {
      setToast(lang === "mr" ? "शेअर रद्द केले" : "Share cancelled")
    }
    window.setTimeout(() => setToast(""), 2200)
  }, [lang])

  // Handle splash -> onboarding -> home flow
  const handleSplashDone = useCallback(() => {
    if (!hasOnboarded) {
      setScreen("onboarding")
    } else {
      setScreen("home")
    }
  }, [hasOnboarded])

  const handleOnboardingDone = useCallback(() => {
    setHasOnboarded(true)
    setScreen("home")
  }, [setHasOnboarded])

  // Apply font size and dark mode
  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px"
    root.classList.toggle("dark", darkMode)
  }, [fontSize, darkMode])

  // Handle back button / swipe-back for Android
  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      e.preventDefault()
      if (screen === "home" || screen === "splash" || screen === "onboarding") return
      if (screen === "menu") go("home")
      else if (screen === "confirm") go("menu")
      else if (screen === "answer") go("confirm")
      else if (screen === "uncertain") go("menu")
      else if (screen === "summary") go("home")
      else if (screen === "chat") go("home")
      else if (screen === "history") go("home")
      else if (screen === "settings") go("home")
      else go("home")
    }

    window.history.pushState(null, "", "")
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [screen, go])

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <PageTransition screen={screen}>
        {screen === "splash" && <SplashScreen onDone={handleSplashDone} />}
        {screen === "onboarding" && <Onboarding onDone={handleOnboardingDone} lang={lang} />}
        {screen === "home" && (
          <Home
            go={go}
            lang={lang}
            onHistoryClick={() => go("history")}
            onSettingsClick={() => go("settings")}
          />
        )}
        {screen === "menu" && <Menu go={go} lang={lang} callTime={callTime} />}
        {screen === "confirm" && <Confirm go={go} lang={lang} callTime={callTime} />}
        {screen === "answer" && <Answer go={go} lang={lang} callTime={callTime} />}
        {screen === "uncertain" && <Uncertain go={go} lang={lang} callTime={callTime} />}
        {screen === "summary" && <Summary go={go} share={share} lang={lang} />}
        {screen === "chat" && <Chat go={go} share={share} lang={lang} />}
        {screen === "history" && (
          <History
            go={go}
            lang={lang}
            records={callRecords}
            onClear={() => setCallRecords([])}
          />
        )}
        {screen === "settings" && (
          <Settings
            go={go}
            lang={lang}
            setLang={setLang}
            fontSize={fontSize}
            setFontSize={setFontSize}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}
      </PageTransition>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
