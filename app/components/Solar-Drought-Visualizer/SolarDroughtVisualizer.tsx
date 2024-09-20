'use client'

import React, { useState, useEffect, useRef } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings'
import Accordion, { AccordionSlots } from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Fade from '@mui/material/Fade'
import CloseIcon from '@mui/icons-material/Close'

import SidePanel from '@/app/components/Dashboard/RightSidepanel'
import { useSidepanel } from '@/app/context/SidepanelContext'

import { useDidMountEffect } from "@/app/utils/hooks"

import MapboxMap from '@/app/components/Solar-Drought-Visualizer/MapboxMap'
import Heatmap from '@/app/components/Heatmap/Heatmap'
import { Typography } from '@mui/material'
import VizPrmsForm from './VisualizationParamsForm'
import { ApiResponse } from './DataType'
import '@/app/styles/dashboard/solar-drought-visualizer.scss'
import LoadingSpinner from '../Global/LoadingSpinner'

const TOOL_WIDTH = 1000

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
    const [isLocationSet, setIsLocationSet] = useState<boolean>(false)
    const [accordionExpanded, setAccordionExpanded] = useState(false)
    const mapRef = useRef<any>(null); // Ref for the Mapbox component
    const [mapMarker, setMapMarker] = useState<[number, number] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // ACCORDION
    const expandMap = () => {
        setAccordionExpanded((prevExpanded: boolean) => !prevExpanded)
    }

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
        setIsLocationSet(true)
    }

    // QUERIED DATA
    useEffect(() => {
        if (queriedData) {
            setIsLoading(false)
        }

    }, [queriedData])

    // Ensure the Mapbox map resizes when the accordion is expanded
    useEffect(() => {
        console.log('accordion expanded changed')
        if (accordionExpanded && mapRef.current) {
            console.log('accordion expanded & mapref current')
            setTimeout(() => {
                mapRef.current?.resize(); // Force map resize after expansion
                console.log('map resize')
            }, 300); // Delay to allow the accordion transition to complete
        }
    }, [accordionExpanded]);

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

        setIsLoading(true)
        setAccordionExpanded(false)
        
        const [long, lat] = apiParams.point
        const apiUrl = `https://2fxwkf3nc6.execute-api.us-west-2.amazonaws.com/point/${long},${lat}`

        const queryParams = new URLSearchParams({
            url: `s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/mon/${configStr}/d03`,
            variable: apiParams.configQueryStr
        })
        const fullUrl = `${apiUrl}?${queryParams.toString()}`

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
        <div className="solar-drought-tool" style={{ 'width': `${TOOL_WIDTH}px` }}>
            <div className="solar-drought-tool__intro"><Typography variant="h4">Solar Drought Visualizer</Typography></div>
            {!isLocationSet &&
                <div className="solar-drought-tool__initial-map">
                    <Typography className="inline" variant="h5">Select a location to generate your visualization</Typography>
                    <div className="solar-drought-tool__map">
                        <MapboxMap mapMarker={mapMarker} setMapMarker={setMapMarker} ref={mapRef} locationSelected={apiParams.point} setLocationSelected={setLocationSelected}></MapboxMap>
                    </div>
                </div>
            }
            {isLocationSet &&
                <Accordion
                    expanded={accordionExpanded}
                    onChange={expandMap}
                    slots={{ transition: Fade as AccordionSlots['transition'] }}
                    slotProps={{ transition: { timeout: 400 } }}
                    sx={[
                        accordionExpanded
                            ? {
                                '& .MuiAccordion-region': {
                                    height: 'auto',
                                },
                                '& .MuiAccordionDetails-root': {
                                    display: 'block',
                                },
                            }
                            : {
                                '& .MuiAccordion-region': {
                                    height: 0,
                                },
                                '& .MuiAccordionDetails-root': {
                                    display: 'none',
                                },
                            },
                    ]}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <Typography className="inline" variant="h5">Change your location</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="solar-drought-tool__map">
                            <MapboxMap mapMarker={mapMarker} setMapMarker={setMapMarker} ref={mapRef} locationSelected={apiParams.point} setLocationSelected={setLocationSelected}></MapboxMap>
                        </div>
                    </AccordionDetails>
                </Accordion>}
            <div className={'solar-drought-tool__heatmap' + (isLoading ? ' loading-screen' : '')} style={{ 'width': `${TOOL_WIDTH}px` }}>
                {queriedData && !isLoading &&
                    (<div>
                        <div className="flex-params">
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
                                <IconButton className='inline' onClick={toggleOpen}>
                                    <SettingsIcon />
                                </IconButton>
                            </div>
                        </div>
                        <Heatmap width={TOOL_WIDTH} height={500} data={queriedData && queriedData} />
                    </div>)}
                {isLoading &&
                    (
                        <LoadingSpinner />
                    )
                }
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
                        setGlobalWarmingSelected={setGlobalWarmingSelected}
                        toggleOpen={toggleOpen}>
                    </VizPrmsForm>
                </SidePanel>
            </div>

        </div >
    )
}