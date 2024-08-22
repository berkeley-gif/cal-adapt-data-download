'use client'

import React, { useState, useEffect } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import SidePanel from '@/app/components/Dashboard/RightSidepanel'
import { useSidepanel } from '@/app/context/SidepanelContext'
import CloseIcon from '@mui/icons-material/Close'
import Fade from '@mui/material/Fade'

import Map from '@/app/components/Solar-Drought-Visualizer/Map'
import Heatmap from '@/app/components/Heatmap/Heatmap'
import { dummyData } from '@/app/components/Solar-Drought-Visualizer/Data'
import { Typography } from '@mui/material'
import VizPrmsForm from './VisualizationParamsForm'
import { ApiResponse } from './DataType'


export default function SolarDroughtViz({ data }: any ) {
    // const data: any = await getData()
    const { open, toggleOpen } = useSidepanel()

    const [globalWarmingSelected, setGlobalWarmingSelected] = useState('1.2')

    const globalWarmingList = ['1.2', '1.5', '2.0']

    const [photoConfigSelected, setPhotoConfigSelected] = useState('Utility Configuration')

    const photoConfigList = ['Utility Configuration', 'Distributed Configuration']

    const onFormDataSubmit = async () => {
        const apiUrl = 'https://d3pv76zq0ekj5q.cloudfront.net/search'

        console.log('onformdatasubmit')
    }

    useEffect(() => {
        console.log(data)
    }, [])

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool__map">
                <Map></Map>
            </div>
            <Typography variant="h4">Solar Drought Visualizer</Typography>
            <div className="solar-drought-tool__heatmap">
                <div className="flex-params">
                    <div className="flex-params__item">
                        <Typography className="option-group__title" variant="body2">Location</Typography>
                        <Typography variant="body1">Alameda County</Typography>
                    </div>
                    <div className="flex-params__item">
                        <Typography className="option-group__title" variant="body2">Global Warming Level</Typography>
                        <Typography variant="body1">{globalWarmingSelected}</Typography>
                    </div>
                    <div className="flex-params__item">
                        <Typography className="option-group__title" variant="body2">Photovoltaic Configuration</Typography>
                        <Typography variant="body1">{photoConfigSelected}</Typography>
                    </div>

                </div>
                <Heatmap width={900} height={480} data={data} />
            </div>
            <div className="solar-drought-tool__sidepanel">
                {/** Sidepanel */}
                <SidePanel
                    anchor="right"
                    variant="temporary"
                    open={open}
                    onClose={toggleOpen}
                >
                    <Tooltip
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        title="Close the sidebar"
                    >
                        <IconButton onClick={toggleOpen}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <VizPrmsForm
                        onFormDataSubmit={onFormDataSubmit}
                        photoConfigSelected={photoConfigSelected}
                        setPhotoConfigSelected={setPhotoConfigSelected}
                        photoConfigList={photoConfigList}
                        globalWarmingList={globalWarmingList}
                        globalWarmingSelected={globalWarmingSelected}
                        setGlobalWarmingSelected={setGlobalWarmingSelected}>
                    </VizPrmsForm>
                </SidePanel>
            </div>
        </div>
    )
}