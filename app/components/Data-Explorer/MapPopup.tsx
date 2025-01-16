'use client'

import { Popup } from 'react-map-gl'
import Typography from '@mui/material/Typography'

type MapPopupProps = {
    longitude: number
    latitude: number
    value: number
}

export const MapPopup = ({ longitude, latitude, value }: MapPopupProps) => {
    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            closeButton={false}
            anchor="bottom"
            className="map-popup"
        >
            <Typography variant="body2">
                {value.toFixed(2)}
            </Typography>
        </Popup>
    )
} 