"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, useMemo } from "react";

// Fix Leaflet marker icon issue
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function RealMap({ state, dronePosition, userPosition }: { 
  state: string, 
  dronePosition: [number, number],
  userPosition: [number, number]
}) {
  const [nearbyDrones, setNearbyDrones] = useState<{ id: number, pos: [number, number] }[]>([]);

  useEffect(() => {
    // Generate drones once on mount
    const drones = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      pos: [
        userPosition[0] + (Math.random() - 0.5) * 0.015,
        userPosition[1] + (Math.random() - 0.5) * 0.015
      ] as [number, number]
    }));
    setNearbyDrones(drones);
  }, [userPosition]); // Added userPosition dependency just in case, though it's constant

  const droneIcon = useMemo(() => typeof window !== 'undefined' ? L.divIcon({
    className: 'custom-drone-icon',
    html: `<div class="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 p-1 shadow-md dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-black dark:text-white"><path d="m20 11-8-8-8 8"/><path d="M12 3v18"/><path d="M12 11h8"/><path d="M4 11h8"/></svg>
            <div class="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }) : null, []);

  const activeDroneIcon = useMemo(() => typeof window !== 'undefined' ? L.divIcon({
    className: 'active-drone-icon',
    html: `<div class="relative">
            <div class="absolute -inset-6 animate-pulse rounded-full bg-blue-500/20"></div>
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-2xl ring-4 ring-white/20 dark:bg-white dark:text-black dark:ring-black/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 11-8-8-8 8"/><path d="M12 3v18"/><path d="M12 11h8"/><path d="M4 11h8"/></svg>
            </div>
          </div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28]
  }) : null, []);

  const userIcon = useMemo(() => typeof window !== 'undefined' ? L.divIcon({
    className: 'user-icon',
    html: `<div class="relative">
            <div class="absolute -inset-6 animate-ping rounded-full bg-black/5"></div>
            <div class="absolute -inset-3 rounded-full bg-blue-500/30"></div>
            <div class="h-6 w-6 rounded-full border-[4px] border-white bg-blue-600 shadow-2xl"></div>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }) : null, []);

  if (typeof window === 'undefined') {
    return <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900" />;
  }

    return (
      <div className="absolute inset-0 z-0 overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: `
          .leaflet-marker-icon {
            transition: transform 0.1s linear !important;
          }
        `}} />
        <MapContainer 
          center={userPosition} 
          zoom={15} 
          scrollWheelZoom={false}
          zoomControl={false}
          className="h-full w-full"
        >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Nearby Drones */}
        {(state === "IDLE" || state === "SEARCHING") && nearbyDrones.map((drone) => (
          droneIcon && <Marker key={drone.id} position={drone.pos} icon={droneIcon} />
        ))}

        {/* User Marker */}
        {userIcon && <Marker position={userPosition} icon={userIcon} />}

        {/* Active Drone Marker */}
        {(state === "MATCHED" || state === "EN_ROUTE" || state === "ARRIVED" || state === "TRIP_IN_PROGRESS") && activeDroneIcon && (
          <Marker position={dronePosition} icon={activeDroneIcon} />
        )}

        <MapController center={state === "TRIP_IN_PROGRESS" ? dronePosition : userPosition} />
      </MapContainer>
    </div>
  );
}
