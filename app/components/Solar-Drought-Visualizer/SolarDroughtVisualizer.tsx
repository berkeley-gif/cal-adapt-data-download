'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Accordion, { AccordionSlots } from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Fade from '@mui/material/Fade'
import CloseIcon from '@mui/icons-material/Close'
import EditLocationOutlinedIcon from '@mui/icons-material/EditLocationOutlined'
import Alert from '@mui/material/Alert'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl } from '@mui/material'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'

declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}
import Button from '@mui/material/Button'
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import SidePanel from '@/app/components/Dashboard/RightSidePanel'
import { useSidepanel } from '@/app/context/SidepanelContext'
import { usePhotoConfig } from '@/app/context/PhotoConfigContext'

import { useDidMountEffect } from "@/app/utils/hooks"

import MapboxMap from '@/app/components/Solar-Drought-Visualizer/MapboxMap'
import Heatmap from '@/app/components/Heatmap/Heatmap'
import VizPrmsForm from './VisualizationParamsForm'
import { ApiResponse } from './DataType'
import '@/app/styles/dashboard/solar-drought-visualizer.scss'
import LoadingSpinner from '../Global/LoadingSpinner'

const MAP_HEIGHT = 615
const HEATMAP_HEIGHT = 500
const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

type Location = [number, number]
type apiParams = {
    point: Location | null,
    configQueryStr: string,
}
type LocationStatus = 'none' | 'data' | 'no-data'

interface QueriedData {
    data: number[][]
}

const MenuProps: any = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "center"
    },
    transformOrigin: {
        vertical: "top",
        horizontal: "center"
    },
    variant: "menu"
}

