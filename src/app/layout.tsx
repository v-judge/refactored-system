import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Sidebar} from "@/components/sidebar"


export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        </body>
        </html>
    )
}