
import SolarDroughtViz from "@/app/components/Solar-Drought-Visualizer/SolarDroughtVisualizer"
import { ApiResponse } from "@/app/components/Solar-Drought-Visualizer/DataType"
import '@/app/styles/global/layout.scss'

export default async function SolarDroughtVizWrapper() {
    return (
        <SolarDroughtViz></SolarDroughtViz>
    )
}