import { useMemo } from 'react'
import * as d3 from 'd3'
import { InteractionData } from './Heatmap'

const MARGIN = { top: 10, right: 10, bottom: 30, left: 30 }

type RendererProps = {
    width: number;
    height: number;
    data: { x: string; y: string, value: number | null }[];
    setHoveredCell: (hoveredCell: InteractionData | null) => void
}

export default function Renderer({ width, height, data, setHoveredCell }: RendererProps) {
    // bounds = area inside the axis
    const boundsWidth = width - MARGIN.right - MARGIN.left
    const boundsHeight = height - MARGIN.top - MARGIN.bottom

    // groups
    // list of unique items that will appear on the heatmap Y axis 
    const allYGroups = useMemo(() => [...new Set(data.map((d) => d.y))], [data])
    const allXGroups = useMemo(() => [...new Set(data.map((d) => d.x))], [data])

    // x and y scales
    const xScale = useMemo(() => {
        return d3
            .scaleBand()
            .range([0, boundsWidth])
            .domain(allXGroups)
            .padding(0.01);
    }, [data, width]);

    const yScale = useMemo(() => {
        return d3
            .scaleBand()
            .range([boundsHeight, 0])
            .domain(allYGroups)
            .padding(0.01);
    }, [data, height]);

    const filteredValues = data.map((d) => d.value).filter((value): value is number => value !== null)
    const [min, max] = d3.extent(filteredValues)

    if (!min || !max) {
        return null
    }

    const colorScale = d3
        .scaleSequential()
        .interpolator(d3.interpolateRgb('#FD6A55', '#EEE8DA'))
        .domain([min, max])

    const allShapes = data.map((d, i) => {
        const x = xScale(d.x)
        const y = yScale(d.y)

        if (d.value == null) {
            return
        }
        return (
            <rect
                key={i}
                r={4}
                x={xScale(d.x)}
                y={yScale(d.y)}
                width={xScale.bandwidth()}
                height={yScale.bandwidth()}
                opacity={1}
                fill={colorScale(d.value)}
                rx={0}
                stroke={"white"}
                onMouseEnter={(e) => {
                    setHoveredCell({
                        xLabel: 'group ' + d.x,
                        yLabel: 'group ' + d.y,
                        xPos: x + xScale.bandwidth() + MARGIN.left,
                        yPos: y + xScale.bandwidth() / 2 + MARGIN.top,
                        value: Math.round(d.value * 100) / 100,
                    })
                }}
                onMouseLeave={() => setHoveredCell(null)}
                cursor="pointer"
            />
        )
    })

    const xLabels = allXGroups.map((name, i) => {
        const xPos = xScale(name) ?? 0

        return (
            <text
                key={i}
                x={xPos + xScale.bandwidth() / 2}
                y={boundsHeight + 10}
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {name}
            </text>

        )
    })

    const yLabels = allYGroups.map((name, i) => {
        const yPos = yScale(name) ?? 0

        return (
            <text
                key={i}
                x={-5}
                y={yPos + yScale.bandwidth() / 2}
                textAnchor="end"
                dominantBaseline="end"
            >
                {name}
            </text>

        )
    })

    return (
        <div className="heatmap">
            <svg width={width} height={height}>
                <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
                >
                    {allShapes}
                    {xLabels}
                    {yLabels}
                </g>
            </svg>
        </div>
    )
}