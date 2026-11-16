import { Plus_Jakarta_Sans } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'Kaksha | Academic Learning Portal',
  description: 'Collegiate Learning Management System for courses, lectures, materials, live classes, and assignments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
