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
    icon: [
      { url: '/logo-swirl.png', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/logo-swirl.png', type: 'image/png' }],
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
        {/* Mobile optimization meta tags */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />

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
