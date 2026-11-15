// Every choice in the report form (English).
// Values match the database check constraints exactly.

export type Lang = "en";
export type Label = { en: string };

export const CATEGORIES = [
  { value: "road_damage", icon: "construction", label: { en: "Road or pothole" } },
  { value: "water_leak", icon: "droplets", label: { en: "Water leak" } },
  { value: "sewage", icon: "waves", label: { en: "Sewage" } },
  { value: "stormwater_drain", icon: "cloud-rain", label: { en: "Rainwater drain" } },
  { value: "garbage", icon: "trash-2", label: { en: "Garbage" } },
  { value: "streetlight", icon: "lamp", label: { en: "Streetlight" } },
  { value: "electricity", icon: "zap", label: { en: "Electric wire or pole" } },
  { value: "pollution", icon: "factory", label: { en: "Pollution" } },
  { value: "other", icon: "circle-help", label: { en: "Something else" } },
] as const;
export type Category = (typeof CATEGORIES)[number]["value"];

export const OPEN_SINCE = [
  { value: "days", label: { en: "A few days" } },
  { value: "weeks", label: { en: "Some weeks" } },
  { value: "months", label: { en: "Months" } },
  { value: "year+", label: { en: "Over a year" } },
] as const;
export type OpenSince = (typeof OPEN_SINCE)[number]["value"];

export const SEVERITY = [
  { value: 1, label: { en: "Annoying" }, hint: { en: "It bothers people, but nobody is at risk." } },
  { value: 2, label: { en: "Slows me down" }, hint: { en: "People have to go around it or wait." } },
  { value: 3, label: { en: "Damages vehicles" }, hint: { en: "Bikes, cars or property get damaged." } },
  { value: 4, label: { en: "People could get hurt" }, hint: { en: "Someone could fall or be injured." } },
  { value: 5, label: { en: "Danger right now" }, hint: { en: "A life could be at risk today." } },
] as const;

export const AFFECTED = [
  { value: "walkers", label: { en: "People walking" } },
  { value: "two_wheelers", label: { en: "Two-wheelers" } },
  { value: "school_children", label: { en: "School children" } },
  { value: "elderly", label: { en: "Elderly people" } },
  { value: "shops", label: { en: "Shops" } },
  { value: "everyone", label: { en: "Everyone here" } },
] as const;

export const DANGER_LABELS: Record<string, Label> = {
  live_wire: { en: "Live wire" },
  open_manhole: { en: "Open manhole" },
  accident_reported: { en: "Accident mentioned" },
  open_pit: { en: "Open pit" },
  sewage_overflow: { en: "Sewage overflow" },
  flooding: { en: "Water-logging" },
  no_barricade: { en: "No barricade" },
  near_school: { en: "Near a school" },
  near_hospital: { en: "Near a hospital" },
};

export const pick = (label: Label, _lang: Lang) => label.en;
