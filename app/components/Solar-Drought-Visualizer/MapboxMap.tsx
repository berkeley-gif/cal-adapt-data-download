'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import React, { useRef, useState, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import { Marker, Map, Layer, Source, MapMouseEvent, NavigationControl } from 'react-map-gl'
import { Button } from '@mui/material'
import GeocoderControl from './geocoder-control'
import * as turf from '@turf/turf'

type Location = [number, number]

type MapboxMapProps = {
    locationSelected: Location | null;
    setLocationSelected: (locationSelected: Location | null) => void;
}

export default function MapboxMap({ locationSelected, setLocationSelected }: MapboxMapProps) {

    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const [marker, setMarker] = useState<[number, number] | null>(null)


    const initialViewState = {
        longitude: -122.4,
        latitude: 37.8,
        zoom: 8
    }

    const handleMapLoad = (e: mapboxgl.MapEvent) => {
        mapRef.current = e.target as mapboxgl.Map;
        setMapLoaded(true);
    };

    const gridLayer: any = {
        id: 'grid',
        type: 'fill',
        paint: {
            'fill-color': 'transparent',
            'fill-opacity': 1.0,
            'fill-outline-color': '#000'
        }
    };

    const handleSubmit = () => {
        console.log('location selected', locationSelected);
    }

    const handleMapClick = (e: MapMouseEvent) => {
        if (e.features && e.features.length > 0) {
            var selectedFeature = e.features[0];
            const centroid = turf.centroid(selectedFeature).geometry.coordinates;

            setMarker([centroid[0], centroid[1]]);

            setLocationSelected(centroid as [number, number])

            //console.log(locationSelected, marker)

            // TODO clear geocoder search bar when map is clicked on
        }
    }

    return (
        <div className="map">
            <Typography className="inline" variant="h5">Select a location to generate your visualization</Typography>
            <Typography variant="body1">Click on the map, or search for an adress and then click on the map.</Typography>
            <div id="map">
                <Map
                    onLoad={handleMapLoad}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    initialViewState={initialViewState}
                    style={{ width: 700, height: 400 }}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                    interactiveLayerIds={["grid"]}
                    onClick={handleMapClick}
                >
                    {marker &&
                        <Marker longitude={marker[0]} latitude={marker[1]}>
                        </Marker>
                    }

                    <Source id="grid" type="geojson" data="/data/wrf_3km_4326.geojson">
                        <Layer {...gridLayer} />
                    </Source>
                    <NavigationControl position="bottom-left" />
                    <GeocoderControl zoom={13} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''} position="top-left" />
                </Map>
            </div>
            <br></br>
            {/**<Button onClick={() => { handleSubmit() }}
                variant="contained"
                disabled={locationSelected == null}
            >
                Generate Visualization &gt;</Button>**/}
        </div>
    )
}
