import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button, Card, C, Face, Icon, s } from "./ui";
import {
  moodLabels,
  watchMood,
  watchResponse,
  type WatchTrigger,
} from "./watch-model";
import type { Submission } from "./model";

type Screen = "home" | "mood" | "reminder" | "prompt" | "result";
type Props = {
  patient: { id: string; name: string };
  events: Submission[];
  pendingIds: string[];
  bridgeUrl: string;
  onSubmit: (event: Submission) => Promise<boolean>;
  onRetry: () => Promise<void>;
  onSettings: () => void;
  onMedication: () => void;
};
const id = () =>
  `watch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export default function WatchSimulator(props: Props) {
  const {
    patient,
    events,
    pendingIds,
    bridgeUrl,
    onSubmit,
    onRetry,
    onSettings,
    onMedication,
  } = props;
  const { width } = useWindowDimensions();
  const size = Math.min(330, width - 56);
  const [screen, setScreen] = useState<Screen>("home");
  const [mood, setMood] = useState(3);
  const [shape, setShape] = useState<"round" | "square">("round");
  const [incident, setIncident] = useState<{
    id: string;
    trigger: WatchTrigger;
  } | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [reminderDue, setReminderDue] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    id: string;
    title: string;
    detail: string;
    alert: boolean;
  } | null>(null);
  const recentAlert = events.find((e) => e.kind === "watch-alert");
  const alertPending = !!recentAlert && pendingIds.includes(recentAlert.id);
  const unresolved = screen === "prompt";
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (dueAt === null || clock < dueAt) return;
    setDueAt(null);
    setReminderDue(true);
    if (screen === "home" || screen === "mood") setScreen("reminder");
  }, [clock, dueAt, screen]);

  async function perform(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError(
        "Could not save this response. Please retry. Nothing has been marked delivered.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function send(event: Submission, title: string, alert = false) {
    const delivered = await onSubmit(event);
    setResult({
      id: event.id,
      title,
      alert,
      detail: delivered
        ? alert
          ? "Delivered as a clinic message. No staff acknowledgement is available."
          : "Delivered to demo clinic."
        : "Saved on this device. NOT delivered. Connect the clinic below and retry.",
    });
    setScreen("result");
    setIncident(null);
  }
  function simulate(trigger: WatchTrigger) {
    if (unresolved || busy) return;
    setIncident({ id: id(), trigger });
    setScreen("prompt");
    setError("");
  }
  function basicEvent(kind: Submission["kind"], body: string): Submission {
    return {
      id: id(),
      patientId: patient.id,
      patientName: patient.name,
      kind,
      body,
      simulated: true,
      createdAt: new Date().toISOString(),
    };
  }
  const seconds =
    dueAt === null
      ? null
      : Math.min(10, Math.max(0, Math.ceil((dueAt - clock) / 1000)));
  const WatchButton = ({
    title,
    onPress,
    danger = false,
    muted = false,
    label,
  }: {
    title: string;
    onPress: () => void;
    danger?: boolean;
    muted?: boolean;
    label?: string;
  }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        w.watchButton,
        muted && w.mutedButton,
        danger && w.dangerButton,
        { opacity: busy ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text
        style={[
          w.buttonText,
          muted && { color: "#EAF0E5" },
          danger && { color: "white" },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 7 }}>
        <Text style={s.eyebrow}>AFTERCARE ON YOUR WRIST</Text>
        <Text style={s.h1}>A small check-in.{"\n"}A closer connection.</Text>
        <Text style={s.body}>
          Interactive watch simulator for {patient.name.split(" ")[0]}.
        </Text>
      </View>
      <View style={w.simLabel}>
        <View style={w.dot} />
        <Text style={w.simText}>SIMULATED · NO WATCH OR SENSORS CONNECTED</Text>
      </View>
      <View style={[s.row, { justifyContent: "center" }]}>
        {(["round", "square"] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="radio"
            accessibilityState={{ checked: shape === item }}
            aria-checked={shape === item}
            onPress={() => setShape(item)}
            style={[s.chip, shape === item && s.chipActive]}
          >
            <Text style={s.small}>
              {item === "round" ? "Round watch" : "Apple-style shape"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={w.watchStage}>
        <View style={[w.strap, { width: size * 0.49 }]} />
        <View
          style={[w.crown, { right: Math.max(0, (width - 48 - size) / 2 - 7) }]}
        />
        <View
          style={[
            w.case,
            {
              width: size,
              height: size,
              borderRadius: shape === "round" ? size / 2 : 64,
            },
          ]}
        >
          <View
            style={[
              w.glass,
              { borderRadius: shape === "round" ? size / 2 : 55 },
            ]}
          >
            <View
              style={[
                w.inner,
                { width: 231, transform: [{ scale: size / 330 }] },
              ]}
            >
              <Text style={w.time}>
                {new Date(clock).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · aftercare
              </Text>
              {screen === "home" && (
                <>
                  <Text style={w.hello}>Here with you.</Text>
                  <Text style={w.subtitle}>One small step at a time.</Text>
                  <View style={w.sampleRow}>
                    <View>
                      <Text style={w.metric}>
                        72<Text style={w.unit}> bpm</Text>
                      </Text>
                      <Text style={w.metricLabel}>Sample heart rate</Text>
                    </View>
                    <View>
                      <Text style={w.metric}>
                        7.2<Text style={w.unit}> h</Text>
                      </Text>
                      <Text style={w.metricLabel}>Sample sleep</Text>
                    </View>
                  </View>
                  <WatchButton
                    title="How are you feeling?"
                    onPress={() => {
                      setMood(3);
                      setScreen("mood");
                    }}
                  />
                  <WatchButton
                    title={
                      reminderDue ? "Reminder waiting" : "My care reminder"
                    }
                    muted
                    onPress={() => setScreen("reminder")}
                  />
                </>
              )}
              {screen === "mood" && (
                <>
                  <Text style={w.title}>How do you feel?</Text>
                  <View style={w.faceRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Previous mood"
                      disabled={mood === 1 || busy}
                      onPress={() => setMood((m) => m - 1)}
                      style={[w.arrow, mood === 1 && { opacity: 0.25 }]}
                    >
                      <Text style={w.arrowText}>‹</Text>
                    </Pressable>
                    <Face value={mood} size={58} />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Next mood"
                      disabled={mood === 5 || busy}
                      onPress={() => setMood((m) => m + 1)}
                      style={[w.arrow, mood === 5 && { opacity: 0.25 }]}
                    >
                      <Text style={w.arrowText}>›</Text>
                    </Pressable>
                  </View>
                  <Text accessibilityLiveRegion="polite" style={w.moodLabel}>
                    {moodLabels[mood - 1]} · {mood}/5
                  </Text>
                  <WatchButton
                    title={busy ? "Saving…" : "Save mood"}
                    onPress={() =>
                      void perform(() =>
                        send(
                          watchMood({
                            id: id(),
                            patientId: patient.id,
                            patientName: patient.name,
                            mood,
                            createdAt: new Date().toISOString(),
                          }),
                          "Check-in saved",
                        ),
                      )
                    }
                  />
                  <WatchButton
                    title="Back"
                    muted
                    onPress={() => setScreen("home")}
                  />
                </>
              )}
              {screen === "reminder" && (
                <>
                  <Icon name="bell" color={C.lime} size={26} />
                  <Text style={w.title}>A moment for care.</Text>
                  <Text style={w.subtitle}>
                    Review your prescribed{"\n"}medication plan.
                  </Text>
                  <WatchButton
                    title="I’ve reviewed my plan"
                    onPress={() =>
                      void perform(async () => {
                        await send(
                          basicEvent(
                            "watch-reminder",
                            "Watch simulator: patient confirmed reviewing their medication plan. No dose or medication intake was recorded.",
                          ),
                          "Review recorded",
                        );
                        setReminderDue(false);
                      })
                    }
                  />
                  <WatchButton
                    title="Snooze 10 seconds"
                    muted
                    onPress={() => {
                      setDueAt(Date.now() + 10000);
                      setReminderDue(false);
                      setScreen("home");
                    }}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={onMedication}
                    disabled={busy}
                  >
                    <Text style={w.smallLink}>Open medication on phone →</Text>
                  </Pressable>
                </>
              )}
              {screen === "prompt" && incident && (
                <>
                  <View style={w.warningIcon}>
                    <Icon name="heart" color="#FFC9B9" size={23} />
                  </View>
                  <Text style={w.title}>Are you okay?</Text>
                  <Text style={w.subtitle}>
                    Simulated {incident.trigger}
                    {"\n"}change. How do you feel?
                  </Text>
                  <WatchButton
                    title="I’m okay"
                    muted
                    onPress={() =>
                      void perform(() =>
                        send(
                          watchResponse({
                            id: incident.id,
                            patientId: patient.id,
                            patientName: patient.name,
                            trigger: incident.trigger,
                            needsHelp: false,
                            createdAt: new Date().toISOString(),
                          }),
                          "Response recorded",
                        ),
                      )
                    }
                  />
                  <WatchButton
                    title="I need help"
                    danger
                    onPress={() =>
                      void perform(() =>
                        send(
                          watchResponse({
                            id: incident.id,
                            patientId: patient.id,
                            patientName: patient.name,
                            trigger: incident.trigger,
                            needsHelp: true,
                            createdAt: new Date().toISOString(),
                          }),
                          "Help requested",
                          true,
                        ),
                      )
                    }
                  />
                </>
              )}
              {screen === "result" && result && (
                <>
                  <Icon
                    name={result.alert ? "bell" : "check"}
                    size={28}
                    color={result.alert ? "#FFC9B9" : C.lime}
                  />
                  <Text style={w.title}>{result.title}</Text>
                  <Text style={w.subtitle}>
                    {pendingIds.includes(result.id)
                      ? "Saved on this device. NOT delivered. Connect the clinic below and retry."
                      : result.alert
                        ? "Delivered as a clinic message. No staff acknowledgement is available."
                        : "Delivered to demo clinic."}
                  </Text>
                  <WatchButton
                    title="Back to watch"
                    muted
                    onPress={() => setScreen("home")}
                  />
                </>
              )}
            </View>
          </View>
        </View>
        <View style={[w.strap, w.bottomStrap, { width: size * 0.49 }]} />
      </View>
      {!!error && (
        <View style={[s.notice, { backgroundColor: C.coral }]}>
          <Text accessibilityLiveRegion="assertive" style={s.body}>
            {error}
          </Text>
        </View>
      )}
      {recentAlert && (
        <Card>
          <Text style={s.h3}>
            {alertPending
              ? "Help request NOT delivered"
              : "Help request delivered to clinic inbox"}
          </Text>
          <Text style={s.small}>
            {alertPending
              ? "Connect and retry below. The clinic has not received this request."
              : "Sent as a patient message. This version does not provide an administrator alarm or acknowledgement status."}
          </Text>
          <Text style={s.small}>
            If you need urgent help, contact local emergency services. Do not
            wait for this demo.
          </Text>
        </Card>
      )}
      <Card>
        <View style={s.between}>
          <Text style={s.h3}>Demo controls</Text>
          <View style={s.pill}>
            <Text style={s.pillText}>Presenter mode</Text>
          </View>
        </View>
        <Text style={s.small}>
          These buttons simulate a device event. No abnormality detection or
          clinical thresholds are implemented.
        </Text>
        <View style={{ gap: 8 }}>
          <Button
            title="Simulate heartbeat change"
            secondary
            disabled={unresolved || busy}
            onPress={() => simulate("heartbeat")}
          />
          <Button
            title="Simulate breathing change"
            secondary
            disabled={unresolved || busy}
            onPress={() => simulate("breathing")}
          />
          <Button
            title={
              seconds !== null
                ? `Reminder in ${seconds}s · Cancel`
                : "Run reminder in 10 seconds"
            }
            secondary
            disabled={busy}
            onPress={() => {
              setDueAt(seconds !== null ? null : Date.now() + 10000);
            }}
          />
        </View>
        <Text style={s.small}>
          {unresolved
            ? "Answer the watch prompt before starting another event. No response does not automatically raise an alarm."
            : "Keep this Watch screen open for timed demo reminders. Leaving the tab cancels the demo timer."}
        </Text>
      </Card>
      <Card>
        <View style={s.row}>
          <Icon name="message" />
          <Text style={s.h3}>Clinic connection</Text>
        </View>
        <Text style={s.small}>
          {bridgeUrl
            ? `Configured: ${bridgeUrl}`
            : "Not configured. Responses are saved on this device."}
        </Text>
        <Text style={s.body}>
          {pendingIds.length} watch updates waiting to send
        </Text>
        <Button
          title="Configure clinic connection"
          secondary
          disabled={busy}
          onPress={onSettings}
        />
        {pendingIds.length > 0 && (
          <Button
            title={busy ? "Syncing…" : "Retry pending watch updates"}
            disabled={!bridgeUrl || busy}
            onPress={() =>
              void perform(async () => {
                try {
                  await onRetry();
                  if (result)
                    setResult({
                      ...result,
                      detail:
                        "Delivered to the clinic inbox. No staff acknowledgement is available.",
                    });
                } catch {
                  setError(
                    "Delivery failed. Pending updates remain saved; the clinic has not received them.",
                  );
                }
              })
            }
          />
        )}
      </Card>
    </View>
  );
}
const w = StyleSheet.create({
  simLabel: {
    backgroundColor: "#E8EDD9",
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    justifyContent: "center",
  },
  simText: {
    color: C.forest,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#62864C" },
  watchStage: { alignItems: "center", paddingVertical: 0 },
  strap: {
    height: 26,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#3F4D40",
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderColor: "#566151",
  },
  bottomStrap: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  crown: {
    width: 12,
    height: 32,
    backgroundColor: "#757C70",
    borderRadius: 5,
    position: "absolute",
    top: 108,
  },
  case: {
    backgroundColor: "#727D6B",
    padding: 7,
    borderWidth: 2,
    borderColor: "#A7AE9D",
    boxShadow: "0px 10px 25px rgba(25,40,28,0.22)",
  },
  glass: {
    flex: 1,
    backgroundColor: "#101C18",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#28332C",
  },
  inner: { alignItems: "center", gap: 7 },
  time: {
    fontSize: 10,
    color: "#AEBDA6",
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  hello: {
    color: "#EEF5E5",
    fontSize: 24,
    letterSpacing: -0.8,
    fontWeight: "600",
  },
  title: {
    color: "#F0F5E7",
    fontSize: 21,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "#BAC8B3",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
  },
  sampleRow: { flexDirection: "row", gap: 20, marginVertical: 3 },
  metric: { fontSize: 23, color: C.lime, fontWeight: "600" },
  unit: { fontSize: 11, fontWeight: "400" },
  metricLabel: { fontSize: 8, color: "#AEBDA6" },
  watchButton: {
    width: "100%",
    minHeight: 42,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedButton: { backgroundColor: "#2C3D32" },
  dangerButton: { backgroundColor: "#A3392B" },
  buttonText: {
    color: "#1C3827",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  faceRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  arrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { color: C.lime, fontSize: 34 },
  moodLabel: { color: "#E6EEDA", fontSize: 13 },
  smallLink: { color: "#B8D99D", fontSize: 10, paddingVertical: 5 },
  warningIcon: {
    backgroundColor: "#482B26",
    width: 42,
    height: 36,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
