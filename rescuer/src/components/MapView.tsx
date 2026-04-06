import { useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import { AlertTriangle } from 'lucide-react';
import type { Alert } from '../types';

import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'sending':
    case 'api':
      return '#E24B4A'; // accent
    case 'sms':
      return '#EF9F27'; // warning
    case 'resolved':
      return '#444441'; // muted/border
    default:
      return '#888780';
  }
};

const MapView: React.FC<MapViewProps> = ({ alerts, selectedAlertId, onSelectAlert }) => {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (selectedAlertId && mapRef.current) {
      const alert = alerts.find(a => a.id === selectedAlertId);
      if (alert) {
        mapRef.current.flyTo({
          center: [alert.lng, alert.lat],
          zoom: 14,
          duration: 1500
        });
      }
    }
  }, [selectedAlertId, alerts]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{
        longitude: 121.7740,
        latitude: 12.8797,
        zoom: 6
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {alerts.map((alert) => {
        const isSelected = selectedAlertId === alert.id;
        return (
          <Marker 
            key={alert.id}
            longitude={alert.lng} 
            latitude={alert.lat}
            anchor="center"
            onClick={e => {
              e.originalEvent.stopPropagation();
              onSelectAlert(alert.id);
            }}
          >
            <div 
              style={{ backgroundColor: getMarkerColor(alert.status) }}
              className={`flex justify-center items-center rounded-full text-background cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'w-9 h-9 border-2 border-white shadow-xl scale-110' : 'w-7 h-7 scale-100 hover:scale-110'}`}
            >
              <AlertTriangle size={isSelected ? 20 : 16} className="text-background" />
            </div>
          </Marker>
        );
      })}
    </Map>
  );
};

export default MapView;
