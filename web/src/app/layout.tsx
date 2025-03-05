import type {Metadata} from "next";
import {Geist_Mono} from "next/font/google";
import "./globals.scss";
import React from "react";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CAPO",
    description: "COMPUTER AIDED PROCESS OVERVIEW"
};

export default function AppLayout(
    {children}: { children: React.ReactNode }
) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistMono.variable}`}>
            <div className="mx-0 my-0">
                {children}
            </div>
        </body>
        </html>
    );
}