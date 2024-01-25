'use client'

import Image from 'next/image'
import packageIcon from '@/public/img/icons/package.svg'
import sidebarBg from '@/public/img/photos/ocean-thumbnail.png'
import logo from '@/public/img/logos/cal-adapt-data-download.png'

import React, { useState, useEffect, useRef } from 'react'

import Alert from '@mui/material/Alert'
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import CssBaseline from '@mui/material/CssBaseline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import StartIcon from '@mui/icons-material/Start';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';


import SidePanel from './SidePanel'
import PackageForm from './PackageForm'
import './../../styles/components/dashboard.scss'

import { createOrStatement, stringToArray, arrayToCommaSeparatedString } from "@/app/utils/functions"
import { useDidMountEffect, useLocalStorageState } from "@/app/utils/hooks"


const DRAWER_WIDTH = 212

type varUrl = {
    name: string,
    href: string
}

type modelVarUrls = {
    model: string,
    vars: varUrl[]
}

type apiParamStrs = {
    countyQueryStr: string,
    scenariosQueryStr: string,
    modelQueryStr: string
}

interface DashboardProps {
    data: any,
    packagesData: any,
}

export default function Dashboard({ data, packagesData }: DashboardProps) {
    const [dataResponse, setDataResponse] = useState<modelVarUrls[]>([])

    // API PARAMS

    const [apiParams, setApiParams] = useState<apiParamStrs>({
        countyQueryStr: '',
        scenariosQueryStr: '',
        modelQueryStr: ''
    })
    const [apiParamsChanged, setApiParamsChanged] = useState<boolean>(false)
    useDidMountEffect(() => {

        setApiParamsChanged(true)
        setDataResponse([]) // Clear previous data

    }, [apiParams]);

    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false)
    const [overwriteDialogOpen, openOverwriteDialog] = useState<boolean>(false)
    const [tentativePackage, setTentativePackage] = useState<number>(0)
    const [sidebarState, setSidebarState] = useState<string>('')

    const onFormDataSubmit = async () => {
        const apiUrl = 'https://r0e5qa3kxj.execute-api.us-west-2.amazonaws.com/search'

        const queryParams = new URLSearchParams({
            limit: '50',
            filter: "collection='loca2-mon-county'" + (apiParams?.scenariosQueryStr ? " AND " + apiParams?.scenariosQueryStr : '') + (apiParams?.countyQueryStr ? " AND " + apiParams?.countyQueryStr : '') + (apiParams?.modelQueryStr ? " AND " + apiParams?.modelQueryStr : ''),
            filter_lang: 'cql2-text',
        })

        const fullUrl = `${apiUrl}?${queryParams.toString()}`;

        if (apiParamsChanged) {
            try {
                const res = await fetch(fullUrl)
                const data = await res.json()

                const apiResponseData: modelVarUrls[] = []

                for (const modelIdx in data.features) {
                    const assets = data.features[modelIdx].assets

                    const varsInModel: modelVarUrls = {
                        model: '',
                        vars: []
                    }

                    for (const asset in assets) {
                        const varInVars: varUrl = {
                            name: '',
                            href: ''
                        }

                        varInVars.name = asset
                        varInVars.href = assets[asset].href
                        varsInModel.vars.push(varInVars)
                    }

                    varsInModel.model = data.features[modelIdx].id
                    apiResponseData.push(varsInModel)
                }

                setDataResponse(apiResponseData)
            } catch (err) {
                console.log(err)
            }
            setApiParamsChanged(false)
        }
    }

    function resetStateToSettings(): void {
        setSidebarState('settings')
    }

    // VARIABLES

    const varsList: string[] = (data.summaries['cmip6:variable_id']).map((obj: {}) => obj)

    const [selectedVars, setSelectedVars] = useState<any>([])
    useDidMountEffect(() => {
        const selectedVarsStr = arrayToCommaSeparatedString(selectedVars)

        setPackageSettings({
            ...localPackageSettings,
            vars: selectedVarsStr
        })

    }, [selectedVars])


    // COUNTIES

    const countiesList: string[] = (data.summaries['countyname']).map((obj: {}) => obj)

    const [selectedCounties, setSelectedCounties] = useState<string[]>([])
    useDidMountEffect(() => {
        let selectedCountiesStr: string = ''

        if (selectedCounties.length > 0) {
            const updatedApiParam: apiParamStrs = {
                ...apiParams,
                countyQueryStr: createOrStatement('countyname', selectedCounties)
            }

            setApiParams(updatedApiParam)

            selectedCountiesStr = arrayToCommaSeparatedString(selectedCounties)
        }

        setPackageSettings({
            ...localPackageSettings,
            boundaries: selectedCountiesStr
        })
    }, [selectedCounties])

    const [selectedPackage, setSelectedPackage] = useLocalStorageState<number>('selectedPackage', 0)
    const [localPackageSettings, setPackageSettings] = useLocalStorageState<any>('package', {
        id: -1,
        dataset: '',
        scenarios: '',
        models: '',
        vars: '',
        boundaryType: '',
        boundaries: '',
        frequency: '',
        dataFormat: '',
        rangeStart: '',
        rangeEnd: '',
        units: ''
    })
    const [isPackageStored, setIsPkgStored] = useLocalStorageState<boolean>('isPackageStored', false)

    // MODELS

    const modelsList: string[] = (data.summaries['cmip6:source_id']).map((obj: {}) => obj)

    const [modelsSelected, setModelsSelected] = useState<string[]>([])

    useDidMountEffect(() => {
        let selectedModelsStr: string = ''

        if (modelsSelected.length > 0) {
            const updatedApiParam: apiParamStrs = {
                countyQueryStr: selectedCounties.length > 0 ? createOrStatement('countyname', selectedCounties) : '',
                scenariosQueryStr: selectedScenarios.length > 0 ? createOrStatement('cmip6:experiment_id', selectedScenarios) : '',
                modelQueryStr: createOrStatement('cmip6:source_id', modelsSelected)
            }

            setApiParams(updatedApiParam)

            selectedModelsStr = arrayToCommaSeparatedString(modelsSelected)
        }

        setPackageSettings({
            ...localPackageSettings,
            models: selectedModelsStr
        })
    }, [modelsSelected])

    const isAllModelsSelected = useRef(false)

    // SCENARIOS
    const scenariosList: string[] = (data.summaries['cmip6:experiment_id']).map((obj: {}) => obj)

    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
    useDidMountEffect(() => {
        let selectedScenariosStr: string = ''

        if (selectedScenarios.length > 0) {
            const updatedApiParam: apiParamStrs = {
                ...apiParams,
                scenariosQueryStr: createOrStatement('cmip6:experiment_id', selectedScenarios)
            }

            setApiParams(updatedApiParam)

            selectedScenariosStr = arrayToCommaSeparatedString(selectedScenarios)
        }

        setPackageSettings({
            ...localPackageSettings,
            scenarios: selectedScenariosStr
        })
    }, [selectedScenarios])

    function handlePackageSave() {

        setPackageSettings({
            id: packagesData[selectedPackage].id,
            dataset: packagesData[selectedPackage].dataset,
            scenarios: packagesData[selectedPackage].scenarios,
            models: packagesData[selectedPackage].models,
            vars: packagesData[selectedPackage].vars,
            boundaryType: packagesData[selectedPackage].boundaryType,
            boundaries: '',
            frequency: packagesData[selectedPackage].frequency,
            dataFormat: packagesData[selectedPackage].dataFormat,
            rangeStart: packagesData[selectedPackage].rangeStart,
            rangeEnd: packagesData[selectedPackage].rangeEnd,
            units: packagesData[selectedPackage].units,
            disabled: packagesData[selectedPackage].disabled
        })

        setSelectedVars(stringToArray(packagesData[selectedPackage].vars))
        setModelsSelected(stringToArray(packagesData[selectedPackage].models))
        setSelectedScenarios(stringToArray(packagesData[selectedPackage].scenarios))
        setSelectedCounties([])
        setIsPkgStored(true)
        toggleDrawer(true)
    }

    function selectPackageToSave(id: number) {
        setTentativePackage(id)

        if (isPackageStored) {
            openOverwriteDialog(true)
        } else {
            setSidebarState('settings')
            setSelectedPackage(tentativePackage)
            handlePackageSave()
        }
    }

    function handleOverwriteDialog(overwrite: boolean) {
        if (overwrite) {
            openOverwriteDialog(false)
            setSidebarState('settings')
            setSelectedPackage(tentativePackage)
            handlePackageSave()
        } else {
            openOverwriteDialog(false)
            setTentativePackage(0)
        }
    }

    function handleLocalPackageClear() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear()
            setIsPkgStored(false)
            setSidebarState('settings')
        }
    }

    function toggleDrawer(open: boolean) {
        setSidePanelOpen(open);
    }


    useEffect(() => {
        setSelectedVars(localPackageSettings.vars.length > 0 ? stringToArray(localPackageSettings.vars) : [])
        setModelsSelected(localPackageSettings.models.length > 0 ? stringToArray(localPackageSettings.models) : [])
        setSelectedScenarios(localPackageSettings.scenarios.length > 0 ? stringToArray(localPackageSettings.scenarios) : [])
        setSelectedCounties(localPackageSettings.boundaries.length > 0 ? stringToArray(localPackageSettings.boundaries) : [])
        setSidebarState('settings')

        isAllModelsSelected.current = (modelsSelected.length == modelsList.length)
    }, [])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`, backgroundColor: `#fffff`, boxShadow: `none`, borderBottom: `1px solid #e8e8e8` }}
            >
                <Toolbar className="toolbar-main" sx={{ justifyContent: `space-between` }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/">
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Getting Started</Typography>
                    </Breadcrumbs>
                    <Tooltip
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        title={sidebarState == 'settings' ? "Review your selected package" : "Download your data"}
                    >
                        <IconButton onClick={() => toggleDrawer(true)}>
                            <Image
                                src={packageIcon}
                                alt="Package icon that you can click on to see your current data package"
                            />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        backgroundImage: `url(${sidebarBg.src})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        border: "none",
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar>
                    <Image
                        src={logo}
                        alt="Cal Adapt logo"
                        className="cal-adapt-logo"
                    />
                </Toolbar>


                <List sx={{
                    '& .MuiListItemIcon-root': {
                        color: '#000',
                    },
                    // selected and (selected + hover) states
                    '&& .Mui-selected, && .Mui-selected:hover': {
                        bgcolor: 'rgba(247, 249, 251, 0.9)'
                    },
                    // hover states
                    '& .MuiListItemButton-root:hover': {
                        bgcolor: 'rgba(247, 249, 251, 0.6)',
                        borderRadius: '12px'
                    },
                }}>
                    {['Getting Started'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    <StartIcon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: "64px", pt: "200px" }}
            >
                <Toolbar />

                <div className="alerts">
                    <Alert variant="purple" severity="info">Looking for the full LOCA2 scientific data at daily resolution for the entire state of California?
                        <div className="cta">
                            <Button variant="contained">Click Here for the How-To-Guide</Button>
                        </div>
                    </Alert>
                    <Alert variant="grey" severity="info">The Cal-Adapt data download tool is a beta tool. Feedback or questions are always welcome.
                        <div className="cta">
                            <Tooltip
                                TransitionComponent={Fade}
                                TransitionProps={{ timeout: 600 }}
                                title="Email support@cal-adapt.org"
                                placement="right-end"
                            >
                                <Button variant="contained" href="mailto:support@cal-adapt.org">Contact Us</Button>
                            </Tooltip>
                        </div>
                    </Alert>
                </div>

                <Alert sx={{ mb: "26px" }} variant="filled" severity="info">The size of data packages might be very large. In that case, you may be asked for an email address to notify you when your package is ready for download. </Alert>

                {/** Packages container */}
                <div className="container container--full">
                    <Typography variant="h5">
                        Data Packages
                    </Typography>
                    <Typography variant="body1">
                        Select a data package preset from the options listed below
                    </Typography>
                    <div className="packages-grid">
                        {packagesData.map((pkg: any) => (
                            <div className="package container container--package" key={pkg.id}>
                                <Typography className="package__name" variant="h6" >
                                    {pkg.name}
                                </Typography>
                                <ul className="package__settings">
                                    <li><Typography variant="body2">Dataset:</Typography> {pkg.dataset}</li>
                                    <li><Typography variant="body2">Scenarios:</Typography> {pkg.scenarios}</li>
                                    <li><Typography variant="body2">Models:</Typography> {pkg.models}</li>
                                    <li><Typography variant="body2">Vars:</Typography> {pkg.vars}</li>
                                    <li><Typography variant="body2">Boundary Type:</Typography> {pkg.boundaryType}</li>
                                    <li><Typography variant="body2">Range:</Typography> {pkg.rangeStart} - {pkg.rangeEnd}</li>
                                    <li><Typography variant="body2">Frequency:</Typography> {pkg.frequency}</li>
                                    <li><Typography variant="body2">Data Format:</Typography> {pkg.dataFormat}</li>
                                    <li><Typography variant="body2">Units:</Typography> {pkg.units}</li>
                                </ul>
                                {pkg.disabled && (
                                    <Tooltip
                                        TransitionComponent={Fade}
                                        TransitionProps={{ timeout: 600 }}
                                        title="This data package preset is not available"
                                    >
                                        <span>
                                            <Button disabled={pkg.disabled} variant="contained" >Customize and download</Button>
                                        </span>
                                    </Tooltip>
                                )}
                                {!pkg.disabled && (
                                    <Tooltip
                                        TransitionComponent={Fade}
                                        TransitionProps={{ timeout: 600 }}
                                        title="Continue with this data package preset"
                                    >
                                        <span>
                                            <Button onClick={() => selectPackageToSave(pkg.id)} variant="contained">Customize and download</Button>
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                        ))}

                    </div>
                </div>

                {/** Confirm package overwrite dialog */}
                <Dialog
                    open={overwriteDialogOpen}
                    onClose={() => handleOverwriteDialog(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Confirm package overwrite"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            If you proceed, the current package data that is saved will be overwritten by the package that you are selecting
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => handleOverwriteDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={() => handleOverwriteDialog(true)} autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/** Sidepanel */}
                <SidePanel
                    anchor="right"
                    variant="temporary"
                    open={isSidePanelOpen}
                    onClose={() => toggleDrawer(false)}
                >
                    <Tooltip
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        title="Close the sidebar"
                    >
                        <IconButton onClick={() => toggleDrawer(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>

                    {isPackageStored &&
                        <Tooltip
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            title="Delete stored data package"
                        >
                            <IconButton onClick={() => handleLocalPackageClear()}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    }

                    {isPackageStored && sidebarState == 'download' &&
                        <Tooltip
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                            title="Review your package settings"
                        >
                            <IconButton onClick={() => (resetStateToSettings())}>
                                <UndoOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                    }


                    {isPackageStored &&
                        <PackageForm
                            localPackageSettings={localPackageSettings}
                            sidebarState={sidebarState}
                            setSidebarState={setSidebarState}
                            setPackageSettings={setPackageSettings}
                            modelsSelected={modelsSelected}
                            setModelsSelected={setModelsSelected}
                            isAllModelsSelected={isAllModelsSelected}
                            modelsList={modelsList} selectedVars={selectedVars}
                            setSelectedVars={setSelectedVars}
                            varsList={varsList}
                            selectedCounties={selectedCounties}
                            setSelectedCounties={setSelectedCounties}
                            countiesList={countiesList}
                            selectedScenarios={selectedScenarios}
                            setSelectedScenarios={setSelectedScenarios}
                            scenariosList={scenariosList}
                            onFormDataSubmit={onFormDataSubmit}
                            dataResponse={dataResponse}
                            isPackageStored={isPackageStored}
                            handleLocalPackageClear={handleLocalPackageClear}
                        ></PackageForm>
                    }

                    {!isPackageStored &&
                        <div className='package-contents'>
                            <Typography variant="h6">
                                No package has been selected. Head back to the dashboard and select a data package preset.
                            </Typography>
                        </div>
                    }

                </SidePanel>
            </Box>
        </Box >
    )
}