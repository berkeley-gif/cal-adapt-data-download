import React from 'react'

import DataDownload from '@/app/components/Data-Download-Tool/DataDownloadTool'
import '@/app/styles/dashboard/data-download-tool.scss'

async function getData() {
    const res = await fetch('https://d3pv76zq0ekj5q.cloudfront.net/collections/loca2-mon-county')

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export default async function DataDownloadWrapper() {
    const data: any = await getData()

    return (
        <DataDownload data={data}></DataDownload>
    )
}