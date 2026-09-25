export type WearableScenarioId =
  | "on-track"
  | "low-recovery"
  | "sleep-debt"
  | "high-strain";

export type WearableScenario = {
  id: WearableScenarioId;
  label: string;
  shortLabel: string;
  recovery: number;
  sleep: number;
  strain: number;
  hrv: number;
  restingHeartRate: number;
  sleepHours: string;
  recoveryTrend: number[];
  sleepTrend: number[];
  headline: string;
  explanation: string;
  guidance: string;
  tone: "green" | "amber" | "red";
};

export const wearableScenarios: WearableScenario[] = [
  {
    id: "on-track",
    label: "Recovery on track",
    shortLabel: "On track",
    recovery: 72,
    sleep: 86,
    strain: 6.4,
    hrv: 54,
    restingHeartRate: 64,
    sleepHours: "7h 34m",
    recoveryTrend: [48, 55, 59, 63, 66, 69, 72],
    sleepTrend: [68, 75, 71, 82, 79, 84, 86],
    headline: "Your recovery signals are moving in a positive direction.",
    explanation:
      "Sleep and heart-rate variability are close to your recent baseline, while yesterday's strain stayed moderate.",
    guidance:
      "Continue with the activity and rest targets in your clinic care plan.",
    tone: "green",
  },
  {
    id: "low-recovery",
    label: "Low recovery day",
    shortLabel: "Low recovery",
    recovery: 22,
    sleep: 48,
    strain: 8.7,
    hrv: 31,
    restingHeartRate: 92,
    sleepHours: "4h 12m",
    recoveryTrend: [61, 56, 48, 43, 38, 29, 22],
    sleepTrend: [72, 65, 62, 58, 55, 51, 48],
    headline: "Several recovery signals are below your recent baseline.",
    explanation:
      "Recovery and sleep performance have fallen while resting heart rate is elevated. Wearable data alone cannot explain why.",
    guidance:
      "Follow your care plan and complete today's symptom check-in so your clinic has the full picture.",
    tone: "red",
  },
  {
    id: "sleep-debt",
    label: "Sleep debt building",
    shortLabel: "Sleep debt",
    recovery: 43,
    sleep: 57,
    strain: 5.1,
    hrv: 42,
    restingHeartRate: 74,
    sleepHours: "5h 08m",
    recoveryTrend: [63, 59, 55, 51, 49, 46, 43],
    sleepTrend: [78, 73, 69, 65, 62, 59, 57],
    headline: "Your recent sleep is shorter than your estimated need.",
    explanation:
      "Three lower-sleep nights are contributing to a moderate recovery score even though strain remains light.",
    guidance:
      "Use your clinic's rest guidance and mention persistent sleep difficulty in your next check-in.",
    tone: "amber",
  },
  {
    id: "high-strain",
    label: "High strain yesterday",
    shortLabel: "High strain",
    recovery: 51,
    sleep: 74,
    strain: 15.8,
    hrv: 46,
    restingHeartRate: 71,
    sleepHours: "6h 42m",
    recoveryTrend: [67, 70, 66, 64, 61, 58, 51],
    sleepTrend: [71, 78, 76, 80, 73, 75, 74],
    headline: "Yesterday's activity was high for this stage of recovery.",
    explanation:
      "Strain rose above the recent range. Your other signals are near baseline, so the change is worth watching rather than interpreting alone.",
    guidance:
      "Compare activity with the limits in your discharge plan and tell the clinic about new symptoms.",
    tone: "amber",
  },
];

export function wearableScenario(id: WearableScenarioId) {
  return wearableScenarios.find((scenario) => scenario.id === id)!;
}

export function wearableSnapshot(scenario: WearableScenario) {
  return `Wearable snapshot — ${scenario.label}. Recovery ${scenario.recovery}%, sleep performance ${scenario.sleep}% (${scenario.sleepHours}), strain ${scenario.strain.toFixed(1)}, HRV ${scenario.hrv} ms, resting heart rate ${scenario.restingHeartRate} bpm.`;
}
