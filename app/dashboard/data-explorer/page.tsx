import React from 'react'

import DataExplorer from '@/app/components/Data-Explorer/DataExplorer'

// Use this function to gather the initial map rendering data, using default values
async function getData() {
    // Not the right api, set to correct route
    const res = await fetch('https://d3pv76zq0ekj5q.cloudfront.net/collections/loca2-mon-county')

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export default async function DataExplorerWrapper() {
    const data: any = await getData()

    return (
        <DataExplorer data={data}></DataExplorer>
    )
}
