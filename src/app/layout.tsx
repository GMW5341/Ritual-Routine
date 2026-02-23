import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ritual & Routine",
  description: "체력은 정신력. 정신력은 의사결정. 의사결정은 내 삶. 지속가능한 삶을 위한 원칙.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
