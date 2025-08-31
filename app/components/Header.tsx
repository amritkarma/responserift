"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiSun, HiMoon, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { RiGithubFill } from "react-icons/ri";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (!theme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const toggleMobileMenu = () => setMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Image
              src="/logo-responserift.png"
              alt="ResponseRift Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-semibold text-lg">
              Response<span className="text-blue-500">Rift</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/api/posts"
                className="text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              >
                Try API
              </Link>
              <Link
                href="https://github.com/amritkarma/responserift"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              >
                <RiGithubFill className="size-6" />
              </Link>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <HiSun className="size-5 text-yellow-500" />
              ) : (
                <HiMoon className="size-5 text-gray-600" />
              )}
            </button>

            {/* CTA */}
            <Link
              href="/api/posts"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black h-9 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Try It
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <HiOutlineX className="size-6" /> : <HiOutlineMenu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav
        className={`md:hidden bg-white dark:bg-black border-t border-black/10 dark:border-white/15 px-6 sm:px-10 transition-max-height duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-4 py-4">
          <li>
            <Link
              href="/api/posts"
              className="block text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors text-base font-medium"
              onClick={closeMobileMenu}
            >
              Try API
            </Link>
          </li>
          <li>
            <Link
              href="https://github.com/amritkarma/responserift"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors text-base font-medium"
              onClick={closeMobileMenu}
            >
              GitHub
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
