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
import { Typography } from '@mui/material'
import VizPrmsForm from './VisualizationParamsForm'
import { ApiResponse } from './DataType'

type apiParamStrs = {
    pointQueryStr: string,
    configQueryStr: string,
}

export default function SolarDroughtViz({ data }: any) {
    const { open, toggleOpen } = useSidepanel()

    const [globalWarmingSelected, setGlobalWarmingSelected] = useState('1.5')
    const globalWarmingList = ['1.5']
    const [photoConfigSelected, setPhotoConfigSelected] = useState('Utility Configuration')
    const photoConfigList = ['Utility Configuration', 'Distributed Configuration']
    const [configStr, setConfigStr] = useState<string>('')
    const [queriedData, setQueriedData] = useState(data)

    // API PARAMS
    const [apiParams, setApiParams] = useState<apiParamStrs>({
        pointQueryStr: '',
        configQueryStr: '',
    })

    useEffect(() => {
        if (photoConfigSelected == "Utility Configuration") {
            setConfigStr('srdu')
        } else if (photoConfigSelected == "Distributed Configuration") {
            setConfigStr('srdd')
        }
    }, [photoConfigSelected])

    useEffect(() => {
        updateApiParams({
            configQueryStr: configStr
        })
        console.log('configStr: ' + configStr)
    }, [configStr])

    const [apiParamsChanged, setApiParamsChanged] = useState<boolean>(false)

    useEffect(() => {
        setApiParamsChanged(true)
    }, [apiParams])


    function updateApiParams(newParams: Partial<apiParamStrs>) {
        setApiParams(prevParams => ({
            ...prevParams,
            ...newParams
        }))
    }

    const onFormDataSubmit = async () => {
        // https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/-120,38?url=s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/srdu/d03&variable=srdu
        const apiUrl = 'https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/-120,38'

        console.log('apiparams')
        console.log(apiParams)
        const queryParams = new URLSearchParams({
            url: `s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/${configStr}/d03`,
            variable: apiParams.configQueryStr
        })

        const fullUrl = `${apiUrl}?${queryParams.toString()}`

        if (apiParamsChanged) {

            console.log(fullUrl)
            try {
                const res = await fetch(fullUrl)
                const newData = await res.json()

                if (newData) {
                    setQueriedData(newData)
                }
            } catch (err) {
                console.log(err)
            }
            setApiParamsChanged(false)
        }
    }

    useEffect(() => {
        // debugging code
        setConfigStr('sdru')
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
                        <Typography className="option-group__title" variant="body2">Coordinates</Typography>
                        <Typography variant="body1">[120,38]</Typography>
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
                <Heatmap width={900} height={500} data={queriedData} />
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