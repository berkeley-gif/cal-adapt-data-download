'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Marker, Map, Layer, Source, MapMouseEvent, NavigationControl, MapRef, ScaleControl } from 'react-map-gl'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import { MapLegend } from './MapLegend'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

type MapProps = {
    metricSelected: number;
    gwlSelected: number;
    data: any;
    setMetricSelected: (metric: number) => void,
    setGwlSelected: (gwl: number) => void,
}

const COLORMAPS = ["magma", "viridis", "inferno", "plasma", "cividis"] as const;

const MapboxMap = forwardRef<MapRef | null, MapProps>(
    ({ metricSelected, gwlSelected, data, setMetricSelected, setGwlSelected }, ref) => {
        const mapRef = useRef<MapRef | null>(null)
        const [mapLoaded, setMapLoaded] = useState(false)
        const [tileJson, setTileJson] = useState(null)
        const [colormap, setColormap] = useState<typeof COLORMAPS[number]>("magma")

        const initialViewState = {
            longitude: -120,
            latitude: 37.4,
            zoom: 5
        }

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current as MapRef)

        const handleMapLoad = (e: any) => {
            const map = e.target;
            mapRef.current = map;
            setMapLoaded(true);
        }

        useEffect(() => {
            const fetchTileJson = async () => {
                const url = `https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/WebMercatorQuad/tilejson.json?url=s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/TX99p/d02/TX99p.zarr&variable=TX99p&datetime=3.0&rescale=1.18,35.19&colormap_name=${colormap}`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    setTileJson(data);
                } catch (error) {
                    console.error('Failed to fetch TileJSON:', error);
                }
            };

            fetchTileJson();
        }, [metricSelected, colormap]);

    return (
        <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1 }}>
            <Box>
                <p>{metricSelected}</p>
                <p>{gwlSelected}</p>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>Colormap</InputLabel>
                    <Select
                        value={colormap}
                        label="Colormap"
                        onChange={(e) => setColormap(e.target.value as typeof COLORMAPS[number])}
                    >
                        {COLORMAPS.map((cm) => (
                            <MenuItem key={cm} value={cm}>
                                {cm.charAt(0).toUpperCase() + cm.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                        {tileJson && (
                            <Source type="raster" tiles={tileJson.tiles} tileSize={256}>
                                <Layer
                                    id="tile-layer"
                                    type="raster"
                                    paint={{ 'raster-opacity': 0.8 }}
                                />
                            </Source>
                        )}
                        <MapLegend 
                            colormap={colormap}
                            min={1.18}
                            max={35.19}
                            title="Temperature (°C)"
                        />
                    </Map>
                </Box>
        </Grid>
    )
    }
)

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap


