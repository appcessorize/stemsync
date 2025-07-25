export interface StemInfo {
  id: string;
  name: string;
  color: string;
  url: string;
}

export const STEMS: StemInfo[] = [
  { id: "01", name: "Vocals", color: "#FF6B6B", url: "/stems/stem-01-vocals.mp3" },
  { id: "02", name: "Backing Vocals", color: "#4ECDC4", url: "/stems/stem-02-backing-vocals.mp3" },
  { id: "03", name: "Bass", color: "#45B7D1", url: "/stems/stem-03-bass.mp3" },
  { id: "04", name: "Drums", color: "#F7DC6F", url: "/stems/stem-04-drums.mp3" },
  { id: "05", name: "Guitar", color: "#BB8FCE", url: "/stems/stem-05-guitar.mp3" },
  { id: "06", name: "Keyboard", color: "#85C1E9", url: "/stems/stem-06-keyboard.mp3" },
  { id: "07", name: "Percussion", color: "#F8C471", url: "/stems/stem-07-percussion.mp3" },
  { id: "08", name: "Strings", color: "#82E0AA", url: "/stems/stem-08-strings.mp3" },
  { id: "09", name: "Synth", color: "#F8B7CD", url: "/stems/stem-09-synth.mp3" },
  { id: "10", name: "FX", color: "#D7BDE2", url: "/stems/stem-10-fx.mp3" }
];

export function getAssignedStem(deviceIndex: number): StemInfo {
  return STEMS[deviceIndex % STEMS.length];
}