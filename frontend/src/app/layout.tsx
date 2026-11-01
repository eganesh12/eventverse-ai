import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "EventVerse AI – Intelligent Event Planning Platform",
    template: "%s | EventVerse AI",
  },
  description:
    "Plan any event with AI — weddings, birthdays, conferences, and more. Intelligent budgeting, vendor discovery, guest management, and real-time collaboration.",
  keywords: [
    "event planning",
    "AI event planner",
    "wedding planner",
    "budget management",
    "vendor marketplace",
    "EventVerse",
  ],
  authors: [{ name: "EventVerse AI" }],
  creator: "EventVerse AI",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "EventVerse AI – Intelligent Event Planning",
    description: "Plan extraordinary events with AI assistance",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#5b21b6" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
