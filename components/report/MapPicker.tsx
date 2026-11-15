"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapPin } from "lucide-react";

export type LatLng = { lat: number; lng: number };

// Chennai centre, used until the person shares their location or moves the map.
export const DEFAULT_CENTER: LatLng = { lat: 13.0827, lng: 80.2707 };

function Tracker({ onMove }: { onMove: (p: LatLng) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onMove({ lat: Number(c.lat.toFixed(6)), lng: Number(c.lng.toFixed(6)) });
    },
  });
  return null;
}

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], 18, { animate: false });
  }, [map, target]);
  return null;
}

// The pin stays fixed in the middle; people move the map under it. This is easier
// on a phone than dragging a small marker, especially for older users.
export default function MapPicker({
  value,
  flyTo,
  onMove,
  label,
}: {
  value: LatLng | null;
  flyTo: LatLng | null;
  onMove: (p: LatLng) => void;
  label: string;
}) {
  const start = value ?? DEFAULT_CENTER;
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-[14px] surface" role="application" aria-label={label}>
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={value ? 18 : 13}
        minZoom={7}
        maxZoom={19}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Tracker onMove={onMove} />
        <FlyTo target={flyTo} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
        <MapPin
          aria-hidden
          className="-translate-y-[18px] text-[var(--danger)] drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
          size={40}
          strokeWidth={2}
          fill="currentColor"
          fillOpacity={0.2}
        />
      </div>
    </div>
  );
}
