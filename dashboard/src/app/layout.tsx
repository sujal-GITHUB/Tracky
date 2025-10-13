import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./global.css";
import { DarkModeProvider } from "../providers/DarkModeProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tracky",
  description: "Order management system for Tracky sellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Hurricane&family=Inconsolata:wght@200..900&family=Italianno&family=Lexend:wght@100..900&family=Manrope:wght@200..800&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${manrope.variable} font-sans antialiased`} suppressHydrationWarning>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
