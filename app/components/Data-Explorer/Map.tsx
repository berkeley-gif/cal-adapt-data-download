'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@/app/styles/dashboard/mapbox-map.scss'
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Map, MapRef, Layer, Source, MapMouseEvent, NavigationControl, ScaleControl, LngLatBoundsLike } from 'react-map-gl'
import { throttle } from 'lodash'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Unstable_Grid2'
import { MapLegend } from './MapLegend'
import { MapPopup } from './MapPopup'
import LoadingSpinner from '../Global/LoadingSpinner'
import GeocoderControl from '../Solar-Drought-Visualizer/geocoder-control'


// remove me, for demo only v
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

const GWL_VALUES = ["1.5", "2.0", "2.5", "3.0"] as const;
// remove me, for demo only ^

const INITIAL_VIEW_STATE = {
    longitude: -120,
    latitude: 37.4,
    zoom: 5
} as const;

const MAP_BOUNDS: LngLatBoundsLike = [
    [-140, 20], // Southwest coordinates [lng, lat]
    [-100, 50]  // Northeast coordinates [lng, lat]
];

const THROTTLE_DELAY = 100 as const;
const BASE_URL = 'https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com' as const;
const RASTER_TILE_LAYER_OPACITY = 0.8 as const;

// edit me v
const VARIABLES = {
    'TX99p': {
        title: 'Maximum air temperature days exceeding 99th percentile',
        path: 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/TX99p/d02/TX99p.zarr',
        rescale: '1.18,35.19',
        colormap: 'oranges' // case sensitive
    },
    'R99p': {
        title: 'Absolute change in 99th percentile precipitation',
        path: 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/R99p/d02/R99p.zarr',
        rescale: '-4.866,39.417',
        colormap: 'blues'
    },
    'ffwige50': {
        title: 'Number of days with FFWI greater than 50',
        path: 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/ffwige50/d02/ffwige50.zarr',
        rescale: '-197.96,92.158',
        colormap: 'reds'
    }
} as const;
// edit me ^


type MapProps = {
    metricSelected: number;
    gwlSelected: number;
    data: any;
    setMetricSelected: (metric: number) => void,
    setGwlSelected: (gwl: number) => void,
}

type VariableKey = keyof typeof VARIABLES;

type TileJson = {
    tiles: string[];
    tileSize?: number;
};

const throttledFetchPoint = throttle(async (
    lng: number, 
    lat: number, 
    path: string, 
    variable: string,
    gwl: string,
    callback: (value: number | null) => void
) => {
    try {
        const response = await fetch(
            `${BASE_URL}/point/${lng},${lat}?` + 
            `url=${encodeURIComponent(path)}&` +
            `variable=${variable}`
        );
        
        if (response.ok) {
            const data = await response.json();
            const gwlIndex = GWL_VALUES.indexOf(gwl as typeof GWL_VALUES[number]);
            const value = data.data[gwlIndex];
            callback(value ?? null);
        }
    } catch (error) {
        console.error('Error fetching point data:', error);
        callback(null);
    }
}, THROTTLE_DELAY, { 
    leading: true,  // Execute on the leading edge (immediate first call)
    trailing: true  // Execute on the trailing edge (final call)
});

