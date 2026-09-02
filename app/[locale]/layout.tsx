import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NWIS Football",
  icons: {
    icon: "/school-logo.png",
  },
};
import Navbar from "@/components/Navbar";

const googleSans = localFont({
  src: "../../fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
  variable: "--font-google-sans",
});

const ibmPlexArabic = localFont({
  src: "../../fonts/IBMPlexSansArabic-Regular.ttf",
});

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();

  const isArabic = locale === "ar";

  return (
    <NextIntlClientProvider messages={messages}>
      <div
        dir={isArabic ? "rtl" : "ltr"}
        lang={locale}
        className={`${
          isArabic ? ibmPlexArabic.className : googleSans.className
        } min-h-screen bg-white text-gray-950 dark:bg-gray-950 dark:text-white`}
      >
        <Navbar />
        {children}
      </div>
    </NextIntlClientProvider>
  );
}