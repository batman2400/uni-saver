import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UniSavers Admin',
  description: 'Admin dashboard for the UniSavers platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#0a071a', color: '#f0f0f0', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
