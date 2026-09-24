"use client";

import { useState } from "react";
import type { PatientProfile } from "../../db/types";
import { dayOfRecovery } from "../dashboard-adapter";

type Screen = "login" | "home" | "checkin";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-3 pb-1 text-[13px] font-semibold text-[var(--ink)]">
      <span>9:41</span>
      <div className="absolute left-1/2 top-2 h-[22px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex items-center gap-1">
        <span>􀙇</span>
        <span>􀛨</span>
        <span>􀛯</span>
      </span>
    </div>
  );
}

function TabBar({ active }: { active: "home" | "plan" | "messages" | "profile" }) {
  const items: { key: typeof active; label: string; icon: string }[] = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "plan", label: "Care plan", icon: "✓" },
    { key: "messages", label: "Messages", icon: "□" },
    { key: "profile", label: "Profile", icon: "◌" },
  ];
  return (
    <div className="flex items-center justify-around border-t border-[var(--line)] bg-white/95 px-2 pb-6 pt-2 backdrop-blur">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium ${item.key === active ? "text-[var(--forest)]" : "text-[var(--muted)]"}`}
        >
          <span className="text-[17px] leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function PatientAppView({ patient, embed = false }: { patient: PatientProfile | undefined; embed?: boolean }) {
  const [screen, setScreen] = useState<Screen>("login");
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>({});
  const [checkinStep, setCheckinStep] = useState<"ask" | "done">("ask");

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] p-6 text-center">
        <p>Demo patient record not found.</p>
      </div>
    );
  }

  const firstName = patient.name.split(" ")[0];
  const isDone = (label: string, fallback: boolean) => taskDone[label] ?? fallback;
  const completedCount = patient.tasks.filter((task) => isDone(task.label, task.done)).length;

  const screenContent = (
    <div className={`relative flex flex-col overflow-hidden bg-white ${embed ? "h-screen w-screen" : "h-full w-full"}`}>
          <StatusBar />

          {screen === "login" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--forest)] text-2xl font-bold text-white">C</div>
              <div>
                <h1 className="text-[22px] font-bold text-[var(--ink)]">Welcome back</h1>
                <p className="mt-1 text-[13px] text-[var(--muted)]">Continuum patient app · synthetic demo account</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--canvas)] text-3xl">{patient.initials}</div>
              <p className="text-[15px] font-semibold text-[var(--ink)]">{patient.name}</p>
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span key={index} className="h-3 w-3 rounded-full border border-[var(--line)] bg-[var(--canvas)]" />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setScreen("home")}
                className="mt-4 w-full rounded-full bg-[var(--forest)] py-3 text-[15px] font-semibold text-white active:opacity-80"
              >
                Continue as {firstName}
              </button>
              <p className="text-[11px] text-[var(--muted)]">Face ID / passcode sign-in mocked for this demo</p>
            </div>
          )}

          {screen === "home" && (
            <div className="flex-1 overflow-y-auto px-5 pb-3 pt-2">
              <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">Day {dayOfRecovery(patient.dischargeDate)} of recovery</p>
              <h1 className="mt-1 text-[24px] font-bold text-[var(--ink)]">Good morning, {firstName}</h1>
              <p className="mt-1 text-[13px] text-[var(--muted)]">{patient.procedure} · Discharged {patient.dischargeDate}</p>

              <button
                type="button"
                onClick={() => { setScreen("checkin"); setCheckinStep("ask"); }}
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[var(--forest)] px-5 py-4 text-left text-white active:opacity-90"
              >
                <span>
                  <span className="block text-[13px] font-medium opacity-80">Today's check-in</span>
                  <span className="block text-[16px] font-semibold">How are you feeling today?</span>
                </span>
                <span className="text-xl">→</span>
              </button>

              <section className="mt-5 rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-[var(--ink)]">Today's care plan</h2>
                  <span className="text-[12px] font-medium text-[var(--muted)]">{completedCount} of {patient.tasks.length}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {patient.tasks.map((task) => {
                    const done = isDone(task.label, task.done);
                    return (
                      <button
                        key={task.label}
                        type="button"
                        onClick={() => setTaskDone((current) => ({ ...current, [task.label]: !done }))}
                        className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-3 py-2 text-left active:bg-[var(--canvas)]"
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] ${done ? "border-[var(--green)] bg-[var(--green-soft)] text-[var(--green)]" : "border-[var(--line)] text-transparent"}`}>✓</span>
                        <span>
                          <span className={`block text-[13px] font-medium ${done ? "text-[var(--muted)] line-through" : "text-[var(--ink)]"}`}>{task.label}</span>
                          <span className="block text-[11px] text-[var(--muted)]">{task.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
                <h2 className="text-[15px] font-semibold text-[var(--ink)]">Recovery signals</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {patient.metrics.slice(0, 4).map((metric) => (
                    <div key={metric.label} className="rounded-xl bg-[var(--canvas)] p-3">
                      <p className="text-[11px] text-[var(--muted)]">{metric.label}</p>
                      <p className="text-[16px] font-bold text-[var(--ink)]">{metric.value}</p>
                      <p className="text-[10px] text-[var(--muted)]">{metric.context}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-[var(--ink)]">Care team message</h2>
                  <span className="text-[11px] text-[var(--muted)]">2m ago</span>
                </div>
                <div className="mt-2 rounded-xl bg-[var(--canvas)] p-3">
                  <p className="text-[12px] font-semibold text-[var(--ink)]">Maya Nelson · Care manager</p>
                  <p className="mt-1 text-[13px] text-[var(--ink)]">Hi {firstName}, please complete today's check-in and let us know if anything feels different. We're reviewing your recovery daily.</p>
                </div>
              </section>

              <section className="mt-4 mb-4 rounded-2xl border border-[var(--line)] bg-white p-4">
                <h2 className="text-[15px] font-semibold text-[var(--ink)]">Next appointment</h2>
                <p className="mt-1 text-[13px] text-[var(--ink)]">{patient.nextAppointment}</p>
              </section>
            </div>
          )}

          {screen === "checkin" && (
            <div className="flex flex-1 flex-col px-5 pb-3 pt-2">
              <button type="button" onClick={() => setScreen("home")} className="self-start text-[13px] font-medium text-[var(--forest)]">← Back</button>
              {checkinStep === "ask" ? (
                <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-5 text-center">
                  <h1 className="text-[20px] font-bold text-[var(--ink)]">How are you feeling today?</h1>
                  <p className="text-[13px] text-[var(--muted)]">Your care team reviews every check-in.</p>
                  <div className="mt-2 flex w-full flex-col gap-3">
                    {["Good — no new symptoms", "Okay — some discomfort", "Not well — I have a new concern"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setCheckinStep("done")}
                        className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-left text-[14px] font-medium text-[var(--ink)] active:bg-[var(--canvas)]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {patient.symptoms.length > 0 && patient.symptoms[0] !== "No new symptoms" && (
                    <div className="mt-2 w-full rounded-2xl bg-[var(--amber-soft)] p-3 text-left">
                      <p className="text-[12px] font-semibold text-[var(--ink)]">Reported recently</p>
                      <p className="text-[12px] text-[var(--muted)]">{patient.symptoms.join(" · ")}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-soft)] text-3xl text-[var(--green)]">✓</div>
                  <h1 className="text-[20px] font-bold text-[var(--ink)]">Check-in sent</h1>
                  <p className="text-[13px] text-[var(--muted)]">Your care team will review this and follow up if needed.</p>
                  <button
                    type="button"
                    onClick={() => setScreen("home")}
                    className="mt-4 w-full rounded-full bg-[var(--forest)] py-3 text-[15px] font-semibold text-white active:opacity-80"
                  >
                    Back to home
                  </button>
                </div>
              )}
            </div>
          )}

          {screen !== "login" && <TabBar active="home" />}
    </div>
  );

  if (embed) {
    return screenContent;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] px-4 py-10">
      <div className="mx-auto mb-6 max-w-[380px] text-center">
        <a href="/" className="text-[13px] font-medium text-[var(--forest)] hover:underline">← Back to clinician dashboard</a>
        <p className="mt-2 text-[12px] text-[var(--muted)]">Patient app prototype · what {firstName} would see after logging in · mobile mock</p>
      </div>

      <div className="relative mx-auto h-[812px] w-[375px] overflow-hidden rounded-[3rem] border-[10px] border-black bg-white shadow-[0_30px_60px_rgba(24,36,33,.25)]">
        <div className="absolute inset-0 overflow-hidden rounded-[2.2rem]">
          {screenContent}
        </div>
      </div>
    </div>
  );
}
