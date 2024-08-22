'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

import Renderer from '@/app/components/Heatmap/Rendererer'
import MapTooltip from '@/app/components/Heatmap/MapTooltip'
import { ApiResponse } from '../Solar-Drought-Visualizer/DataType'

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

    return (
        <div style={{ position: 'relative' }}>
            <Renderer
                width={width}
                height={height}
                data={data}
                setHoveredCell={setHoveredCell}
            />
            <MapTooltip interactionData={hoveredCell} width={width} height={height} />
        </div>
    )
}

