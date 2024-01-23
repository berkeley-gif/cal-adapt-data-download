
import React, { useState, useEffect } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import { FormControl, Button } from '@mui/material'

import { arrayToCommaSeparatedString, handleDownload } from "@/app/utils/functions"
import { useDidMountEffect, useLocalStorageState } from "@/app/utils/hooks"

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

type varUrl = {
    name: string,
    href: string
}

type modelVarUrls = {
    model: string,
    vars: varUrl[]
}
interface ChildFormProps {
    modelsList: string[],
    modelsSelected: string[],
    varsList: string[],
    selectedVars: string[],
    countiesList: string[],
    selectedCounties: string[],
    sidebarState: string,
    localPackageSettings: any,
    apiResData: unknown,
    dataResponse: modelVarUrls[]
    isAllModelsSelected: any,
    setSidebarState: ((state: string) => void),
    setPackageSettings: (localPackageSettings: string[]) => void,
    setSelectedVars: (selectedVars: string[]) => void,
    setModelsSelected: (selectedModels: string[]) => void,
    setSelectedCounties: (selectedCounties: string[]) => void,
    onFormDataSubmit: () => unknown,
}

// Configurations for Models Select field dropdown
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "center"
    },
    transformOrigin: {
        vertical: "top",
        horizontal: "center"
    },
    variant: "menu"
};

interface FormFieldErrorStates {
    models: boolean;
    vars: boolean;
    counties: boolean;
}

function searchObject(obj: FormFieldErrorStates, targetValue: any): boolean {
    for (const key in obj) {
        if (obj[key] === targetValue) {
            return true;
        }

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Recursively search nested objects
            if (searchObject(obj[key], targetValue)) {
                return true;
            }
        }
    }

    return false;
}

