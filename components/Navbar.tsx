"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Home,
  Menu,
  Newspaper,
  Play,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "NWIS Football",
  icons: {
    icon: "/school-logo.png",
  },
};

const navigation = [
  { key: "home", href: "", icon: Home },
  { key: "matches", href: "matches", icon: CalendarDays },
  { key: "teams", href: "teams", icon: Trophy },
  { key: "players", href: "players", icon: Users },
  { key: "stats", href: "stats", icon: BarChart3 },
  { key: "highlights", href: "highlights", icon: Play },
  { key: "news", href: "news", icon: Newspaper },
];

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === "en" ? "ar" : "en";

  const languagePath =
    `/${otherLocale}${pathname.replace(`/${locale}`, "")}` || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex h-[72px] items-center justify-between">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            onClick={() => setMobileOpen(false)}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gray-950 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-white">
  <img
    src="/school-logo.png"
    alt="NWIS"
    className="h-full w-full object-contain p-1.5"
  />
</div>

            <div className="hidden sm:block">
              <div className="text-[15px] font-extrabold tracking-tight text-gray-950 dark:text-white">
                NWIS Football
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                School Tournament
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const href = item.href
                ? `/${locale}/${item.href}`
                : `/${locale}`;

              const active =
                pathname === href ||
                (item.href !== "" && pathname.startsWith(`${href}/`));

              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
  active
  ? "bg-gray-950 !text-white dark:bg-white dark:!text-gray-950"
    : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
}`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 ${
                      active
                        ? "text-emerald-400 dark:text-emerald-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    strokeWidth={2}
                  />

                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Language */}
            <Link
              href={languagePath}
              className="hidden rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-800 sm:block"
            >
              {otherLocale === "ar" ? "العربية" : "English"}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-900 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-800 lg:hidden">
            <nav className="grid gap-1">
              {navigation.map((item) => {
                const href = item.href
                  ? `/${locale}/${item.href}`
                  : `/${locale}`;

                const active =
                  pathname === href ||
                  (item.href !== "" && pathname.startsWith(`${href}/`));

                const Icon = item.icon;

                return (
                  <Link
                    key={item.key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                      active
                        ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active
                            ? "text-emerald-400 dark:text-emerald-600"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />

                      <span className="text-sm font-semibold">
                        {t(item.key)}
                      </span>
                    </div>

                    <ArrowRight
                      className={`h-4 w-4 ${
                        active
                          ? "text-white dark:text-gray-950"
                          : "text-gray-500 dark:text-gray-400"
                      } ${
                        locale === "ar" ? "rotate-180" : ""
                      }`}
                    />
                  </Link>
                );
              })}

              {/* Mobile Language Switch */}
              <Link
                href={languagePath}
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                <span>
                  {otherLocale === "ar" ? "العربية" : "English"}
                </span>

                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {locale === "ar" ? "English" : "العربية"}
                </span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
