import type { Lang } from "./options";

// Form copy in English and Tamil. Tamil text should be reviewed by a native
// speaker before launch (listed in the README's data cautions).
const S = {
  title: { en: "Report a problem", ta: "பிரச்சனையைப் புகார் செய்யுங்கள்" },
  step: { en: "Step", ta: "படி" },
  of: { en: "of", ta: "/" },
  back: { en: "Back", ta: "பின்செல்" },
  next: { en: "Next", ta: "அடுத்து" },
  skip: { en: "Skip", ta: "தவிர்" },
  draftSaved: { en: "Draft saved on this device", ta: "இந்தச் சாதனத்தில் வரைவு சேமிக்கப்பட்டது" },

  q1: { en: "What is the problem?", ta: "என்ன பிரச்சனை?" },
  q1Hint: { en: "Pick the closest one.", ta: "பொருத்தமானதைத் தேர்ந்தெடுங்கள்." },

  q2: { en: "Where is it?", ta: "எங்கே உள்ளது?" },
  q2Hint: { en: "Move the map so the pin sits on the exact spot.", ta: "சரியான இடத்தில் குறி இருக்கும்படி வரைபடத்தை நகர்த்துங்கள்." },
  useLocation: { en: "Use my location", ta: "என் இருப்பிடம்" },
  locating: { en: "Finding you…", ta: "தேடுகிறது…" },
  locationDenied: { en: "Location is off. Move the map by hand instead.", ta: "இருப்பிடம் அணைக்கப்பட்டுள்ளது. வரைபடத்தை கையால் நகர்த்துங்கள்." },
  road: { en: "Road or street", ta: "சாலை / தெரு" },
  locality: { en: "Area", ta: "பகுதி" },
  landmark: { en: "Nearest landmark", ta: "அருகிலுள்ள அடையாளம்" },
  landmarkPlaceholder: { en: "e.g. opposite the metro pillar", ta: "எ.கா. மெட்ரோ தூண் எதிரே" },

  q3: { en: "Add photos or a short video", ta: "புகைப்படம் அல்லது சிறு வீடியோ சேர்க்கவும்" },
  q3Hint: { en: "Up to 4 photos and 1 video (30 seconds). These are proof for your neighbours and officials.", ta: "4 புகைப்படங்கள், 1 வீடியோ (30 விநாடி) வரை. இவை அக்கம்பக்கத்தினருக்கும் அதிகாரிகளுக்கும் சான்று." },
  addPhoto: { en: "Add photo", ta: "புகைப்படம் சேர்" },
  addVideo: { en: "Add video", ta: "வீடியோ சேர்" },
  remove: { en: "Remove", ta: "நீக்கு" },
  videoTooLong: { en: "Please keep the video under 30 seconds and 15 MB.", ta: "வீடியோ 30 விநாடி, 15 MB-க்குள் இருக்கட்டும்." },

  q4: { en: "Tell us in your words", ta: "உங்கள் வார்த்தைகளில் சொல்லுங்கள்" },
  q4Hint: { en: "Tamil, English or Tanglish. What is wrong, and how does it affect people?", ta: "தமிழ், ஆங்கிலம் அல்லது தங்கிலிஷ். என்ன பிரச்சனை, மக்களை எப்படி பாதிக்கிறது?" },
  q4Placeholder: { en: "e.g. Deep pit next to the metro pillar. It fills with rain water and bikes fall in at night.", ta: "எ.கா. மெட்ரோ தூண் அருகே ஆழமான பள்ளம். மழையில் தண்ணீர் நிறைந்து இரவில் வண்டிகள் விழுகின்றன." },
  minChars: { en: "A few more words, please.", ta: "இன்னும் சில வார்த்தைகள் எழுதுங்கள்." },

  similarTitle: { en: "Thambi found reports like yours nearby", ta: "அருகில் இதே போன்ற புகார்கள் உள்ளன" },
  similarBody: { en: "Is it one of these? Add your Me too so your voice joins theirs.", ta: "இவற்றில் ஒன்றா? உங்கள் ஆதரவைச் சேர்த்து குரலை வலுப்படுத்துங்கள்." },
  meToo: { en: "Yes, add my Me too", ta: "ஆம், எனக்கும்" },
  different: { en: "No, mine is different", ta: "இல்லை, என்னுடையது வேறு" },
  metersAway: { en: "m away", ta: "மீ தொலைவில்" },
  people: { en: "people", ta: "பேர்" },
  dayOpen: { en: "day open", ta: "நாளாக" },
  daysOpen: { en: "days open", ta: "நாட்களாக" },
  joined: { en: "You joined your neighbours on this report.", ta: "இந்தப் புகாரில் நீங்களும் இணைந்தீர்கள்." },
  joinedNote: { en: "One strong report reaches officials faster than many scattered ones.", ta: "பல சிதறிய புகார்களைவிட ஒரு வலுவான புகார் வேகமாகச் சேரும்." },

  q5: { en: "How long has it been like this?", ta: "எவ்வளவு காலமாக இப்படி உள்ளது?" },
  q6: { en: "How serious is it for you?", ta: "உங்களுக்கு இது எவ்வளவு தீவிரம்?" },
  emergency: { en: "If someone is in danger now, call 112 (emergency) or 101 (fire). Thambi is not an emergency service.", ta: "இப்போது யாராவது ஆபத்தில் இருந்தால் 112 (அவசரம்) அல்லது 101 (தீயணைப்பு) அழைக்கவும். தம்பி அவசர சேவை அல்ல." },
  q7: { en: "Who gets affected?", ta: "யார் பாதிக்கப்படுகிறார்கள்?" },
  q7Hint: { en: "Pick all that apply.", ta: "பொருந்துபவை அனைத்தையும் தேர்ந்தெடுங்கள்." },

  q8: { en: "Check and send", ta: "சரிபார்த்து அனுப்புங்கள்" },
  q8Hint: { en: "This is what Thambi understood. You can change the title.", ta: "தம்பி புரிந்துகொண்டது இது. தலைப்பை மாற்றலாம்." },
  reading: { en: "Reading your report…", ta: "உங்கள் புகாரைப் படிக்கிறது…" },
  titleLabel: { en: "Title", ta: "தலைப்பு" },
  yourSeverity: { en: "Your rating", ta: "உங்கள் மதிப்பீடு" },
  thambiSeverity: { en: "Thambi's reading of your words", ta: "உங்கள் வார்த்தைகளிலிருந்து தம்பியின் மதிப்பீடு" },
  dangers: { en: "Dangers noticed", ta: "கவனித்த ஆபத்துகள்" },
  keywordsOnly: { en: "Read from danger words only. A person will review it.", ta: "ஆபத்து வார்த்தைகளிலிருந்து மட்டும். ஒருவர் சரிபார்ப்பார்." },
  aiNote: { en: "Thambi reads your words, not your photos. It can be wrong; your own rating is always shown too.", ta: "தம்பி உங்கள் வார்த்தைகளைப் படிக்கிறது, புகைப்படங்களை அல்ல. தவறலாம்; உங்கள் மதிப்பீடும் எப்போதும் காட்டப்படும்." },
  send: { en: "Send report", ta: "புகாரை அனுப்பு" },
  sending: { en: "Sending…", ta: "அனுப்புகிறது…" },
  uploading: { en: "Uploading photos…", ta: "புகைப்படங்கள் பதிவேறுகிறது…" },

  signInTitle: { en: "Sign in to send", ta: "அனுப்ப உள்நுழையவும்" },
  signInBody: { en: "Reports carry a real name, so fake ones can't drown out real ones. Your draft is saved.", ta: "புகார்கள் உண்மையான பெயருடன் வரும்; போலிப் புகார்கள் உண்மையானவற்றை மறைக்க முடியாது. வரைவு சேமிக்கப்பட்டது." },
  signIn: { en: "Sign in", ta: "உள்நுழை" },

  doneTitle: { en: "Your report is in.", ta: "உங்கள் புகார் பதிவானது." },
  doneLive: { en: "It is now public. Neighbours can add their Me too.", ta: "இப்போது பொதுவில் உள்ளது. அக்கம்பக்கத்தினர் ஆதரவு தரலாம்." },
  doneReview: { en: "A person will check it before it goes public. This keeps fake reports out.", ta: "பொதுவில் வருமுன் ஒருவர் சரிபார்ப்பார். இது போலிப் புகார்களைத் தடுக்கிறது." },
  reference: { en: "Reference", ta: "குறிப்பு எண்" },
  another: { en: "Report another problem", ta: "இன்னொரு பிரச்சனையைப் புகார் செய்" },
  error: { en: "Something went wrong. Your draft is safe — please try again.", ta: "ஏதோ தவறு. வரைவு பாதுகாப்பாக உள்ளது — மீண்டும் முயலுங்கள்." },
} as const;

export type StringKey = keyof typeof S;
export const t = (key: StringKey, lang: Lang) => S[key][lang];
