import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS Terminal",
  description: "Smart කඩේ Point of Sale checkout register and inventory synchronization terminal.",
};

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
