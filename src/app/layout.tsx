import { ReactNode } from "react";
import { Open_Sans } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'

export const openSans = Open_Sans({ subsets: ["latin"] });

// THEME PROVIDER
import ThemeProvider from "theme/theme-provider";
// PRODUCT CART PROVIDER
import CartProvider from "contexts/CartContext";
// Removed GraphQL cart provider to unify on local useCart
// SITE SETTINGS PROVIDER
import SettingsProvider from "contexts/SettingContext";
// TOAST NOTIFICATION PROVIDER
import { ToastProvider } from "contexts/ToastContext";
// GLOBAL CUSTOM COMPONENTS
import RTL from "components/rtl";
import ProgressBar from "components/progress";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

// IMPORT i18n SUPPORT FILE
import "i18n";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={openSans.className}>
        <CartProvider>
            <SettingsProvider>
              <ThemeProvider>
                <ToastProvider>
                  <ProgressBar />
                  <RTL>{children}</RTL>
                </ToastProvider>
              </ThemeProvider>
            </SettingsProvider>
        </CartProvider>
        <GoogleAnalytics gaId="G-XKPD36JXY0" />
      </body>
    </html>
  );
}
