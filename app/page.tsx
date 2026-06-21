"use client";

import { useState, useEffect } from "react";

const PROVIDER_PREVIEWS: Record<
  string,
  {
    displayName: string;
    gradient: string;
    dotColor: string;
    sessionLabel: string;
    sessionUsed: string;
    sessionLimit: string;
    sessionPercent: number;
    weeklyLabel: string;
    weeklyUsed: string;
    weeklyLimit: string;
    weeklyPercent: number;
    costText: string;
    costToday: string;
    cost30d: string;
  }
> = {
  claude: {
    displayName: "Claude",
    gradient: "from-amber-500 to-orange-600",
    dotColor: "#f97316",
    sessionLabel: "Session Limit",
    sessionUsed: "42",
    sessionLimit: "100",
    sessionPercent: 42,
    weeklyLabel: "Sonnet Quota",
    weeklyUsed: "185,200",
    weeklyLimit: "500,000",
    weeklyPercent: 37,
    costText: "This month: $12.45 / $50.00",
    costToday: "$1.85",
    cost30d: "$34.12",
  },
  gemini: {
    displayName: "Gemini",
    gradient: "from-blue-500 to-indigo-600",
    dotColor: "#3b82f6",
    sessionLabel: "Pro Quota",
    sessionUsed: "18",
    sessionLimit: "50",
    sessionPercent: 36,
    weeklyLabel: "Flash Tokens",
    weeklyUsed: "12,400",
    weeklyLimit: "100,000",
    weeklyPercent: 12.4,
    costText: "This month: $0.00 (Free Tier)",
    costToday: "$0.00",
    cost30d: "$0.00",
  },
  codex: {
    displayName: "Codex",
    gradient: "from-emerald-500 to-teal-600",
    dotColor: "#10b981",
    sessionLabel: "Rate Limit resets in 1h",
    sessionUsed: "79",
    sessionLimit: "100",
    sessionPercent: 79,
    weeklyLabel: "Monthly Spend",
    weeklyUsed: "15",
    weeklyLimit: "20",
    weeklyPercent: 75,
    costText: "This month: $6.54 / $10.00",
    costToday: "$2.51",
    cost30d: "$6.54",
  },
  cursor: {
    displayName: "Cursor",
    gradient: "from-violet-500 to-purple-600",
    dotColor: "#8b5cf6",
    sessionLabel: "Fast Requests",
    sessionUsed: "180",
    sessionLimit: "500",
    sessionPercent: 36,
    weeklyLabel: "Auto-fallback Requests",
    weeklyUsed: "0",
    weeklyLimit: "10",
    weeklyPercent: 0,
    costText: "Personal Account",
    costToday: "$0.00",
    cost30d: "$0.00",
  },
};

