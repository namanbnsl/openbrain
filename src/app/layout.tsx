import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

import "./globals.css";

const mainFont = Lexend({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "openbrain",
  description: "The AI-native learning OS.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ConvexClientProvider>
        <body
          className={`${mainFont.className} antialiased min-h-screen text-[var(--foreground)]`}
        >
          {children}
        </body>
      </ConvexClientProvider>
    </html>
  );
}
