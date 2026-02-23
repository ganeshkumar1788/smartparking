import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { AppShell } from "../components/AppShell";

export const metadata = {
  title: "SmartPark",
  description: "Automated parking and P2P space rental platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
