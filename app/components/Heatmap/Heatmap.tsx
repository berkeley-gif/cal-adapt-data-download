'use client'

import * as d3 from 'd3'
import { ScaleSequential } from 'd3-scale';
import React, { useState, useEffect, useRef, useMemo } from 'react'
import Switch from '@mui/material/Switch'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'

import Renderer from '@/app/components/Heatmap/Rendererer'
import MapTooltip from '@/app/components/Heatmap/MapTooltip'

import { ColorLegend } from "../Solar-Drought-Visualizer/ColorLegend"
import '@/app/styles/dashboard/heatmap.scss'

const colorSwitchLabel = { inputProps: { 'aria-label': 'Color Palette switch' } };

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

    // alternative color for colorblind people
    const [useAltColor, setUseAltColor] = useState(false)

    if (!data) {
        return null;
    }

    // Flatten data and filter out undefined values
    const flatData: number[] = data.data.flat().filter((d: number | undefined): d is number => d !== undefined)
    const min = d3.min(flatData) as number | null
    const max = d3.max(flatData) as number | null

    const defColorScale = useMemo(() => {
        return d3
            .scaleSequential<string>()
            .interpolator(d3.interpolateRgbBasis(['#FD6A55', '#FEAB7D', '#EEE8DA']))
            .domain([min ?? 0, max ?? 1]);
    }, [min, max])

    const altColorScale = useMemo(() => {
        return d3
            .scaleSequential<string>()
            .interpolator(d3.interpolateRgbBasis(['#e6550d', '#fdae6b', '#fee6ce']))
            .domain([min ?? 0, max ?? 1]);
    }, [min, max])

    // Dynamically select color scale
    const colorScale = useMemo(() => (useAltColor ? altColorScale : defColorScale), [useAltColor, defColorScale, altColorScale]);

    const handleColorChange = () => {
        setUseAltColor((prev) => !prev);
    };

    // **Fallback to prevent colorScale errors**
    if (!colorScale) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ position: 'relative' }}>
            <div className="color-scale-toggle">
                <FormGroup>
                    <FormControlLabel control={<Switch onChange={handleColorChange} color="secondary" {...colorSwitchLabel} />} label="Alternative color palette" />
                </FormGroup></div>
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

