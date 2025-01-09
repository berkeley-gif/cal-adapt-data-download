'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Marker, Map, Layer, Source, MapMouseEvent, NavigationControl, MapRef, ScaleControl } from 'react-map-gl'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'

type MapProps = {
    metricSelected: number;
    gwlSelected: number;
    data: any;
    setMetricSelected: (metric: number) => void,
    setGwlSelected: (gwl: number) => void,
}

const MapboxMap = forwardRef<MapRef | null, MapProps>(
    ({ metricSelected, gwlSelected, data, setMetricSelected, setGwlSelected }, ref) => {
        const mapRef = useRef<MapRef | null>(null)
        const [mapLoaded, setMapLoaded] = useState(false)

        const initialViewState = {
            longitude: -122.4,
            latitude: 37.8,
            zoom: 8
        }

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current as MapRef)

        const handleMapLoad = (e: any) => {
            const map = e.target;
            mapRef.current = map;
            setMapLoaded(true);
        }

    return (
        <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1 }}>
            <Box>
                <p>{metricSelected}</p>
                <p>{gwlSelected}</p>
            </Box>
                <Box sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1, position: "relative" }} id="map">
                    <Map
                        ref={mapRef}
                        onLoad={handleMapLoad}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={initialViewState}
                        mapStyle="mapbox://styles/mapbox/streets-v9"
                        scrollZoom={false}
                        minZoom={3.5}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    >
                        <NavigationControl position="bottom-left" />
                        <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
                    </Map>
                </Box>
        </Grid>
    )
    }
)

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap


