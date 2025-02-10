'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Marker, Map, MapMouseEvent, NavigationControl, ScaleControl, MapRef } from 'react-map-gl'
import GeocoderControl from './geocoder-control'
import * as turf from '@turf/turf'

import Fade from '@mui/material/Fade'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import HtmlTooltip from '../Global/HtmlTooltip'
import { usePhotoConfig } from '@/app/context/PhotoConfigContext'
import '@/app/styles/dashboard/mapbox-map.scss'

type Location = [number, number]

type MapboxMapProps = {
    locationSelected: Location | null;
    setLocationSelected: (locationSelected: Location | null) => void;
    mapMarker: [number, number] | null;
    setMapMarker: (marker: [number, number] | null) => void;
    width?: number;
    height: number;
}
const MapboxMap = forwardRef<MapRef | null, MapboxMapProps>(
    ({ locationSelected, setLocationSelected, mapMarker, setMapMarker, height }, ref) => {
        const { photoConfigSelected } = usePhotoConfig()

        const mapRef = useRef<MapRef | null>(null)
        const [mapLoaded, setMapLoaded] = useState(false)

        const initialViewState = {
            longitude: -120.4542,
            latitude: 37.0701,
            zoom: 6
        }

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current as MapRef)

        const handleMapLoad = (e: any) => {
            const map = e.target
            mapRef.current = map
            setMapLoaded(true)
        }

        const handleMapClick = (e: MapMouseEvent) => {
            const clickedPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat]

            if (mapRef.current) {
                const point = mapRef.current.project(clickedPoint)
                const features = mapRef.current.queryRenderedFeatures(point, {
                    layers: ['grid']
                })

                if (features && features.length > 0) {
                    const selectedFeature = features[0]
                    const centroid = turf.centroid(selectedFeature).geometry.coordinates
                    setMapMarker([centroid[0], centroid[1]])
                    setLocationSelected(centroid as [number, number])
                } else {
                    console.log('No features found at the clicked location.')
                }
            }
        }

        const handleMarkerDragEnd = (e: { lngLat: { lng: number; lat: number } }) => {
            if (mapRef.current) {
                const point = mapRef.current.project([e.lngLat.lng, e.lngLat.lat])
                const features = mapRef.current.queryRenderedFeatures(point, {
                    layers: ['grid']
                })

                if (features && features.length > 0) {
                    const selectedFeature = features[0]
                    const centroid = turf.centroid(selectedFeature).geometry.coordinates

                    setMapMarker([centroid[0], centroid[1]])
                    setLocationSelected(centroid as [number, number])
                }
            }
        }


        // Update grid layer nodata cells based on photoConfigSelected
        useEffect(() => {
            if (mapRef.current && mapLoaded) {
                const map = mapRef.current as unknown as mapboxgl.Map; // Type assertion to Mapbox GL JS Map
                const maskAttribute = photoConfigSelected === 'Utility Configuration' ? 'srdumask' : 'srddmask'

                if (map) {
                    map.setPaintProperty('grid', 'fill-color', [
                        'case',
                        ['==', ['get', maskAttribute], 0],
                        'rgba(128, 128, 128, 0.3)',
                        'rgba(0, 0, 0, 0)'
                    ])
                }
            }
        }, [photoConfigSelected, mapLoaded])

        return (
            <div className="map-container">
                <div id="map">
                    <Map
                        onLoad={handleMapLoad}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={initialViewState}
                        style={{ width: '100%', height }}
                        mapStyle="mapbox://styles/cal-adapt/cm4vhnvx7001601srckkbc5us"
                        interactiveLayerIds={['grid']}
                        onClick={handleMapClick}
                        scrollZoom={false}
                        attributionControl={false}
                        minZoom={3.5}
                    >
                        {mapMarker && (
                            <Marker
                                longitude={mapMarker[0]}
                                latitude={mapMarker[1]}
                                draggable={true}
                                onDragEnd={handleMarkerDragEnd}
                            />
                        )}
                        <NavigationControl position="bottom-left" />
                        <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
                        <GeocoderControl zoom={13} mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''} position="top-left" />
                    </Map>
                </div>
                {/* Legend */}
                <div className="map-container__legend">
                    <div className="map-container__legend-color-box"></div>

                    <p>Location with land restrictions</p>  

                    <HtmlTooltip
                        textFragment={
                            <React.Fragment>
                                <p>This location has land use or land cover restrictions. No data will be returned if selected.</p>
                            </React.Fragment>
                        }
                        iconFragment={<InfoOutlinedIcon />}
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        placement="right-end"
                    />
                </div>
            </div>
        )
    }
)

MapboxMap.displayName = 'MapboxMap'

export default MapboxMap