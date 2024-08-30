
import SolarDroughtViz from "@/app/components/Solar-Drought-Visualizer/SolarDroughtVisualizer"
import { ApiResponse } from "@/app/components/Solar-Drought-Visualizer/DataType"
import '@/app/styles/global/layout.scss'

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
        <SolarDroughtViz data={data}></SolarDroughtViz>
    )

}