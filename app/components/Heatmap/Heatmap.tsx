'use client'

import * as d3 from 'd3'
import React, { useState, useEffect, useRef, useMemo } from 'react'

import Renderer from '@/app/components/Heatmap/Rendererer'
import MapTooltip from '@/app/components/Heatmap/MapTooltip'
import { ApiResponse } from '../Solar-Drought-Visualizer/DataType'
import { ColorLegend } from "../Solar-Drought-Visualizer/ColorLegend"
import '@/app/styles/dashboard/heatmap.scss'

const MARGIN = { top: 10, right: 10, bottom: 30, left: 30 }

type HeatmapProps = {
    width: number;
    height: number;
    data: any;
}

export type InteractionData = {
    xLabel: string;
    yLabel: string;
    xPos: number;
    yPos: number;
    value: number;
}

export default function Heatmap({ width, height, data }: HeatmapProps) {
    // cell that is being hovered, for tooltips
    const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null)

    const flatData: number[] = data.data.flat()
    const min = d3.min(flatData)
    const max = d3.max(flatData)

    const colorScale =
        d3.scaleSequential<string>()
            .interpolator(d3.interpolateRgbBasis(["#FD6A55", "#FFFFFF", "#25c6da"]))
            .domain([min, max])

    return (
        <div style={{ position: 'relative' }}>
            <Renderer
                width={width}
                height={height}
                data={data}
                setHoveredCell={setHoveredCell}
                colorScale={colorScale}
            />
            <MapTooltip interactionData={hoveredCell} width={width} height={height} />
            <div className="color-legend" style={{ width: width }}>
                <ColorLegend width={400} height={100} colorScale={colorScale} min={min} max={max} />
            </div>
        </div>
    )
}

