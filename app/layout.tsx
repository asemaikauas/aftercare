import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3001";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Continuum — Post-discharge care command center",
    description: "A clinician workspace for prioritizing post-discharge risk, reviewing patient context, and coordinating approved follow-up actions.",
    openGraph: {
      title: "Continuum — Post-discharge care command center",
      description: "Post-discharge care, clearly prioritized.",
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "Continuum post-discharge care command center" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Continuum — Post-discharge care command center",
      description: "Post-discharge care, clearly prioritized.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
