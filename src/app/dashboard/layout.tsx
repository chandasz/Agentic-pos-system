import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  description: "Smart කඩේ Executive Owner Dashboard, AI business advisor, and store performance metrics.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
