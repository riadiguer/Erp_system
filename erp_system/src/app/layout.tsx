import './globals.css';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"   data-arp="">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
