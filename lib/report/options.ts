// Every choice in the report form, in English and Tamil.
// Values match the database check constraints exactly.

export type Lang = "en" | "ta";
export type Label = { en: string; ta: string };

export const CATEGORIES = [
  { value: "road_damage", icon: "construction", label: { en: "Road or pothole", ta: "சாலை / பள்ளம்" } },
  { value: "water_leak", icon: "droplets", label: { en: "Water leak", ta: "குடிநீர் கசிவு" } },
  { value: "sewage", icon: "waves", label: { en: "Sewage", ta: "சாக்கடை / கழிவுநீர்" } },
  { value: "stormwater_drain", icon: "cloud-rain", label: { en: "Rainwater drain", ta: "மழைநீர் வடிகால்" } },
  { value: "garbage", icon: "trash-2", label: { en: "Garbage", ta: "குப்பை" } },
  { value: "streetlight", icon: "lamp", label: { en: "Streetlight", ta: "தெருவிளக்கு" } },
  { value: "electricity", icon: "zap", label: { en: "Electric wire or pole", ta: "மின் கம்பி / கம்பம்" } },
  { value: "pollution", icon: "factory", label: { en: "Pollution", ta: "மாசு" } },
  { value: "other", icon: "circle-help", label: { en: "Something else", ta: "மற்றவை" } },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

export const OPEN_SINCE = [
  { value: "days", label: { en: "A few days", ta: "சில நாட்களாக" } },
  { value: "weeks", label: { en: "Some weeks", ta: "சில வாரங்களாக" } },
  { value: "months", label: { en: "Months", ta: "பல மாதங்களாக" } },
  { value: "year+", label: { en: "Over a year", ta: "ஒரு வருடத்துக்கு மேல்" } },
] as const;
export type OpenSince = (typeof OPEN_SINCE)[number]["value"];

export const SEVERITY = [
  { value: 1, label: { en: "Annoying", ta: "தொந்தரவு" }, hint: { en: "It bothers people, but nobody is at risk.", ta: "தொந்தரவு, ஆனால் யாருக்கும் ஆபத்தில்லை." } },
  { value: 2, label: { en: "Slows me down", ta: "தாமதம் ஏற்படுகிறது" }, hint: { en: "People have to go around it or wait.", ta: "சுற்றிச் செல்ல வேண்டியுள்ளது அல்லது காத்திருக்க வேண்டியுள்ளது." } },
  { value: 3, label: { en: "Damages vehicles", ta: "வாகனங்கள் சேதமடைகின்றன" }, hint: { en: "Bikes, cars or property get damaged.", ta: "வண்டிகள் அல்லது சொத்துக்கள் சேதமடைகின்றன." } },
  { value: 4, label: { en: "People could get hurt", ta: "மக்கள் காயமடையலாம்" }, hint: { en: "Someone could fall or be injured.", ta: "யாராவது விழலாம் அல்லது காயமடையலாம்." } },
  { value: 5, label: { en: "Danger right now", ta: "இப்போதே ஆபத்து" }, hint: { en: "A life could be at risk today.", ta: "இன்றே உயிருக்கு ஆபத்து இருக்கலாம்." } },
] as const;

export const AFFECTED = [
  { value: "walkers", label: { en: "People walking", ta: "நடப்பவர்கள்" } },
  { value: "two_wheelers", label: { en: "Two-wheelers", ta: "இருசக்கர வாகனங்கள்" } },
  { value: "school_children", label: { en: "School children", ta: "பள்ளிக் குழந்தைகள்" } },
  { value: "elderly", label: { en: "Elderly people", ta: "முதியோர்" } },
  { value: "shops", label: { en: "Shops", ta: "கடைகள்" } },
  { value: "everyone", label: { en: "Everyone here", ta: "இங்குள்ள அனைவரும்" } },
] as const;

export const DANGER_LABELS: Record<string, Label> = {
  live_wire: { en: "Live wire", ta: "மின்கம்பி ஆபத்து" },
  open_manhole: { en: "Open manhole", ta: "திறந்த பாதாள சாக்கடை" },
  accident_reported: { en: "Accident mentioned", ta: "விபத்து குறிப்பிடப்பட்டுள்ளது" },
  open_pit: { en: "Open pit", ta: "திறந்த பள்ளம்" },
  sewage_overflow: { en: "Sewage overflow", ta: "சாக்கடை வழிதல்" },
  flooding: { en: "Water-logging", ta: "தண்ணீர் தேக்கம்" },
  no_barricade: { en: "No barricade", ta: "தடுப்பு இல்லை" },
  near_school: { en: "Near a school", ta: "பள்ளி அருகே" },
  near_hospital: { en: "Near a hospital", ta: "மருத்துவமனை அருகே" },
};

export const pick = (label: Label, lang: Lang) => label[lang];
