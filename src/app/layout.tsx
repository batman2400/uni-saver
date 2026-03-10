import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UNI Savers API Backend',
  description: 'Backend platform for the UNI Savers mobile application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
