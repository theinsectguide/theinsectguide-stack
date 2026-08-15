import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { JournalEntry } from '../types';

interface LeafletMapProps {
  entries: JournalEntry[];
  onSelectEntry?: (entry: JournalEntry) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ entries, onSelectEntry }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to London / Center if no entries
      const map = L.map(mapContainerRef.current).setView([51.505, -0.09], 5);

      // Dark theme map tiles from CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    const validEntries = entries.filter(
      (e) => e.location && typeof e.location.lat === 'number' && typeof e.location.lng === 'number'
    );

    if (validEntries.length > 0) {
      const bounds: L.LatLngExpression[] = [];

      validEntries.forEach((entry) => {
        const lat = entry.location!.lat;
        const lng = entry.location!.lng;
        bounds.push([lat, lng]);

        // Custom colored circle marker based on danger level
        let markerColor = '#10b981'; // safe
        if (entry.status_type === 'venomous') markerColor = '#e94560';
        else if (entry.status_type === 'dangerous') markerColor = '#f5a623';
        else if (entry.status_type === 'pest') markerColor = '#8b4513';
        else if (entry.status_type === 'protected') markerColor = '#2e86ff';

        const customIcon = L.divIcon({
          className: 'custom-insect-marker',
          html: `
            <div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
              ${entry.danger_level ?? '•'}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; min-width: 140px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 2px;">${entry.insect_name}</div>
            <div style="font-style: italic; font-size: 11px; color: #9ca3af; margin-bottom: 6px;">${entry.latin_name || 'Specimen'}</div>
            <div style="display: inline-block; font-size: 10px; font-weight: 700; color: ${markerColor}; border: 1px solid ${markerColor}; padding: 2px 6px; border-radius: 9999px;">
              Danger ${entry.danger_level || 0}/10 • ${(entry.status_type || 'safe').toUpperCase()}
            </div>
            <div style="font-size: 11px; color: #d1d5db; margin-top: 6px;">${new Date(entry.date).toLocaleDateString()}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectEntry) onSelectEntry(entry);
        });

        markers.addLayer(marker);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds as any, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [entries]);

  return (
    <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-[#2e2e4e] relative shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 z-[400] bg-[#161628]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 shadow-md">
        Private GPS Observations ({entries.filter((e) => e.location?.lat).length})
      </div>
    </div>
  );
};
