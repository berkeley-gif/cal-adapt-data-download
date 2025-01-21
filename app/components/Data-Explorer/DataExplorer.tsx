'use client'

import React, { useState, useEffect } from 'react'

import MapboxMap from './Map'
import Grid from '@mui/material/Unstable_Grid2'
import MapUI from './MapUI'

import { useLeftDrawer } from '../../context/LeftDrawerContext'
import { globalWarmingLevelsList } from '@/app/lib/data-explorer/global-warming-levels'
import { metricsList } from '@/app/lib/data-explorer/metrics'

type DataExplorerProps = {
    data: any;
}

export default function DataExplorer({ data }: DataExplorerProps) {
    const { toggleLeftDrawer } = useLeftDrawer()

    const [gwlSelected, setGwlSelected] = useState<number>(0)
    const [metricSelected, setMetricSelected] = useState<number>(0)

    // TEMP: for color ramp options
    const [customColorRamp, setCustomColorRamp] = useState<string>('')

    const customColorRampList: string[] = [
        'inferno', 'BuPu', 'viridis', 'coolwarm', 'berlin'
    ]

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            toggleLeftDrawer()
        }, 100)

        return () => clearTimeout(timeoutId)
    }, [])

    return (
        <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1 }}>
            <MapUI
                metricSelected={metricSelected}
                gwlSelected={gwlSelected}
                customColorRamp={customColorRamp}
                setCustomColorRamp={setCustomColorRamp}
                setMetricSelected={setMetricSelected}
                setGwlSelected={setGwlSelected}
                globalWarmingLevels={globalWarmingLevelsList}
                metrics={metricsList}
                customColorRampList={customColorRampList}
            />
            <MapboxMap
                gwlSelected={gwlSelected}
                setGwlSelected={setGwlSelected}
                metricSelected={metricSelected}
                setMetricSelected={setMetricSelected}
                globalWarmingLevels={globalWarmingLevelsList}
                metrics={metricsList}
            />
        </Grid>
    )
}