'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingData {
  restaurant: {
    name: string;
    coords: [number, number];
    address: any;
  };
  delivery: {
    coords: [number, number];
    address: any;
  };
  rider: [number, number] | null;
  status: string;
}

interface Props {
  tracking: TrackingData;
}

// Custom SVG icons
const restaurantIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:44px; height:44px; background:#f97316; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg); border:3px solid white;
      box-shadow:0 4px 12px rgba(249,115,22,0.4);
      display:flex; align-items:center; justify-content:center;
    ">
      <div style="transform:rotate(45deg); font-size:18px; margin-top:2px;">🍽️</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -48],
});

const riderIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;">
      <div style="
        width:48px; height:48px; background:#7c3aed; border-radius:50%;
        border:3px solid white; box-shadow:0 4px 16px rgba(124,58,237,0.5);
        display:flex; align-items:center; justify-content:center;
        font-size:22px; animation:pulse 1.5s infinite;
      ">🛵</div>
      <div style="
        position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
        background:#7c3aed; color:white; font-size:9px; font-weight:700;
        padding:2px 6px; border-radius:99px; white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.2);
      ">ON THE WAY</div>
    </div>
  `,
  iconSize: [48, 60],
  iconAnchor: [24, 60],
  popupAnchor: [0, -64],
});

const deliveryIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:44px; height:44px; background:#22c55e; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg); border:3px solid white;
      box-shadow:0 4px 12px rgba(34,197,94,0.4);
      display:flex; align-items:center; justify-content:center;
    ">
      <div style="transform:rotate(45deg); font-size:18px; margin-top:2px;">🏠</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -48],
});

export default function OrderTrackingMapInner({ tracking }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current || initRef.current) return;
    initRef.current = true;

    // Fix default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const { restaurant, delivery, rider } = tracking;

    // Center map between restaurant and delivery
    const centerLat = (restaurant.coords[0] + delivery.coords[0]) / 2;
    const centerLng = (restaurant.coords[1] + delivery.coords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // OpenStreetMap tiles — completely free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add attribution in corner
    L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

    // Restaurant marker
    L.marker(restaurant.coords, { icon: restaurantIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:sans-serif; min-width:160px;">
          <p style="font-weight:700; font-size:14px; margin:0 0 4px;">${restaurant.name}</p>
          <p style="color:#78716c; font-size:12px; margin:0;">${restaurant.address?.street || ''}, ${restaurant.address?.city || ''}</p>
          <span style="display:inline-block; margin-top:6px; background:#fff7ed; color:#ea580c; font-size:11px; font-weight:600; padding:2px 8px; border-radius:99px;">📍 Restaurant</span>
        </div>
      `, { maxWidth: 220 });

    // Delivery marker
    L.marker(delivery.coords, { icon: deliveryIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:sans-serif; min-width:160px;">
          <p style="font-weight:700; font-size:14px; margin:0 0 4px;">Your Location</p>
          <p style="color:#78716c; font-size:12px; margin:0;">${delivery.address?.street || ''}, ${delivery.address?.city || ''}</p>
          <span style="display:inline-block; margin-top:6px; background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:600; padding:2px 8px; border-radius:99px;">🏠 Delivery Here</span>
        </div>
      `, { maxWidth: 220 });

    // Dashed route line from restaurant to delivery
    const routeLine = L.polyline(
      [restaurant.coords, delivery.coords],
      {
        color: '#94a3b8',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 8',
      }
    ).addTo(map);
    routeLineRef.current = routeLine;

    // Rider marker (only if out for delivery)
    if (rider) {
      const riderMarker = L.marker(rider, { icon: riderIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;">
            <p style="font-weight:700; font-size:14px; margin:0 0 4px;">🛵 Your Rider</p>
            <p style="color:#78716c; font-size:12px; margin:0;">On the way to you!</p>
          </div>
        `);
      riderMarkerRef.current = riderMarker;

      // Draw solid line from rider to delivery
      L.polyline([rider, delivery.coords], {
        color: '#7c3aed',
        weight: 3,
        opacity: 0.8,
      }).addTo(map);
    }

    // Fit map to show all markers
    const allCoords: L.LatLngExpression[] = [restaurant.coords, delivery.coords];
    if (rider) allCoords.push(rider);
    map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });

    return () => {
      map.remove();
      initRef.current = false;
    };
  }, []);

  // Update rider position when tracking data changes
  useEffect(() => {
    if (!mapRef.current || !tracking.rider || !riderMarkerRef.current) return;
    riderMarkerRef.current.setLatLng(tracking.rider);
  }, [tracking.rider]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
    />
  );
}
