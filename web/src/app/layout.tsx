import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.scss";
import React from "react";
import { QueryProvider } from "@/lib/query/provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CAPO",
  description: "COMPUTER AIDED PROCESS OVERVIEW",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable}`}>
        <QueryProvider>
          <div className="mx-0 my-0">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
