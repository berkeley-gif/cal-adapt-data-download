'use client'

// Importing necessary React hooks and utilities
import React, { useState, useEffect, useRef } from 'react'

import { downloadZip } from 'client-zip'

// Importing Material-UI components
import Alert from '@mui/material/Alert'
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'

// Importing custom components and utilities
import SidePanel from '@/app/components/Dashboard/RightSidepanel'
import { useSidepanel } from '@/app/context/SidepanelContext'
import PackageForm from '@/app/components/Data-Download-Tool/PackageForm'
import { apiParamStrs, varUrl, modelVarUrls } from '@/app/lib/data-download/types'
import { dataPackages } from '@/app/lib/data-download/dataPackages'
import { createOrStatement, stringToArray, arrayToCommaSeparatedString, splitStringByPeriod, extractFilenameFromURL, getTodaysDateAsString } from "@/app/utils/functions"
import { useDidMountEffect, useLocalStorageState } from "@/app/utils/hooks"
import { variablesLookupTable, scenariosLookupTable, lookupValue, filterByFlag, modelsGenUseLookupTable } from '@/app/utils/lookupTables'

type DataDownloadProps = {
    data: any // or a more specific type like `data: Array<any>` or `data: { [key: string]: any }`
}

export default function DataDownload({ data }: DataDownloadProps) {
    const { open, toggleOpen } = useSidepanel()

    const [dataResponse, setDataResponse] = useState<modelVarUrls[]>([])
    const [totalDataSize, setTotalDataSize] = useState<number>(0)

    // API PARAMS
    const [apiParams, setApiParams] = useState<apiParamStrs>({
        countyQueryStr: '',
        scenariosQueryStr: '',
        modelQueryStr: '',
        freqQueryStr: '',
    })
    const [apiParamsChanged, setApiParamsChanged] = useState<boolean>(false)
    useEffect(() => {
        setApiParamsChanged(true)
        setDataResponse([]) // Clear previous data

    }, [apiParams])


    function updateApiParams(newParams: Partial<apiParamStrs>) {
        setApiParams(prevParams => ({
            ...prevParams,
            ...newParams
        }))
    }

    const [downloadLinks, setDownloadLinks] = useState<string[]>([])
    const [sidebarState, setSidebarState] = useState<string>('')
    const [nextPageUrl, setNextPageUrl] = useState<string>('')
    const [overwriteDialogOpen, openOverwriteDialog] = useState<boolean>(false)
    const [isDataDaily, setIsDataDaily] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isBundling, setIsBundling] = useState(false)
    const [isPackageStored, setIsPkgStored] = useLocalStorageState<boolean>('isPackageStored', false)
    const [tentativePackage, setTentativePackage] = useState<number>(-1)

    const [selectedPackage, setSelectedPackage] = useState<number>(-1)
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

    const onFormDataSubmit = async () => {
        const apiUrl = 'https://d3pv76zq0ekj5q.cloudfront.net/search'

        const queryParams = new URLSearchParams({
            limit: '3480',
            filter: (apiParams?.freqQueryStr ? apiParams?.freqQueryStr : '') + (apiParams?.scenariosQueryStr ? " AND " + apiParams?.scenariosQueryStr : '') + (apiParams?.countyQueryStr ? " AND " + apiParams?.countyQueryStr : '') + (apiParams?.modelQueryStr ? " AND " + apiParams?.modelQueryStr : ''),
            filter_lang: 'cql2-text',
        })

        const fullUrl = `${apiUrl}?${queryParams.toString()}`;

        if (apiParamsChanged) {
            try {
                const res = await fetch(fullUrl)
                const data = await res.json()

                const apiResponseData: modelVarUrls[] = []

                for (const modelIdx in data.features) {

                    // For each model in data response 
                    const assets = data.features[modelIdx].assets


                    const varsInModel: modelVarUrls = {
                        model: '',
                        countyname: '',
                        scenario: '',
                        vars: []
                    }

                    // For each variable in models
                    for (const asset in assets) {
                        const varInVars: varUrl = {
                            name: '',
                            href: '',
                            size: 0
                        }

                        varInVars.name = asset
                        setDownloadLinks(prevState => [...prevState, assets[asset].href])
                        varInVars.href = assets[asset].href
                        varInVars.size = assets[asset]['file:size']
                        setTotalDataSize(totalDataSize => totalDataSize + varInVars.size)
                        varsInModel.vars.push(varInVars)
                    }

                    const modelScenarioStr = data.features[modelIdx].id
                    const modelScenarioStrArr = splitStringByPeriod(modelScenarioStr)

                    varsInModel.model = modelScenarioStrArr.length >= 0 ? modelScenarioStrArr[1] : ''
                    varsInModel.scenario = modelScenarioStrArr.length >= 0 ? modelScenarioStrArr[2] : ''
                    varsInModel.countyname = data.features[modelIdx].properties.countyname
                    apiResponseData.push(varsInModel)
                }

                if (data.links[0].rel == 'next') {
                    setNextPageUrl(data.links[0].href || null)
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

    function bytesToGBOrMB(bytes: number): string {
        const fileSizeInGB = bytes / (1024 * 1024 * 1024)
        const fileSizeInMB = bytes / (1024 * 1024)

        if (fileSizeInGB >= 1) {
            return fileSizeInGB.toFixed(2) + ' GB'
        } else {
            return fileSizeInMB.toFixed(2) + ' MB'
        }
    }

    async function createZip(links: string[], extraFilenameStr: string): Promise<void> {
        showLoadingIndicator()

        const urlResponses = await Promise.all(links.map(url => fetch(url)))

        const files = await Promise.all(urlResponses.map(async (response) => {
            const fileData = await response.blob()
            const fileName = extractFilenameFromURL(response.url)
            return { name: fileName, input: fileData }
        }))

        const blob = await downloadZip(files).blob()
        const todaysDateAsString: string = getTodaysDateAsString()

        const outputPath = 'data-download-bundle-' + `${todaysDateAsString}` + '-' + selectedFrequency + (extraFilenameStr ? '-' + extraFilenameStr : '') + '.zip';

        hideLoadingIndicator()

        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = outputPath
        a.click()
        a.remove()
    }

    function showLoadingIndicator() {
        setIsLoading(true)
        setIsBundling(true)
    }

    function hideLoadingIndicator() {
        setIsLoading(false)
        setIsBundling(false)
    }

    // FREQUENCY 

    const frequenciesList: string[] = ['Daily', 'Monthly']

    const [selectedFrequency, setSelectedFrequency] = useState<string>('')

    const [collectionStr, setCollectionStr] = useState<string>('')

    useEffect(() => {
        setPackageSettings({
            ...localPackageSettings,
            frequency: selectedFrequency
        })

        if (selectedFrequency == 'Monthly') {
            setIsDataDaily(false)
            setCollectionStr('loca2-mon-county')
        } else if (selectedFrequency == 'Daily') {
            setIsDataDaily(true)
            setCollectionStr('loca2-day-county')
        }

    }, [selectedFrequency])

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
    useEffect(() => {
        let selectedCountiesStr: string = ''

        if (selectedCounties.length > 0) {
            selectedCountiesStr = arrayToCommaSeparatedString(selectedCounties)
        }

        setPackageSettings({
            ...localPackageSettings,
            boundaries: selectedCountiesStr
        })
    }, [selectedCounties])

    // MODELS

    const modelsList: string[] = (data.summaries['cmip6:source_id']).map((obj: {}) => obj)
    const genUseModelsList: string[] = filterByFlag(modelsGenUseLookupTable)

    const [modelsSelected, setModelsSelected] = useState<string[]>([])

    useEffect(() => {
        let selectedModelsStr: string = ''

        if (modelsSelected.length > 0) {
            selectedModelsStr = arrayToCommaSeparatedString(modelsSelected)
        }

        setPackageSettings({
            ...localPackageSettings,
            models: selectedModelsStr
        })
    }, [modelsSelected])

    const isAllModelsSelected = useRef(false)

    isAllModelsSelected.current = (modelsSelected.length == modelsList.length)

    // SCENARIOS
    const scenariosList: string[] = (data.summaries['cmip6:experiment_id']).map((obj: {}) => obj)

    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
    useDidMountEffect(() => {
        let selectedScenariosStr: string = ''

        if (selectedScenarios.length > 0) {
            selectedScenariosStr = arrayToCommaSeparatedString(selectedScenarios)
        }

        setPackageSettings({
            ...localPackageSettings,
            scenarios: selectedScenariosStr
        })
    }, [selectedScenarios])

    function selectPackageToSave(id: number) {
        setTentativePackage(id)

        if (isPackageStored) {
            openOverwriteDialog(true)
        } else {
            setSelectedPackage(id)
            savePackageToLocal()
        }
    }

    function handleOverwriteDialog(overwrite: boolean) {
        if (overwrite) {
            openOverwriteDialog(false)
            setSelectedPackage(tentativePackage)
            savePackageToLocal()
        } else {
            openOverwriteDialog(false)
            setTentativePackage(-1)
        }
    }

    function savePackageToLocal() {
        if (tentativePackage >= 0) {

            setPackageSettings({
                id: dataPackages[tentativePackage].id,
                dataset: dataPackages[tentativePackage].dataset,
                scenarios: dataPackages[tentativePackage].scenarios,
                models: dataPackages[tentativePackage].models,
                vars: dataPackages[tentativePackage].vars,
                boundaryType: dataPackages[tentativePackage].boundaryType,
                boundaries: '',
                frequency: dataPackages[tentativePackage].frequency,
                dataFormat: dataPackages[tentativePackage].dataFormat,
                rangeStart: dataPackages[tentativePackage].rangeStart,
                rangeEnd: dataPackages[tentativePackage].rangeEnd,
                units: dataPackages[tentativePackage].units,
                disabled: dataPackages[tentativePackage].disabled
            })

            setSelectedVars(stringToArray(dataPackages[selectedPackage].vars))
            setModelsSelected(stringToArray(dataPackages[selectedPackage].models))
            setSelectedScenarios(stringToArray(dataPackages[selectedPackage].scenarios))
            setSelectedCounties([])
            setIsPkgStored(true)
            setSidebarState('settings')
            toggleOpen()
        }
    }

    function handleLocalPackageClear() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear()
            setIsPkgStored(false)
            setSidebarState('settings')
        }
    }

    useEffect(() => {

        // Update apiParams whenever selectedCounties, selectedScenarios, or modelsSelected change

        updateApiParams({
            countyQueryStr: createOrStatement('countyname', selectedCounties),
            scenariosQueryStr: createOrStatement('cmip6:experiment_id', selectedScenarios),
            modelQueryStr: createOrStatement('cmip6:source_id', modelsSelected),
            freqQueryStr: "collection='" + collectionStr + "'"
        })

    }, [selectedCounties, selectedScenarios, modelsSelected, collectionStr])



    useEffect(() => {
        setSelectedPackage(parseInt(localPackageSettings.id) >= 0 ? parseInt(localPackageSettings.id) : -1)
        setSelectedVars(localPackageSettings.vars.length > 0 ? stringToArray(localPackageSettings.vars) : [])
        setSelectedFrequency(localPackageSettings.frequency !== '' ? localPackageSettings.frequency : 'Monthly')
        setModelsSelected(localPackageSettings.models.length > 0 ? stringToArray(localPackageSettings.models) : [])
        setSelectedScenarios(localPackageSettings.scenarios.length > 0 ? stringToArray(localPackageSettings.scenarios) : [])
        setSelectedCounties(localPackageSettings.boundaries.length > 0 ? stringToArray(localPackageSettings.boundaries) : [])
        setSidebarState('settings')
    }, [])

    return (
        <div className="tool-container tool-container--padded">
            {/** Alerts */}
            <div className="alerts alerts-50">
                <Alert variant="filled" severity="info" color="info" aria-label="Where to go for full LOCA2 scientific data">Looking for the full LOCA2 scientific data at daily resolution for the entire state of California?
                    <div className="cta">
                        <Button variant="contained" target="_blank" href="https://docs.google.com/document/d/1HRISAkRb0TafiCSCOq773iqt2TtT2A9adZqDTAShvhE/edit?usp=sharing">Click Here for the How-To-Guide</Button>
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

            <Alert className="alerts alerts-100" sx={{ mb: "26px" }} variant="standard" severity="info">The size of data packages might be very large. In that case, you may be asked for an email address to notify you when your package is ready for download. </Alert>

            {/** Packages container */}
            <div className="container container--full">
                <Typography variant="h5">
                    Data Packages
                </Typography>
                <Typography variant="body1">
                    Select a data package preset from the options listed below
                </Typography>
                <div className="packages-grid">
                    {dataPackages.map((pkg: any) => (
                        <div className="package container container--package" key={pkg.id}>
                            <Typography className="package__name" variant="h6" >
                                {pkg.name}
                            </Typography>
                            <ul className="package__settings">
                                <li><Typography variant="body2">Dataset:</Typography> {pkg.dataset}</li>
                                <li><Typography variant="body2">Scenarios:</Typography>
                                    {stringToArray(pkg.scenarios).map((scenario, index) => (
                                        ' ' + lookupValue(scenario, scenariosLookupTable) + (index !== stringToArray(pkg.scenarios).length - 1 ? ',' : '')
                                    ))}
                                </li>
                                <li><Typography variant="body2">Models:</Typography> {pkg.models}</li>
                                <li><Typography variant="body2">Vars:</Typography>
                                    {stringToArray(pkg.vars).map((variable, index) => (
                                        ' ' + lookupValue(variable, variablesLookupTable) + (index !== stringToArray(pkg.vars).length - 1 ? ',' : '')
                                    ))}
                                </li>
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
                                        <Button onClick={() => selectPackageToSave(parseInt(pkg.id))} variant="contained">Customize and download</Button>
                                    </span>
                                </Tooltip>
                            )}
                        </div>
                    ))}
                    <div className="package container container--package flex-center-col" >
                        <WatchLaterOutlined style={{ 'width': '50px', 'height': '50px' }} />
                        <Typography className="package__name" variant="h6" >
                            Coming Soon
                        </Typography>
                        <Typography className="package__name" variant="body2" >
                            We&#39;re working on building more data packages
                        </Typography>
                    </div>
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
                        frequenciesList={frequenciesList}
                        selectedFrequency={selectedFrequency}
                        setSelectedFrequency={setSelectedFrequency}
                        modelsList={modelsList}
                        genUseModelsList={genUseModelsList}
                        selectedVars={selectedVars}
                        setSelectedVars={setSelectedVars}
                        varsList={varsList}
                        selectedCounties={selectedCounties}
                        setSelectedCounties={setSelectedCounties}
                        countiesList={countiesList}
                        selectedScenarios={selectedScenarios}
                        setSelectedScenarios={setSelectedScenarios}
                        scenariosList={scenariosList}
                        onFormDataSubmit={onFormDataSubmit}
                        nextPageUrl={nextPageUrl}
                        dataResponse={dataResponse}
                        isPackageStored={isPackageStored}
                        handleLocalPackageClear={handleLocalPackageClear}
                        createZip={createZip}
                        downloadLinks={downloadLinks}
                        setDownloadLinks={setDownloadLinks}
                        isDataDaily={isDataDaily}
                        totalDataSize={totalDataSize}
                        bytesToGBOrMB={bytesToGBOrMB}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        isBundling={isBundling}
                        setIsBundling={setIsBundling}
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
        </div>
    )
}