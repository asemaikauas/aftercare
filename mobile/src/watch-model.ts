import type { Submission } from "./model";

export type WatchTrigger = "heartbeat" | "breathing";
export const moodLabels = ["Very low", "Low", "Okay", "Good", "Great"];
export function watchResponse(input: {
  id: string;
  patientId: string;
  patientName: string;
  trigger: WatchTrigger;
  needsHelp: boolean;
  createdAt: string;
}): Submission {
  return {
    id: input.id,
    patientId: input.patientId,
    patientName: input.patientName,
    kind: input.needsHelp ? "watch-alert" : "watch-response",
    simulated: true,
    trigger: input.trigger,
    createdAt: input.createdAt,
    body: `SIMULATED ${input.trigger === "heartbeat" ? "heartbeat" : "breathing"} change. Patient selected “${input.needsHelp ? "I need help" : "I’m okay"}”. ${input.needsHelp ? "Staff review requested. No real sensor measurement or emergency dispatch." : "Response recorded; no alarm raised. This does not establish that the patient is medically well."}`,
  };
}
export function watchMood(input: {
  id: string;
  patientId: string;
  patientName: string;
  mood: number;
  createdAt: string;
}): Submission {
  if (!Number.isInteger(input.mood) || input.mood < 1 || input.mood > 5)
    throw new Error("Choose a mood from 1 to 5.");
  return {
    id: input.id,
    patientId: input.patientId,
    patientName: input.patientName,
    kind: "watch-checkin",
    simulated: true,
    createdAt: input.createdAt,
    body: `Watch simulator check-in: feeling ${moodLabels[input.mood - 1]} (${input.mood}/5). Pain was not assessed.`,
  };
}