export default function SolarDroughtViz() {
    // Context
    const { open, toggleOpen } = useSidepanel()
    const { photoConfigSelected, photoConfigList } = usePhotoConfig()

    // Map & location state
    const mapRef = useRef<any>(null)
    const [apiParams, setApiParams] = useState<apiParams>({ point: null, configQueryStr: 'srdu' })
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('none')
    const [isPointValid, setIsPointValid] = useState<boolean>(false)
    const [mapMarker, setMapMarker] = useState<[number, number] | null>(null)

    // Heatmap state
    const heatmapContainerRef = useRef<HTMLDivElement>(null)
    const [heatmapWidth, setHeatmapWidth] = useState(0)
    const [queriedData, setQueriedData] = useState<QueriedData | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [reverseColorMap, setReverseColorMap] = useState(false)
    const [useAltColor, setUseAltColor] = useState(false)

    // UI state
    const [accordionExpanded, setAccordionExpanded] = useState(true)

    // Derived state
    const configStr = useMemo(() => {
        return photoConfigSelected === 'Utility Configuration' ? 'srdu' : 'srdd'
    }, [photoConfigSelected])

    // TEMP: for color ramp options
    const [currentColorMap, setCurrentColorMap] = useState<string>('Oranges')

    const customColorMapList: string[] = [
        'Oranges', 'Purples', 'Reds', 'Turbo', 'Viridis', 'Inferno', 'Magma', 'Cividis', 'Warm', 'Cool', 'CubehelixDefault', 'BuGn',
        'BuPu', 'GnBu', 'OrRd', 'PuBuGn', 'PuBu', 'PuRd', 'RdPu', 'YlGnBu', 'YlGn', 'YlOrBr', 'YlOrRd'
    ]

    // Parameters state
    const [isColorRev, setIsColorRev] = useState<boolean>(false)
    const [globalWarmingSelected, setGlobalWarmingSelected] = useState('2')
    const globalWarmingList = ['2']

    // Effect Hooks
    useEffect(() => {
        if (JSON.stringify(prevApiParams.current) !== JSON.stringify(apiParams)) {
            onFormDataSubmit()
        }
        prevApiParams.current = apiParams
    }, [apiParams, onFormDataSubmit])

    useEffect(() => {
        if (queriedData) {
            setIsLoading(false)
            setIsPointValid(true)
        }
    }, [queriedData])

    useEffect(() => {
        if (!isLoading && !isPointValid) {
            console.log('map point invalid')
        }
    }, [isLoading, isPointValid])

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.resize()
        }
    }, [accordionExpanded])

    useEffect(() => {
        if (!heatmapContainerRef.current) return
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setHeatmapWidth(entry.contentRect.width)
            }
        })
        resizeObserver.observe(heatmapContainerRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [heatmapContainerRef])

    // Handlers
    const handleAccordionChange = () => {
        if (apiParams.point !== null) {
            setAccordionExpanded(!accordionExpanded)
        }
    }

    // API PARAMS
    const prevApiParams = useRef<apiParams>(apiParams)

    const onFormDataSubmit = useCallback(async () => {
        if (!apiParams.point) {
            return
        }

        setIsLoading(true)

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
    }, [apiParams, configStr])

    function setLocationSelected(point: Location | null) {
        if (!point) {
            setLocationStatus('none')
            updateApiParams({ point: null })
            return
        }

        // Get the grid value at this point
        if (mapRef.current) {
            const mapboxPoint = mapRef.current.project(point)
            const features = mapRef.current.queryRenderedFeatures(mapboxPoint, {
                layers: ['grid']
            })

            if (features && features.length > 0) {
                const selectedFeature = features[0]
                const maskAttribute = photoConfigSelected === 'Utility Configuration' ? 'srdumask' : 'srddmask'
                const gridValue = selectedFeature.properties?.[maskAttribute]
                
                // Set status based on grid value
                setLocationStatus(gridValue === 1 ? 'data' : 'no-data')
                updateApiParams({ point })
                
                // Collapse accordion if we have valid data
                if (gridValue === 1) {
                    setAccordionExpanded(false)
                }
            }
        }
    }

    function updateApiParams(newParams: Partial<apiParams>) {
        setApiParams(prevParams => ({
            ...prevParams,
            ...newParams
        }))
    }

    const handleColorChange = () => {
        setUseAltColor((prev) => !prev)
    }

    const handleSummaryClick = (event: React.MouseEvent) => {
        if (apiParams.point === null) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    return (
        <Box className="solar-drought-tool tool-container tool-container--padded" aria-label="Solar Drought Visualizer" role="region">

            {/* Intro section */}
            <Box className="solar-drought-tool__intro" style={{ 'maxWidth': '860px' }}>
                <Typography variant="h4" aria-label="Solar Drought Visualizer Title">Solar Drought Visualizer</Typography>
                <Typography variant="body1" aria-label="Description of the tool">This tool shows when there are likely to be significant reductions in solar energy availability in the future. To be more specific, it shows the number of solar resource drought days (less than 40% average generation) per month throughout a representative 30-year period. </Typography>
                <Typography variant="body1">
                    <a style={{ 'textDecoration': 'underline', 'display': 'inline-block' }} href="https://docs.google.com/document/d/1HRISAkRb0TafiCSCOq773iqt2TtT2A9adZqDTAShvhE/edit?usp=sharing" target="_blank" aria-label="Read more in the documentation">Read more in the documentation</a>
                </Typography>
            </Box>

            {/* Main viz content */}
            <Grid container xs={12}>
                {/* Heatmap parameters section */}
                <Grid xs={locationStatus !== 'none' ? 12 : 0} sx={{ display: locationStatus !== 'none' ? 'block' : 'none', transition: 'all 0.3s ease' }}>
                    {queriedData && !isLoading && isPointValid &&
                        (<Box>
                            <Box className="flex-params">
                                <Box className="flex-params__item">
                                    <Typography className="option-group__title" variant="body2" aria-label="Global Warming Level">Global Warming Level</Typography>
                                    <Typography variant="body1" aria-label={`Selected Global Warming Level: ${globalWarmingSelected}`}>{globalWarmingSelected}°</Typography>
                                </Box>
                                <Box className="flex-params__item">
                                    <Typography className="option-group__title" variant="body2" aria-label="Photovoltaic Configuration">Photovoltaic Configuration</Typography>
                                    <Typography variant="body1" aria-label={`Selected Photovoltaic Configuration: ${photoConfigSelected}`}>{photoConfigSelected}</Typography>
                                </Box>
                                <Box className="flex-params__item">
                                    <Typography className='inline' variant="subtitle1" aria-label="Edit parameters">Edit parameters</Typography>
                                    <IconButton className='inline' onClick={toggleOpen} aria-label="Open settings">
                                        <SettingsOutlinedIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Global warming level information */}
                            <Box className="alerts" sx={{ maxWidth: '100%' }}>
                                <Alert variant="filled" severity="info" color="info" aria-label="Global models estimate information">Global models estimate that 2° global warming levels (GWL) will be reached between <strong>2037</strong> and <strong>2061</strong>
                                    <Box className="cta">
                                        <Button variant="contained" target="_blank" href="https://cal-adapt.org/blog/understanding-warming-levels" aria-label="Learn more about GWL">Learn more about GWL</Button>
                                    </Box>
                                </Alert>
                            </Box>
                        </Box>
                        )}
                </Grid>
            </Grid>
            <Accordion
                expanded={accordionExpanded}
                onChange={handleAccordionChange}
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
                            '&.Mui-expanded': {
                                margin: 0,
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

                <Grid container xs={12} justifyContent="flex-end">
                    {/* Colormap toggle for heatmap */}
                    <Grid xs={locationStatus !== 'none' ? (accordionExpanded ? 12 : 8.5) : 0} sx={{ display: locationStatus !== 'none' ? 'block' : 'none', transition: 'all 0.3s ease' }}>
                        {isPointValid && (
                            <div className="color-scale-toggle">
                                <div className="option-group option-group--vertical">
                                    <div className="option-group__title">
                                        <Typography variant="body2">Custom Color Ramp</Typography>
                                    </div>

                                    <FormControl>
                                        <Select
                                            value={currentColorMap}
                                            onChange={(event: any) => {
                                                setCurrentColorMap(event.target.value as string)
                                            }}
                                            MenuProps={MenuProps}
                                            sx={{ mt: '15px', width: '220px' }}
                                        >
                                            {customColorMapList.map((colorRamp) => (
                                                <MenuItem key={colorRamp} value={colorRamp}>
                                                    <ListItemText primary={colorRamp} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div >
                                    {/*                                     <FormGroup>
                                        <FormControlLabel
                                            control={<Switch onChange={handleColorChange} color="secondary" />}
                                            label="Alternative color palette"
                                        />
                                    </FormGroup> */}
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Switch onChange={() => setIsColorRev(!isColorRev)} color="secondary" />}
                                            label="Reverse color palette"
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                        )}
                    </Grid>

                    {/* Locator map instruction section */}
                    <Grid xs={12} sx={{ display: 'flex', justifyContent: accordionExpanded ? 'flex-start' : 'flex-end' }}>
                        <Box sx={{ width: accordionExpanded ? '100%' : 'auto' }}>
                            <AccordionSummary
                                onClick={handleSummaryClick}
                                expandIcon={apiParams.point !== null ? <ExpandMoreIcon /> : null}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                sx={{
                                    '& .MuiAccordionSummary-content': {
                                        marginTop: '20px',
                                        marginBottom: '20px',
                                        justifyContent: accordionExpanded ? 'flex-start' : 'flex-end',
                                    },
                                    width: '100%',
                                }}
                            >
                                <EditLocationOutlinedIcon aria-label="Edit location" />
                                <Typography
                                    className="inline"
                                    variant="h5"
                                    style={{
                                        'marginLeft': '10px',
                                    }}
                                    aria-label={locationStatus !== 'none' ? "Change your location" : "Select your location"}
                                >
                                    {locationStatus !== 'none' ? "Change your location" : "Select your location"}
                                </Typography>
                            </AccordionSummary>
                        </Box>
                    </Grid>

                    {/* Heatmap section */}
                    <Grid xs={accordionExpanded ? 0 : 8.5}
                        sx={{
                            maxWidth: '100%',
                            pr: 4,
                            marginLeft: 'auto',
                            paddingRight: 0,
                        }}
                    >
                        {!isLoading && locationStatus === 'no-data' && (
                            <Box sx={{ marginBottom: '30px' }}>
                                <Alert variant="grey" severity="info">
                                    You have selected a location with land use or land cover restrictions. No data will be returned.&nbsp;
                                    <span
                                        onClick={accordionExpanded ? undefined : handleAccordionChange}
                                        aria-label="Select another location"
                                    >
                                        <strong>Select another location </strong>
                                    </span>
                                    to try again
                                </Alert>
                            </Box>
                        )}
                        <Box
                            ref={heatmapContainerRef}
                            className={'solar-drought-tool__heatmap' + (isLoading ? ' loading-screen' : '') + (!isLoading && !isPointValid ? ' invalid-point-screen' : '')}
                            style={{ display: accordionExpanded ? 'none' : 'block' }}
                        >
                            {!isLoading && isPointValid &&
                                (
                                    <Heatmap
                                        width={heatmapWidth}
                                        height={HEATMAP_HEIGHT}
                                        data={queriedData && queriedData}
                                        useAltColor={useAltColor}
                                        aria-label="Heatmap visualization"
                                        currentColorMap={currentColorMap}
                                        isColorRev={isColorRev}
                                    />
                                )
                            }
                            {isLoading &&
                                (
                                    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <LoadingSpinner aria-label="Loading heatmap data" />
                                    </Box>
                                )
                            }
                        </Box>
                    </Grid>

                    {/* Locator map section */}
                    <Grid xs={accordionExpanded ? 12 : 3.5} sx={{ alignItems: 'flex-end' }}>
                        <AccordionDetails
                            className="custom-accordion-details"
                            sx={{
                                paddingTop: '0px',
                            }}
                        >
                            <Box className="solar-drought-tool__map" style={{ width: '100%' }}>
                                <MapboxMap
                                    mapMarker={mapMarker}
                                    setMapMarker={setMapMarker}
                                    ref={mapRef}
                                    locationSelected={apiParams.point}
                                    setLocationSelected={setLocationSelected}
                                    height={MAP_HEIGHT}
                                    aria-label="Map for selecting location of heatmap data"
                                />
                            </Box>
                        </AccordionDetails>
                    </Grid>
                </Grid>
            </Accordion>

            {/** Sidepanel */}
            <Box className="solar-drought-tool__sidepanel">
                <SidePanel
                    anchor="right"
                    variant="temporary"
                    open={open}
                    onClose={toggleOpen}
                    aria-label="Settings side panel"
                >
                    <Tooltip
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        title="Close the sidebar"
                    >
                        <IconButton onClick={toggleOpen} aria-label="Close settings sidebar">
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <VizPrmsForm
                        onFormDataSubmit={onFormDataSubmit}
                        globalWarmingList={globalWarmingList}
                        globalWarmingSelected={globalWarmingSelected}
                        setGlobalWarmingSelected={setGlobalWarmingSelected}
                        toggleOpen={toggleOpen}
                        aria-label="Visualization parameters form"
                    >
                    </VizPrmsForm>
                </SidePanel>
            </Box>
        </Box >
    )
}