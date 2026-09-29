import type { DangerLevel } from "./sim/engine";

export type VoiceLevel = "WATCH" | "WARNING" | "CRITICAL";

export interface VoiceLanguage {
  code: string;
  name: string;
  native: string;
  regions: string[];
  messages: Record<VoiceLevel, string>;
}

/**
 * Audio asset contract. Files are expected at `/audio/<code>/<level>.mp3`.
 * No recordings are bundled yet — `audioAvailable()` reports false and the
 * player falls back to browser speech synthesis, clearly labelled as such.
 * Dropping real MP3s into `public/audio/<code>/` enables them with no code change.
 */
export function audioPath(code: string, level: VoiceLevel) {
  return `/audio/${code}/${level.toLowerCase()}.mp3`;
}

export const BUNDLED_AUDIO: Record<string, VoiceLevel[]> = {}; // none bundled yet

export function audioAvailable(code: string, level: VoiceLevel) {
  return (BUNDLED_AUDIO[code] ?? []).includes(level);
}

export const LANGUAGES: VoiceLanguage[] = [
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    regions: ["Tamil Nadu", "Puducherry"],
    messages: {
      WATCH: "வானிலை அழுத்தத்தில் மாற்றம் கண்டறியப்பட்டுள்ளது. தொடர்ந்து கண்காணிக்கவும்.",
      WARNING:
        "எச்சரிக்கை. அசாதாரண வளிமண்டல அழுத்த மாற்றம் கண்டறியப்பட்டுள்ளது. பாதுகாப்பான இடத்திற்கு செல்ல தயாராக இருக்கவும்.",
      CRITICAL:
        "அவசர எச்சரிக்கை. ஆபத்தான வளிமண்டல மாற்றம் கண்டறியப்பட்டுள்ளது. உடனடியாக பாதுகாப்பான இடத்திற்கு செல்லவும்.",
    },
  },
  {
    code: "en",
    name: "English",
    native: "English",
    regions: ["Fallback"],
    messages: {
      WATCH: "Atmospheric pressure changes detected. Continue monitoring.",
      WARNING:
        "Warning. An abnormal atmospheric pressure pattern has been detected. Prepare to move to a safe location.",
      CRITICAL:
        "Emergency warning. A potentially hazardous atmospheric event has been detected. Move to a safe location immediately.",
    },
  },
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    regions: ["Andhra Pradesh", "Telangana"],
    messages: {
      WATCH: "వాతావరణ పీడనంలో మార్పులు గుర్తించబడ్డాయి. పరిశీలన కొనసాగించండి.",
      WARNING:
        "హెచ్చరిక. అసాధారణ వాతావరణ పీడన మార్పు గుర్తించబడింది. సురక్షిత ప్రాంతానికి వెళ్లేందుకు సిద్ధంగా ఉండండి.",
      CRITICAL:
        "అత్యవసర హెచ్చరిక. ప్రమాదకర వాతావరణ మార్పు గుర్తించబడింది. వెంటనే సురక్షిత ప్రాంతానికి వెళ్లండి.",
    },
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    regions: ["Karnataka"],
    messages: {
      WATCH: "ವಾಯುಮಂಡಲದ ಒತ್ತಡದಲ್ಲಿ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ. ಗಮನಿಸುತ್ತಿರಿ.",
      WARNING:
        "ಎಚ್ಚರಿಕೆ. ಅಸಾಮಾನ್ಯ ವಾಯುಮಂಡಲ ಒತ್ತಡದ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ. ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಲು ಸಿದ್ಧರಾಗಿರಿ.",
      CRITICAL:
        "ತುರ್ತು ಎಚ್ಚರಿಕೆ. ಅಪಾಯಕಾರಿ ವಾಯುಮಂಡಲ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ.",
    },
  },
  {
    code: "ml",
    name: "Malayalam",
    native: "മലയാളം",
    regions: ["Kerala", "Lakshadweep"],
    messages: {
      WATCH: "അന്തരീക്ഷ മർദ്ദത്തിൽ മാറ്റം കണ്ടെത്തി. നിരീക്ഷണം തുടരുക.",
      WARNING:
        "മുന്നറിയിപ്പ്. അസാധാരണ അന്തരീക്ഷ മർദ്ദ വ്യതിയാനം കണ്ടെത്തി. സുരക്ഷിത സ്ഥലത്തേക്ക് നീങ്ങാൻ തയ്യാറാകുക.",
      CRITICAL:
        "അടിയന്തര മുന്നറിയിപ്പ്. അപകടകരമായ അന്തരീക്ഷ മാറ്റം കണ്ടെത്തി. ഉടൻ സുരക്ഷിത സ്ഥലത്തേക്ക് മാറുക.",
    },
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    regions: ["Hindi-speaking regions", "Delhi", "Uttar Pradesh", "Bihar", "Rajasthan"],
    messages: {
      WATCH: "वायुमंडलीय दबाव में परिवर्तन पाया गया है। निगरानी जारी रखें।",
      WARNING:
        "चेतावनी। असामान्य वायुमंडलीय दबाव परिवर्तन पाया गया है। सुरक्षित स्थान पर जाने के लिए तैयार रहें।",
      CRITICAL:
        "आपातकालीन चेतावनी। खतरनाक वायुमंडलीय परिवर्तन पाया गया है। तुरंत सुरक्षित स्थान पर जाएं।",
    },
  },
  {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    regions: ["Maharashtra", "Goa"],
    messages: {
      WATCH: "वातावरणीय दाबात बदल आढळला आहे. निरीक्षण सुरू ठेवा.",
      WARNING:
        "इशारा. असामान्य वातावरणीय दाब बदल आढळला आहे. सुरक्षित ठिकाणी जाण्याची तयारी ठेवा.",
      CRITICAL:
        "तातडीचा इशारा. धोकादायक वातावरणीय बदल आढळला आहे. त्वरित सुरक्षित ठिकाणी जा.",
    },
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    regions: ["West Bengal", "Tripura", "Andaman & Nicobar"],
    messages: {
      WATCH: "বায়ুমণ্ডলীয় চাপে পরিবর্তন শনাক্ত হয়েছে। পর্যবেক্ষণ চালিয়ে যান।",
      WARNING:
        "সতর্কতা। অস্বাভাবিক বায়ুমণ্ডলীয় চাপ পরিবর্তন শনাক্ত হয়েছে। নিরাপদ স্থানে যাওয়ার জন্য প্রস্তুত থাকুন।",
      CRITICAL:
        "জরুরি সতর্কতা। বিপজ্জনক বায়ুমণ্ডলীয় পরিবর্তন শনাক্ত হয়েছে। অবিলম্বে নিরাপদ স্থানে চলে যান।",
    },
  },
  {
    code: "gu",
    name: "Gujarati",
    native: "ગુજરાતી",
    regions: ["Gujarat", "Daman & Diu"],
    messages: {
      WATCH: "વાતાવરણીય દબાણમાં ફેરફાર જણાયો છે. નિરીક્ષણ ચાલુ રાખો.",
      WARNING:
        "ચેતવણી. અસામાન્ય વાતાવરણીય દબાણ ફેરફાર જણાયો છે. સુરક્ષિત સ્થળે જવા તૈયાર રહો.",
      CRITICAL:
        "કટોકટી ચેતવણી. ખતરનાક વાતાવરણીય ફેરફાર જણાયો છે. તાત્કાલિક સુરક્ષિત સ્થળે જાઓ.",
    },
  },
  {
    code: "pa",
    name: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    regions: ["Punjab", "Chandigarh"],
    messages: {
      WATCH: "ਵਾਯੂਮੰਡਲੀ ਦਬਾਅ ਵਿੱਚ ਤਬਦੀਲੀ ਮਿਲੀ ਹੈ। ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।",
      WARNING:
        "ਚੇਤਾਵਨੀ। ਅਸਧਾਰਨ ਵਾਯੂਮੰਡਲੀ ਦਬਾਅ ਤਬਦੀਲੀ ਮਿਲੀ ਹੈ। ਸੁਰੱਖਿਅਤ ਥਾਂ ਜਾਣ ਲਈ ਤਿਆਰ ਰਹੋ।",
      CRITICAL:
        "ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ। ਖ਼ਤਰਨਾਕ ਵਾਯੂਮੰਡਲੀ ਤਬਦੀਲੀ ਮਿਲੀ ਹੈ। ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਥਾਂ 'ਤੇ ਜਾਓ।",
    },
  },
  {
    code: "or",
    name: "Odia",
    native: "ଓଡ଼ିଆ",
    regions: ["Odisha"],
    messages: {
      WATCH: "ବାୟୁମଣ୍ଡଳୀୟ ଚାପରେ ପରିବର୍ତ୍ତନ ଚିହ୍ନଟ ହୋଇଛି। ନଜର ରଖନ୍ତୁ।",
      WARNING:
        "ସତର୍କତା। ଅସ୍ୱାଭାବିକ ବାୟୁମଣ୍ଡଳୀୟ ଚାପ ପରିବର୍ତ୍ତନ ଚିହ୍ନଟ ହୋଇଛି। ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯିବା ପାଇଁ ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ।",
      CRITICAL:
        "ଜରୁରୀ ସତର୍କତା। ବିପଦଜନକ ବାୟୁମଣ୍ଡଳୀୟ ପରିବର୍ତ୍ତନ ଚିହ୍ନଟ ହୋଇଛି। ତୁରନ୍ତ ସୁରକ୍ଷିତ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ।",
    },
  },
  {
    code: "as",
    name: "Assamese",
    native: "অসমীয়া",
    regions: ["Assam", "North-East"],
    messages: {
      WATCH: "বায়ুমণ্ডলীয় চাপত পৰিৱৰ্তন ধৰা পৰিছে। নিৰীক্ষণ অব্যাহত ৰাখক।",
      WARNING:
        "সতৰ্কবাণী। অস্বাভাৱিক বায়ুমণ্ডলীয় চাপ পৰিৱৰ্তন ধৰা পৰিছে। নিৰাপদ ঠাইলৈ যাবলৈ সাজু থাকক।",
      CRITICAL:
        "জৰুৰীকালীন সতৰ্কবাণী। বিপজ্জনক বায়ুমণ্ডলীয় পৰিৱৰ্তন ধৰা পৰিছে। লগে লগে নিৰাপদ ঠাইলৈ যাওক।",
    },
  },
];

