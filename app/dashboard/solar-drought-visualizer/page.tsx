
import SolarDroughtViz from "@/app/components/Solar-Drought-Visualizer/SolarDroughtVisualizer"
import { ApiResponse } from "@/app/components/Solar-Drought-Visualizer/DataType"
import { PhotoConfigProvider } from "@/app/context/PhotoConfigContext"

export default async function SolarDroughtVizWrapper() {
    return (
        <PhotoConfigProvider>
            <SolarDroughtViz></SolarDroughtViz>
        </PhotoConfigProvider>
    )
}