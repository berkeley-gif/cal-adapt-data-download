'use client'

import React, { useState, useEffect, useRef } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings'

import SidePanel from '@/app/components/Dashboard/RightSidepanel'
import { useSidepanel } from '@/app/context/SidepanelContext'
import CloseIcon from '@mui/icons-material/Close'
import Fade from '@mui/material/Fade'
import { useDidMountEffect } from "@/app/utils/hooks"

import MapboxMap from '@/app/components/Solar-Drought-Visualizer/MapboxMap'
import Heatmap from '@/app/components/Heatmap/Heatmap'
import { Typography } from '@mui/material'
import VizPrmsForm from './VisualizationParamsForm'
import { ApiResponse } from './DataType'

type Location = [number, number]

type apiParams = {
    point: Location | null,
    configQueryStr: string,
}

export default function SolarDroughtViz() {
    const { open, toggleOpen } = useSidepanel()

    const [globalWarmingSelected, setGlobalWarmingSelected] = useState('1.5')
    const globalWarmingList = ['1.5']
    const [photoConfigSelected, setPhotoConfigSelected] = useState('Utility Configuration')
    const photoConfigList = ['Utility Configuration', 'Distributed Configuration']
    const [configStr, setConfigStr] = useState<string>('')
    const [queriedData, setQueriedData] = useState(null)

    // API PARAMS
    const [apiParams, setApiParams] = useState<apiParams>({
        point: null,
        configQueryStr: 'srdu',
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

    }, [configStr])

    // Ref to store previous state
    const prevApiParams = useRef<apiParams>(apiParams)

    useEffect(() => {
        // Compare previous and current state
        if (JSON.stringify(prevApiParams.current) !== JSON.stringify(apiParams)) {
            console.log(`apiparams have been updated from previous state`)
            onFormDataSubmit()
        }

        // Update the ref to the current apiParams
        prevApiParams.current = apiParams
    }, [apiParams])

    function setLocationSelected(point: Location | null) {
        updateApiParams({
            point: point
        })
    }

    function updateApiParams(newParams: Partial<apiParams>) {
        setApiParams(prevParams => ({
            ...prevParams,
            ...newParams
        }))
    }

    const onFormDataSubmit = async () => {
        // https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/-120,38?url=s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/srdu/d03&variable=srdu
        if (!apiParams.point) {
            console.log("Location is not selected")
            return
        }

        console.log(`location is selected at ${apiParams.point}`)
        const [long, lat] = apiParams.point
        const apiUrl = `https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/${long},${lat}`

        const queryParams = new URLSearchParams({
            url: `s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/${configStr}/d03`,
            variable: apiParams.configQueryStr
        })
        const fullUrl = `${apiUrl}?${queryParams.toString()}`

        console.log(`calling api at ${fullUrl}`)
        try {
            const res = await fetch(fullUrl)
            const newData = await res.json()

            if (newData) {
                setQueriedData(newData)
            }
        } catch (err) {
            console.log(err)
        }

    }

    return (
        <div className="solar-drought-tool">
            <div className="solar-drought-tool__intro"></div>
            <div className="solar-drought-tool__map">
                <MapboxMap locationSelected={apiParams.point} setLocationSelected={setLocationSelected}></MapboxMap>
            </div>
            {queriedData &&
                (<div className="solar-drought-tool__heatmap">
                    <Typography variant="h4">Solar Drought Visualizer</Typography>
                    <div className="flex-params">
                        <div className="flex-params__item">
                            <Typography className="option-group__title" variant="body2">Coordinates</Typography>
                            <Typography variant="body1">{apiParams.point?.toString()}</Typography>
                        </div>
                        <div className="flex-params__item">
                            <Typography className="option-group__title" variant="body2">Global Warming Level</Typography>
                            <Typography variant="body1">{globalWarmingSelected}</Typography>
                        </div>
                        <div className="flex-params__item">
                            <Typography className="option-group__title" variant="body2">Photovoltaic Configuration</Typography>
                            <Typography variant="body1">{photoConfigSelected}</Typography>
                        </div>
                        <div className="flex-params__item">
                            <Typography className='inline' variant="subtitle1">Edit parameters</Typography>
                            <IconButton className='inline' onClick={() => toggleOpen}>
                                <SettingsIcon />
                            </IconButton>
                        </div>
                    </div>
                    <Heatmap width={900} height={500} data={queriedData && queriedData} />
                </div>)}
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
                        setGlobalWarmingSelected={setGlobalWarmingSelected}
                        toggleOpen={toggleOpen}>
                    </VizPrmsForm>
                </SidePanel>
            </div>

        </div>
    )
}