export const STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Goa",
  "Gujarat",
  "West Bengal",
  "Odisha",
  "Punjab",
  "Assam",
  "Puducherry",
  "Delhi",
  "Uttar Pradesh",
  "Other",
];

export const DISTRICTS: Record<string, string[]> = {
  "Tamil Nadu": ["Madurai", "Chennai", "Rameswaram", "Nagapattinam", "Kanyakumari"],
  Kerala: ["Alappuzha", "Kochi", "Kozhikode", "Thiruvananthapuram"],
  Karnataka: ["Udupi", "Mangaluru", "Karwar", "Bengaluru"],
  "Andhra Pradesh": ["Visakhapatnam", "Machilipatnam", "Nellore"],
  Telangana: ["Hyderabad", "Warangal"],
  Maharashtra: ["Mumbai", "Ratnagiri", "Sindhudurg"],
  Gujarat: ["Porbandar", "Dwarka", "Surat"],
  "West Bengal": ["Digha", "Sundarbans", "Kolkata"],
  Odisha: ["Puri", "Paradip", "Gopalpur"],
  Assam: ["Guwahati", "Dibrugarh"],
};

export function languageForState(state: string): VoiceLanguage {
  const match = LANGUAGES.find((l) => l.regions.includes(state));
  return match ?? LANGUAGES.find((l) => l.code === "en")!;
}

export function voiceLevelFor(level: DangerLevel): VoiceLevel | null {
  return level === "NORMAL" ? null : (level as VoiceLevel);
}
