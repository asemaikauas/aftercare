import styles from "./landing.module.css";
import ResearchSection from "./ResearchSection";

const Arrow = () => <span aria-hidden="true">↗</span>;

const PulseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 12h4l2.2-5 4.1 10 2.2-5H21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 5 6v5c0 4.8 2.9 8 7 10 4.1-2 7-5.2 7-10V6l-7-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} id="home">
        <div className={styles.rail} aria-hidden="true" />
        <nav className={styles.nav} aria-label="Main navigation">
          <a className={styles.brand} href="#home" aria-label="CareMinute home">
            <span className={styles.brandMark}><PulseIcon /></span>
            <span>CareMinute</span>
          </a>
          <div className={styles.navLinks}>
            <a href="#patients">For patients</a>
            <a href="#clinics">For clinics</a>
            <a href="#how-it-works">How it works</a>
            <a href="#safety">Safety</a>
          </div>
          <a className={styles.navCta} href="/login">Clinic sign in <Arrow /></a>
        </nav>

        <div className={styles.heroCopy}>
          <div className={styles.heroBadge}><span /> Connected recovery operations</div>
          <h1>
            One minute a day.
            <span>A clearer recovery picture.</span>
          </h1>
          <p className={styles.heroText}>
            CareMinute combines a 60-second daily check-in with WHOOP and Apple Health signals, helping patients share how they feel and giving care teams the context to act early.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="/patient-app">Open patient app <Arrow /></a>
            <a className={styles.secondaryCta} href="/login">View clinic workspace <span aria-hidden="true">→</span></a>
          </div>
        </div>

        <div className={styles.productStage} aria-label="Connected patient and clinic product preview">
          <div className={styles.stageGlow} />
          <div className={styles.stageChrome} aria-hidden="true">
            <span><i /><i /><i /></span>
            <b>careminute.com / care overview</b>
            <em>Live</em>
          </div>
          <div className={styles.patientPreview}>
            <div className={styles.phoneTop}><span>9:41</span><i /></div>
            <div className={styles.phoneGreeting}>
              <span>Tuesday, 25 September</span>
              <strong>Good morning, Mason</strong>
              <p>Here&apos;s how your recovery is tracking.</p>
            </div>
            <div className={styles.recoveryCard}>
              <div className={styles.recoveryRing}><strong>60</strong><span>sec</span></div>
              <div><span>Today&apos;s check-in</span><strong>How are you feeling?</strong><small>Speak, type, or tap to answer</small></div>
            </div>
            <div className={styles.phoneMetrics}>
              <div><span>Sleep</span><strong>7h 42m</strong><small>Good</small></div>
              <div><span>HRV</span><strong>48 ms</strong><small>In range</small></div>
            </div>
            <div className={styles.checkinCard}>
              <span className={styles.mic}>●</span>
              <div><strong>Start 60-sec check-in</strong><small>Connected to your health signals</small></div>
              <b>→</b>
            </div>
            <div className={styles.integrationRow} aria-label="Connected health integrations">
              <span className={styles.whoopBadge}><i />WHOOP</span>
              <span className={styles.healthBadge}><i>♥</i>Apple Health</span>
              <small>Synced</small>
            </div>
          </div>

          <div className={styles.connectionBadge}>
            <span><PulseIcon /></span>
            <div><strong>WHOOP + Apple Health</strong><small>Signals synced securely</small></div>
            <i />
          </div>

          <div className={styles.clinicPreview}>
            <div className={styles.clinicBar}>
              <div><span className={styles.miniMark}>C</span><strong>CareMinute</strong></div>
              <div className={styles.clinicNav}><b>Overview</b><span>Patients</span><span>Messages</span></div>
              <span className={styles.avatar}>MN</span>
            </div>
            <div className={styles.clinicBody}>
              <div className={styles.clinicHeading}>
                <div><small>WEDNESDAY, 25 SEPTEMBER</small><strong>Good morning, Maya</strong></div>
                <button type="button">+ Add patient</button>
              </div>
              <div className={styles.askBar}><span>✦</span><p>Ask CareMinute about your recovery cohort…</p><b>⌘ K</b></div>
              <div className={styles.priorityStrip}>
                <div><span>Patient Priority</span><strong>4 need review now</strong></div>
                <b>4 <small>Critical</small></b><b>3 <small>Watch</small></b><b>12 <small>Stable</small></b>
              </div>
              <div className={styles.clinicGrid}>
                <div className={styles.patientList}>
                  <div className={styles.listTitle}><strong>Recovery cohort</strong><span>19 patients</span></div>
                  {[
                    ["CC", "Christel Carter", "Breathlessness increased", "87", "critical"],
                    ["AO", "Antonia Olivas", "Pain score trending up", "84", "critical"],
                    ["MW", "Mason Weissnat", "Recovery on track", "63", "watch"],
                  ].map(([initials, name, signal, score, risk]) => (
                    <div className={styles.patientRow} key={name}>
                      <span className={`${styles.rowAvatar} ${styles[risk]}`}>{initials}</span>
                      <div><strong>{name}</strong><small>{signal}</small></div>
                      <b>{score}</b>
                    </div>
                  ))}
                </div>
                <div className={styles.aiBrief}>
                  <div><span>✦</span><strong>AI Care Brief</strong><em>Review required</em></div>
                  <p>Symptoms and wearable signals meet the clinic&apos;s configured review rule.</p>
                  <small>Based on</small>
                  <div className={styles.sourcePills}><b>Check-in</b><b>Wearable</b><b>Care plan</b></div>
                  <button type="button">Review evidence →</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.signalStrip}>
          <span>One connected care loop</span>
          <div><b>Voice check-ins</b><i /></div>
          <div><b>WHOOP</b><i /></div>
          <div><b>Apple Health</b><i /></div>
          <div><b>Care plans</b><i /></div>
          <div><b>Secure messaging</b></div>
        </div>
      </section>

      <ResearchSection />

      <section className={styles.audiences}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Built for both sides of recovery</p>
          <h2>Patients feel supported.<br />Clinics stay ahead.</h2>
        </div>

        <article className={`${styles.audienceCard} ${styles.patientCard}`} id="patients">
          <div className={styles.audienceCopy}>
            <span className={styles.audienceNumber}>01 · FOR PATIENTS</span>
            <h3>One minute to tell the whole story.</h3>
            <p>A 60-second daily check-in captures how recovery feels, while WHOOP and Apple Health add the passive signals patients should not have to remember or re-enter.</p>
            <ul>
              <li><span>✓</span> 60-second check-ins by voice, chat, or simple taps</li>
              <li><span>✓</span> WHOOP recovery, sleep, strain, and HRV signals</li>
              <li><span>✓</span> Apple Health activity, heart rate, and sleep context</li>
              <li><span>✓</span> Care-plan reminders and secure clinic messages</li>
            </ul>
            <a href="/patient-app">Explore the patient experience <Arrow /></a>
          </div>
          <div className={styles.audienceVisual}>
            <div className={styles.patientTimeline}>
              <div className={styles.timelineTop}><span>Today</span><strong>Recovery plan</strong><em>2 of 3 done</em></div>
              <div className={styles.timelineItem}><b className={styles.complete}>✓</b><div><strong>Morning medication</strong><small>Completed at 8:10 AM</small></div></div>
              <div className={styles.timelineItem}><b>2</b><div><strong>Complete today&apos;s check-in</strong><small>About 60 seconds</small></div><span>Start</span></div>
              <div className={styles.timelineItem}><b>3</b><div><strong>Breathing exercises</strong><small>10 minutes · Before 6 PM</small></div></div>
              <div className={styles.careMessage}><span>MN</span><div><strong>Maya · Care team</strong><p>Your readings look steady today. Keep following your plan and message us if anything changes.</p></div></div>
            </div>
          </div>
        </article>

        <article className={`${styles.audienceCard} ${styles.clinicCard}`} id="clinics">
          <div className={styles.audienceCopy}>
            <span className={styles.audienceNumber}>02 · FOR CLINICS</span>
            <h3>The whole recovery cohort, prioritized.</h3>
            <p>Bring patient-reported updates, wearable signals, and the clinical record into one review queue so teams can spend time where it matters most.</p>
            <ul>
              <li><span>✓</span> Explainable priority scores and source evidence</li>
              <li><span>✓</span> One inbox for check-ins and patient messages</li>
              <li><span>✓</span> AI-assisted care briefs with human review</li>
              <li><span>✓</span> Tasks, escalations, and follow-up in one workspace</li>
            </ul>
            <a href="/login">Open the clinic workspace <Arrow /></a>
          </div>
          <div className={styles.audienceVisual}>
            <div className={styles.reviewPanel}>
              <div className={styles.reviewHeader}><div><span>Needs review now</span><strong>Christel Carter</strong></div><b>87</b></div>
              <div className={styles.alertLine}><span>!</span><p><strong>Weight gain and breathlessness</strong>Reported symptoms and post-CABG fluid status meet the configured review rule.</p></div>
              <div className={styles.evidenceTitle}><strong>Source evidence</strong><span>Updated 2m ago</span></div>
              <div className={styles.evidenceGrid}>
                <div><span>Weight</span><strong>+2.3 kg</strong><small>in 48 hours</small></div>
                <div><span>SpO₂</span><strong>93%</strong><small>−4 vs baseline</small></div>
                <div><span>Resting HR</span><strong>91 bpm</strong><small>+14 vs baseline</small></div>
              </div>
              <div className={styles.reviewActions}><button type="button">Message patient</button><button type="button">Start clinical review</button></div>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.how} id="how-it-works">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>How it works</p>
          <h2>From everyday signals<br />to timely care.</h2>
          <p>Four steps keep the patient and clinic experience connected without replacing clinical judgment.</p>
        </div>
        <div className={styles.steps}>
          {[
            ["01", "Connect", "Bring together 60-second patient check-ins with WHOOP, Apple Health, care plans, and clinical records."],
            ["02", "Understand", "Turn scattered updates into a clear, personal view of recovery."],
            ["03", "Prioritize", "Surface patients who meet clinic-defined review rules, with the evidence attached."],
            ["04", "Follow through", "Review, message, assign, and document the next action in one shared workflow."],
          ].map(([number, title, body]) => (
            <div className={styles.step} key={number}>
              <span>{number}</span><i />
              <h3>{title}</h3><p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.platform} id="connected-platform">
        <div className={styles.platformIntro}>
          <p className={styles.eyebrow}>One connected platform</p>
          <h2>Every signal in view.<br />Every action accountable.</h2>
        </div>
        <div className={styles.featureGrid}>
          <article className={`${styles.feature} ${styles.featureLarge}`}>
            <div className={styles.featureIcon}><PulseIcon /></div>
            <h3>60-second check-ins, enriched automatically</h3>
            <p>Pair what a patient says each day with WHOOP and Apple Health data to understand both the lived experience and the physiological trend.</p>
            <div className={styles.integrationPanel}>
              <div><span className={styles.integrationLogo}>60</span><p><strong>Daily check-in</strong><small>Symptoms · mood · medication</small></p></div>
              <b>+</b>
              <div><span className={`${styles.integrationLogo} ${styles.whoopLogo}`}>W</span><p><strong>WHOOP</strong><small>Recovery · sleep · strain</small></p></div>
              <b>+</b>
              <div><span className={`${styles.integrationLogo} ${styles.appleLogo}`}>♥</span><p><strong>Apple Health</strong><small>Activity · heart · sleep</small></p></div>
            </div>
          </article>
          <article className={`${styles.feature} ${styles.conversationFeature}`}>
            <div className={styles.conversationCopy}>
              <div className={styles.featureIcon}>◎</div>
              <h3>Built to take 60 seconds</h3>
              <p>Speak, type, or tap through a short, adaptive conversation. CareMinute listens for what changed and pairs it with connected health signals.</p>
            </div>
            <div className={styles.conversationVisual}>
              <div className={styles.conversationLines}>
                <span><b>A</b>Did you consume any sugar today?</span>
                <span>A bar of dark chocolate.</span>
                <span><b>A</b>How did you feel after it?</span>
                <em><b>60</b> sec check-in</em>
              </div>
              <img src="/checkin-conversation.webp" alt="Patient speaking into their phone during a CareMinute check-in" />
            </div>
          </article>
          <article className={`${styles.feature} ${styles.actionFeature}`}>
            <div className={styles.actionCopy}>
              <div className={styles.featureIcon}>↗</div>
              <p className={styles.featureKicker}>More than monitoring</p>
              <h3>It can take care of the next step.</h3>
              <p>CareMinute turns a conversation into a clear action, so patients can keep moving without another phone call or portal search.</p>
            </div>
            <div className={styles.actionList}>
              <div><span className={styles.actionSymbol}>Rx</span><p><strong>Request a medication refill</strong><small>CareMinute collects the details and routes them for authorized review.</small></p><b>Request ready</b></div>
              <div><span className={styles.actionSymbol}>15</span><p><strong>Book an appointment</strong><small>See available times and confirm the one that works for you.</small></p><b>3 times found</b></div>
              <small><span>✓</span> You confirm every action before it is sent.</small>
            </div>
          </article>
          <article className={`${styles.feature} ${styles.featureWide}`}>
            <div>
              <div className={styles.featureIcon}><ShieldIcon /></div>
              <h3>Designed around human review</h3>
              <p>CareMinute supports decisions; it does not make them. Clinic-defined rules, source-level evidence, and explicit review states keep people accountable.</p>
            </div>
            <div className={styles.reviewFlow}><span>Signal received</span><b>→</b><span>Rule matched</span><b>→</b><span className={styles.reviewActive}>Clinician review</span><b>→</b><span>Action logged</span></div>
          </article>
        </div>
      </section>

      <section className={styles.safety} id="safety">
        <div className={styles.safetyIcon}><ShieldIcon /></div>
        <div><p className={styles.eyebrow}>Clinical safety by design</p><h2>Technology that keeps people in the loop.</h2></div>
        <p>AI-generated summaries and Patient Priority scores require clinical review and are not for emergency use. Every score shows the source signal behind it.</p>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>A better handoff home</p>
          <h2>Recovery doesn&apos;t stop at discharge.<br /><span>Neither should care.</span></h2>
          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href="/patient-app">Open patient app <Arrow /></a>
            <a className={styles.lightCta} href="/login">Clinic sign in <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#home"><span className={styles.brandMark}><PulseIcon /></span><span>CareMinute</span></a>
        <p>Patient recovery operations, connected from home to clinic.</p>
        <div><a href="/patient-app">Patient app</a><a href="/login">Clinic sign in</a><a href="#safety">Safety</a></div>
        <small>Decision support only · Not for emergency use</small>
      </footer>
    </main>
  );
}
