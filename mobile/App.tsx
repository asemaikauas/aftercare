import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { seedPatients as patientProfiles } from "../db/seed-data";
import {
  bridgeAddress,
  dayKey,
  doseKey,
  emptyPatient,
  validateCheckin,
  type Checkin,
  type PatientState,
  type Submission,
} from "./src/model";
import WatchSimulator from "./src/WatchSimulator";
import { useStore } from "./src/useStore";
import {
  wearableScenario,
  wearableScenarios,
  wearableSnapshot,
  type WearableScenarioId,
} from "./src/wearable";
import {
  disableReminders,
  enableReminders,
  getPushToken,
  observeNotifications,
  testReminder,
} from "./src/notifications";
import {
  Button,
  Card,
  C,
  Face,
  Icon,
  Plant,
  s,
  Section,
  type IconName,
} from "./src/ui";

type Tab = "Today" | "Medication" | "My plan" | "Watch" | "Care team";
type Sheet = "checkin" | "settings" | "history" | null;
const moods = ["Very low", "Low", "Okay", "Good", "Great"];
const symptomsList = [
  "Pain",
  "Nausea",
  "Fatigue",
  "Swelling",
  "Chills",
  "Poor sleep",
];
const tabs: { name: Tab; icon: IconName }[] = [
  { name: "Today", icon: "home" },
  { name: "Medication", icon: "pill" },
  { name: "My plan", icon: "plan" },
  { name: "Watch", icon: "clock" },
  { name: "Care team", icon: "heart" },
];
const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

