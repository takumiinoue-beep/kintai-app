import "./globals.css";

export const metadata = {
  title: "勤怠管理",
  description: "従業員勤怠管理システム",
  icons: { icon: '/icon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
