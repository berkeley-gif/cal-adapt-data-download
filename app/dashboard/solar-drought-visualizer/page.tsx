
import SolarDroughtViz from "@/app/components/Solar-Drought-Visualizer/SolarDroughtVisualizer"
import '@/app/styles/global/layout.scss'

export async function getData() {
    // retrieve data for the tool 
}

export default async function SolarDroughtVizWrapper() {

    return (
        <SolarDroughtViz></SolarDroughtViz>
    )

}