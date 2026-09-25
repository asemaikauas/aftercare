import type { PatientProfile } from "./types";

// Demographics, real conditions, real medications, and real allergies below
// were extracted from a locally generated Synthea (syntheticmass) population
// — see the "synthea" source tag on each row once seeded. Recovery-specific
// fields (symptoms, vitals deltas, tasks, timeline, AI summary) are authored
// for this dataset, grounded in each patient's underlying conditions, since
// Synthea does not simulate day-by-day post-discharge check-ins.

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

type Seed = Omit<PatientProfile, "careTeam" | "documents"> & {
  careTeam?: PatientProfile["careTeam"];
  documents?: PatientProfile["documents"];
};

function profile(seed: Seed): PatientProfile {
  return { careTeam: defaultCareTeam, documents: defaultDocuments, ...seed };
}

export const seedPatients: PatientProfile[] = [
  profile({
    id: "1", name: "Christel Carter", initials: "CC", risk: "Critical", score: 87, age: 51, dob: "12 Mar 1975", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-2201", email: "christel.carter@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20144",
    procedure: "Coronary artery bypass graft", procedureDate: "17 Sep 2026", dischargeDate: "18 Sep 2026", service: "Cardiac recovery",
    nextAppointment: "24 Sep · 2:00 PM · Cardiac nurse call",
    alert: "Weight gain and breathlessness on exertion",
    summary: "Christel's COPD and post-CABG fluid status meet the clinic's configured review rule together. Reported breathlessness has increased since yesterday's check-in.",
    conditions: ["Ischemic heart disease", "Chronic obstructive bronchitis", "Diabetes mellitus type 2", "Essential hypertension"],
    allergies: ["Animal dander · respiratory", "Grass pollen · respiratory", "Tree pollen · respiratory"],
    symptoms: ["Breathlessness on exertion", "Ankle swelling", "Fatigue"],
    medications: [
      { name: "Metoprolol succinate (extended release)", detail: "Per discharge plan · morning dose", status: "Taken" },
      { name: "Clopidogrel 75mg", detail: "Per discharge plan", status: "Taken" },
      { name: "Metformin (extended release)", detail: "Home medication · reconciliation complete", status: "Active" },
      { name: "Fluticasone / salmeterol inhaler", detail: "Twice daily", status: "Active" },
    ],
    metrics: [
      { label: "Weight", value: "82.4 kg", context: "+2.3 kg in 48 hours", tone: "critical" },
      { label: "SpO₂", value: "93%", context: "−4 pts vs baseline", tone: "critical" },
      { label: "Resting heart rate", value: "91 bpm", context: "+14 vs baseline", tone: "watch" },
      { label: "Steps", value: "540", context: "−52% yesterday", tone: "watch" },
    ],
    labs: [
      { date: "23 Sep · 07:40", name: "BNP", value: "410 pg/mL", reference: "Up from 260 at discharge", status: "High" },
      { date: "23 Sep · 07:40", name: "Glucose", value: "168 mg/dL", reference: "Patient-specific review range", status: "High" },
      { date: "22 Sep · 15:10", name: "Hemoglobin", value: "10.6 g/dL", reference: "Expected post-op trend", status: "Low" },
    ],
    tasks: [
      { label: "Daily weight check-in", detail: "Logged 07:12 — flagged for review", done: true },
      { label: "Breathing exercises", detail: "Not yet logged", done: false },
      { label: "Morning medication", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 07:45", title: "Escalation created", detail: "Weight and SpO₂ rules crossed the clinic threshold together.", source: "Rules engine", tone: "critical" },
      { time: "Today · 07:12", title: "Weight logged", detail: "82.4 kg, up 2.3 kg over 48 hours.", source: "Connected scale", tone: "critical" },
      { time: "Yesterday · 18:30", title: "Care manager call", detail: "Mild breathlessness reported; no chest pain.", source: "Maya Nelson", tone: "neutral" },
    ],
  }),
  profile({
    id: "2", name: "Antonia Olivas", initials: "AO", risk: "Critical", score: 84, age: 75, dob: "02 Jun 1951", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-3312", email: "antonia.olivas@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20151",
    procedure: "Breast lesion excision", procedureDate: "18 Sep 2026", dischargeDate: "19 Sep 2026", service: "Breast surgery recovery",
    nextAppointment: "24 Sep · 11:15 AM · Surgical oncology review",
    alert: "Chest discomfort in a patient with prior heart attack",
    summary: "Antonia's history of ischemic heart disease and a prior myocardial infarction raise the acuity of a new chest-discomfort report following breast surgery. Escalated for same-day clinician review.",
    conditions: ["Ischemic heart disease", "History of myocardial infarction", "Anemia", "Malignant neoplasm of breast"],
    allergies: ["No known drug allergies"],
    symptoms: ["Chest discomfort", "Incision tenderness", "Fatigue"],
    medications: [
      { name: "Metoprolol tartrate", detail: "Per discharge plan", status: "Taken" },
      { name: "Clopidogrel 75mg", detail: "Per discharge plan", status: "Taken" },
      { name: "Aspirin 81mg", detail: "Per discharge plan", status: "Taken" },
      { name: "Rosuvastatin", detail: "Per discharge plan", status: "Active" },
    ],
    metrics: [
      { label: "Resting heart rate", value: "97 bpm", context: "+21 vs baseline", tone: "critical" },
      { label: "Temperature", value: "37.6°C", context: "+0.6°C today", tone: "watch" },
      { label: "Sleep", value: "3h 50m", context: "−44% this week", tone: "critical" },
      { label: "Steps", value: "310", context: "−61% yesterday", tone: "watch" },
    ],
    labs: [
      { date: "23 Sep · 08:10", name: "Troponin", value: "Pending", reference: "Ordered after symptom report", status: "Pending" },
      { date: "22 Sep · 14:20", name: "Hemoglobin", value: "10.1 g/dL", reference: "Below patient baseline", status: "Low" },
    ],
    tasks: [
      { label: "Morning symptom check-in", detail: "Chest discomfort reported 08:05", done: true },
      { label: "Incision photo upload", detail: "Requested yesterday", done: false },
      { label: "Cardiac medication", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 08:12", title: "Escalation created", detail: "New chest discomfort in a patient with cardiac history.", source: "Rules engine", tone: "critical" },
      { time: "Today · 08:05", title: "Symptom reported", detail: "Chest discomfort and poor sleep noted in check-in.", source: "Patient app", tone: "critical" },
      { time: "Yesterday · 16:40", title: "Care manager call", detail: "Incision site reviewed; no drainage at that time.", source: "Maya Nelson", tone: "neutral" },
    ],
  }),
  profile({
    id: "3", name: "Anglea Gulgowski", initials: "AG", risk: "Critical", score: 81, age: 59, dob: "30 Jan 1967", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-4420", email: "anglea.gulgowski@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20159",
    procedure: "Aortic valve replacement", procedureDate: "16 Sep 2026", dischargeDate: "20 Sep 2026", service: "Cardiac recovery",
    nextAppointment: "24 Sep · 9:30 AM · Cardiac nurse call",
    alert: "Reduced urine output with existing kidney disease",
    summary: "Anglea's chronic kidney disease makes today's low fluid intake and reduced urine output a same-day review item under the clinic's renal-cardiac protocol.",
    conditions: ["Chronic kidney disease stage 2", "Essential hypertension", "Diabetes mellitus type 2", "Hypothyroidism"],
    allergies: ["No known drug allergies"],
    symptoms: ["Low urine output", "Swelling in ankles", "Lightheadedness"],
    medications: [
      { name: "Lisinopril", detail: "Per discharge plan", status: "Active" },
      { name: "Levothyroxine sodium", detail: "Per discharge plan", status: "Active" },
      { name: "Insulin (isophane / regular mix)", detail: "Home medication · reconciliation complete", status: "Active" },
      { name: "Aspirin 81mg", detail: "Per discharge plan", status: "Taken" },
    ],
    metrics: [
      { label: "Fluid intake", value: "1 / 6 cups", context: "Well below today's goal", tone: "critical" },
      { label: "Blood pressure", value: "102/64 mmHg", context: "−16 vs baseline", tone: "critical" },
      { label: "Resting heart rate", value: "88 bpm", context: "+12 vs baseline", tone: "watch" },
      { label: "Weight", value: "71.2 kg", context: "−1.1 kg in 24 hours", tone: "watch" },
    ],
    labs: [
      { date: "23 Sep · 07:55", name: "Creatinine", value: "1.8 mg/dL", reference: "Up from 1.4 at discharge", status: "High" },
      { date: "23 Sep · 07:55", name: "Potassium", value: "5.2 mmol/L", reference: "Above clinic range", status: "High" },
      { date: "22 Sep · 13:05", name: "Glucose", value: "152 mg/dL", reference: "Patient-specific review range", status: "High" },
    ],
    tasks: [
      { label: "Fluid and weight log", detail: "Flagged low intake", done: true },
      { label: "Morning medication", detail: "Completed", done: true },
      { label: "Renal follow-up labs", detail: "Ordered — pending draw", done: false },
    ],
    timeline: [
      { time: "Today · 08:00", title: "Escalation created", detail: "Renal and blood pressure signals crossed the clinic threshold.", source: "Rules engine", tone: "critical" },
      { time: "Today · 07:55", title: "New lab results received", detail: "Creatinine and potassium added to the record.", source: "Clinic EHR", tone: "critical" },
      { time: "Yesterday · 17:15", title: "Care manager call", detail: "Reviewed discharge fluid targets.", source: "Maya Nelson", tone: "neutral" },
    ],
  }),
  profile({
    id: "4", name: "Mason Weissnat", initials: "MW", risk: "Watch", score: 63, age: 63, dob: "08 Apr 1963", pronouns: "He / him", sex: "Male", language: "English", phone: "+1 (555) 018-1187", email: "mason.weissnat@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20112",
    procedure: "Coronary artery bypass graft", procedureDate: "19 Sep 2026", dischargeDate: "22 Sep 2026", service: "Cardiac recovery",
    nextAppointment: "25 Sep · 10:00 AM · Cardiac rehab",
    alert: "Activity below target, blood pressure at watch boundary",
    summary: "Mason is medically stable, but reported activity remains below the discharge target and his morning blood pressure reading sits at the clinic's watch boundary.",
    conditions: ["Ischemic heart disease", "Hyperlipidemia", "Essential hypertension", "Osteoarthritis of knee"],
    allergies: ["No known drug allergies"],
    symptoms: ["Mild chest tightness with exertion", "Fatigue"],
    medications: [
      { name: "Metoprolol succinate (extended release)", detail: "Per discharge plan", status: "Taken" },
      { name: "Clopidogrel 75mg", detail: "Per discharge plan", status: "Taken" },
      { name: "Simvastatin", detail: "Per discharge plan", status: "Active" },
    ],
    metrics: [
      { label: "Blood pressure", value: "138/86 mmHg", context: "Above discharge target", tone: "watch" },
      { label: "Resting heart rate", value: "78 bpm", context: "+9 vs baseline", tone: "watch" },
      { label: "Steps", value: "1,410", context: "−34% yesterday", tone: "watch" },
      { label: "SpO₂", value: "96%", context: "Within configured range", tone: "stable" },
    ],
    labs: [
      { date: "22 Sep", name: "Hemoglobin", value: "11.6 g/dL", reference: "Stable post-operative trend", status: "Normal" },
      { date: "22 Sep", name: "Troponin", value: "Trending down", reference: "Expected post-CABG course", status: "Normal" },
    ],
    tasks: [
      { label: "Cardiac rehab walk", detail: "Not yet logged", done: false },
      { label: "Morning medication", detail: "Completed", done: true },
      { label: "Incision check", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 07:20", title: "Vitals synced", detail: "Blood pressure at watch boundary.", source: "Patient app", tone: "watch" },
      { time: "Yesterday · 16:00", title: "Care manager call", detail: "Discussed graduated walking plan.", source: "Maya Nelson", tone: "neutral" },
    ],
  }),
  profile({
    id: "5", name: "Francoise Graham", initials: "FG", risk: "Watch", score: 57, age: 71, dob: "14 May 1955", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-5518", email: "francoise.graham@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20167",
    procedure: "Laparoscopic partial colectomy", procedureDate: "20 Sep 2026", dischargeDate: "22 Sep 2026", service: "Abdominal surgery recovery",
    nextAppointment: "25 Sep · 9:45 AM · Clinic visit",
    alert: "Mobility goal missed and rising pain score",
    summary: "Francoise's mobility goals have been missed twice and today's reported pain score is higher than yesterday, though other recovery signals remain within the clinic's watch range.",
    conditions: ["Essential hypertension", "Osteoarthritis of knee", "Chronic sinusitis"],
    allergies: ["No known drug allergies"],
    symptoms: ["Abdominal pain 6/10", "Reduced mobility"],
    medications: [
      { name: "Amlodipine", detail: "Per discharge plan", status: "Active" },
      { name: "Naproxen", detail: "As needed for pain", status: "Active" },
    ],
    metrics: [
      { label: "Reported pain", value: "6/10", context: "Up from 4/10 yesterday", tone: "watch" },
      { label: "Steps", value: "780", context: "−28% yesterday", tone: "watch" },
      { label: "Resting heart rate", value: "74 bpm", context: "+5 vs baseline", tone: "stable" },
    ],
    labs: [
      { date: "21 Sep", name: "White blood cells", value: "9.8 ×10⁹/L", reference: "Within range", status: "Normal" },
      { date: "21 Sep", name: "Hemoglobin", value: "11.9 g/dL", reference: "Stable", status: "Normal" },
    ],
    tasks: [
      { label: "Short walk", detail: "Not yet logged", done: false },
      { label: "Pain check-in", detail: "Completed", done: true },
      { label: "Incision care", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 07:50", title: "Check-in completed", detail: "Pain rose to 6/10; mobility goal missed.", source: "Patient app", tone: "watch" },
    ],
  }),
  profile({
    id: "6", name: "Yolonda Erdman", initials: "YE", risk: "Watch", score: 54, age: 69, dob: "19 Nov 1956", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-6604", email: "yolonda.erdman@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20172",
    procedure: "Breast lesion excision with sentinel node biopsy", procedureDate: "21 Sep 2026", dischargeDate: "21 Sep 2026", service: "Breast surgery recovery",
    nextAppointment: "26 Sep · 1:30 PM · Surgical oncology review",
    alert: "Arm swelling reported near the node biopsy site",
    summary: "Yolonda reported mild swelling near the sentinel node biopsy site this morning. Within the clinic's expected post-op range but flagged for a nurse check-in.",
    conditions: ["Malignant neoplasm of breast", "Hyperlipidemia", "Osteoarthritis of knee"],
    allergies: ["Fish · reaction on record", "Mold · respiratory"],
    symptoms: ["Mild arm swelling", "Incision soreness"],
    medications: [
      { name: "Simvastatin", detail: "Per discharge plan", status: "Active" },
      { name: "Naproxen", detail: "As needed for pain", status: "Active" },
    ],
    metrics: [
      { label: "Arm circumference", value: "+1.2 cm", context: "Vs. pre-op baseline", tone: "watch" },
      { label: "Reported pain", value: "3/10", context: "Stable since discharge", tone: "stable" },
      { label: "Steps", value: "1,860", context: "Within expected range", tone: "stable" },
    ],
    labs: [{ date: "21 Sep", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }],
    tasks: [
      { label: "Lymphedema check-in", detail: "Flagged mild swelling", done: true },
      { label: "Arm exercises", detail: "Not yet logged", done: false },
      { label: "Medication", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 08:20", title: "Check-in completed", detail: "Mild arm swelling near biopsy site reported.", source: "Patient app", tone: "watch" },
    ],
  }),
  profile({
    id: "7", name: "Reginald Veum", initials: "RV", risk: "Watch", score: 51, age: 34, dob: "05 Feb 1992", pronouns: "He / him", sex: "Male", language: "English", phone: "+1 (555) 018-7719", email: "reginald.veum@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20180",
    procedure: "Lung volume reduction surgery", procedureDate: "17 Sep 2026", dischargeDate: "21 Sep 2026", service: "Thoracic surgery recovery",
    nextAppointment: "25 Sep · 3:00 PM · Pulmonology review",
    alert: "Oxygen saturation dipping on exertion",
    summary: "Reginald's underlying emphysema means today's exertional SpO₂ dip is being watched closely, though he remains within the clinic's configured range at rest.",
    conditions: ["Pulmonary emphysema", "Mitral valve regurgitation", "Anemia"],
    allergies: ["No known drug allergies"],
    symptoms: ["Breathlessness on exertion", "Occasional cough"],
    medications: [
      { name: "Fluticasone / salmeterol inhaler", detail: "Twice daily", status: "Active" },
      { name: "Albuterol inhaler", detail: "As needed", status: "Active" },
    ],
    metrics: [
      { label: "SpO₂ at rest", value: "95%", context: "Within configured range", tone: "stable" },
      { label: "SpO₂ on exertion", value: "89%", context: "Below clinic threshold", tone: "watch" },
      { label: "Steps", value: "620", context: "−40% yesterday", tone: "watch" },
    ],
    labs: [{ date: "22 Sep", name: "Hemoglobin", value: "10.9 g/dL", reference: "Monitor", status: "Low" }],
    tasks: [
      { label: "Incentive spirometry", detail: "2 of 4 sessions complete", done: false },
      { label: "Oxygen check-in", detail: "Completed", done: true },
      { label: "Medication", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "Today · 07:35", title: "Wearable synced", detail: "Exertional SpO₂ dipped below threshold on a short walk.", source: "Apple Health", tone: "watch" },
    ],
  }),
  profile({
    id: "8", name: "Zoila Buckridge", initials: "ZB", risk: "Stable", score: 33, age: 56, dob: "27 Aug 1970", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-8825", email: "zoila.buckridge@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20130",
    procedure: "Coronary artery bypass graft", procedureDate: "13 Sep 2026", dischargeDate: "18 Sep 2026", service: "Cardiac recovery",
    nextAppointment: "26 Sep · Routine cardiac check",
    alert: "Recovery progressing as expected",
    summary: "Zoila's recovery signals and care-plan adherence are steady. Her diabetes and kidney-function monitoring remain on schedule with no new concerns.",
    conditions: ["Chronic kidney disease stage 2", "Diabetes mellitus type 2", "Ischemic heart disease"],
    allergies: ["Shellfish · reaction on record"],
    symptoms: ["Mild incision soreness"],
    medications: [
      { name: "Metoprolol succinate (extended release)", detail: "Per discharge plan", status: "Taken" },
      { name: "Clopidogrel 75mg", detail: "Per discharge plan", status: "Taken" },
      { name: "Insulin (isophane / regular mix)", detail: "Home medication · reconciliation complete", status: "Active" },
    ],
    metrics: [
      { label: "Glucose", value: "128 mg/dL", context: "Within patient range", tone: "stable" },
      { label: "Resting heart rate", value: "70 bpm", context: "At baseline", tone: "stable" },
      { label: "Steps", value: "2,340", context: "+15% yesterday", tone: "stable" },
    ],
    labs: [{ date: "22 Sep", name: "Creatinine", value: "1.1 mg/dL", reference: "Stable for CKD stage 2", status: "Normal" }],
    tasks: [
      { label: "Glucose log", detail: "Completed", done: true },
      { label: "Morning medication", detail: "Completed", done: true },
    ],
    timeline: [{ time: "Today · 06:55", title: "Vitals synced", detail: "Glucose and activity within range.", source: "Apple Health", tone: "stable" }],
  }),
  profile({
    id: "9", name: "Lenna Pollich", initials: "LP", risk: "Stable", score: 22, age: 56, dob: "03 Oct 1969", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-9931", email: "lenna.pollich@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20188",
    procedure: "Laparoscopic partial colectomy", procedureDate: "20 Sep 2026", dischargeDate: "21 Sep 2026", service: "Abdominal surgery recovery",
    nextAppointment: "24 Sep · Routine check",
    alert: "Meeting recovery goals",
    summary: "Lenna is meeting activity and diet targets with no new symptoms reported since discharge.",
    conditions: ["Essential hypertension", "Obstructive sleep apnea syndrome"],
    allergies: ["No known drug allergies"],
    symptoms: ["Mild incision tenderness"],
    medications: [
      { name: "Amlodipine", detail: "Per discharge plan", status: "Active" },
      { name: "Hydrochlorothiazide", detail: "Per discharge plan", status: "Active" },
    ],
    metrics: [
      { label: "Steps", value: "3,120", context: "+9% yesterday", tone: "stable" },
      { label: "Reported pain", value: "2/10", context: "Improving", tone: "stable" },
    ],
    labs: [{ date: "—", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }],
    tasks: [
      { label: "Short walk", detail: "Completed", done: true },
      { label: "Diet check-in", detail: "Completed", done: true },
    ],
    timeline: [{ time: "Today · 07:05", title: "Check-in completed", detail: "No new symptoms reported.", source: "Patient app", tone: "stable" }],
  }),
  profile({
    id: "10", name: "Jenni Johnston", initials: "JJ", risk: "Stable", score: 14, age: 27, dob: "21 Mar 1999", pronouns: "She / her", sex: "Female", language: "English", phone: "+1 (555) 018-0142", email: "jenni.johnston@example.com", address: "Address on file", emergencyContact: "Emergency contact on file", mrn: "NB-20195",
    procedure: "Laparoscopic appendectomy", procedureDate: "22 Sep 2026", dischargeDate: "22 Sep 2026", service: "General surgery recovery",
    nextAppointment: "24 Sep · Routine check",
    alert: "Ready for routine follow-up",
    summary: "Jenni's recovery is on track with all required daily tasks complete and no new symptoms.",
    conditions: ["No active conditions flagged"],
    allergies: ["No known drug allergies"],
    symptoms: ["No new symptoms"],
    medications: [{ name: "Post-operative medication set", detail: "Per discharge plan", status: "Active" }],
    metrics: [
      { label: "Steps", value: "4,480", context: "+18% yesterday", tone: "stable" },
      { label: "Reported pain", value: "1/10", context: "Improving", tone: "stable" },
    ],
    labs: [{ date: "—", name: "No new labs", value: "—", reference: "Not required", status: "Normal" }],
    tasks: [
      { label: "Daily check-in", detail: "Completed", done: true },
      { label: "Walking goal", detail: "Completed", done: true },
    ],
    timeline: [{ time: "Today · 06:40", title: "Recovery synced", detail: "All recovery goals met.", source: "Patient app", tone: "stable" }],
  }),
];
