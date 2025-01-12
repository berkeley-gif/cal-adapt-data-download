'use client'

import React, { useState, useEffect, useRef } from 'react'

import { globalWarmingLevelsList } from '@/app/lib/data-explorer/global-warming-levels'
import { metricsList } from '@/app/lib/data-explorer/metrics'
import MapboxMap from './Map'
import Grid from '@mui/material/Unstable_Grid2'
type DataExplorerProps = {
    data: any
}

export default function DataExplorer({ data }: DataExplorerProps) {
    const [gwlSelected, setGwlSelected] = useState<number>(0)
    const [metricSelected, setMetricSelected] = useState<number>(0)

    return (
        <Grid container sx={{ height: '100%', flexDirection: "column", flexWrap: "nowrap", flexGrow: 1 }}>
            <MapboxMap gwlSelected={gwlSelected} setGwlSelected={setGwlSelected} metricSelected={metricSelected} setMetricSelected={setMetricSelected} data={data}></MapboxMap>
        </Grid>
    )
}