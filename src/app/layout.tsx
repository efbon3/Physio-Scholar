import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PostHogProvider } from "@/lib/analytics/posthog-provider";
import { createClient } from "@/lib/supabase/server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Physio-Scholar",
    template: "%s · Physio-Scholar",
  },
  description:
    "Mechanism-based active-recall learning for MBBS physiology. V1 pilot for cardiovascular fundamentals.",
  applicationName: "Physio-Scholar",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the consent state server-side so PostHog never initializes in the
  // browser before we know the answer. Env-missing / not-signed-in paths both
  // fall through to `consented: false`, which makes PostHogProvider a no-op.
  let userId: string | undefined;
  let consented = false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("consent_analytics")
          .eq("id", user.id)
          .single();
        consented = profile?.consent_analytics ?? false;
      }
    } catch {
      // Any failure (e.g. Supabase reachable but schema mismatch) leaves
      // analytics off. Conservative default is the correct one.
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <PostHogProvider userId={userId} consented={consented}>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
