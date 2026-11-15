import type { Lang } from "./options";

// Form copy. English only for the demo; Tamil is a planned future feature.
const S = {
  title: { en: "Report a problem" },
  step: { en: "Step" },
  of: { en: "of" },
  back: { en: "Back" },
  next: { en: "Next" },
  skip: { en: "Skip" },
  draftSaved: { en: "Draft saved on this device" },

  q1: { en: "What is the problem?" },
  q1Hint: { en: "Pick the closest one." },

  q2: { en: "Where is it?" },
  q2Hint: { en: "Move the map so the pin sits on the exact spot." },
  useLocation: { en: "Use my location" },
  locating: { en: "Finding you…" },
  locationDenied: { en: "Location is off. Move the map by hand instead." },
  road: { en: "Road or street" },
  locality: { en: "Area" },
  landmark: { en: "Nearest landmark" },
  landmarkPlaceholder: { en: "e.g. opposite the metro pillar" },

  q3: { en: "Add photos or a short video" },
  q3Hint: { en: "Up to 4 photos and 1 video (30 seconds). These are proof for your neighbours and officials." },
  addPhoto: { en: "Add photo" },
  addVideo: { en: "Add video" },
  remove: { en: "Remove" },
  videoTooLong: { en: "Please keep the video under 30 seconds and 15 MB." },

  q4: { en: "Tell us in your words" },
  q4Hint: { en: "English or Tanglish. What is wrong, and how does it affect people?" },
  q4Placeholder: { en: "e.g. Deep pit next to the metro pillar. It fills with rain water and bikes fall in at night." },
  minChars: { en: "A few more words, please." },

  similarTitle: { en: "Thambi found reports like yours nearby" },
  similarBody: { en: "Is it one of these? Add your Me too so your voice joins theirs." },
  meToo: { en: "Yes, add my Me too" },
  different: { en: "No, mine is different" },
  metersAway: { en: "m away" },
  people: { en: "people" },
  dayOpen: { en: "day open" },
  daysOpen: { en: "days open" },
  joined: { en: "You joined your neighbours on this report." },
  joinedNote: { en: "One strong report reaches officials faster than many scattered ones." },

  q5: { en: "How long has it been like this?" },
  q6: { en: "How serious is it for you?" },
  emergency: { en: "If someone is in danger now, call 112 (emergency) or 101 (fire). Thambi is not an emergency service." },
  q7: { en: "Who gets affected?" },
  q7Hint: { en: "Pick all that apply." },

  q8: { en: "Check and send" },
  q8Hint: { en: "This is what Thambi understood. You can change the title." },
  reading: { en: "Reading your report…" },
  titleLabel: { en: "Title" },
  yourSeverity: { en: "Your rating" },
  thambiSeverity: { en: "Thambi's reading of your words" },
  dangers: { en: "Dangers noticed" },
  keywordsOnly: { en: "Read from danger words only. A person will review it." },
  aiNote: { en: "Thambi reads your words, not your photos. It can be wrong; your own rating is always shown too." },
  send: { en: "Send report" },
  sending: { en: "Sending…" },
  uploading: { en: "Uploading photos…" },

  signInTitle: { en: "Sign in to send" },
  signInBody: { en: "Reports carry a real name, so fake ones can't drown out real ones. Your draft is saved." },
  signIn: { en: "Sign in" },

  doneTitle: { en: "Your report is in." },
  doneLive: { en: "It is now public. Neighbours can add their Me too." },
  doneReview: { en: "A person will check it before it goes public. This keeps fake reports out." },
  reference: { en: "Reference" },
  another: { en: "Report another problem" },
  error: { en: "Something went wrong. Your draft is safe — please try again." },
} as const;

export type StringKey = keyof typeof S;
export const t = (key: StringKey, _lang: Lang) => S[key].en;
