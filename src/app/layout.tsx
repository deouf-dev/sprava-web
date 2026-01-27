import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { WebsocketProvider } from "@/lib/ws/WebsocketContext";
import { Toaster } from "@/components/ui/sonner";
import WsToasts from "@/components/system/WsToasts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprava",
  description: "A simple messaging app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <WebsocketProvider>
            {children}
            <WsToasts />
            <Toaster richColors position="top-right" />
          </WebsocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
