'use client'

import React, { useState, useEffect, useRef } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Accordion, { AccordionSlots } from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Fade from '@mui/material/Fade'
import CloseIcon from '@mui/icons-material/Close'
import EditLocationOutlinedIcon from '@mui/icons-material/EditLocationOutlined';
import Alert from '@mui/material/Alert'
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}
import Button from '@mui/material/Button'

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

    const heatmapSection = useRef<HTMLDivElement>(null)

    const [globalWarmingSelected, setGlobalWarmingSelected] = useState('2')
    const globalWarmingList = ['2']
    const [photoConfigSelected, setPhotoConfigSelected] = useState('Utility Configuration')
    const photoConfigList = ['Utility Configuration', 'Distributed Configuration']
    const [configStr, setConfigStr] = useState<string>('')
    const [queriedData, setQueriedData] = useState(null)
    const [isLocationSet, setIsLocationSet] = useState<boolean>(false)
    const [accordionExpanded, setAccordionExpanded] = useState(false)
    const mapRef = useRef<any>(null); // Ref for the Mapbox component
    const [mapMarker, setMapMarker] = useState<[number, number] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isPointValid, setIsPointValid] = useState<boolean>(false)

    // ACCORDION
    const expandMap = () => {
        setAccordionExpanded((prevExpanded: boolean) => !prevExpanded)
    }

    // SCROLL TO MAP
    const scrollToMap = () => {
        if (heatmapSection.current) {
            const top = heatmapSection.current.scrollTop
            heatmapSection.current.scroll({
                top: 0,
                behavior: 'smooth'
            });
        }
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

            if (queriedData.data[0][0]) {
                // Point is valid
                setIsPointValid(true)
                scrollToMap()
            } else {
                // Point is Invalid
                setIsPointValid(false)
            }
        }

    }, [queriedData])

    // IS LOADING
    useEffect(() => {
        if (!isLoading && !isPointValid) {
            console.log('map point invalid')
        }

    }, [isLoading])

    // Ensure the Mapbox map resizes when the accordion is expanded
    useEffect(() => {
        if (accordionExpanded && mapRef.current) {
            setTimeout(() => {
                mapRef.current?.resize(); // Force map resize after expansion
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
        if (!apiParams.point) {
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
            <div className="solar-drought-tool__intro"><Typography variant="h4">Solar Drought Visualizer</Typography>
                <Typography variant="body1">This tool shows when there are likely to be significant reductions in solar energy availability in the future. To be more specific, it shows the number of solar resource drought days (less than 40% average generation) per month throughout a representative 30-year period. </Typography>
                <a style={{ 'textDecoration': 'underline' }} href="https://docs.google.com/document/d/1HRISAkRb0TafiCSCOq773iqt2TtT2A9adZqDTAShvhE/edit?usp=sharing" target="_blank">Read more in the documentation</a>
            </div>

            {!isLocationSet &&
                <div className="solar-drought-tool__initial-map">
                    <Typography className="inline" variant="h5">Select a location to generate your visualization</Typography>
                    <div className="solar-drought-tool__map" style={{ 'marginTop': '10px' }}>
                        <MapboxMap mapMarker={mapMarker} setMapMarker={setMapMarker} ref={mapRef} locationSelected={apiParams.point} setLocationSelected={setLocationSelected}></MapboxMap>
                    </div>
                </div>
            }
            {isLocationSet &&
                <div ref={heatmapSection}>
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
                            <EditLocationOutlinedIcon />
                            <Typography className="inline" variant="h5" style={{ 'marginLeft': '10px' }}>Change your location</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="solar-drought-tool__map">
                                <MapboxMap mapMarker={mapMarker} setMapMarker={setMapMarker} ref={mapRef} locationSelected={apiParams.point} setLocationSelected={setLocationSelected}></MapboxMap>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>}

            <div className={'solar-drought-tool__heatmap' + (isLoading ? ' loading-screen' : '') + (!isLoading && !isPointValid ? ' invalid-point-screen' : '')} style={{ 'width': `${TOOL_WIDTH}px` }}>
                {queriedData && !isLoading && isPointValid &&
                    (<div>
                        <div className="flex-params">
                            <div className="flex-params__item">
                                <Typography className="option-group__title" variant="body2">Global Warming Level</Typography>
                                <Typography variant="body1">{globalWarmingSelected}°</Typography>
                            </div>
                            <div className="flex-params__item">
                                <Typography className="option-group__title" variant="body2">Photovoltaic Configuration</Typography>
                                <Typography variant="body1">{photoConfigSelected}</Typography>
                            </div>
                            <div className="flex-params__item">
                                <Typography className='inline' variant="subtitle1">Edit parameters</Typography>
                                <IconButton className='inline' onClick={toggleOpen}>
                                    <SettingsOutlinedIcon />
                                </IconButton>
                            </div>
                        </div>
                        <div className="alerts">
                            <Alert variant="purple" severity="info">Global models estimate that 2° global warming levels (GWL) will be reached between <strong>2037</strong> and <strong>2061</strong>
                                <div className="cta">
                                    <Button variant="contained" target="_blank" href="https://cal-adapt.org/blog/understanding-warming-levels">Learn more about GWL</Button>
                                </div>
                            </Alert>
                        </div>

                        <Heatmap width={TOOL_WIDTH} height={500} data={queriedData && queriedData} />
                    </div>)}
                {isLoading &&
                    (
                        <LoadingSpinner />
                    )
                }
                {!isLoading && !isPointValid && isLocationSet &&
                    (
                        <div>
                            <Alert variant="grey" severity="info">You have selected a location with land use or land cover restrictions. No data will be returned. <span className="underline" onClick={expandMap}><strong>Select another location</strong></span> to try again
                            </Alert>
                        </div>
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