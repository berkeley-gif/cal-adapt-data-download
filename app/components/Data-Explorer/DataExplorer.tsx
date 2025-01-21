'use client'

import React, { useState, useEffect } from 'react'

import MapboxMap from './Map'
import Grid from '@mui/material/Unstable_Grid2'
import MapUI from './MapUI'

import { useLeftDrawer } from '../../context/LeftDrawerContext'
import { globalWarmingLevelsList } from '@/app/lib/data-explorer/global-warming-levels'

type DataExplorerProps = {
    data: any;
}

export default function DataExplorer({ data }: DataExplorerProps) {
    const { toggleLeftDrawer } = useLeftDrawer()

    const [gwlSelected, setGwlSelected] = useState<number>(0)
    const [metricSelected, setMetricSelected] = useState<number>(0)

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
                setMetricSelected={setMetricSelected}
                setGwlSelected={setGwlSelected}
                globalWarmingLevels={globalWarmingLevelsList}
            />
            <MapboxMap
                gwlSelected={gwlSelected}
                setGwlSelected={setGwlSelected}
                metricSelected={metricSelected}
                setMetricSelected={setMetricSelected}
                globalWarmingLevels={globalWarmingLevelsList}
            />
        </Grid>
    )
}