export type Checkin = {
  id: string;
  date: string;
  createdAt: string;
  mood: number;
  pain: number;
  symptoms: string[];
  notes: string;
};
export type PatientState = {
  watchEvents?: Submission[];
  checkins: Checkin[];
  doses: Record<string, string>;
  tasks: Record<string, boolean>;
  messages: { id: string; body: string; createdAt: string }[];
};
export type Submission = {
  id: string;
  patientId: string;
  patientName: string;
  kind:
    | "check-in"
    | "medication"
    | "message"
    | "wearable"
    | "watch-checkin"
    | "watch-reminder"
    | "watch-response"
    | "watch-alert";
  simulated?: true;
  trigger?: "heartbeat" | "breathing";
  createdAt: string;
  body: string;
};
export type Store = {
  version: 1;
  patientId: string;
  patients: Record<string, PatientState>;
  reminderTime: string;
  reminderEnabled: boolean;
  bridgeUrl: string;
  outbox: Submission[];
};
export const initialStore: Store = {
  version: 1,
  patientId: "1",
  patients: {},
  reminderTime: "09:00",
  reminderEnabled: false,
  bridgeUrl: "",
  outbox: [],
};
export function emptyPatient(): PatientState {
  return { checkins: [], doses: {}, tasks: {}, messages: [] };
}
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function doseKey(
  patientId: string,
  medication: string,
  date = new Date(),
) {
  return `${patientId}:${dayKey(date)}:${medication}`;
}
export function parseTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    throw new Error("Enter a time like 09:00 or 20:30 (24-hour clock).");
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}
export function bridgeAddress(input: string) {
  const url = new URL(input.trim());
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  )
    throw new Error("Use a server address such as http://192.168.1.10:3000.");
  return url.origin;
}
export function validateCheckin(mood: number | null, pain: number | null) {
  if (mood === null || !Number.isInteger(mood) || mood < 1 || mood > 5)
    throw new Error("Choose how you are feeling.");
  if (pain === null || !Number.isInteger(pain) || pain < 0 || pain > 10)
    throw new Error("Choose your pain level.");
}
export function decodeStore(raw: string | null): Store {
  if (!raw) return { ...initialStore, patients: {}, outbox: [] };
  const data = JSON.parse(raw);
  if (
    data.version !== 1 ||
    typeof data.patientId !== "string" ||
    !data.patients ||
    !Array.isArray(data.outbox)
  )
    throw new Error("Saved data could not be read.");
  for (const p of Object.values(data.patients) as PatientState[]) {
    if (
      !Array.isArray(p.checkins) ||
      !Array.isArray(p.messages) ||
      !p.tasks ||
      !p.doses
    )
      throw new Error("Saved patient data is incomplete.");
  }
  return { ...initialStore, ...data };
}
