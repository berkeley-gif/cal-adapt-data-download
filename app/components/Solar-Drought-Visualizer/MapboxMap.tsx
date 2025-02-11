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

const INITIAL_VIEW_STATE = {
    longitude: -120.4542,
    latitude: 37.4,
    zoom: 6
}

const GRID_FILL_COLOR = 'rgba(118, 150, 190, 0.8)'

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

        const initialViewState = INITIAL_VIEW_STATE

        // Forward the internal ref to the parent using useImperativeHandle
        useImperativeHandle(ref, () => mapRef.current as MapRef)

        const handleMapLoad = (e: any) => {
            const map = e.target
            mapRef.current = map
            setMapLoaded(true)
        }

        const handleMapResize = () => {
            if (mapRef.current) {
                const currentCenter = mapRef.current.getCenter()
                mapRef.current.setCenter(currentCenter)
            }
        }

        useEffect(() => {
            if (mapRef.current) {
                mapRef.current.on('resize', handleMapResize)
            }

            return () => {
                if (mapRef.current) {
                    mapRef.current.off('resize', handleMapResize)
                }
            }
        }, [])

        const handleLocationUpdate = (coordinates: [number, number]) => {
            if (mapRef.current) {
                const point = mapRef.current.project(coordinates)
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

        const handleMapClick = (e: MapMouseEvent) => {
            handleLocationUpdate([e.lngLat.lng, e.lngLat.lat])
        }

        const handleMarkerDragEnd = (e: { lngLat: { lng: number; lat: number } }) => {
            handleLocationUpdate([e.lngLat.lng, e.lngLat.lat])
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
                        GRID_FILL_COLOR,
                        'rgba(0, 0, 0, 0)'
                    ])
                }
            }
        }, [photoConfigSelected, mapLoaded])

        return (
            <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                        minZoom={5}
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
                {/* Legend Overlay */}
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