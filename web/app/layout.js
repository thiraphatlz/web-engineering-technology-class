import './globals.css';

export const metadata = { title: 'Book Shelf' };

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <main>
          <h1>Book Shelf</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
