import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aftercare",
  manifest: "/patient-app-manifest.json",
  themeColor: "#163f36",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aftercare",
  },
  icons: {
    apple: "/patient-app-icon-180.png",
  },
};

export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
