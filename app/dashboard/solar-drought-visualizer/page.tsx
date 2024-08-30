
import MapboxMap from '@/app/components/Solar-Drought-Visualizer/MapboxMap'
import SolarDroughtViz from "@/app/components/Solar-Drought-Visualizer/SolarDroughtVisualizer"
import '@/app/styles/global/layout.scss'

import { ApiResponse } from "@/app/components/Solar-Drought-Visualizer/DataType"

export async function getData(): Promise<ApiResponse> {
    // retrieve data for the tool 
    const res = await fetch('https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/-120,38?url=s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/srdu/d03&variable=srdu')

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export default async function SolarDroughtVizWrapper() {
    const data: any = await getData()

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool_map">
                <MapboxMap></MapboxMap>
            </div>
            <SolarDroughtViz data={data}></SolarDroughtViz>
        </div>
    )

}