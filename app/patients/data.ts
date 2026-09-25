export type ProfileRisk = "Critical" | "Watch" | "Stable";

export type PatientProfile = {
  id: string;
  name: string;
  initials: string;
  risk: ProfileRisk;
  score: number;
  age: number;
  dob: string;
  pronouns: string;
  sex: string;
  language: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  mrn: string;
  procedure: string;
  procedureDate: string;
  dischargeDate: string;
  service: string;
  nextAppointment: string;
  alert: string;
  summary: string;
  careTeam: { name: string; role: string; initials: string }[];
  conditions: string[];
  allergies: string[];
  medications: { name: string; detail: string; status: string }[];
  symptoms: string[];
  metrics: { label: string; value: string; context: string; tone: string }[];
  labs: { date: string; name: string; value: string; reference: string; status: "High" | "Low" | "Normal" | "Pending" }[];
  tasks: { label: string; detail: string; done: boolean }[];
  documents: { name: string; type: string; date: string }[];
  timeline: { time: string; title: string; detail: string; source: string; tone: string }[];
};

type ProfileSeed = Omit<PatientProfile, "careTeam" | "address" | "emergencyContact" | "language" | "sex" | "pronouns" | "documents"> & {
  address?: string;
  emergencyContact?: string;
  language?: string;
  sex?: string;
  pronouns?: string;
  careTeam?: PatientProfile["careTeam"];
  documents?: PatientProfile["documents"];
};

const defaultCareTeam = [
  { name: "Dr. Lena Morris", role: "Attending clinician", initials: "LM" },
  { name: "Maya Nelson", role: "Care manager", initials: "MN" },
  { name: "Priya Rao", role: "Physiotherapist", initials: "PR" },
];

const defaultDocuments = [
  { name: "Discharge summary", type: "Clinical note", date: "Discharge day" },
  { name: "Medication reconciliation", type: "Medication list", date: "Discharge day" },
  { name: "Recovery care plan", type: "Care pathway", date: "Last reviewed 2 days ago" },
];

function profile(seed: ProfileSeed): PatientProfile {
  return {
    language: "English",
    sex: "Noted in clinical record",
    pronouns: "Not specified",
    address: "Address on file",
    emergencyContact: "Emergency contact on file",
    careTeam: defaultCareTeam,
    documents: defaultDocuments,
    ...seed,
  };
}

