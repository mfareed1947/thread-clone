import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutTheme from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Threads App",
  description: "The Threads app to share your thoughts and much more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutTheme>{children}</LayoutTheme>
      </body>
    </html>
  );
}
