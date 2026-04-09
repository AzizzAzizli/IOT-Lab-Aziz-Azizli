import { useEffect, useState } from "react";
import IOTservice from "../service/service";

export default function Home() {
  const [url, setUrl] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [telemetry, setTelemetry] = useState(null);
  const [status, setStatus] = useState("Connecting...");

  const [lastSeen, setLastSeen] = useState(Date.now());

  useEffect(() => {
    const watchdog = setInterval(() => {
      const diff = (Date.now() - lastSeen) / 1000;
      if (diff > 5 && status === "Connected") {
        setStatus("Data Lost ⚠️");
      }
    }, 1000);
    return () => clearInterval(watchdog);
  }, [lastSeen, status]);

  useEffect(() => {
    if (!wsUrl) return;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setStatus("Connected");
      setLastSeen(Date.now());
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTelemetry(data);
        setLastSeen(Date.now());
        setStatus("Connected");
      } catch (err) {
        console.error("Data reading error:", err);
      }
    };

    socket.onclose = () => setStatus("Disconnected");
    socket.onerror = () => setStatus("Error");

    return () => socket.close();
  }, [wsUrl]);

  async function getServerUrl() {
    try {
      const response = await IOTservice.getURL();
      if (response.data.status === "ok") {
        setUrl(response.data.url);
        setWsUrl(response.data.ws_endpoint);
      }
    } catch (error) {
      console.log(error);
      setStatus("Failed to load URL");
    }
  }

  useEffect(() => {
    getServerUrl();
  }, []);

  const getBatteryColor = (level) => {
    if (level > 0.6) return "text-emerald-400";
    if (level > 0.2) return "text-amber-400";
    return "text-rose-400";
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "---";
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!wsUrl) return;
    const cleanUrl = url || wsUrl; // Prefer the HTTP URL for easy entry if available
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:1s]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500 font-bold uppercase tracking-widest text-[10px] ${
                status === "Connected" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : status === "Data Lost ⚠️"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  status === "Connected" ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                  status === "Data Lost ⚠️" ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-rose-400"
                }`}></span>
                {status}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-br from-white via-white to-slate-600 flex flex-wrap items-center gap-4">
              {telemetry?.deviceId || "AZIZ-IOT-NODE"}
              <div className="h-8 w-px bg-white/10 hidden md:block"></div>
              <a 
                href="https://github.com/AzizzAzizli" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 group/author active:scale-95 transition-all outline-none"
              >
                <span className="text-xs font-black text-slate-500 group-hover/author:text-indigo-400 transition-colors uppercase tracking-[0.3em]">
                  Aziz Azizli
                </span>
                <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover/author:border-indigo-500/30 group-hover/author:bg-indigo-500/10 transition-all">
                  <svg className="w-5 h-5 text-slate-400 group-hover/author:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </div>
              </a>
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <svg className="w-4 h-4 opacity-50 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px]">Last Update:</span> <span className="text-slate-200 font-mono text-xs">{formatTimestamp(telemetry?.timestamp)}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCopy}
            disabled={!url}
            className="group flex flex-col items-center bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-4xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-6 mb-2">
              <div className="flex flex-col items-start pr-6 border-r border-white/10">
                <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase mb-1">Node Target URL</span>
                <span className="text-xl md:text-2xl font-black text-indigo-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] text-center">
                  {url ? (() => {
                    const u = new URL(url);
                    return `${u.hostname}${u.port ? ':' + u.port : ''}/data`;
                  })() : "Scanning Network..."}
                </span>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                {copied ? (
                  <svg className="w-8 h-8 text-emerald-400 animate-in zoom-in duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </div>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest animate-pulse">
                URL copied to clipboard successfully
              </span>
            )}
            {!copied && (
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                Click to copy address
              </span>
            )}
          </button>
        </header>


        {telemetry ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Battery Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-indigo-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${getBatteryColor(telemetry.sensors?.battery?.batteryLevel)}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Battery Management</h3>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`text-6xl font-black ${getBatteryColor(telemetry.sensors?.battery?.batteryLevel)}`}>
                  {(telemetry.sensors?.battery?.batteryLevel * 100).toFixed(0)}
                </span>
                <span className="text-2xl font-bold text-slate-600">%</span>
              </div>

              <div className="space-y-6">
                <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                      telemetry.sensors?.battery?.batteryLevel > 0.6 ? 'bg-linear-to-r from-emerald-600 to-emerald-400' : 
                      telemetry.sensors?.battery?.batteryLevel > 0.2 ? 'bg-linear-to-r from-amber-600 to-amber-400' : 'bg-linear-to-r from-rose-600 to-rose-400'
                    }`}
                    style={{ width: `${telemetry.sensors?.battery?.batteryLevel * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">State</p>
                    <p className="text-xs font-bold text-slate-300 capitalize">{telemetry.sensors?.battery?.batteryState}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Mode</p>
                    <p className="text-xs font-bold text-slate-300">{telemetry.sensors?.battery?.lowPowerMode ? "Low Power" : "Standard"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Light Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-yellow-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-yellow-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Environment</h3>
              
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black text-yellow-500">
                  {telemetry.sensors?.light?.lux}
                </span>
                <span className="text-2xl font-bold text-slate-600 lowercase">lux</span>
              </div>

              <div className="relative h-24 flex items-end justify-between gap-1">
                {[...Array(24)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-full rounded-t-full transition-all duration-700 ${
                      (telemetry.sensors?.light?.lux / 1000) * 24 > i ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-white/5'
                    }`}
                    style={{ height: `${Math.max(10, (i / 24) * 100)}%` }}
                  ></div>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10"></div>
              </div>
              <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Ambient Intensity</p>
            </div>

            {/* Audio Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-emerald-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Audio Analytics</h3>
              
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black text-emerald-500">
                  {telemetry.sensors?.microphone?.dBFS.toFixed(0)}
                </span>
                <span className="text-2xl font-bold text-slate-600 uppercase">dBFS</span>
              </div>

              <div className="h-24 flex items-center justify-center gap-[3px]">
                {[...Array(30)].map((_, i) => {
                  const strength = (telemetry.sensors?.microphone?.dBFS + 120) / 120;
                  const randomHeight = 20 + (Math.random() * 80 * strength);
                  return (
                    <div 
                      key={i} 
                      className="w-1 bg-emerald-500/40 rounded-full transition-all duration-200"
                      style={{ 
                        height: `${randomHeight}%`,
                        opacity: 0.3 + (randomHeight / 100) * 0.7
                      }}
                    ></div>
                  );
                })}
              </div>
              <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Real-time Spectrum</p>
            </div>

            {/* Battery Temperature Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-rose-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-rose-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Thermal Status</h3>
              
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-6xl font-black text-rose-500">
                  {telemetry.sensors?.['battery temp']?.temperature?.toFixed(1) || telemetry.sensors?.batteryTemp?.temperature?.toFixed(1) || "---"}
                </span>
                <span className="text-2xl font-bold text-slate-600">°C</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Cold</span>
                  <span>Optimal</span>
                  <span>Hot</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                  <div 
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 via-emerald-500 to-rose-500 opacity-20 w-full"
                  ></div>
                  <div 
                    className="absolute inset-y-0 bg-white transition-all duration-1000 w-1 shadow-[0_0_10px_white]"
                    style={{ left: `${Math.min(100, Math.max(0, ((telemetry.sensors?.['battery temp']?.temperature || 25) - 10) / 40 * 100))}%` }}
                  ></div>
                </div>
              </div>
              <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Core Battery Temperature</p>
            </div>
            {/* Magnetometer (Compass) Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-blue-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Magnetic Field
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-10">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">X-Axis</p>
                  <p className="text-sm font-bold text-blue-400">{(telemetry.sensors?.magnetometer?.x || 0).toFixed(1)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Y-Axis</p>
                  <p className="text-sm font-bold text-indigo-400">{(telemetry.sensors?.magnetometer?.y || 0).toFixed(1)}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Z-Axis</p>
                  <p className="text-sm font-bold text-purple-400">{(telemetry.sensors?.magnetometer?.z || 0).toFixed(1)}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-center p-4">
                 <div className="absolute inset-0 border border-white/5 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                 <div className="relative w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center bg-radial from-blue-500/5 to-transparent">
                    {/* Compass Markings */}
                    <div className="absolute inset-2 border border-white/5 rounded-full"></div>
                    <div className="absolute top-1 text-[8px] font-black text-slate-600">N</div>
                    <div className="absolute bottom-1 text-[8px] font-black text-slate-600">S</div>
                    <div className="absolute right-1 text-[8px] font-black text-slate-600">E</div>
                    <div className="absolute left-1 text-[8px] font-black text-slate-600">W</div>
                    
                    {/* Compass Needle */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
                      style={{ transform: `rotate(${Math.atan2(telemetry.sensors?.magnetometer?.y || 0, telemetry.sensors?.magnetometer?.x || 0) * (180 / Math.PI) + 90}deg)` }}
                    >
                      <div className="w-1 h-14 bg-linear-to-b from-blue-500 to-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    </div>
                    
                    {/* Magnitude Display */}
                    <div className="z-10 bg-[#111625] px-2 py-1 rounded-md border border-white/10 shadow-xl">
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Strength</p>
                       <p className="text-xs font-black text-white leading-none">
                         {Math.sqrt(
                           Math.pow(telemetry.sensors?.magnetometer?.x || 0, 2) + 
                           Math.pow(telemetry.sensors?.magnetometer?.y || 0, 2) + 
                           Math.pow(telemetry.sensors?.magnetometer?.z || 0, 2)
                         ).toFixed(1)} <span className="text-[7px] text-slate-400 font-normal">µT</span>
                       </p>
                    </div>
                 </div>
              </div>
              <p className="mt-6 text-[9px] text-slate-500 font-medium text-center italic tracking-wide">Spatial Magnetic Orientation Tracking</p>
            </div>

            {/* Gyroscope (Rotation) Module */}
            <div className="group relative bg-[#111625] border border-white/5 p-8 rounded-[2.5rem] hover:ring-1 hover:ring-orange-500/50 transition-all duration-500">
              <div className="absolute top-6 right-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>

              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                Angular Velocity
              </h3>
              
              <div className="flex flex-col gap-6 mb-10">
                {[
                  { label: "Pitch (X)", val: telemetry.sensors?.gyroscope?.x || 0, color: "bg-orange-500" },
                  { label: "Roll (Y)", val: telemetry.sensors?.gyroscope?.y || 0, color: "bg-amber-500" },
                  { label: "Yaw (Z)", val: telemetry.sensors?.gyroscope?.z || 0, color: "bg-yellow-500" }
                ].map((axis, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{axis.label}</span>
                      <span className="text-[10px] font-mono font-bold text-orange-400">{(axis.val).toFixed(3)} rad/s</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
                      <div className="h-full flex items-center justify-center relative">
                         <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 z-10"></div>
                         <div 
                           className={`h-full ${axis.color} transition-all duration-200 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]`}
                           style={{ 
                             width: `${Math.min(50, Math.abs(axis.val) * 50)}%`,
                             marginLeft: axis.val > 0 ? '50%' : 'auto',
                             marginRight: axis.val < 0 ? '50%' : 'auto'
                           }}
                         ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col items-center">
                 <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <div className="absolute inset-0 opacity-20 border border-white/10 rounded-full scale-125 animate-ping duration-1000"></div>
                    <div 
                      className="w-10 h-10 bg-linear-to-br from-orange-400 to-orange-600 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform duration-200"
                      style={{ 
                        transform: `perspective(200px) rotateX(${(telemetry.sensors?.gyroscope?.x || 0) * 150}deg) rotateY(${(telemetry.sensors?.gyroscope?.y || 0) * 150}deg) rotateZ(${(telemetry.sensors?.gyroscope?.z || 0) * 150}deg)` 
                      }}
                    >
                       <div className="absolute top-1 left-2 w-1 h-3 bg-white/30 rounded-full"></div>
                    </div>
                 </div>
                 <p className="mt-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">3D Dynamics Preview</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-[#111625] border border-dashed border-white/10 rounded-[3rem]">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Awaiting Telemetry</p>
          </div>
        )}

        <footer className="mt-32 pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
                  &copy; 2026 AZ-IOT LABS
                </div>
                <a 
                  href="https://github.com/AzizzAzizli" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 group"
                >
                  <span className="text-[9px] font-bold text-slate-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">Dev / Aziz Azizli</span>
                  <svg className="w-3 h-3 text-slate-700 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </a>
              </div>
              <div className="h-8 w-px bg-white/5 hidden md:block"></div>
              <div className="flex gap-6">

              </div>
            </div>
            <div className="flex gap-4">
              <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


