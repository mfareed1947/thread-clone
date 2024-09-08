import "../globals.css";
import type { Metadata } from "next";
import LayoutTheme from "@/components/layout";

export const metadata: Metadata = {
  title: "Auth Page",
  description: "The Threads app Auth pages.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutTheme>{children}</LayoutTheme>;
}
