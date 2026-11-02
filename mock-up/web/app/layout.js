import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Shop' };

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav><Link href="/">สินค้า</Link> | <Link href="/categories">หมวดหมู่</Link></nav>
        {children}
      </body>
    </html>
  );
}
