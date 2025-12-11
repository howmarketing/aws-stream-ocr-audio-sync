import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Audio Sync Player',
  description: 'Low-latency audio streaming with scoreboard synchronization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
