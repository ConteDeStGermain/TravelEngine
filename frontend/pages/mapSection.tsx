// @ts-nocheck
import React, { useEffect, useState } from 'react';

const MapContainer = ({ waypoints }) => {
  const [map, setMap] = useState(null);
  const apiKey = process.env.NEXT_PUBLIC_GMAP_API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', initMap);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', initMap);
      document.head.removeChild(script);
    };
  }, [apiKey]);

  const initMap = () => {
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    const mapOptions = {
      center: waypoints[0],
      zoom: 14,
    };

    const mapInstance = new window.google.maps.Map(document.getElementById('map'), mapOptions);

    directionsRenderer.setMap(mapInstance);

    const request: any = {
      origin: waypoints[0],
      destination: waypoints[waypoints.length - 1],
      waypoints: waypoints.slice(1, -1).map(waypoint => ({ location: waypoint })),
      travelMode: 'WALKING',
    };

    
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });

    setMap(mapInstance);
  }

  return (
    <div className='h-[100vh] w-[100vw] bg-[#261B2C] flex justify-center items-center flex-col'>
      <h1 className="text-white text-5xl">Your itinerary for Monday</h1>
      <div id="map" className='h-[70vh] w-[70vw] rounded-xl z-0' />
    </div>
  );
};

export default MapContainer;