export default function Home() {
  const [installOS, setInstallOS] = useState<"linux" | "windows">("linux");
  const [linuxMethod, setLinuxMethod] = useState<"appimage" | "deb">("appimage");
  const [copied, setCopied] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState("claude");

  const [downloads, setDownloads] = useState({
    appimage: {
      url: "https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_amd64.AppImage",
      filename: "TokenTracker_0.1.0_amd64.AppImage",
      cmd: "curl -LO https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_amd64.AppImage && chmod +x TokenTracker_0.1.0_amd64.AppImage && ./TokenTracker_0.1.0_amd64.AppImage",
    },
    deb: {
      url: "https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_amd64.deb",
      filename: "TokenTracker_0.1.0_amd64.deb",
      cmd: "curl -LO https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_amd64.deb && sudo dpkg -i TokenTracker_0.1.0_amd64.deb",
    },
    msi: "https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_x64_en-US.msi",
    exe: "https://github.com/ayan-de/Token-Tracker/releases/latest/download/TokenTracker_0.1.0_x64-setup.exe",
  });

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        const res = await fetch("https://api.github.com/repos/ayan-de/Token-Tracker/releases/latest");
        if (!res.ok) throw new Error("Failed to fetch latest release");
        const data = await res.json();
        
        let appImageUrl = "";
        let appImageName = "";
        let debUrl = "";
        let debName = "";
        let msiUrl = "";
        let exeUrl = "";

        if (data.assets && Array.isArray(data.assets)) {
          for (const asset of data.assets) {
            const name = asset.name;
            const url = asset.browser_download_url;
            if (name.endsWith(".AppImage")) {
              appImageUrl = url;
              appImageName = name;
            } else if (name.endsWith(".deb")) {
              debUrl = url;
              debName = name;
            } else if (name.endsWith(".msi")) {
              msiUrl = url;
            } else if (name.endsWith(".exe") || name.endsWith("-setup.exe")) {
              exeUrl = url;
            }
          }
        }

        setDownloads((prev) => ({
          appimage: {
            url: appImageUrl || prev.appimage.url,
            filename: appImageName || prev.appimage.filename,
            cmd: appImageUrl 
              ? `curl -LO ${appImageUrl} && chmod +x ${appImageName} && ./${appImageName}`
              : prev.appimage.cmd,
          },
          deb: {
            url: debUrl || prev.deb.url,
            filename: debName || prev.deb.filename,
            cmd: debUrl 
              ? `curl -LO ${debUrl} && sudo dpkg -i ${debName}`
              : prev.deb.cmd,
          },
          msi: msiUrl || prev.msi,
          exe: exeUrl || prev.exe,
        }));
      } catch (err) {
        console.error("Failed to load releases:", err);
      }
    }
    fetchLatestRelease();
  }, []);

  const activeLinuxCommand = downloads[linuxMethod].cmd;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeLinuxCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy command:", err);
    }
  };

  const preview = PROVIDER_PREVIEWS[selectedPreview] || PROVIDER_PREVIEWS.claude;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans select-none">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[80%] h-[60%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center font-extrabold text-[10px] text-white">
            TT
          </div>
          <span className="font-bold tracking-tight text-sm">TokenTracker</span>
        </div>
        <a
          href="https://github.com/ayan-de/Token-Tracker"
          className="text-xs text-zinc-400 hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </header>

      {/* Main Content Layout */}
      <main className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10">
        {/* Left Side: Copy/Branding info */}
        <section className="lg:col-span-7 space-y-8 flex flex-col justify-center text-center lg:text-left">
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-blue-500/10 text-cyan-400 border border-blue-500/25 uppercase">
              Now Available on Linux, Arch & Windows
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Track Your AI Spend Directly From Your Desktop
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              TokenTracker is a lightweight popover client for monitoring local and cloud-based AI provider quotas, rate limits, and spend metrics.
            </p>
          </div>

          {/* Interactive Installation Tabs */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 max-w-lg mx-auto lg:mx-0 shadow-2xl backdrop-blur-md">
            {/* Tab switchers */}
            <div className="flex border-b border-white/5 pb-4 mb-4 gap-2">
              <button
                onClick={() => setInstallOS("linux")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
                  installOS === "linux"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                🐧 Linux Setup
              </button>
              <button
                onClick={() => setInstallOS("windows")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
                  installOS === "windows"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                🪟 Windows Setup
              </button>
            </div>

            {/* Linux Content */}
            {installOS === "linux" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 text-left">
                  Choose your distribution to download and run TokenTracker:
                </p>

                {/* Method selector */}
                <div className="flex gap-2">
                  {(["appimage", "deb"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setLinuxMethod(m)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        linuxMethod === m
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {m === "appimage" ? "AppImage" : "Debian"}
                    </button>
                  ))}
                </div>

                {/* AppImage install */}
                {linuxMethod === "appimage" && (
                  <>
                    <div className="bg-zinc-950 border border-white/5 p-3 rounded-xl font-mono text-[10px] text-cyan-400 relative group overflow-hidden">
                      <span className="break-all text-left flex-1 pr-10 leading-normal">
                        {downloads.appimage.cmd}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="absolute right-2 top-2 p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors border-0 outline-none cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6-4h6" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-left">
                      AppImage works on all Linux distros (Ubuntu, Debian, Fedora, Arch, and more). Make executable and run directly.
                    </p>
                  </>
                )}

                {/* Debian install */}
                {linuxMethod === "deb" && (
                  <>
                    <div className="bg-zinc-950 border border-white/5 p-3 rounded-xl font-mono text-[10px] text-cyan-400 relative group overflow-hidden">
                      <span className="break-all text-left flex-1 pr-10 leading-normal">
                        {downloads.deb.cmd}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="absolute right-2 top-2 p-1.5 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors border-0 outline-none cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6-4h6" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-left">
                      For Ubuntu, Debian, and derivatives. Installs system-wide via dpkg.
                    </p>
                  </>
                )}

                <a
                  href="https://github.com/ayan-de/Token-Tracker/releases/latest"
                  className="text-blue-400 hover:underline text-[11px]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  All Downloads (RPM, source) &rarr;
                </a>
              </div>
            )}

            {/* Windows Content */}
            {installOS === "windows" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 text-left">
                  Download and run the installer to set up TokenTracker Desktop on Windows:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={downloads.msi}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-zinc-950 hover:bg-white/5 transition-all text-center group cursor-pointer decoration-none"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">MSI Installer</span>
                    <span className="text-[10px] text-zinc-500 mt-1">Recommended (.msi)</span>
                  </a>
                  <a
                    href={downloads.exe}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-zinc-950 hover:bg-white/5 transition-all text-center group cursor-pointer decoration-none"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">EXE Installer</span>
                    <span className="text-[10px] text-zinc-500 mt-1">Standard installer (.exe)</span>
                  </a>
                </div>
                <p className="text-[10px] text-zinc-500 text-left pt-1 leading-normal">
                  *Requires the CodexBar CLI binary to be configured inside your system <code className="font-mono text-zinc-300">%PATH%</code> environment variables.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Interactive UI Popover Simulation */}
        <section className="lg:col-span-5 flex justify-center">
          <div className="relative w-[340px] h-[500px] rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden font-sans">
            {/* Top glassmorphic highlight glow */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

            {/* Header bar */}
            <div className="relative flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent uppercase">
                  TokenTracker
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 text-zinc-400 rounded hover:text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="w-3.5 h-3.5 text-zinc-400 rounded hover:text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Provider Tabs selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-b border-white/5 bg-white/5/20 scrollbar-none">
              {Object.keys(PROVIDER_PREVIEWS).map((k) => {
                const p = PROVIDER_PREVIEWS[k];
                const isSelected = selectedPreview === k;
                return (
                  <button
                    key={k}
                    onClick={() => setSelectedPreview(k)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border-0 outline-none ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10 scale-105"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: p.dotColor }}
                    />
                    <span>{p.displayName}</span>
                  </button>
                );
              })}
            </div>

            {/* Popover detailed cards */}
            <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">
                    {preview.displayName}
                  </span>
                  <span className="text-[9px] text-zinc-500">Updated just now</span>
                </div>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-white">
                  OAuth API
                </span>
              </div>

              {/* Progress rows */}
              <div className="space-y-3">
                {/* Session Rate limit */}
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-zinc-300">
                    {preview.sessionLabel}
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${preview.gradient} rounded-full`}
                      style={{ width: `${preview.sessionPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>
                      {preview.sessionUsed} / {preview.sessionLimit} requests
                    </span>
                    <span>{preview.sessionPercent}% used</span>
                  </div>
                </div>

                {/* Weekly Limit */}
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-zinc-300">
                    {preview.weeklyLabel}
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${preview.gradient} rounded-full`}
                      style={{ width: `${preview.weeklyPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>
                      {preview.weeklyUsed} / {preview.weeklyLimit} tokens
                    </span>
                    <span>{preview.weeklyPercent.toFixed(1)}% used</span>
                  </div>
                </div>
              </div>

              {/* Cost Box */}
              <div className="pt-2 border-t border-white/5 flex flex-col text-[10px] text-zinc-400">
                <div className="flex justify-between font-semibold text-zinc-200">
                  <span>Spend Limit</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="w-2.5 h-2.5 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">{preview.costText}</div>
                <div className="flex gap-4 mt-2 text-[9px]">
                  <div>
                    Today: <span className="text-white font-mono">{preview.costToday}</span>
                  </div>
                  <div>
                    Last 30d: <span className="text-white font-mono">{preview.cost30d}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions menu list */}
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-400">
              <span>Settings...</span>
              <span>About TokenTracker</span>
              <span className="text-rose-500/80">Quit</span>
            </div>
          </div>
        </section>
      </main>

      {/* Features Showcase Section */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 border-t border-white/5 z-10">
        <h2 className="text-2xl font-bold text-center mb-12">Designed for modern developer setups</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base">Vibrant Design</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Beautiful brand-colored indicator glows, gradients, and a sleek, translucent panel that updates instantly.
            </p>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base">Multi-limit Precision</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Never get rate-limited. TokenTracker monitors all nested limits like session tokens, daily inputs, and custom hourly API quotas.
            </p>
          </div>
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-base">Offline-first Cache</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Zero network overhead on startup. TokenTracker reads local CLI configuration caches instantly, allowing offline usage review.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-6xl mx-auto px-6 py-8 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 z-10">
        <span>&copy; {new Date().getFullYear()} TokenTracker Desktop client.</span>
        <span>Original macOS app by Peter Steinberger.</span>
      </footer>
    </div>
  );
}
