import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fierce Diagnostic | Build the Right Workshop for Your Team",
  description:
    "A short, honest conversation that surfaces what your team actually needs — and recommends the Fierce module that will move the needle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-fierce-black text-fierce-cream min-h-screen">
        {children}
      </body>
    </html>
  );
}
