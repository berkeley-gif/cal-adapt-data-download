import React from 'react'

import DataDownload from '@/app/components/Data Download Tool/DataDownloadTool';

export async function getData() {
    const res = await fetch('https://r0e5qa3kxj.execute-api.us-west-2.amazonaws.com/collections/loca2-mon-county')

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