import React from 'react'

import Map from '@/app/components/Solar-Drought-Visualizer/Map'

export async function getData() {
    // retrieve data for the tool 
}

export default async function DataDownloadWrapper() {
    const data: any = await getData()

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool_map">
                <Map></Map>
            </div>
            Solar Drought Visualization Tool
        </div>
    )
}