"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  Search, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Menu, 
  X,
  Video,
  AlertTriangle
} from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR and hydration issues
const RealMap = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
});

type AppState = "IDLE" | "SEARCHING" | "MATCHED" | "EN_ROUTE" | "ARRIVED" | "TRIP_IN_PROGRESS" | "DANGER_DETECTED";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [destination, setDestination] = useState("");
  const [userPos, setUserPos] = useState<[number, number]>([37.7749, -122.4194]);
  const [dronePos, setDronePos] = useState<[number, number]>([37.78, -122.42]);

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.01)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: 'none',
  } as React.CSSProperties;

  const handleRequest = () => {
    setAppState("SEARCHING");
    setTimeout(() => {
      setAppState("MATCHED");
      setTimeout(() => {
        setAppState("EN_ROUTE");
        let currentLat = 37.78;
        let currentLng = -122.42;
        const targetLat = userPos[0];
        const targetLng = userPos[1];
        
        let frameId: number;
        const animate = () => {
          const deltaLat = (targetLat - currentLat) * 0.05;
          const deltaLng = (targetLng - currentLng) * 0.05;
          
          currentLat += deltaLat;
          currentLng += deltaLng;
          setDronePos([currentLat, currentLng]);
          
          if (Math.abs(targetLat - currentLat) < 0.00001 && Math.abs(targetLng - currentLng) < 0.00001) {
            cancelAnimationFrame(frameId);
            setAppState("ARRIVED");
          } else {
            frameId = requestAnimationFrame(animate);
          }
        };
        frameId = requestAnimationFrame(animate);
      }, 1500);
    }, 3000);
  };

  const startTrip = () => {
    setAppState("TRIP_IN_PROGRESS");
    let currentUserLat = userPos[0];
    let currentUserLng = userPos[1];
    let currentDroneLat = userPos[0];
    let currentDroneLng = userPos[1];
    
    let frameId: number;
    const startTime = Date.now();
    const dangerTime = 7000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < dangerTime) {
        currentUserLat += 0.000002;
        currentUserLng += 0.000002;
        currentDroneLat += 0.000002;
        currentDroneLng += 0.000002;
        
        setUserPos([currentUserLat, currentUserLng]);
        setDronePos([currentDroneLat, currentDroneLng]);
        frameId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(frameId);
        setAppState("DANGER_DETECTED");
      }
    };
    frameId = requestAnimationFrame(animate);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-white selection:bg-black selection:text-white">
      {/* Map is lowest layer */}
      <div className="absolute inset-0 z-0">
        <RealMap state={appState} dronePosition={dronePos} userPosition={userPos} />
      </div>

      {/* Header */}
      <header className="absolute top-0 z-50 flex w-full items-center justify-between p-6 pointer-events-none">
        <button 
          style={glassStyle}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95 pointer-events-auto"
        >
          <Menu className="h-6 w-6 text-black" />
        </button>
        <div 
          style={glassStyle}
          className="flex h-12 items-center gap-2 rounded-full px-4 pointer-events-auto"
        >
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-black">SafeZone Active</span>
        </div>
      </header>

      {/* Main UI Overlay - Left Glass Panel */}
      <AnimatePresence mode="wait">
        {appState === "IDLE" && (
          <motion.div 
            key="idle-ui"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            className="absolute left-0 top-0 z-[100] h-full w-[420px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex h-full flex-col">
              <h2 className="mb-8 text-3xl font-bold tracking-tight text-black">Where to?</h2>
              
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Search className="h-5 w-5 text-zinc-600" />
                </div>
                <input 
                  type="text"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={glassStyle}
                  className="h-14 w-full rounded-2xl pl-12 pr-4 text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-black/20 text-black placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-4 flex-1">
                <button 
                  onClick={() => setDestination("123 Safety Way, Secure City")}
                  style={glassStyle}
                  className="flex w-full items-center gap-4 rounded-2xl p-4 transition-all hover:brightness-110"
                >
                  <div 
                    style={glassStyle}
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                  >
                    <Clock className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm text-black">Home</p>
                    <p className="text-sm text-zinc-600">123 Safety Way, Secure City</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-400" />
                </button>
              </div>
              
              <button 
                onClick={handleRequest}
                disabled={!destination}
                className="h-14 w-full rounded-2xl bg-black text-lg font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 shadow-2xl"
              >
                Request Escort
              </button>
            </div>
          </motion.div>
        )}

        {appState === "SEARCHING" && (
          <motion.div 
            key="searching-ui"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="absolute left-0 top-0 z-[100] h-full w-[420px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="relative">
                <div className="absolute -inset-4 animate-ping rounded-full bg-black/5" />
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-2xl">
                  <Navigation className="h-8 w-8 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">Matching with a Drone</h3>
                <p className="text-zinc-600">Searching for available escorts in your area...</p>
              </div>
              <button 
                onClick={() => setAppState("IDLE")}
                style={glassStyle}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-black hover:brightness-110 transition-all"
              >
                Cancel Request
              </button>
            </div>
          </motion.div>
        )}

        {(appState === "MATCHED" || appState === "EN_ROUTE" || appState === "ARRIVED") && (
          <motion.div 
            key="active-escort-ui"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="absolute left-0 top-0 z-[100] h-full w-[420px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex h-full flex-col">
              <div className="mb-8 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div 
                    style={glassStyle}
                    className="flex h-16 w-16 items-center justify-center rounded-3xl"
                  >
                    <Navigation className="h-8 w-8 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-black">Sentinel X-4</h3>
                    <p className="text-sm text-zinc-600">Arriving in 2 mins</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div 
                    style={{
                      ...glassStyle,
                      background: 'rgba(34, 197, 94, 0.05)',
                    }}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-green-700"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">DR-9921</p>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                <div 
                  style={glassStyle}
                  className="rounded-2xl p-5"
                >
                  <p className="text-xs text-zinc-600 uppercase font-bold tracking-tight mb-1">Battery</p>
                  <p className="text-2xl font-bold text-black">94%</p>
                </div>
                <div 
                  style={glassStyle}
                  className="rounded-2xl p-5"
                >
                  <p className="text-xs text-zinc-600 uppercase font-bold tracking-tight mb-1">Distance</p>
                  <p className="text-2xl font-bold text-black">0.4 mi</p>
                </div>
              </div>

              <div className="mt-auto">
                {appState === "ARRIVED" ? (
                  <button 
                    onClick={startTrip}
                    className="h-16 w-full rounded-2xl bg-black text-lg font-bold text-white shadow-2xl transition-all hover:bg-zinc-800"
                  >
                    Start Escort
                  </button>
                ) : (
                  <div 
                    style={glassStyle}
                    className="flex h-16 w-full items-center justify-center rounded-2xl text-lg font-bold text-zinc-600"
                  >
                    Drone is en route...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {(appState === "TRIP_IN_PROGRESS" || appState === "DANGER_DETECTED") && (
          <motion.div 
            key="trip-ui"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="absolute left-0 top-0 z-[100] h-full w-[420px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex h-full flex-col">
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex w-full items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold italic tracking-tighter uppercase text-black">Escort Active</h3>
                    <p className="text-sm text-zinc-600">Drone following at 15ft height</p>
                  </div>
                  <button 
                    onClick={() => setAppState("IDLE")}
                    style={{
                      ...glassStyle,
                      background: 'rgba(239, 68, 68, 0.05)',
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full text-red-600 hover:brightness-110 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div 
                  style={glassStyle}
                  className="h-3 w-full overflow-hidden rounded-full"
                >
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    className="h-full bg-gradient-to-r from-black to-zinc-700"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-red-500" />
                  <h4 className="text-lg font-bold text-black">Drone Camera Feed</h4>
                  <span className="ml-auto flex h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                </div>
                
                <div 
                  style={glassStyle}
                  className="flex-1 rounded-3xl overflow-hidden relative"
                >
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src="/drone-feed.mp4" type="video/mp4" />
                  </video>
                  <div 
                    style={glassStyle}
                    className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono rounded-xl px-4 py-2.5"
                  >
                    <span>ALTITUDE: 15ft</span>
                    <span>●</span>
                    <span>FPS: 60</span>
                    <span>●</span>
                    <span>1080p</span>
                  </div>
                </div>
              </div>
            </div>

            {appState === "DANGER_DETECTED" && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center p-8 z-10"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                  }}
                  className="rounded-3xl p-8 text-center shadow-2xl relative max-w-sm"
                >
                  <button
                    onClick={() => {
                      setAppState("IDLE");
                      setDestination("");
                      setUserPos([37.7749, -122.4194]);
                      setDronePos([37.78, -122.42]);
                    }}
                    style={{
                      ...glassStyle,
                      background: 'rgba(239, 68, 68, 0.1)',
                    }}
                    className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full text-red-600 hover:brightness-110 transition-all shadow-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.6 
                    }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="rounded-full bg-red-500 p-4 shadow-lg">
                      <AlertTriangle className="h-12 w-12 text-white" />
                    </div>
                  </motion.div>
                  <h2 className="mb-3 text-3xl font-bold text-red-600">DANGER DETECTED</h2>
                  <p className="text-lg font-medium text-red-700">Drone identified potential threat</p>
                  <p className="mt-2 text-sm text-red-600">Escort paused for your safety</p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
