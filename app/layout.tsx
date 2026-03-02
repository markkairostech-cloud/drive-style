import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drive Style",
  description: "Your personal vehicle concierge advisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#04060b] font-sans">{children}</body>
    </html>
  );
}
