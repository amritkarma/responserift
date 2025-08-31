"use client";

import Link from "next/link";
import { useEffect} from "react";
import Prism from "prismjs";
import "prismjs/components/prism-http";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

export default function Home() {
  useEffect(() => {
    Prism.highlightAll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-white">
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Hero */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mt-6 md:mt-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm bg-white/80 border border-zinc-200 text-zinc-600 dark:bg-zinc-900/80 dark:border-zinc-700/50 dark:text-zinc-300">
            <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse" />
            <span>🌐 Open Source JSON API • Built with Next.js</span>
          </div>

          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent leading-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
            ResponseRift
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-zinc-500 dark:text-zinc-400 font-normal mt-2">
              Instant JSON API Platform
            </span>
          </h1>

          <p className="mt-6 text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            A fully-featured, open-source REST API powered by Next.js. Supports{" "}
            <strong className="text-zinc-900 dark:text-zinc-300">12+ resources</strong>, filtering,
            pagination, and full CRUD. Ideal for rapid prototyping and learning.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/YOUR_USERNAME/responserift"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl shadow-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 transition-all duration-200"
            >
              View on GitHub
            </a>

            <Link
              href="/api/posts"
              className="group inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl shadow-lg backdrop-blur-sm bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900/80 dark:border-zinc-700/50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all duration-200"
            >
              Try API Live
            </Link>
          </div>

          {/* Base URL */}
          <div className="mt-8 p-4 rounded-xl inline-block backdrop-blur-sm border bg-white/70 border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-700/50">
            <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
              Base URL:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                http://localhost:3000
              </span>
            </code>
          </div>
        </div>
      </section>

      {/* Feature Cards, Steps, Examples, etc. */}
      {/* Leave as-is, it's educational and works well for GitHub users */}

      {/* Final CTA - Replace docs with GitHub */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 rounded-3xl shadow-2xl border bg-gradient-to-r from-white to-zinc-100 border-zinc-200 dark:from-zinc-900 dark:to-black dark:border-zinc-700/50">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Want to Contribute?
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8">
              ResponseRift is open source. Fork the repo and help improve it!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/YOUR_USERNAME/responserift"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
              >
                Visit GitHub Repo
              </a>
              <Link
                href="/api/posts"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 bg-transparent border-2 border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                Try API Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
