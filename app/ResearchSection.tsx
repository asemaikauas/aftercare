"use client";

import { useState } from "react";
import styles from "./landing.module.css";

const findings = [
  {
    number: "01",
    label: "Control ends",
    title: "The controlled environment ends overnight.",
    pain: "Vitals, symptoms, medication response, and human observation are visible in hospital. At home, that shared picture can disappear at the exact moment patients must manage recovery themselves.",
    response: "A daily minute restores a continuous connection between home and the care team.",
  },
  {
    number: "02",
    label: "Change is hidden",
    title: "Important changes can remain invisible.",
    pain: "A small symptom, a difficult night, or a shift in recovery may not feel worth a phone call—yet those changes can matter when seen together over time.",
    response: "Daily check-ins and connected health signals make change easier to notice.",
  },
  {
    number: "03",
    label: "Signal gets lost",
    title: "Care teams need signal, not more noise.",
    pain: "Without a shared view, teams must reconstruct recovery from calls, portals, records, and disconnected wearable data.",
    response: "A prioritized queue shows who changed, why, and the evidence behind it.",
  },
  {
    number: "04",
    label: "Action is delayed",
    title: "Attention must lead to action.",
    pain: "Recognizing a need is only useful when the patient can reach the right next step without another maze of calls and portals.",
    response: "CareMinute connects insight to reviewed actions such as appointments and refill requests.",
  },
];

export default function ResearchSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = findings[activeIndex];

  return (
    <section className={styles.research} id="research">
      <div className={styles.researchInner}>
        <div className={styles.researchHeading}>
          <p className={styles.eyebrow}>The post-discharge gap</p>
          <h2>When patients leave the hospital, visibility disappears.</h2>
          <p>Inside the hospital, every change can be observed. After discharge, that continuous view suddenly ends—even though recovery is still unfolding and the stakes are still human lives.</p>
        </div>

        <div className={styles.continuity} aria-label="Care visibility from hospital to home">
          <div className={styles.continuityLabels}><span>In hospital</span><strong>Discharge</strong><span>Recovery at home</span></div>
          <div className={styles.continuityTrack} aria-hidden="true"><i /><b><span>!</span></b><em /></div>
          <div className={styles.continuityState}><span>Continuous observation</span><strong>Control drops here</strong><span>Patient manages alone</span></div>
        </div>

        <div className={styles.researchExplorer}>
          <div className={styles.researchTabs} role="tablist" aria-label="Post-discharge research themes">
            {findings.map((finding, index) => (
              <button
                className={index === activeIndex ? styles.researchTabActive : ""}
                key={finding.number}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls="research-panel"
                onClick={() => setActiveIndex(index)}
              >
                <span>{finding.number}</span><strong>{finding.label}</strong><b>→</b>
              </button>
            ))}
          </div>

          <article className={styles.researchPanel} id="research-panel" role="tabpanel" aria-live="polite">
            <span className={styles.researchPanelNumber}>{active.number}</span>
            <p className={styles.researchKicker}>Observed friction</p>
            <h3>{active.title}</h3>
            <p>{active.pain}</p>
            <div className={styles.researchAnswer}><span>✦</span><p><b>CareMinute response</b>{active.response}</p></div>
          </article>
        </div>

        <div className={styles.researchFooter}>
          <p><strong>Discharge is a handoff, not an endpoint.</strong> Better visibility can help care teams recognize meaningful changes earlier and respond with context.</p>
          <small>Qualitative workflow themes—not clinical outcome claims or survey statistics.</small>
        </div>
      </div>
    </section>
  );
}
