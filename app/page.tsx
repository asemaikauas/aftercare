export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#6fb3dd] via-[#bfe0f5] to-[var(--canvas)] pb-28">
        <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
          <div className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-[var(--ink)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--forest)] text-white">A</span>
            Aftercare
          </div>
          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[var(--ink)]/70 md:flex">
            <a href="#hero" className="font-semibold text-[var(--ink)]">Home</a>
            <a href="#signals" className="hover:text-[var(--ink)]">Patients</a>
            <a href="#loop" className="hover:text-[var(--ink)]">Health Overview</a>
            <a href="#safety" className="hover:text-[var(--ink)]">Escalations</a>
            <a href="/patient-app" className="hover:text-[var(--ink)]">AI Assistant</a>
          </nav>
          <a href="/login" className="rounded-full bg-[var(--green)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90">
            Administrator Login
          </a>
        </header>

        <div id="hero" className="relative mx-auto max-w-6xl px-6 pt-10 text-center">
          <h1
            className="pointer-events-none select-none whitespace-nowrap text-white"
            style={{ fontSize: "clamp(52px, 13vw, 110px)", lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 900, margin: 0 }}
          >
            AFTERCARE
          </h1>

          <div id="signals" className="relative mx-auto mt-10 h-[260px] max-w-3xl">
            <div className="absolute left-1/2 top-0 w-[210px] -translate-x-1/2 rotate-[-3deg] rounded-2xl border border-white/50 bg-white/30 p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.15)] backdrop-blur-xl backdrop-saturate-150">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[var(--ink)]">Resting Heart Rate</p>
                <span className="text-[18px] leading-none">🫀</span>
              </div>
              <p className="mt-2 text-[11px] text-[var(--ink)]/60">Post-op day 6 average</p>
              <p className="mt-2 text-[30px] font-black text-[var(--ink)]">78 <span className="text-[14px] font-semibold text-[var(--ink)]/60">bpm</span></p>
            </div>

            <div className="absolute left-0 top-20 w-[190px] -rotate-3 rounded-2xl border border-white/50 bg-white/30 p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.12)] backdrop-blur-xl backdrop-saturate-150">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink)]/60">Patient Priority</p>
                <span className="text-[16px] leading-none">🩺</span>
              </div>
              <p className="mt-2 text-[13px] font-bold text-[var(--ink)]">4 need review now</p>
              <div className="mt-2 flex items-end gap-1">
                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                  <span key={i} className="w-2 rounded-full bg-[var(--coral)]" style={{ height: `${h * 0.35}px` }} />
                ))}
              </div>
            </div>

            <div className="absolute right-0 top-20 w-[190px] rotate-3 rounded-2xl border border-white/50 bg-white/30 p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.12)] backdrop-blur-xl backdrop-saturate-150">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[var(--ink)]">AI Care Brief</p>
                <span className="text-[16px] leading-none">✨</span>
              </div>
              <p className="mt-2 text-[11px] text-[var(--ink)]/60">AI Generate</p>
              <p className="mt-2 text-[12px] font-medium text-[var(--ink)]">&ldquo;Escalated for same-day review.&rdquo;</p>
            </div>

            <div className="absolute left-1/2 top-[172px] w-[220px] -translate-x-1/2 rotate-1 rounded-2xl border border-white/50 bg-white/30 p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.15)] backdrop-blur-xl backdrop-saturate-150">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[var(--ink)]">Voice Check-ins</p>
                <span className="text-[16px] leading-none">🎙️</span>
              </div>
              <p className="mt-1 text-[11px] text-[var(--ink)]/60">AI Generate</p>
              <p className="mt-2 text-[26px] font-black text-[var(--ink)]">8/10 <span className="text-[13px] font-semibold text-[var(--ink)]/60">checked in</span></p>
            </div>

            <div className="absolute -left-10 top-8 hidden w-[120px] -rotate-6 rounded-2xl border border-white/50 bg-white/30 p-3 shadow-[0_20px_40px_rgba(24,36,33,.1)] backdrop-blur-xl backdrop-saturate-150 lg:block">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[var(--ink)]/60">Care Team</p>
                <span className="text-[13px] leading-none">👥</span>
              </div>
              <p className="mt-1 text-[18px] font-black text-[var(--ink)]">3 <span className="text-[10px] font-semibold text-[var(--ink)]/60">online</span></p>
            </div>
            <div className="absolute -right-10 top-8 hidden w-[120px] rotate-6 rounded-2xl border border-white/50 bg-white/30 p-3 shadow-[0_20px_40px_rgba(24,36,33,.1)] backdrop-blur-xl backdrop-saturate-150 lg:block">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-[var(--ink)]/60">Adherence</p>
                <span className="text-[13px] leading-none">✅</span>
              </div>
              <p className="mt-1 text-[18px] font-black text-[var(--ink)]">92<span className="text-[10px] font-semibold text-[var(--ink)]/60">%</span></p>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-[15px] text-[var(--ink)]/70">
            Prioritize your recovery cohort, explain every score with the source signal behind it, and manage patient
            care with AI-assisted insights all in one place.
          </p>

          <div className="mt-7">
            <a href="/login" className="rounded-full bg-[var(--green)] px-8 py-3.5 text-[15px] font-semibold text-white hover:opacity-90">
              Administrator Login
            </a>
          </div>
        </div>
      </section>

      <section id="loop" className="border-t border-[var(--line)] bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--forest)]">The product loop</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-[32px] font-bold">A generic chatbot isn&apos;t the point. This loop is.</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Collect & prioritize", body: "Patient check-ins, wearables, and clinic records feed a rules engine that ranks your cohort into Critical, Watch, and Stable." },
              { step: "02", title: "Explain, don't guess", body: "Every score shows its source signals — no black-box risk numbers. Staff see exactly why a patient was escalated." },
              { step: "03", title: "Review, approve, log", body: "AI may draft a message or summary; a staff member reviews and approves every outgoing action. Outcomes stay on the record." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-[var(--line)] p-6">
                <span className="text-[13px] font-bold text-[var(--forest)]">{item.step}</span>
                <h3 className="mt-3 text-[18px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[14px] text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-[13px] font-semibold text-[var(--ink)]">Decision support only</p>
          <p className="max-w-xl text-[13px] text-[var(--muted)]">
            AI-generated summaries and priority scores require clinical review and are not for emergency use. This demo
            runs on synthetic patient data.
          </p>
          <a href="/login" className="mt-2 rounded-full bg-[var(--forest)] px-7 py-3 text-[14px] font-semibold text-white hover:opacity-90">
            Administrator Login
          </a>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-center text-[12px] text-[var(--muted)]">
        Aftercare · Synthetic patient data · Not for emergency use
      </footer>
    </div>
  );
}