export const patientProfiles: PatientProfile[] = [
  profile({
    id: "1", name: "Sophia Reed", initials: "SR", risk: "Critical", score: 86, age: 67, dob: "14 Feb 1959", pronouns: "She / her", sex: "Female", phone: "+1 (555) 014-2809", email: "sophia.reed@example.com", address: "24 Juniper Lane, Northbridge", emergencyContact: "Daniel Reed · Son · +1 (555) 014-1087", mrn: "NB-10482", procedure: "Right total knee arthroplasty", procedureDate: "17 Sep 2026", dischargeDate: "18 Sep 2026", service: "Orthopedic recovery", nextAppointment: "24 Sep · 10:30 AM · Nurse video call", alert: "Fever and rising resting heart rate", summary: "Three signals crossed the clinic’s post-operative escalation rules overnight. Sophia reports chills and worsening pain alongside a sustained rise in resting heart rate.",
    conditions: ["Hypertension", "Type 2 diabetes", "Osteoarthritis"], allergies: ["Penicillin · rash", "Adhesive tape · skin irritation"], symptoms: ["Pain 8/10", "Chills", "Incision warmth"],
    medications: [{ name: "Acetaminophen", detail: "Per discharge plan · last logged 07:32", status: "Taken" }, { name: "Aspirin", detail: "Per discharge plan · morning dose", status: "Taken" }, { name: "Metformin", detail: "Home medication · reconciliation complete", status: "Active" }],
    metrics: [{ label: "Temperature", value: "38.1°C", context: "+1.2°C today", tone: "critical" }, { label: "Resting heart rate", value: "92 bpm", context: "+18 vs baseline", tone: "critical" }, { label: "Sleep", value: "4h 12m", context: "−31% this week", tone: "watch" }, { label: "WHOOP recovery", value: "22%", context: "−29 pts in 3 days", tone: "critical" }, { label: "Steps", value: "612", context: "−46% yesterday", tone: "watch" }, { label: "SpO₂", value: "96%", context: "Within configured range", tone: "stable" }],
    labs: [{ date: "23 Sep · 08:05", name: "C-reactive protein", value: "31 mg/L", reference: "Up from 12 at discharge", status: "High" }, { date: "23 Sep · 08:05", name: "White blood cells", value: "12.4 ×10⁹/L", reference: "Clinic range 4.0–11.0", status: "High" }, { date: "22 Sep · 16:10", name: "Hemoglobin", value: "11.1 g/dL", reference: "Stable post-operative trend", status: "Normal" }, { date: "22 Sep · 16:10", name: "Glucose", value: "146 mg/dL", reference: "Patient-specific review range", status: "High" }],
    tasks: [{ label: "Morning symptom check-in", detail: "Overdue by 1h 24m", done: false }, { label: "Take prescribed medication", detail: "Logged at 07:32", done: true }, { label: "Upload incision photo", detail: "Requested yesterday", done: false }, { label: "Physio exercises", detail: "2 of 3 sessions complete", done: false }],
    documents: [{ name: "Operative note", type: "Surgical record", date: "17 Sep 2026" }, { name: "Discharge summary", type: "Clinical note", date: "18 Sep 2026" }, { name: "Post-op laboratory report", type: "Lab report", date: "23 Sep 2026" }, { name: "Orthopedic recovery plan", type: "Care pathway", date: "Reviewed 21 Sep" }],
    timeline: [{ time: "Today · 08:14", title: "Escalation created", detail: "Temperature and heart-rate rules crossed the clinic threshold.", source: "Rules engine", tone: "critical" }, { time: "Today · 08:05", title: "New lab results received", detail: "CRP and white blood cell count added to the record.", source: "Clinic EHR", tone: "critical" }, { time: "Today · 07:32", title: "Medication confirmed", detail: "Morning dose marked complete by patient.", source: "Patient app", tone: "stable" }, { time: "Today · 06:58", title: "Recovery data synced", detail: "Recovery 22%, sleep performance 48%.", source: "WHOOP", tone: "watch" }, { time: "Yesterday · 16:20", title: "Care manager call", detail: "Pain was 6/10; no fever reported at that time.", source: "Maya Nelson", tone: "neutral" }],
  }),
  profile({
    id: "2", name: "Noah Williams", initials: "NW", risk: "Critical", score: 78, age: 59, dob: "03 Nov 1966", pronouns: "He / him", sex: "Male", phone: "+1 (555) 014-3318", email: "noah.williams@example.com", mrn: "NB-10517", procedure: "Coronary artery bypass graft", procedureDate: "10 Sep 2026", dischargeDate: "16 Sep 2026", service: "Cardiac recovery", nextAppointment: "24 Sep · 2:00 PM · Cardiac nurse call", alert: "Weight gain and low activity", summary: "Reported weight gain and ankle swelling meet the clinic’s configured fluid-status review rule. Activity remains below the discharge target.", conditions: ["Coronary artery disease", "Hypertension", "Hyperlipidemia"], allergies: ["No known drug allergies"], symptoms: ["Ankle swelling", "Fatigue"], medications: [{ name: "Cardiac discharge regimen", detail: "Reconciled at discharge", status: "Active" }, { name: "Morning medication set", detail: "Logged at 07:12", status: "Taken" }], metrics: [{ label: "Weight", value: "84.7 kg", context: "+2.1 kg in 48 hours", tone: "critical" }, { label: "Resting heart rate", value: "84 bpm", context: "+11 vs baseline", tone: "watch" }, { label: "Steps", value: "884", context: "−38% yesterday", tone: "watch" }, { label: "SpO₂", value: "95%", context: "Within configured range", tone: "stable" }], labs: [{ date: "22 Sep", name: "Creatinine", value: "1.3 mg/dL", reference: "Slight rise", status: "High" }, { date: "22 Sep", name: "Potassium", value: "4.4 mmol/L", reference: "Clinic range", status: "Normal" }, { date: "21 Sep", name: "Hemoglobin", value: "10.8 g/dL", reference: "Expected post-op trend", status: "Low" }], tasks: [{ label: "Daily weight", detail: "Completed 07:40", done: true }, { label: "Breathing exercises", detail: "Not yet logged", done: false }, { label: "Morning medication", detail: "Completed", done: true }], timeline: [{ time: "Today · 07:45", title: "Check-in reviewed", detail: "Patient reported ankle swelling.", source: "Patient app", tone: "critical" }, { time: "Today · 07:40", title: "Weight logged", detail: "Up 2.1 kg over 48 hours.", source: "Connected scale", tone: "critical" }, { time: "Today · 06:42", title: "Wearables synced", detail: "Activity and recovery updated.", source: "Apple Health", tone: "stable" }],
  }),
  profile({
    id: "3", name: "Amelia Khan", initials: "AK", risk: "Watch", score: 64, age: 44, dob: "28 Jun 1982", pronouns: "She / her", sex: "Female", phone: "+1 (555) 014-4492", email: "amelia.khan@example.com", mrn: "NB-10543", procedure: "Laparoscopic colectomy", procedureDate: "18 Sep 2026", dischargeDate: "19 Sep 2026", service: "Abdominal surgery recovery", nextAppointment: "25 Sep · 9:15 AM · Clinic visit", alert: "Low hydration and nausea", summary: "Hydration and meal goals have been missed while nausea persists. Other recovery signals remain within the clinic’s watch range.", conditions: ["Iron-deficiency anemia"], allergies: ["Latex · contact reaction"], symptoms: ["Nausea", "Low appetite"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Fluid intake", value: "2 / 6 cups", context: "Below today’s goal", tone: "watch" }, { label: "Resting heart rate", value: "81 bpm", context: "+7 vs baseline", tone: "watch" }, { label: "Steps", value: "1,204", context: "−22% yesterday", tone: "watch" }, { label: "Temperature", value: "37.4°C", context: "+0.3°C today", tone: "stable" }], labs: [{ date: "22 Sep", name: "Sodium", value: "134 mmol/L", reference: "Slightly low", status: "Low" }, { date: "22 Sep", name: "Hemoglobin", value: "10.4 g/dL", reference: "Monitor", status: "Low" }], tasks: [{ label: "Hydration goal", detail: "2 of 6 cups", done: false }, { label: "Morning medication", detail: "Completed", done: true }, { label: "Short walk", detail: "Not yet logged", done: false }], timeline: [{ time: "Today · 08:02", title: "Check-in completed", detail: "Nausea unchanged; low fluid intake.", source: "Patient app", tone: "watch" }, { time: "Today · 06:51", title: "Activity synced", detail: "Sleep and movement updated.", source: "Apple Health", tone: "stable" }],
  }),
  profile({
    id: "4", name: "Ethan Cole", initials: "EC", risk: "Watch", score: 58, age: 71, dob: "09 Jan 1955", pronouns: "He / him", sex: "Male", phone: "+1 (555) 014-5120", email: "ethan.cole@example.com", mrn: "NB-10391", procedure: "Left total hip replacement", procedureDate: "16 Sep 2026", dischargeDate: "17 Sep 2026", service: "Orthopedic recovery", nextAppointment: "25 Sep · 11:00 AM · Physiotherapy", alert: "Mobility goal missed twice", summary: "Ethan is medically stable, but two mobility goals were missed and reported stiffness has increased.", conditions: ["Osteoarthritis"], allergies: ["No known drug allergies"], symptoms: ["Stiffness", "Pain 5/10"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Steps", value: "920", context: "−29% yesterday", tone: "watch" }, { label: "Resting heart rate", value: "73 bpm", context: "+4 vs baseline", tone: "stable" }, { label: "Sleep", value: "6h 05m", context: "−8% this week", tone: "watch" }], labs: [{ date: "21 Sep", name: "Hemoglobin", value: "11.5 g/dL", reference: "Improving", status: "Normal" }], tasks: [{ label: "Morning walk", detail: "Not yet logged", done: false }, { label: "Medication", detail: "Completed", done: true }], timeline: [{ time: "Today · 07:04", title: "Activity synced", detail: "920 steps logged yesterday.", source: "Apple Health", tone: "watch" }],
  }),
  profile({
    id: "5", name: "Mia Chen", initials: "MC", risk: "Watch", score: 55, age: 36, dob: "17 Apr 1990", pronouns: "She / her", sex: "Female", phone: "+1 (555) 014-6224", email: "mia.chen@example.com", mrn: "NB-10562", procedure: "Total thyroidectomy", procedureDate: "19 Sep 2026", dischargeDate: "20 Sep 2026", service: "Endocrine surgery recovery", nextAppointment: "24 Sep · 4:00 PM · Clinician review", alert: "New tingling symptom", summary: "Mia reported a new symptom this morning. Her latest calcium result is at the clinic’s lower review boundary.", conditions: ["Hashimoto’s thyroiditis"], allergies: ["No known drug allergies"], symptoms: ["Finger tingling", "Mild throat pain"], medications: [{ name: "Thyroid replacement", detail: "Per discharge plan", status: "Active" }, { name: "Calcium supplement", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Calcium", value: "8.4 mg/dL", context: "Lower review boundary", tone: "watch" }, { label: "Resting heart rate", value: "76 bpm", context: "+3 vs baseline", tone: "stable" }, { label: "Steps", value: "2,132", context: "+4% yesterday", tone: "stable" }], labs: [{ date: "Today", name: "Calcium", value: "8.4 mg/dL", reference: "Lower configured boundary", status: "Low" }, { date: "Scheduled", name: "TSH", value: "Pending", reference: "Follow-up test", status: "Pending" }], tasks: [{ label: "Symptom check-in", detail: "Completed", done: true }, { label: "Medication", detail: "Completed", done: true }], timeline: [{ time: "Today · 08:05", title: "New symptom reported", detail: "Finger tingling added to check-in.", source: "Patient app", tone: "watch" }],
  }),
  profile({ id: "6", name: "Oliver Grant", initials: "OG", risk: "Stable", score: 31, age: 52, dob: "12 Aug 1974", pronouns: "He / him", sex: "Male", phone: "+1 (555) 014-7314", email: "oliver.grant@example.com", mrn: "NB-10471", procedure: "Rotator cuff repair", procedureDate: "14 Sep 2026", dischargeDate: "15 Sep 2026", service: "Orthopedic recovery", nextAppointment: "26 Sep · Routine check", alert: "Recovery progressing as expected", summary: "Recovery signals and care-plan adherence are improving with no new concerns reported.", conditions: ["No active conditions flagged"], allergies: ["No known drug allergies"], symptoms: ["Pain 3/10"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "WHOOP recovery", value: "72%", context: "Improving", tone: "stable" }, { label: "Adherence", value: "94%", context: "This week", tone: "stable" }, { label: "Steps", value: "4,218", context: "+12% yesterday", tone: "stable" }], labs: [{ date: "—", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }], tasks: [{ label: "Sling check", detail: "Completed", done: true }, { label: "Exercises", detail: "Completed", done: true }], timeline: [{ time: "Today · 07:11", title: "Recovery synced", detail: "Recovery improved to 72%.", source: "WHOOP", tone: "stable" }] }),
  profile({ id: "7", name: "Ava Martinez", initials: "AM", risk: "Stable", score: 28, age: 63, dob: "21 Mar 1963", pronouns: "She / her", sex: "Female", phone: "+1 (555) 014-8450", email: "ava.martinez@example.com", mrn: "NB-10583", procedure: "Cataract surgery", procedureDate: "21 Sep 2026", dischargeDate: "21 Sep 2026", service: "Ophthalmology recovery", nextAppointment: "25 Sep · Routine eye check", alert: "All check-ins complete", summary: "Ava has completed every check-in and reports improving vision with mild irritation only.", conditions: ["Type 2 diabetes"], allergies: ["No known drug allergies"], symptoms: ["Mild irritation"], medications: [{ name: "Prescribed eye drops", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Plan adherence", value: "100%", context: "All tasks complete", tone: "stable" }, { label: "Steps", value: "3,905", context: "+8% yesterday", tone: "stable" }], labs: [{ date: "22 Sep", name: "Glucose", value: "118 mg/dL", reference: "Within patient range", status: "Normal" }], tasks: [{ label: "Morning eye drops", detail: "Completed", done: true }, { label: "Symptom check", detail: "Completed", done: true }], timeline: [{ time: "Today · 08:22", title: "Check-in completed", detail: "No new concerns reported.", source: "Patient app", tone: "stable" }] }),
  profile({ id: "8", name: "Lucas Bennett", initials: "LB", risk: "Stable", score: 24, age: 48, dob: "30 Dec 1977", pronouns: "He / him", sex: "Male", phone: "+1 (555) 014-9021", email: "lucas.bennett@example.com", mrn: "NB-10579", procedure: "Laparoscopic appendectomy", procedureDate: "19 Sep 2026", dischargeDate: "20 Sep 2026", service: "General surgery recovery", nextAppointment: "24 Sep · Routine check", alert: "Pain and activity improving", summary: "Lucas is meeting activity and symptom targets with no new flags.", conditions: ["No active conditions flagged"], allergies: ["No known drug allergies"], symptoms: ["Pain 2/10"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Steps", value: "4,605", context: "+17% yesterday", tone: "stable" }, { label: "Sleep", value: "7h 34m", context: "+11% this week", tone: "stable" }], labs: [{ date: "22 Sep", name: "White blood cells", value: "8.1 ×10⁹/L", reference: "Within range", status: "Normal" }], tasks: [{ label: "Short walk", detail: "Completed", done: true }, { label: "Medication", detail: "Completed", done: true }], timeline: [{ time: "Today · 06:48", title: "Activity synced", detail: "Activity continues to improve.", source: "Apple Health", tone: "stable" }] }),
  profile({ id: "9", name: "Isla Brooks", initials: "IB", risk: "Stable", score: 19, age: 29, dob: "06 May 1997", pronouns: "She / her", sex: "Female", phone: "+1 (555) 014-9782", email: "isla.brooks@example.com", mrn: "NB-10468", procedure: "ACL reconstruction", procedureDate: "13 Sep 2026", dischargeDate: "14 Sep 2026", service: "Sports medicine recovery", nextAppointment: "25 Sep · Physiotherapy", alert: "Physio goals on track", summary: "Isla’s mobility and adherence are progressing according to her care plan.", conditions: ["No active conditions flagged"], allergies: ["No known drug allergies"], symptoms: ["Expected swelling"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "Physio adherence", value: "100%", context: "This week", tone: "stable" }, { label: "WHOOP recovery", value: "73%", context: "Improving", tone: "stable" }], labs: [{ date: "—", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }], tasks: [{ label: "Range-of-motion set", detail: "Completed", done: true }, { label: "Ice and elevation", detail: "Completed", done: true }], timeline: [{ time: "Today · 07:25", title: "Exercises completed", detail: "Morning set logged.", source: "Patient app", tone: "stable" }] }),
  profile({ id: "10", name: "Leo Park", initials: "LP", risk: "Stable", score: 15, age: 41, dob: "19 Sep 1985", pronouns: "He / him", sex: "Male", phone: "+1 (555) 015-0421", email: "leo.park@example.com", mrn: "NB-10455", procedure: "Inguinal hernia repair", procedureDate: "12 Sep 2026", dischargeDate: "13 Sep 2026", service: "General surgery recovery", nextAppointment: "24 Sep · Clinic visit", alert: "Ready for routine follow-up", summary: "Leo’s recovery is on track and all required daily tasks are complete.", conditions: ["No active conditions flagged"], allergies: ["No known drug allergies"], symptoms: ["No new symptoms"], medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }], metrics: [{ label: "WHOOP recovery", value: "81%", context: "Strong", tone: "stable" }, { label: "Steps", value: "5,102", context: "+21% yesterday", tone: "stable" }], labs: [{ date: "—", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }], tasks: [{ label: "Daily check-in", detail: "Completed", done: true }, { label: "Walking goal", detail: "Completed", done: true }], timeline: [{ time: "Today · 06:36", title: "Recovery synced", detail: "Recovery improved to 81%.", source: "WHOOP", tone: "stable" }] }),
];

export function getPatientProfile(id: string) {
  return patientProfiles.find((patient) => patient.id === id);
}
