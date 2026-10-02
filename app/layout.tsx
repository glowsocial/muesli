import type { Metadata } from "next";
import { Schibsted_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";

const body = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Muesli — AI meeting notes in your browser",
  description:
    "Record a meeting from any device and leave with the summary, the decisions, and the next steps. No installs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
