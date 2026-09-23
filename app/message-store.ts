export type MessageDirection = "sent" | "received";

export type CareMessage = {
  id: string;
  patientId: number;
  patientName: string;
  initials: string;
  direction: MessageDirection;
  body: string;
  sentAt: string;
  channel: "SMS + in-app" | "In-app";
  status: "Delivered" | "Read" | "Received";
  author: string;
  category: "Check-in" | "Care plan" | "Appointment" | "Patient reply";
};

export const MESSAGE_STORAGE_KEY = "continuum-demo-messages-v1";
export const MESSAGE_EVENT = "continuum:messages-updated";

const seedMessages: CareMessage[] = [
  { id: "seed-1", patientId: 1, patientName: "Sophia Reed", initials: "SR", direction: "sent", body: "Hi Sophia, this is Maya from Northbridge Clinic. Please upload a photo of your incision when you can, and complete today’s symptom check-in.", sentAt: "2026-09-22T16:21:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Check-in" },
  { id: "seed-2", patientId: 1, patientName: "Sophia Reed", initials: "SR", direction: "received", body: "My knee feels warmer today and I had chills overnight. The pain is worse than yesterday.", sentAt: "2026-09-23T08:14:00+04:00", channel: "In-app", status: "Received", author: "Sophia Reed", category: "Patient reply" },
  { id: "seed-3", patientId: 2, patientName: "Noah Williams", initials: "NW", direction: "sent", body: "Good morning Noah. Please record today’s weight and let us know whether the ankle swelling has changed.", sentAt: "2026-09-23T07:18:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Check-in" },
  { id: "seed-4", patientId: 2, patientName: "Noah Williams", initials: "NW", direction: "received", body: "Weight is 84.7 kg. Both ankles look more swollen than yesterday, but breathing feels the same.", sentAt: "2026-09-23T07:45:00+04:00", channel: "In-app", status: "Received", author: "Noah Williams", category: "Patient reply" },
  { id: "seed-5", patientId: 3, patientName: "Amelia Khan", initials: "AK", direction: "sent", body: "Hi Amelia, a quick reminder to log your fluids this morning. Please reply if the nausea is making it difficult to drink.", sentAt: "2026-09-23T08:06:00+04:00", channel: "SMS + in-app", status: "Delivered", author: "Maya Nelson", category: "Care plan" },
  { id: "seed-6", patientId: 4, patientName: "Ethan Cole", initials: "EC", direction: "sent", body: "Hi Ethan, we noticed two mobility goals were missed. Would you like an earlier call with the physiotherapy team?", sentAt: "2026-09-22T14:32:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Care plan" },
  { id: "seed-7", patientId: 4, patientName: "Ethan Cole", initials: "EC", direction: "received", body: "Yes please. Mornings work best for me.", sentAt: "2026-09-22T15:04:00+04:00", channel: "In-app", status: "Received", author: "Ethan Cole", category: "Patient reply" },
  { id: "seed-8", patientId: 5, patientName: "Mia Chen", initials: "MC", direction: "sent", body: "Hi Mia, your new symptom has been added to the clinician review queue. We will contact you after it has been reviewed.", sentAt: "2026-09-23T08:12:00+04:00", channel: "SMS + in-app", status: "Delivered", author: "Maya Nelson", category: "Check-in" },
  { id: "seed-9", patientId: 6, patientName: "Oliver Grant", initials: "OG", direction: "sent", body: "Your recovery check-in looks on track. Please continue with today’s prescribed exercises and sling check.", sentAt: "2026-09-22T10:08:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Care plan" },
  { id: "seed-10", patientId: 7, patientName: "Ava Martinez", initials: "AM", direction: "sent", body: "Reminder: your routine eye follow-up is Friday at 9:15 AM. Reply here if you need to change the time.", sentAt: "2026-09-22T09:41:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Appointment" },
  { id: "seed-11", patientId: 8, patientName: "Lucas Bennett", initials: "LB", direction: "received", body: "Pain is down to 2 out of 10 and I managed a longer walk today.", sentAt: "2026-09-23T07:56:00+04:00", channel: "In-app", status: "Received", author: "Lucas Bennett", category: "Patient reply" },
  { id: "seed-12", patientId: 9, patientName: "Isla Brooks", initials: "IB", direction: "sent", body: "Great work completing this week’s physio goals. Your next session is Friday.", sentAt: "2026-09-22T17:15:00+04:00", channel: "SMS + in-app", status: "Read", author: "Maya Nelson", category: "Care plan" },
];

export function readMessages(): CareMessage[] {
  if (typeof window === "undefined") return seedMessages;
  const stored = window.localStorage.getItem(MESSAGE_STORAGE_KEY);
  if (!stored) return seedMessages;
  try {
    const parsed = JSON.parse(stored) as CareMessage[];
    return Array.isArray(parsed) ? parsed : seedMessages;
  } catch {
    return seedMessages;
  }
}

export function saveSentMessage(input: {
  patientId: number;
  patientName: string;
  initials: string;
  body: string;
  category?: CareMessage["category"];
}) {
  if (typeof window === "undefined") return;
  const message: CareMessage = {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    patientId: input.patientId,
    patientName: input.patientName,
    initials: input.initials,
    direction: "sent",
    body: input.body,
    sentAt: new Date().toISOString(),
    channel: "SMS + in-app",
    status: "Delivered",
    author: "Maya Nelson",
    category: input.category ?? "Check-in",
  };
  const next = [...readMessages(), message];
  window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(MESSAGE_EVENT));
}

