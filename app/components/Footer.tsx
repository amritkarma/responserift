"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-black/10 dark:border-white/15 bg-black/[.02] dark:bg-white/[.02]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/logo-responserift.png"
                alt="ResponseRift Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="ml-2 font-semibold text-lg">
                Response<span className="text-blue-400">Rift</span>
              </span>
            </div>
            <p className="text-sm text-black/70 dark:text-white/70 max-w-md">
              Open-source JSON API generator for frontend development. Instantly
              mock real-world APIs and speed up your prototyping workflow.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/api/posts"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Try API
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/amritkarma/responserift"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  GitHub Repository
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-semibold mb-4">Built with</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Next.js 15
                </Link>
              </li>
              <li>
                <Link
                  href="https://tailwindcss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Tailwind CSS
                </Link>
              </li>
              <li>
                <Link
                  href="https://typescriptlang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  TypeScript
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-black/60 dark:text-white/60">
              © {year ?? ""} ResponseRift. Open-source JSON API tool.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="https://github.com/amritkarma/responserift/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                MIT License
              </Link>
              <Link
                href="https://responserift.dev/term"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="https://responserift.dev/privacy"
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
