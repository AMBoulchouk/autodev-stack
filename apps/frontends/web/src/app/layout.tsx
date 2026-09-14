import './global.css';

export const metadata = {
  title: 'Autodev Stack',
  description: 'AI-native autonomous development platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
