import React from 'react'

export async function getData() {
    // retrieve data for the tool 
}

export default async function DataDownloadWrapper() {
    const data: any = await getData()

    return (
        <div>Solar Drought Visualization Tool</div>
    )
}