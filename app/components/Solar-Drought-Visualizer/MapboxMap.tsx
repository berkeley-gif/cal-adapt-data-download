'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import Typography from '@mui/material/Typography'
import { Marker, Map, Layer, Source, MapMouseEvent, NavigationControl } from 'react-map-gl'
import { Button } from '@mui/material'
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
const MapboxMap = forwardRef<mapboxgl.Map | null, MapboxMapProps>(
    ({ locationSelected, setLocationSelected, mapMarker, setMapMarker }, ref) => {

        const mapRef = useRef<mapboxgl.Map | null>(null) // Internal ref for the map instance
        const [mapLoaded, setMapLoaded] = useState(false)

        const initialViewState = {
            longitude: -122.4,
            latitude: 37.8,
            zoom: 8
        }

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current);

        const handleMapLoad = (e: mapboxgl.MapEvent) => {
            mapRef.current = e.target as mapboxgl.Map;
            setMapLoaded(true);
        };

        const gridLayer: any = {
            id: 'grid',
            type: 'fill',
            paint: {
                'fill-color': 'transparent',
                'fill-opacity': 0,
            }
        };

        const handleMapClick = (e: MapMouseEvent) => {
            if (e.features && e.features.length > 0) {
                const selectedFeature = e.features[0];
                const centroid = turf.centroid(selectedFeature).geometry.coordinates;

                setMapMarker([centroid[0], centroid[1]]);
                setLocationSelected(centroid as [number, number]);
            }
        }

        return (
            <div className="map-container">
                <div className="map-text">
                    <Typography variant="body1">Click on the map, or search for an address and then click on the map.</Typography>
                </div>

                <div id="map">
                    <Map
                        onLoad={handleMapLoad}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={initialViewState}
                        style={{ width: 900, height: 412.5 }}
                        mapStyle="mapbox://styles/mapbox/streets-v9"
                        interactiveLayerIds={["grid"]}
                        onClick={handleMapClick}
                    >
                        {mapMarker &&
                            <Marker longitude={mapMarker[0]} latitude={mapMarker[1]}>
                            </Marker>
                        }

                        <Source id="grid" type="geojson" data="/data/wrf_3km_4326.geojson">
                            <Layer {...gridLayer} />
                        </Source>
                        <NavigationControl position="bottom-left" />
                        <GeocoderControl zoom={13} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''} position="top-left" />
                    </Map>
                </div>
            </div>
        )
    }
)

export default MapboxMap