export default function App() {
  return (
    <SafeAreaProvider>
      <PatientApp />
    </SafeAreaProvider>
  );
}
function PatientApp() {
  const { store, ready, error, load, update, sync, isPending } = useStore();
  const [tab, setTab] = useState<Tab>("Today");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [pain, setPain] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [time, setTime] = useState("09:00");
  const [bridge, setBridge] = useState("");
  const [message, setMessage] = useState("");
  const [wearableScenarioId, setWearableScenarioId] =
    useState<WearableScenarioId>("on-track");
  const [now, setNow] = useState(new Date());
  const patient =
    patientProfiles.find((p) => p.id === store.patientId) ?? patientProfiles[0];
  const state = store.patients[patient.id] ?? emptyPatient();
  const today = dayKey(now);
  const todayCheckin = state.checkins.find((c) => c.date === today);
  const dosesDone = patient.medications.filter(
    (m) => state.doses[doseKey(patient.id, m.name, now)],
  ).length;
  const tasksDone = patient.tasks.filter(
    (_, i) => state.tasks[`${today}:${i}`],
  ).length;
  const completed = (todayCheckin ? 1 : 0) + dosesDone + tasksDone;
  const total = 1 + patient.medications.length + patient.tasks.length;
  const pending = store.outbox.filter((x) => x.patientId === patient.id).length;
  const wearable = wearableScenario(wearableScenarioId);
  const wearableColor =
    wearable.tone === "green"
      ? "#B8F23D"
      : wearable.tone === "red"
        ? "#FF5D68"
        : "#F5C84C";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    const subscription = AppState.addEventListener("change", (value) => {
      if (value === "active") setNow(new Date());
    });
    let cleanup = () => {};
    let disposed = false;
    observeNotifications(() => setTab("Medication"))
      .then((fn) => {
        if (disposed) fn();
        else cleanup = fn;
      })
      .catch(() => {});
    return () => {
      clearInterval(timer);
      subscription.remove();
      disposed = true;
      cleanup();
    };
  }, []);

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice("");
    try {
      await action();
    } catch (e) {
      setNotice(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function savePatient(
    change: (p: PatientState) => PatientState,
    event?: Submission,
  ) {
    await update((value) => ({
      ...value,
      patients: {
        ...value.patients,
        [patient.id]: change(value.patients[patient.id] ?? emptyPatient()),
      },
      outbox: event ? [...value.outbox, event] : value.outbox,
    }));
  }
  function event(kind: Submission["kind"], body: string): Submission {
    return {
      id: newId(),
      patientId: patient.id,
      patientName: patient.name,
      kind,
      body,
      createdAt: new Date().toISOString(),
    };
  }
  async function deliveryNotice(savedMessage: string) {
    if (!store.bridgeUrl) {
      setNotice(
        `${savedMessage} Saved on this device. Connect your clinic in Settings to share.`,
      );
      return;
    }
    try {
      await sync(store.bridgeUrl);
      setNotice(`${savedMessage} Delivered to the clinic inbox.`);
    } catch {
      setNotice(
        `${savedMessage} Saved on this device; clinic connection unavailable. Tap Sync in Settings to retry.`,
      );
    }
  }
  function openCheckin(value?: number) {
    setMood(value ?? todayCheckin?.mood ?? null);
    setPain(todayCheckin?.pain ?? null);
    setSymptoms(todayCheckin?.symptoms ?? []);
    setNotes(todayCheckin?.notes ?? "");
    setStep(1);
    setSheet("checkin");
    setNotice("");
  }
  function openSettings() {
    setTime(store.reminderTime);
    setBridge(store.bridgeUrl);
    setSheet("settings");
    setNotice("");
  }
  async function submitCheckin() {
    validateCheckin(mood, pain);
    const checkin: Checkin = {
      id: newId(),
      date: dayKey(),
      createdAt: new Date().toISOString(),
      mood: mood!,
      pain: pain!,
      symptoms,
      notes: notes.trim(),
    };
    const submission = event(
      "check-in",
      `Feeling: ${moods[mood! - 1]} (${mood}/5). Pain: ${pain}/10. Symptoms: ${symptoms.length ? symptoms.join(", ") : "None selected"}.${notes.trim() ? ` Note: ${notes.trim()}` : ""}`,
    );
    await savePatient(
      (p) => ({
        ...p,
        checkins: [
          checkin,
          ...p.checkins.filter((x) => x.date !== checkin.date),
        ],
      }),
      submission,
    );
    setSheet(null);
    await deliveryNotice("Your check-in is complete.");
  }
  async function logMedication(name: string) {
    const key = doseKey(patient.id, name);
    if (state.doses[key]) return;
    await savePatient(
      (p) => ({ ...p, doses: { ...p.doses, [key]: new Date().toISOString() } }),
      event(
        "medication",
        `${name}: patient recorded taken today. This is a daily record, not dose verification.`,
      ),
    );
    await deliveryNotice("Medication recorded.");
  }
  async function shareSummary() {
    const lines = state.checkins.map(
      (c) =>
        `${c.date}: feeling ${moods[c.mood - 1]}, pain ${c.pain}/10; ${c.symptoms.join(", ") || "no symptoms selected"}${c.notes ? `; ${c.notes}` : ""}`,
    );
    await Share.share({
      title: "aftercare recovery summary",
      message: `aftercare recovery record\n${patient.name}\n${patient.procedure}\n\n${lines.join("\n") || "No check-ins recorded yet."}`,
    });
  }
  async function shareWearableSnapshot() {
    await savePatient(
      (value) => value,
      event("wearable", wearableSnapshot(wearable)),
    );
    await deliveryNotice("Wearable snapshot shared.");
  }
  if (!ready)
    return (
      <SafeAreaView
        style={[s.root, { justifyContent: "center", padding: 30, gap: 20 }]}
      >
        {error ? (
          <>
            <Text style={s.body}>{error}</Text>
            <Button title="Retry loading" onPress={() => void load()} />
          </>
        ) : (
          <>
            <ActivityIndicator color={C.forest} />
            <Text style={[s.body, { textAlign: "center" }]}>
              Preparing your care space…
            </Text>
          </>
        )}
      </SafeAreaView>
    );

  const Notice = () =>
    notice ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${notice} Dismiss message`}
        onPress={() => setNotice("")}
        style={s.toast}
      >
        <Text accessibilityLiveRegion="polite" style={s.toastText}>
          {notice}
        </Text>
        <Text
          style={[s.toastText, { opacity: 0.7, fontSize: 11, marginTop: 5 }]}
        >
          Tap to dismiss
        </Text>
      </Pressable>
    ) : null;
  return (
    <SafeAreaView style={s.root} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={s.shell}>
        <View style={s.header}>
          <View style={[s.row, { gap: 9 }]}>
            <View style={s.brandMark}>
              <Icon name="leaf" size={21} color={C.lime} />
            </View>
            <Text style={s.brand}>
              aftercare<Text style={{ color: "#839278" }}>.</Text>
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings and reminders"
            onPress={openSettings}
            style={s.iconButton}
          >
            <Icon name="bell" />
          </Pressable>
        </View>
        <ScrollView
          key={`${tab}-${patient.id}`}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "Today" && (
            <>
              <View style={{ gap: 7 }}>
                <Text style={s.eyebrow}>
                  {now.toLocaleDateString("en", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={s.h1}>Hello, {patient.name.split(" ")[0]}.</Text>
                <Text style={s.body}>
                  A little care. A little progress. Every day.
                </Text>
              </View>
              <View style={s.hero}>
                <View style={s.plant}>
                  <Plant />
                </View>
                <View style={{ gap: 9 }}>
                  <Text style={[s.eyebrow, { color: "#CAE0B5", fontSize: 10 }]}>
                    YOUR RECOVERY COMPANION
                  </Text>
                  <Text style={s.heroTitle}>
                    Home, with care{"\n"}by your side.
                  </Text>
                  <Text style={s.heroSmall}>{patient.service}</Text>
                </View>
                <View style={[s.row, { marginTop: 17, gap: 7 }]}>
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: C.lime,
                    }}
                  />
                  <Text style={s.heroSmall}>
                    Your next small step starts here
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open wearable insights"
                onPress={() => setTab("Watch")}
              >
                <Card style={{ backgroundColor: "#121715", borderColor: "#121715" }}>
                  <View style={s.between}>
                    <View style={[s.row, { gap: 9 }]}>
                      <Icon name="activity" color="#B8F23D" />
                      <Text style={[s.h3, { color: "white" }]}>Wearable insights</Text>
                    </View>
                    <Icon name="chevron" color="white" size={18} />
                  </View>
                  <View style={s.between}>
                    <View style={s.grow}>
                      <Text style={[s.small, { color: "#AEBBB5" }]}>Recovery</Text>
                      <Text style={[s.h1, { color: wearableColor, fontSize: 31 }]}>
                        {wearable.recovery}%
                      </Text>
                    </View>
                    <View style={s.grow}>
                      <Text style={[s.small, { color: "#AEBBB5" }]}>Sleep</Text>
                      <Text style={[s.h2, { color: "white" }]}>{wearable.sleep}%</Text>
                    </View>
                    <View style={s.grow}>
                      <Text style={[s.small, { color: "#AEBBB5" }]}>Strain</Text>
                      <Text style={[s.h2, { color: "white" }]}>{wearable.strain.toFixed(1)}</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
              <Card>
                <View style={s.between}>
                  <Text style={s.h2}>How are you feeling?</Text>
                  <Icon name="sun" size={21} />
                </View>
                <Text style={s.small}>
                  {todayCheckin
                    ? `Today you felt ${moods[todayCheckin.mood - 1].toLowerCase()}. You can update your check-in.`
                    : "Take a moment to check in with yourself."}
                </Text>
                <View style={s.moodRow}>
                  {moods.map((label, i) => (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      accessibilityLabel={`Feeling ${label}`}
                      onPress={() => openCheckin(i + 1)}
                      style={s.moodButton}
                    >
                      <Face
                        value={i + 1}
                        selected={todayCheckin?.mood === i + 1}
                      />
                      <Text style={s.moodLabel}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Button
                  title={
                    todayCheckin
                      ? "Update today’s check-in"
                      : "Start daily check-in"
                  }
                  icon="arrow"
                  onPress={() => openCheckin()}
                />
              </Card>
              <Section
                title="Your next steps"
                action="View plan"
                onPress={() => setTab("My plan")}
              />
              <Card>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTab("Medication")}
                  style={s.row}
                >
                  <View style={[s.badge, { backgroundColor: C.amber }]}>
                    <Icon name="pill" />
                  </View>
                  <View style={s.grow}>
                    <Text style={s.h3}>Medication check</Text>
                    <Text style={s.small}>
                      {dosesDone} of {patient.medications.length} recorded today
                    </Text>
                  </View>
                  <Icon name="chevron" size={17} />
                </Pressable>
                <View style={s.divider} />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTab("My plan")}
                  style={s.row}
                >
                  <View style={s.badge}>
                    <Icon name="plan" />
                  </View>
                  <View style={s.grow}>
                    <Text style={s.h3}>A plan, at your pace</Text>
                    <Text style={s.small}>
                      {patient.tasks.length - tasksDone} care tasks to review
                    </Text>
                  </View>
                  <Icon name="chevron" size={17} />
                </Pressable>
              </Card>
              <View
                style={[s.notice, { backgroundColor: "#EAEEE2", padding: 18 }]}
              >
                <View style={s.row}>
                  <Icon name="heart" size={21} />
                  <View style={s.grow}>
                    <Text style={s.h3}>You don’t have to do it alone.</Text>
                    <Text style={s.small}>
                      Your care team and follow-up details, together.
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTab("Care team")}
                  style={[s.textButton, { paddingLeft: 33 }]}
                >
                  <Text style={s.link}>Meet your care team</Text>
                  <Icon name="arrow" size={16} />
                </Pressable>
              </View>
            </>
          )}
          {tab === "Medication" && (
            <>
              <View style={{ gap: 7 }}>
                <Text style={s.eyebrow}>ONE STEP AT A TIME</Text>
                <Text style={s.h1}>Your medication.</Text>
                <Text style={s.body}>
                  Keep track of the plan your clinic gave you.
                </Text>
              </View>
              <Card style={{ backgroundColor: C.mint }}>
                <View style={s.between}>
                  <Text style={s.h3}>Today’s medication log</Text>
                  <Text style={s.h3}>
                    {dosesDone} / {patient.medications.length}
                  </Text>
                </View>
                <View style={s.progress}>
                  <View
                    style={{
                      width: `${(100 * dosesDone) / Math.max(1, patient.medications.length)}%`,
                      height: 6,
                      backgroundColor: C.forest,
                    }}
                  />
                </View>
                <Text style={s.small}>
                  One daily record per medication. Follow your discharge
                  instructions for doses and timing.
                </Text>
              </Card>
              {patient.medications.map((med, i) => {
                const taken = state.doses[doseKey(patient.id, med.name, now)];
                return (
                  <Card key={med.name}>
                    <View style={s.row}>
                      <View
                        style={[
                          s.badge,
                          { backgroundColor: i % 2 ? C.mint : C.amber },
                        ]}
                      >
                        <Icon name="pill" />
                      </View>
                      <View style={s.grow}>
                        <Text style={s.h3}>{med.name}</Text>
                        <Text style={s.small}>
                          From your clinic’s medication list
                        </Text>
                      </View>
                    </View>
                    <Text style={s.body}>{med.detail.split(" · ")[0]}</Text>
                    <Button
                      title={
                        taken
                          ? `Recorded at ${formatTime(taken)}`
                          : "I’ve taken this today"
                      }
                      secondary={!!taken}
                      disabled={!!taken || busy}
                      icon={taken ? "check" : undefined}
                      onPress={() => void run(() => logMedication(med.name))}
                    />
                  </Card>
                );
              })}
              <Card>
                <View style={s.row}>
                  <Icon name="bell" />
                  <View style={s.grow}>
                    <Text style={s.h3}>A gentle daily nudge</Text>
                    <Text style={s.small}>
                      {store.reminderEnabled
                        ? `Reminder set for ${store.reminderTime} on this phone`
                        : "Choose a time to review your medication plan."}
                    </Text>
                  </View>
                </View>
                <Button
                  title="Manage reminders"
                  secondary
                  onPress={openSettings}
                />
              </Card>
              <Text style={s.small}>
                This record does not include complete dose schedules. This
                log does not change your prescription or tell you when another
                dose is due.
              </Text>
            </>
          )}
          {tab === "My plan" && (
            <>
              <View style={{ gap: 7 }}>
                <Text style={s.eyebrow}>MADE FOR YOUR RECOVERY</Text>
                <Text style={s.h1}>Small steps,{"\n"}forward.</Text>
                <Text style={s.body}>{patient.procedure}</Text>
              </View>
              <Card style={{ backgroundColor: C.mint }}>
                <View style={s.between}>
                  <View style={s.grow}>
                    <Text style={s.h3}>Today’s progress</Text>
                    <Text style={s.small}>
                      Check-in, medication logs and care tasks
                    </Text>
                  </View>
                  <Text style={[s.h1, { fontSize: 28 }]}>
                    {completed}
                    <Text style={{ color: C.muted, fontSize: 16 }}>
                      /{total}
                    </Text>
                  </Text>
                </View>
                <View style={s.progress}>
                  <View
                    style={{
                      width: `${(100 * completed) / total}%`,
                      backgroundColor: C.forest,
                      height: 6,
                    }}
                  />
                </View>
              </Card>
              <Section title="Your clinic’s care tasks" />
              <Card>
                {patient.tasks.map((task, i) => {
                  const done = !!state.tasks[`${today}:${i}`];
                  return (
                    <View key={task.label}>
                      {i > 0 && <View style={s.divider} />}
                      <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: done, disabled: busy }}
                        aria-checked={done}
                        disabled={busy}
                        onPress={() =>
                          void run(async () => {
                            await savePatient((p) => ({
                              ...p,
                              tasks: {
                                ...p.tasks,
                                [`${dayKey()}:${i}`]: !done,
                              },
                            }));
                            setNotice("Care task updated on this device.");
                          })
                        }
                        style={s.task}
                      >
                        <View
                          style={[
                            s.checkbox,
                            done && {
                              backgroundColor: C.forest,
                              borderColor: C.forest,
                            },
                          ]}
                        >
                          {done && (
                            <Icon name="check" color="white" size={18} />
                          )}
                        </View>
                        <View style={s.grow}>
                          <Text style={[s.h3, done && { color: C.muted }]}>
                            {task.label}
                          </Text>
                          <Text style={s.small}>
                            {done
                              ? "Completed today on this device"
                              : "From your discharge care plan"}
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </Card>
              <Card>
                <View style={s.row}>
                  <View style={s.badge}>
                    <Icon name="clock" />
                  </View>
                  <View style={s.grow}>
                    <Text style={s.h3}>Your next follow-up</Text>
                    <Text style={s.body}>{patient.nextAppointment}</Text>
                  </View>
                </View>
                <Text style={s.small}>
                  Appointment from your clinic record.
                </Text>
              </Card>
              <Section
                title="Your check-in journal"
                action="View all"
                onPress={() => setSheet("history")}
              />
              {state.checkins.length ? (
                <Card>
                  {state.checkins.slice(0, 3).map((c) => (
                    <View key={c.id} style={s.row}>
                      <Face value={c.mood} size={38} />
                      <View style={s.grow}>
                        <Text style={s.h3}>{moods[c.mood - 1]}</Text>
                        <Text style={s.small}>
                          {c.date} · Pain {c.pain}/10
                        </Text>
                      </View>
                      <Icon name="check" size={18} />
                    </View>
                  ))}
                </Card>
              ) : (
                <Card>
                  <Text style={s.body}>
                    Your story starts with one check-in.
                  </Text>
                  <Button
                    title="Check in today"
                    secondary
                    onPress={() => openCheckin()}
                  />
                </Card>
              )}
            </>
          )}
          {tab === "Watch" && <WatchSimulator key={patient.id} patient={patient} events={state.watchEvents ?? []} pendingIds={store.outbox.filter(e => e.patientId === patient.id && e.kind.startsWith('watch-')).map(e => e.id)} bridgeUrl={store.bridgeUrl} onSettings={openSettings} onMedication={() => setTab('Medication')} onRetry={async () => { await sync(store.bridgeUrl); }} onSubmit={async (item) => {
            await savePatient(p => ({ ...p, watchEvents: [item, ...(p.watchEvents ?? []).filter(e => e.id !== item.id)] }), item);
            if (!store.bridgeUrl) return false;
            try { await sync(store.bridgeUrl); } catch { /* Keep unsent updates on device. */ }
            return !isPending(item.id);
          }} />}
          {tab === "Watch" && (
            <>
              <View style={{ gap: 7 }}>
                <Text style={s.eyebrow}>CONNECTED RECOVERY</Text>
                <Text style={s.h1}>Your wearable story.</Text>
                <Text style={s.body}>
                  Explore how recovery, sleep and strain could support a richer
                  conversation with your care team.
                </Text>
              </View>
              <View style={s.wrap}>
                {wearableScenarios.map((scenario) => (
                  <Pressable
                    key={scenario.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: scenario.id === wearable.id }}
                    onPress={() => setWearableScenarioId(scenario.id)}
                    style={[
                      s.chip,
                      scenario.id === wearable.id && {
                        backgroundColor: "#1C2521",
                        borderColor: "#1C2521",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.small,
                        { fontWeight: "700" },
                        scenario.id === wearable.id && { color: "white" },
                      ]}
                    >
                      {scenario.shortLabel}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.wearableHero}>
                <View style={s.between}>
                  <View>
                    <Text style={[s.eyebrow, { color: "#B8F23D" }]}>WEARABLE INSIGHTS</Text>
                    <Text style={[s.small, { color: "#AEBBB5", marginTop: 5 }]}>Recovery, sleep and strain</Text>
                  </View>
                  <Icon name="activity" color="#B8F23D" />
                </View>
                <View style={[s.row, { alignItems: "center", gap: 20 }]}>
                  <View style={[s.wearableScore, { borderColor: wearableColor }]}>
                    <Text style={[s.h1, { color: "white", fontSize: 31 }]}>{wearable.recovery}</Text>
                    <Text style={[s.small, { color: "#AEBBB5" }]}>RECOVERY</Text>
                  </View>
                  <View style={s.grow}>
                    <Text style={[s.h2, { color: "white", lineHeight: 27 }]}>{wearable.label}</Text>
                    <Text style={[s.small, { color: "#AEBBB5", marginTop: 7 }]}>{wearable.headline}</Text>
                  </View>
                </View>
              </View>
              <View style={s.wearableMetricGrid}>
                {[
                  ["Sleep performance", `${wearable.sleep}%`, wearable.sleepHours],
                  ["Day strain", wearable.strain.toFixed(1), "0–21 scale"],
                  ["Heart-rate variability", `${wearable.hrv} ms`, "Overnight average"],
                  ["Resting heart rate", `${wearable.restingHeartRate} bpm`, "Recent overnight"],
                ].map(([label, value, detail]) => (
                  <View style={s.wearableMetric} key={label}>
                    <Text style={s.small}>{label}</Text>
                    <Text style={[s.h2, { fontSize: 23 }]}>{value}</Text>
                    <Text style={s.small}>{detail}</Text>
                  </View>
                ))}
              </View>
              <Card>
                <View style={s.between}>
                  <View>
                    <Text style={s.h3}>Seven-day recovery</Text>
                    <Text style={s.small}>Oldest to today</Text>
                  </View>
                  <Text style={[s.h2, { color: wearableColor }]}>{wearable.recovery}%</Text>
                </View>
                <View style={s.trend} accessibilityLabel={`Seven-day recovery trend: ${wearable.recoveryTrend.join(", ")} percent`}>
                  {wearable.recoveryTrend.map((value, index) => (
                    <View
                      key={`${value}-${index}`}
                      style={[
                        s.trendBar,
                        {
                          height: `${value}%`,
                          backgroundColor: index === 6 ? wearableColor : "#D8E1DA",
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={s.between}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'Today'].map((day, index) => (
                    <Text key={`${day}-${index}`} style={[s.small, { fontSize: 10 }]}>{day}</Text>
                  ))}
                </View>
              </Card>
              <Card style={{ backgroundColor: C.mint }}>
                <View style={s.row}>
                  <View style={[s.badge, { backgroundColor: C.paper }]}>
                    <Icon name="activity" />
                  </View>
                  <Text style={[s.h3, s.grow]}>What these signals could mean</Text>
                </View>
                <Text style={s.body}>{wearable.explanation}</Text>
                <View style={s.divider} />
                <Text style={s.small}>{wearable.guidance}</Text>
              </Card>
              <Button
                title={store.bridgeUrl ? "Share snapshot with clinic" : "Save snapshot"}
                icon="arrow"
                disabled={busy}
                onPress={() => void run(shareWearableSnapshot)}
              />
              <View style={[s.notice, { backgroundColor: C.amber }]}>
                <Text style={s.h3}>Use wearable data with care</Text>
                <Text style={s.small}>
                  Wearable signals do not diagnose a condition and should be
                  reviewed alongside symptoms and your care plan.
                </Text>
              </View>
            </>
          )}
          {tab === "Care team" && (
            <>
              <View style={{ gap: 7 }}>
                <Text style={s.eyebrow}>PEOPLE IN YOUR CORNER</Text>
                <Text style={s.h1}>Care, connected.</Text>
                <Text style={s.body}>
                  Get to know the people behind your plan.
                </Text>
              </View>
              {patient.careTeam.map((person, i) => (
                <Card key={person.name}>
                  <View style={s.row}>
                    <View
                      style={[
                        s.badge,
                        {
                          width: 54,
                          height: 54,
                          borderRadius: 20,
                          backgroundColor: i % 2 ? C.amber : C.mint,
                        },
                      ]}
                    >
                      <Text style={[s.h3, { fontSize: 18 }]}>
                        {person.initials}
                      </Text>
                    </View>
                    <View style={s.grow}>
                      <Text style={s.h3}>{person.name}</Text>
                      <Text style={s.small}>{person.role}</Text>
                    </View>
                    <Icon name="heart" size={19} />
                  </View>
                </Card>
              ))}
              <Section title="A note for your care team" />
              <Card>
                <Text style={s.body}>
                  Something you want your team to know?
                </Text>
                <TextInput
                  accessibilityLabel="Message to care team"
                  multiline
                  maxLength={1000}
                  placeholder="Tell us what’s on your mind…"
                  placeholderTextColor={C.muted}
                  value={message}
                  onChangeText={setMessage}
                  style={[
                    s.input,
                    { minHeight: 110, textAlignVertical: "top" },
                  ]}
                />
                <Text style={s.small}>
                  {store.bridgeUrl
                    ? "Sent to the clinic inbox when connected."
                    : "Saved on this device until you connect your clinic."}{" "}
                  This inbox is not monitored for emergencies.
                </Text>
                <Button
                  title={
                    store.bridgeUrl ? "Send to clinic" : "Save message"
                  }
                  icon="arrow"
                  disabled={!message.trim() || busy}
                  onPress={() =>
                    void run(async () => {
                      const item = event("message", message.trim());
                      await savePatient(
                        (p) => ({
                          ...p,
                          messages: [
                            ...p.messages,
                            {
                              id: item.id,
                              body: item.body,
                              createdAt: item.createdAt,
                            },
                          ],
                        }),
                        item,
                      );
                      setMessage("");
                      await deliveryNotice("Your message is saved.");
                    })
                  }
                />
              </Card>
              {state.messages
                .slice()
                .reverse()
                .map((m) => (
                  <Card key={m.id} style={{ backgroundColor: C.mint }}>
                    <Text style={s.body}>{m.body}</Text>
                    <Text style={s.small}>
                      {formatTime(m.createdAt)} ·{" "}
                      {store.outbox.some((x) => x.id === m.id)
                        ? "Saved on device · not delivered"
                        : "Delivered to clinic"}
                    </Text>
                  </Card>
                ))}
              <View style={[s.notice, { backgroundColor: C.coral }]}>
                <Text style={s.h3}>Need urgent help?</Text>
                <Text style={s.body}>
                  For an emergency, contact your local emergency service. Do not
                  wait for a reply here.
                </Text>
              </View>
            </>
          )}
          <View style={{ alignItems: "center", gap: 4, marginTop: 3 }}>
            <Text style={[s.small, { fontSize: 10, letterSpacing: 1 }]}>
              aftercare
            </Text>
            <Text style={[s.small, { fontSize: 11 }]}>
              {pending
                ? `${pending} updates saved on device`
                : "Your recovery space"}
            </Text>
          </View>
        </ScrollView>
        {!sheet && <Notice />}
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: C.paper }}>
          <View style={s.nav}>
            {tabs.map((item) => (
              <Pressable
                key={item.name}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === item.name }}
                aria-selected={tab === item.name}
                onPress={() => {
                  setTab(item.name);
                  setNotice("");
                }}
                style={s.navItem}
              >
                <View
                  style={[
                    s.navIcon,
                    tab === item.name && { backgroundColor: C.mint },
                  ]}
                >
                  <Icon
                    name={item.icon}
                    color={tab === item.name ? C.forest : C.muted}
                    size={22}
                  />
                </View>
                <Text
                  style={[
                    s.navText,
                    tab === item.name && { color: C.forest, fontWeight: "700" },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
        <Modal
          visible={sheet !== null}
          transparent
          animationType="slide"
          onRequestClose={() => {
            if (!busy) setSheet(null);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={s.overlay}
          >
            <SafeAreaView edges={["bottom"]} style={s.sheet}>
              <View style={s.sheetHead}>
                <Text style={s.h2}>
                  {sheet === "checkin"
                    ? "Your daily check-in"
                    : sheet === "settings"
                      ? "Your care space"
                      : "Check-in journal"}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  disabled={busy}
                  style={s.iconButton}
                  onPress={() => setSheet(null)}
                >
                  <Icon name="close" />
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={s.sheetContent}
                keyboardShouldPersistTaps="handled"
              >
                {sheet === "checkin" && (
                  <>
                    <Text style={s.eyebrow}>
                      STEP {step} OF 2 · ABOUT A MINUTE
                    </Text>
                    <View style={s.progress}>
                      <View
                        style={{
                          height: 6,
                          width: step === 1 ? "50%" : "100%",
                          backgroundColor: C.forest,
                        }}
                      />
                    </View>
                    {step === 1 ? (
                      <>
                        <Text style={[s.h1, { fontSize: 28 }]}>
                          Let’s start with you.
                        </Text>
                        <Text style={s.body}>How are you feeling today?</Text>
                        <View style={s.moodRow}>
                          {moods.map((label, i) => (
                            <Pressable
                              key={label}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: mood === i + 1 }}
                              aria-checked={mood === i + 1}
                              accessibilityLabel={label}
                              onPress={() => setMood(i + 1)}
                              style={[
                                s.moodButton,
                                mood === i + 1 && { backgroundColor: C.mint },
                              ]}
                            >
                              <Face value={i + 1} selected={mood === i + 1} />
                              <Text style={s.moodLabel}>{label}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Text style={s.h3}>What is your pain level?</Text>
                        <Text style={s.small}>
                          0 is no pain. 10 is the worst pain you can imagine.
                        </Text>
                        <View style={s.wrap}>
                          {Array.from({ length: 11 }, (_, i) => (
                            <Pressable
                              key={i}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: pain === i }}
                              aria-checked={pain === i}
                              accessibilityLabel={`Pain ${i} out of 10`}
                              onPress={() => setPain(i)}
                              style={[
                                s.chip,
                                { minWidth: 44, alignItems: "center" },
                                pain === i && s.chipActive,
                              ]}
                            >
                              <Text style={s.h3}>{i}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Button
                          title="Continue"
                          icon="arrow"
                          disabled={mood === null || pain === null}
                          onPress={() => setStep(2)}
                        />
                      </>
                    ) : (
                      <>
                        <Text style={[s.h1, { fontSize: 28 }]}>
                          Anything else to share?
                        </Text>
                        <Text style={s.body}>
                          Select any symptoms you’ve noticed. You can leave this
                          blank.
                        </Text>
                        <View style={s.wrap}>
                          {symptomsList.map((item) => (
                            <Pressable
                              key={item}
                              accessibilityRole="checkbox"
                              accessibilityState={{
                                checked: symptoms.includes(item),
                              }}
                              aria-checked={symptoms.includes(item)}
                              onPress={() =>
                                setSymptoms((current) =>
                                  current.includes(item)
                                    ? current.filter((x) => x !== item)
                                    : [...current, item],
                                )
                              }
                              style={[
                                s.chip,
                                symptoms.includes(item) && s.chipActive,
                              ]}
                            >
                              <Text style={s.body}>{item}</Text>
                            </Pressable>
                          ))}
                        </View>
                        <Text style={s.h3}>
                          In your own words{" "}
                          <Text style={s.small}>(optional)</Text>
                        </Text>
                        <TextInput
                          accessibilityLabel="Check-in notes"
                          multiline
                          maxLength={1000}
                          value={notes}
                          onChangeText={setNotes}
                          placeholder="What feels different today?"
                          placeholderTextColor={C.muted}
                          style={[
                            s.input,
                            { minHeight: 110, textAlignVertical: "top" },
                          ]}
                        />
                        <View style={s.notice}>
                          <Text style={s.h3}>
                            {mood ? moods[mood - 1] : ""} · Pain {pain}/10
                          </Text>
                          <Text style={s.small}>
                            This records your experience, without assessing or
                            diagnosing symptoms. Contact your care team if
                            you’re concerned; use emergency services for urgent
                            help.
                          </Text>
                        </View>
                        <Button
                          title={busy ? "Saving…" : "Complete check-in"}
                          icon="check"
                          disabled={busy}
                          onPress={() => void run(submitCheckin)}
                        />
                        <Button
                          title="Back"
                          secondary
                          disabled={busy}
                          onPress={() => setStep(1)}
                        />
                      </>
                    )}
                  </>
                )}
                {sheet === "settings" && (
                  <>
                    <Card>
                      <Text style={s.eyebrow}>PATIENT PROFILE</Text>
                      <Text style={s.h3}>{patient.name}</Text>
                      <Text style={s.small}>
                        Choose the patient profile connected to this device.
                      </Text>
                      <View style={s.wrap}>
                        {patientProfiles.map((p) => (
                          <Pressable
                            key={p.id}
                            accessibilityRole="radio"
                            accessibilityState={{
                              checked: p.id === patient.id,
                            }}
                            aria-checked={p.id === patient.id}
                            disabled={busy}
                            onPress={() =>
                              void run(async () => {
                                await update((value) => ({
                                  ...value,
                                  patientId: p.id,
                                }));
                                setMessage("");
                                setNotice(`Switched to ${p.name}.`);
                              })
                            }
                            style={[
                              s.chip,
                              p.id === patient.id && s.chipActive,
                            ]}
                          >
                            <Text style={s.small}>{p.name}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </Card>
                    <Card>
                      <View style={s.row}>
                        <Icon name="bell" />
                        <Text style={s.h3}>Daily phone reminder</Text>
                      </View>
                      <Text style={s.body}>
                        Choose a time to review your care plan.
                      </Text>
                      <Text style={s.small}>
                        This is a personal reminder, not a prescribed dose
                        schedule. Your phone controls notification delivery.
                      </Text>
                      <TextInput
                        accessibilityLabel="Daily reminder time in 24-hour format"
                        value={time}
                        onChangeText={setTime}
                        placeholder="09:00"
                        maxLength={5}
                        keyboardType={
                          Platform.OS === "ios"
                            ? "numbers-and-punctuation"
                            : "default"
                        }
                        style={s.input}
                      />
                      <Button
                        title={
                          busy
                            ? "Please wait…"
                            : store.reminderEnabled
                              ? "Update reminder time"
                              : "Enable reminders"
                        }
                        disabled={busy}
                        onPress={() =>
                          void run(async () => {
                            await enableReminders(time);
                            await update((value) => ({
                              ...value,
                              reminderTime: time,
                              reminderEnabled: true,
                            }));
                            setNotice(
                              `Daily care reminder scheduled for ${time} on this phone.`,
                            );
                          })
                        }
                      />
                      {store.reminderEnabled && (
                        <Button
                          title="Turn off daily reminder"
                          secondary
                          disabled={busy}
                          onPress={() =>
                            void run(async () => {
                              await disableReminders();
                              await update((value) => ({
                                ...value,
                                reminderEnabled: false,
                              }));
                              setNotice("Daily reminder turned off.");
                            })
                          }
                        />
                      )}
                      <Button
                        title="Try a reminder in 5 seconds"
                        secondary
                        disabled={busy}
                        onPress={() =>
                          void run(async () => {
                            await testReminder();
                            setNotice(
                              "Notification scheduled in 5 seconds.",
                            );
                          })
                        }
                      />
                    </Card>
                    <Card>
                      <Text style={s.h3}>Connect your clinic</Text>
                      <Text style={s.small}>
                        Enter the clinic server address from your laptop while
                        both devices are on the same Wi-Fi.
                      </Text>
                      <TextInput
                        accessibilityLabel="Clinic server URL"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="http://192.168.1.10:4100"
                        placeholderTextColor={C.muted}
                        value={bridge}
                        onChangeText={setBridge}
                        style={s.input}
                      />
                      <Button
                        title="Connect and sync"
                        disabled={!bridge.trim() || busy}
                        onPress={() =>
                          void run(async () => {
                            const url = bridgeAddress(bridge);
                            const response = await fetch(`${url}/health`, {
                              signal: AbortSignal.timeout(6000),
                            });
                            const data = await response.json();
                            if (
                              !response.ok ||
                              data.service !== "continuum-demo"
                            )
                              throw new Error(
                                "This server is not compatible with aftercare.",
                              );
                            await update((value) => ({
                              ...value,
                              bridgeUrl: url,
                            }));
                            setBridge(url);
                            const count = await sync(url);
                            setNotice(
                              `Connected. ${count} updates delivered to the clinic.`,
                            );
                          })
                        }
                      />
                      {store.bridgeUrl && (
                        <Button
                          title="Disconnect clinic"
                          secondary
                          disabled={busy}
                          onPress={() =>
                            void run(async () => {
                              await update((value) => ({
                                ...value,
                                bridgeUrl: "",
                              }));
                              setBridge("");
                              setNotice(
                                "Disconnected. New updates stay on this device.",
                              );
                            })
                          }
                        />
                      )}
                      <Text style={s.small}>
                        {store.outbox.length} updates awaiting delivery across
                        patient profiles.
                      </Text>
                    </Card>
                    <Card>
                      <Text style={s.h3}>Remote push setup</Text>
                      <Text style={s.small}>
                        For an installed build linked to your Expo project.
                        Register the device, then use the Expo push testing tool
                        to send a notification.
                      </Text>
                      <Button
                        title="Register & share push token"
                        secondary
                        disabled={busy}
                        onPress={() =>
                          void run(async () => {
                            const token = await getPushToken();
                            await Share.share({
                              message: token,
                              title: "aftercare Expo push token",
                            });
                            setNotice(
                              "Device registered. No clinic push service is connected yet.",
                            );
                          })
                        }
                      />
                    </Card>
                  </>
                )}
                {sheet === "history" && (
                  <>
                    <Text style={s.body}>
                      Your daily check-ins, saved on this device.
                    </Text>
                    {state.checkins.length ? (
                      state.checkins.map((c) => (
                        <Card key={c.id}>
                          <View style={s.row}>
                            <Face value={c.mood} />
                            <View style={s.grow}>
                              <Text style={s.h3}>
                                {moods[c.mood - 1]} · Pain {c.pain}/10
                              </Text>
                              <Text style={s.small}>
                                {c.date} · {formatTime(c.createdAt)}
                              </Text>
                            </View>
                          </View>
                          <Text style={s.body}>
                            {c.symptoms.join(", ") || "No symptoms selected"}
                          </Text>
                          {!!c.notes && <Text style={s.body}>{c.notes}</Text>}
                        </Card>
                      ))
                    ) : (
                      <Text style={s.body}>
                        Complete your first check-in to start your journal.
                      </Text>
                    )}
                    <Button
                      title="Share summary"
                      secondary
                      disabled={!state.checkins.length || busy}
                      icon="arrow"
                      onPress={() => void run(shareSummary)}
                    />
                  </>
                )}
              </ScrollView>
              <Notice />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