const PackageForm: React.FC<ChildFormProps> = ({ localPackageSettings, modelsSelected, setModelsSelected, modelsList, sidebarState, selectedVars, isAllModelsSelected, setSidebarState, setSelectedVars, varsList, selectedCounties, setSelectedCounties, countiesList, onFormDataSubmit, dataResponse }) => {
    const [formErrorState, setFormErrorState] = useState<FormFieldErrorStates>({
        models: false,
        vars: false,
        counties: false
    })

    const [isFormInvalid, setIsFormInvalid] = useState<boolean>(false)
    useEffect(() => {
        setIsFormInvalid(searchObject(formErrorState, true))

    }, [formErrorState])

    const [isError, setIsError] = useState(false);

    // MODELS

    const handleModelsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValues = event.target.value as string[];


        // Check if "Select All" option is selected
        // HERE FOR ERROR WITH DESELECTING ?
        if (selectedValues.includes('all')) {
            if (isAllModelsSelected.current) {
                // Deselect all options if "Select All" was previously selected
                console.log('deselect all')
                setModelsSelected([])
                console.log(modelsSelected)
            } else {
                console.log('select all')
                // Select all options if "Select All" is selected
                setModelsSelected(modelsList);
            }
            // Toggle the selectAll state
            isAllModelsSelected.current = !isAllModelsSelected.current
        } else {
            // Remove "Select All" from selected options
            setModelsSelected(selectedValues.filter(value => value !== 'all'))
            // Ensure selectAll state is false when individual options are selected/deselected
            isAllModelsSelected.current = false
        }
    }

    // MODELS
    useDidMountEffect(() => {
        if (modelsSelected.length > 0) {
            let newFormState = formErrorState

            newFormState.models = false
            setFormErrorState(newFormState)
        }

    }, [modelsSelected])

    // VARIABLES 
    useDidMountEffect(() => {
        if (selectedVars.length > 0) {
            let newFormState = formErrorState

            newFormState.vars = false
            setFormErrorState(newFormState)
        }

    }, [selectedVars])

    // COUNTIES
    useDidMountEffect(() => {
        if (selectedCounties.length > 0) {
            let newFormState = formErrorState

            newFormState.counties = false
            setFormErrorState(newFormState)
        }

    }, [selectedCounties])

    function validateFormData() {
        let newFormState = formErrorState

        if (modelsSelected.length == 0) {
            newFormState.models = true
        } else {
            newFormState.models = false
        }

        if (selectedVars.length == 0) {
            newFormState.vars = true
        } else {
            newFormState.vars = false
        }

        if (selectedCounties.length == 0) {
            newFormState.counties = true
        } else {
            newFormState.counties = false
        }

        setFormErrorState(newFormState)
    }

    const handleSubmit = () => {

        validateFormData()

        // validate form data
        if (!isFormInvalid) {
            console.log('form is valid')

            onFormDataSubmit()

            setIsFormInvalid(false)
            setSidebarState('download')
            setIsError(false)
        } else {
            setIsError(true)
        }
    }

    return (
        <div className="package-form">
            {(sidebarState === 'download') && (
                <div>
                    <Typography variant="h5">Download your data</Typography>
                    {(dataResponse.length > 0) ? (
                        <div>
                            {dataResponse.map((item) => (
                                <div className="container container--package-setting">
                                    <Typography variant="h5">Model</Typography>
                                    {item.model}
                                    <p className="option-group">
                                        <Typography variant="h5">Vars</Typography>
                                        {(item.vars.length > 0) && (
                                            item.vars.map((variable) => (
                                                <div>
                                                    <p className="option-group">
                                                        {variable.name}
                                                    </p>
                                                    <p className="option-group">
                                                        <Button variant="contained" color="primary" onClick={() => { handleDownload(variable.href) }}>
                                                            Download File
                                                        </Button>
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : 'Loading...'}
                </div>
            )}
            {isError && (
                <div>
                    <Typography variant="h4">Error calling the API</Typography>
                </div>
            )}
            {sidebarState === 'settings' && (
                <form onSubmit={handleSubmit} noValidate>
                    <div className="package-contents">
                        <Typography variant="h5">
                            Review Your Data Package
                        </Typography>

                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Dataset</Typography> {localPackageSettings.dataset}
                            </p>

                        </div>


                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Scenario(s)</Typography> {localPackageSettings.scenarios}
                            </p>
                        </div>

                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Models</Typography>
                                <FormControl error={formErrorState.models}>
                                    <Select
                                        multiple
                                        value={isAllModelsSelected.current ? ['all'] : modelsSelected}
                                        onChange={handleModelsChange}
                                        renderValue={(selected) => (isAllModelsSelected.current ? 'All Available' : (selected as string[]).join(', '))}
                                        MenuProps={MenuProps}
                                        sx={{ mt: '15px', width: '380px' }}

                                    >
                                        <MenuItem value="all">
                                            <Checkbox checked={isAllModelsSelected.current} />
                                            Select All
                                        </MenuItem>
                                        {modelsList.map((model) => (
                                            <MenuItem key={model} value={model}>
                                                <Checkbox checked={modelsSelected.includes(model)} />
                                                <ListItemText primary={model} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrorState.models && <div>One or more models need to be selected in order to continue</div>}
                                </FormControl>
                            </p>
                        </div>

                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Variables</Typography>
                                <Autocomplete
                                    multiple
                                    value={selectedVars}
                                    onChange={(event: any, newValue: string | null) => {
                                        setSelectedVars(newValue)
                                    }}
                                    id="tags-outlined"
                                    options={varsList}
                                    filterSelectedOptions
                                    renderOption={(props, option) => {
                                        return (
                                            <li {...props} key={option}>
                                                {option}
                                            </li>
                                        )
                                    }}
                                    renderTags={(tagValue, getTagProps) => {
                                        return tagValue.map((option, index) => (
                                            <Chip {...getTagProps({ index })} key={option} label={option} />
                                        ))
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Search..."
                                            error={formErrorState.vars}
                                            helperText={'One or more variables need to be selected in order to continue'}
                                        />
                                    )}
                                    sx={{ mt: '15px', width: '380px' }}

                                />
                            </p>
                        </div>

                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Spatial Extent</Typography>
                            </p>

                            <p className="option-group">
                                <Typography variant="body2">Type</Typography>
                                {localPackageSettings.boundaryType}
                            </p>

                            <p>
                                <Typography variant="body2">Counties</Typography>

                                <Autocomplete
                                    multiple
                                    value={selectedCounties}
                                    onChange={(event: any, newValue: string | null) => {
                                        setSelectedCounties(newValue)
                                    }}
                                    id="tags-outlined"
                                    options={countiesList}
                                    filterSelectedOptions
                                    renderOption={(props, option) => {
                                        return (
                                            <li {...props} key={option}>
                                                {option}
                                            </li>
                                        )
                                    }}
                                    renderTags={(tagValue, getTagProps) => {
                                        return tagValue.map((option, index) => (
                                            <Chip {...getTagProps({ index })} key={option} label={option} />
                                        ))
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Search..."
                                            error={formErrorState.counties}
                                            helperText={'One or more counties need to be selected in order to continue'}
                                        />
                                    )}
                                    sx={{ mt: '15px', width: '380px' }}

                                />
                            </p>

                        </div>

                        <div className="container container--package-setting">
                            <p className="option-group">
                                <Typography variant="body2">Range</Typography> {localPackageSettings.rangeStart} - {localPackageSettings.rangeEnd}
                            </p>
                        </div>

                        <div className="container container--package-setting">
                            <Typography variant="body2">Data Format</Typography> {localPackageSettings.dataFormat}
                        </div>

                        <div className="cta">
                            <Button onClick={() => {
                                handleSubmit()
                            }} variant="contained">Download package</Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}

export default PackageForm
