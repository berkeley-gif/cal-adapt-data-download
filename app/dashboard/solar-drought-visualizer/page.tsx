import React from 'react'

import Map from '@/app/components/Solar-Drought-Visualizer/Map'
import Heatmap from '@/app/components/Solar-Drought-Visualizer/Heatmap'
import { data } from '@/app/components/Solar-Drought-Visualizer/Data'

export async function getData() {
    // retrieve data for the tool 
}

export default async function DataDownloadWrapper() {
    // const data: any = await getData()

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool_map">
                <Map></Map>
            </div>
            <div className="solar-drought-tool__heatmap">
                <Heatmap width={1200} height={660} data={data} />
            </div>
            Solar Drought Visualization Tool
        </div>
    )
}