const MapboxMap = forwardRef<MapRef | undefined, MapProps>(
    ({ metricSelected, gwlSelected, data, setMetricSelected, setGwlSelected }, ref) => {
        
        // Refs
        const mapRef = useRef<MapRef | null>(null)

        // Forward the internal ref to the parent
        useImperativeHandle(ref, () => mapRef.current || undefined)

        // State
        const [mounted, setMounted] = useState(false)
        const [mapLoaded, setMapLoaded] = useState(false)
        const [tileJson, setTileJson] = useState<TileJson | null>(null)
        const [hoverInfo, setHoverInfo] = useState<{
            longitude: number;
            latitude: number;
            value: number | null;
        } | null>(null);

        // Effects
        useEffect(() => {
            setMounted(true)
        }, [])

        // Derived state
        const variableKeys = Object.keys(VARIABLES) as VariableKey[];
        const currentVariable = variableKeys[metricSelected] || variableKeys[0];
        const currentGwl = GWL_VALUES[gwlSelected] || GWL_VALUES[0];
        
        const currentVariableData = VARIABLES[currentVariable];
        if (!currentVariableData) {
            console.error('Invalid variable selected:', currentVariable);
            return null;
        }

        const currentColormap = currentVariableData.colormap;

        useEffect(() => {
            const fetchTileJson = async () => {
                const params = {
                    url: currentVariableData.path,
                    variable: currentVariable,
                    datetime: currentGwl,
                    rescale: currentVariableData.rescale,
                    colormap_name: currentColormap
                };

                const queryString = Object.entries(params)
                    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                    .join('&');

                const url = `${BASE_URL}/WebMercatorQuad/tilejson.json?${queryString}`;

                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    setTileJson(data);
                } catch (error) {
                    console.error('Failed to fetch TileJSON:', error);
                    console.error('Full URL:', url);
                }
            };
            fetchTileJson();
        }, [metricSelected, gwlSelected, currentVariable, currentVariableData, currentGwl]);

        const handleHover = (event: MapMouseEvent) => {
            if (!mapLoaded || !mapRef.current) {
                return;
            }

            const { lngLat: { lng, lat } } = event;
            
            throttledFetchPoint(
                lng, 
                lat, 
                VARIABLES[currentVariable].path,
                currentVariable,
                currentGwl,
                (value) => {
                    if (value !== null) {
                        setHoverInfo({
                            longitude: lng,
                            latitude: lat,
                            value
                        });
                    } else {
                        setHoverInfo(null);
                    }
                }
            );
        };

        useEffect(() => {
            return () => {
                throttledFetchPoint.cancel();
            };
        }, []);

        const isLoading = !mounted || !tileJson;

        const handleMapError = (event: any) => {
            // Prevent error from reaching console if it's a tile loading error
            if (event.error?.status === 404 && event.error.url?.includes('WebMercatorQuad')) {
                event.preventDefault();  // Stops the error from being logged
                return;
            }
            
            // Let other errors through to console
            console.error(event.error);
        };

        if (!mounted) {
            return (
                <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1 }}>
                    <Box sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)'
                    }}>
                        <LoadingSpinner />
                    </Box>
                </Grid>
            );
        }

        const handleMapLoad = (e: any) => {
            const map = e.target;
            mapRef.current = map;
            setMapLoaded(true);
        }

        return (
            <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1, position: 'relative' }}>
                {/* remove v */}
                <Box>
                    {/* <p>{metricSelected}</p>
                    <p>{gwlSelected}</p> */}

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="variable-select-label">Variable</InputLabel>
                        <Select
                            labelId="variable-select-label"
                            value={currentVariable}
                            label="Variable"
                            onChange={(e) => {
                                const newIndex = variableKeys.indexOf(e.target.value as VariableKey);
                                setMetricSelected(newIndex);
                            }}
                        >
                            {Object.entries(VARIABLES).map(([key, value]) => (
                                <MenuItem key={key} value={key}>
                                    {value.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="gwl-select-label">GWL</InputLabel>
                        <Select
                            labelId="gwl-select-label"
                            value={gwlSelected}
                            label="GWL"
                            onChange={(e) => setGwlSelected(Number(e.target.value))}
                        >
                            {GWL_VALUES.map((gwl, index) => (
                                <MenuItem key={gwl} value={index}>
                                    {gwl}°C
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {/* remove ^ */}

                <Box sx={{ height: '100%', position: 'relative' }} id="map">
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {isLoading && (
                            <Box sx={{ 
                                position: 'absolute', 
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                zIndex: 9999
                            }}>
                                <LoadingSpinner />
                            </Box>
                        )}
                        <Map
                            ref={mapRef}
                            onLoad={handleMapLoad}
                            onMouseMove={handleHover}
                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                            initialViewState={INITIAL_VIEW_STATE}
                            mapStyle="mapbox://styles/mapbox/light-v11"
                            scrollZoom={false}
                            minZoom={3.5}
                            maxBounds={MAP_BOUNDS}
                            style={{ width: "100%", height: "100%" }}
                            onError={handleMapError}
                        >
                            {tileJson && (
                                <Source 
                                    id="raster-source"
                                    type="raster"
                                    tiles={tileJson.tiles}
                                    tileSize={tileJson.tileSize || 256}
                                >
                                    <Layer
                                        id="tile-layer"
                                        type="raster"
                                        paint={{ 'raster-opacity': RASTER_TILE_LAYER_OPACITY }}
                                    />
                                </Source>
                            )}
                            <GeocoderControl 
                                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''}
                                zoom={13} 
                                position="top-right"
                                collapsed={true}
                                clearOnBlur={true}
                                onResult={(e: any) => {
                                    const { result } = e;
                                    const location = result && (
                                        result.center || 
                                        (result.geometry?.type === 'Point' && result.geometry.coordinates)
                                    );
                                    if (location && mapRef.current) {
                                        mapRef.current.flyTo({
                                            center: location,
                                            zoom: 10
                                        });
                                    }
                                }}
                            />
                            <NavigationControl position="top-right" />
                            <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
                            {hoverInfo && (
                                <MapPopup
                                    longitude={hoverInfo.longitude}
                                    latitude={hoverInfo.latitude}
                                    value={hoverInfo.value || 0}
                                />
                            )}
                        </Map>
                        <div style={{ 
                            position: 'absolute',
                            bottom: 40,
                            left: 40,
                            zIndex: 2
                        }}>
                            <MapLegend 
                                colormap={currentColormap}
                                min={parseFloat(currentVariableData.rescale.split(',')[0])}
                                max={parseFloat(currentVariableData.rescale.split(',')[1])}
                                title={currentVariableData.title}
                            />
                        </div>
                    </div>
                </Box>
            </Grid>
        )
    }
)

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap

