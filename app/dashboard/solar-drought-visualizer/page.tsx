import React from 'react'

import MapboxMap from '@/app/components/Solar-Drought-Visualizer/MapboxMap'

export async function getData() {
    // retrieve data for the tool 
}

export default async function DataDownloadWrapper() {
    const data: any = await getData()

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool_map">
                <MapboxMap></MapboxMap>
            </div>
            Solar Drought Visualization Tool
        </div>
    )
}