'use client';

import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only — no SSR
const OrderTrackingMap = dynamic(
  () => import('./OrderTrackingMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-stone-400">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default OrderTrackingMap;
