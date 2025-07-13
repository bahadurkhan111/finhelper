import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finhelper",
  description: "Understand your financial data better",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
