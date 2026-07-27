export const metadata = {
  title: "Tréninkový deník",
  description: "Tréninkový deník pro atletický oddíl",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#12161B", minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
