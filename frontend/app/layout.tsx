import type { Metadata } from 'next';
import { Quicksand, Lato } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/stores/QueryProvider';
import { ThemeProvider } from '@/components/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { GlobalLayout } from '@/components/layout';

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Smartslate',
  description: 'Turn customer insight into a clear, prioritized roadmap.',
  icons: {
    icon: '/logo-swirl.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply theme class immediately to prevent flash
              (function() {
                try {
                  const stored = localStorage.getItem('smartslate-theme');
                  const theme = (stored && ['light', 'dark'].includes(stored)) ? stored : 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  // Fallback to dark if localStorage fails
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${quicksand.variable} ${lato.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <QueryProvider>
              <GlobalLayout>{children}</GlobalLayout>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
