import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rightcar4me.co.za"),

  title: {
    default: "RightCar4Me",
    template: "%s | RightCar4Me",
  },

  description:
    "Independent car-buying advice that helps South African motorists find the right vehicle for their lifestyle, needs and budget.",

  applicationName: "RightCar4Me",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    siteName: "RightCar4Me",
    title: "RightCar4Me | Independent Car-Buying Advisory",
    description:
      "Find the right vehicle for your lifestyle, needs and budget with clear, independent car-buying guidance.",
    images: [
      {
        url: "/rightcar4me-logo.png",
        alt: "RightCar4Me independent car-buying advisory",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RightCar4Me | Independent Car-Buying Advisory",
    description:
      "Find the right vehicle for your lifestyle, needs and budget with clear, independent car-buying guidance.",
    images: ["/rightcar4me-logo.png"],
  },

  icons: {
    icon: "/rightcar4me-logo.png",
    apple: "/rightcar4me-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body className="bg-[#04060b] font-sans">{children}</body>
    </html>
  );
}