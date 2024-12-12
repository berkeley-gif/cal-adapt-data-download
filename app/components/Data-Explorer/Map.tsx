'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

// The map props are inherited from the parent DataExplorer and can be used to set and access the Data Explorer's variables
type MapProps = {
    metricSelected: number;
    gwlSelected: number;
    data: any;
    setMetricSelected: (metric: number) => void,
    setGwlSelected: (gwl: number) => void,
}

export default function Map({ metricSelected, gwlSelected, data }: MapProps) {
    return (
        <div>
            <p>{metricSelected}</p>
            <p>{gwlSelected}</p>
            Map Code
        </div>
    )
}

