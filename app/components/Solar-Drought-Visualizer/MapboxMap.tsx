'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import Typography from '@mui/material/Typography'
import { Marker, Map, Layer, Source, MapMouseEvent, NavigationControl, ScaleControl, MapRef } from 'react-map-gl'
import GeocoderControl from './geocoder-control'
import * as turf from '@turf/turf'

import '@/app/styles/dashboard/mapbox-map.scss'

type Location = [number, number]

type MapboxMapProps = {
    locationSelected: Location | null;
    setLocationSelected: (locationSelected: Location | null) => void;
    mapMarker: [number, number] | null;
    setMapMarker: (marker: [number, number] | null) => void;
}
const MapboxMap = forwardRef<MapRef | null, MapboxMapProps>(
    ({ locationSelected, setLocationSelected, mapMarker, setMapMarker }, ref) => {

        const mapRef = useRef<MapRef | null>(null)
        const [mapLoaded, setMapLoaded] = useState(false)

        const initialViewState = {
            longitude: -122.4,
            latitude: 37.8,
            zoom: 8
        }

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current as MapRef);

        const handleMapLoad = (e: any) => {
            const map = e.target;
            mapRef.current = map;
            setMapLoaded(true);
        };

        const handleMapClick = (e: MapMouseEvent) => {
            const clickedPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];

            if (mapRef.current) {
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                    layers: ['grid'],
                });

                if (features && features.length > 0) {
                    const selectedFeature = features[0];
                    const centroid = turf.centroid(selectedFeature).geometry.coordinates;

                    setMapMarker([centroid[0], centroid[1]]);
                    setLocationSelected(centroid as [number, number]);
                }
            }
        };

        return (
            <div className="map-container">
                <div id="map">
                    <Map
                        onLoad={handleMapLoad}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={initialViewState}
                        style={{ width: 900, height: 412.5 }}
                        mapStyle="mapbox://styles/cal-adapt/cm4vhnvx7001601srckkbc5us"                        interactiveLayerIds={['grid']}
                        onClick={handleMapClick}
                        scrollZoom={false}
                        minZoom={3.5}
                    >
                        {mapMarker &&
                            <Marker longitude={mapMarker[0]} latitude={mapMarker[1]}>
                            </Marker>
                        }

                        <NavigationControl position="bottom-left" />
                        <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
                        <GeocoderControl zoom={13} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''} position="top-left" />
                    </Map>
                </div>
            </div>
        )
    }
)

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap