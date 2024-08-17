'use client'

import React, { useState } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import SidePanel from '@/app/components/Dashboard/RightSidepanel'
import { useSidepanel } from '@/app/context/SidepanelContext'
import CloseIcon from '@mui/icons-material/Close'
import Fade from '@mui/material/Fade'

import Map from '@/app/components/Solar-Drought-Visualizer/Map'
import Heatmap from '@/app/components/Heatmap/Heatmap'
import { data } from '@/app/components/Solar-Drought-Visualizer/Data'
import { Typography } from '@mui/material'
import VizPrmsForm from './VisualizationParamsForm'


export default function SolarDroughtViz() {
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

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool__map">
                <Map></Map>
            </div>
            <Typography variant="h4">Solar Drought Visualizer</Typography>
            <div className="solar-drought-tool__heatmap">
                <Heatmap width={550} height={481} data={data} />
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