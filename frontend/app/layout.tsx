import type { Metadata } from 'next';
import { Quicksand, Lato } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/stores/QueryProvider';
import { ThemeProvider } from '@/components/theme';

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
      <body className={`${quicksand.variable} ${lato.variable} antialiased`}>
        <ThemeProvider defaultTheme="system">
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
