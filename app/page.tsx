export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-[17px] font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--forest)] text-white">C</span>
          Continuum
        </div>
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-[var(--muted)] md:flex">
          <a href="#loop" className="hover:text-[var(--ink)]">How it works</a>
          <a href="#signals" className="hover:text-[var(--ink)]">Signals</a>
          <a href="#safety" className="hover:text-[var(--ink)]">Safety</a>
        </nav>
        <a href="/login" className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90">
          Administrator Login
        </a>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-28 pt-16 text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--forest)]">Post-discharge care command center</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-[56px] font-extrabold leading-[1.05] tracking-tight md:text-[72px]">
          Know who needs you<br />before they call.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] text-[var(--muted)]">
          Continuum prioritizes your recovery cohort, explains every score with the source signal behind it, and keeps
          staff, patients, and AI summaries on one traceable record.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <a href="/login" className="rounded-full bg-[var(--forest)] px-7 py-3.5 text-[15px] font-semibold text-white hover:opacity-90">
            Administrator Login
          </a>
          <a href="/patient-app" className="rounded-full border border-[var(--line)] bg-white px-7 py-3.5 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--canvas)]">
            See the patient app
          </a>
        </div>

        <div id="signals" className="relative mx-auto mt-20 h-[280px] max-w-3xl">
          <div className="absolute left-1/2 top-0 w-[300px] -translate-x-1/2 rotate-[-2deg] rounded-2xl border border-[var(--line)] bg-white p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Patient priority</p>
            <p className="mt-1 text-[14px] font-bold">4 need review now</p>
            <p className="text-[12px] text-[var(--muted)]">Critical 4 · Watch 3 · Stable 3</p>
          </div>
          <div className="absolute left-8 top-24 w-[240px] -rotate-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Voice check-ins</p>
            <p className="mt-1 text-[14px] font-bold">8 of 10 checked in</p>
            <p className="text-[12px] text-[var(--muted)]">2 flagged for review</p>
          </div>
          <div className="absolute right-8 top-24 w-[240px] rotate-3 rounded-2xl border border-[var(--line)] bg-white p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Care team</p>
            <p className="mt-1 text-[14px] font-bold">3 available now</p>
            <p className="text-[12px] text-[var(--muted)]">30 active assignments</p>
          </div>
          <div className="absolute left-1/2 top-[168px] w-[280px] -translate-x-1/2 rotate-1 rounded-2xl border border-[var(--line)] bg-white p-4 text-left shadow-[0_20px_40px_rgba(24,36,33,.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">AI care brief</p>
            <p className="mt-1 text-[13px]">&ldquo;Weight gain and breathlessness meet the clinic&apos;s configured review rule.&rdquo;</p>
            <p className="mt-1 text-[11px] font-semibold text-[var(--coral)]">Review required</p>
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
        Continuum · Synthetic patient data · Not for emergency use
      </footer>
    </div>
  );
}
