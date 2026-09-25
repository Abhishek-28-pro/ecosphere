import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoSphere.AI — AI-Powered Customer Experience Platform",
  description:
    "Grounded AI support agent that answers customer questions using your verified knowledge base, escalates to human agents with full context, tracks sentiment, and unifies CX.",
  keywords: ["AI customer support", "RAG", "CX platform", "ticket triage", "help desk AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#f3f0ff] antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
