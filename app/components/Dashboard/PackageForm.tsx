
import React, { useState, useEffect, ChangeEvent, ChangeEventHandler } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl, Button } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined'
import Tooltip from '@mui/material/Tooltip'
import Fade from '@mui/material/Fade'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { searchObject } from "@/app/utils/functions"
import { useDidMountEffect } from "@/app/utils/hooks"
import DataResultsTable from './DataResultsTable'

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

// Configurations for Models Select field dropdown
const MenuProps: any = {
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

interface ChildFormProps {
    modelsList: string[],
    modelsSelected: string[],
    varsList: string[],
    selectedVars: string[],
    countiesList: string[],
    selectedCounties: string[],
    sidebarState: string,
    localPackageSettings: any,
    dataResponse: modelVarUrls[]
    isAllModelsSelected: any,
    isPackageStored: boolean,
    setSidebarState: ((state: string) => void),
    setPackageSettings: (localPackageSettings: string[]) => void,
    setSelectedVars: (selectedVars: string[]) => void,
    setModelsSelected: (selectedModels: string[]) => void,
    setSelectedCounties: (selectedCounties: string[]) => void,
    onFormDataSubmit: () => unknown,
}

const PackageForm: React.FC<ChildFormProps> = ({ isPackageStored, localPackageSettings, modelsSelected, setModelsSelected, modelsList, sidebarState, selectedVars, isAllModelsSelected, setSidebarState, setSelectedVars, varsList, selectedCounties, setSelectedCounties, countiesList, onFormDataSubmit, dataResponse }) => {
    const [formErrorState, setFormErrorState] = useState<FormFieldErrorStates>({
        models: false,
        vars: false,
        counties: false
    })

    let isFormInvalid: boolean = false

    useEffect(() => {
        isFormInvalid = searchObject(formErrorState, true)

        console.log('form is invalid: ' + isFormInvalid)

    }, [formErrorState])

    // MODELS

    const handleModelsChange = (event: SelectChangeEvent<string[]>) => {
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
        isFormInvalid = searchObject(formErrorState, true)
    }

    const handleSubmit = () => {

        validateFormData()

        if (!isFormInvalid) {
            onFormDataSubmit()

            isFormInvalid = false
            setSidebarState('download')

        } else {
            console.log('form is invalid')
        }
    }

    return (
        <div className="package-form">
            {(sidebarState === 'download') && (
                <div className="package-contents">
                    <Typography variant="h5">Download your data</Typography>
                    {(dataResponse.length > 0) ? (
                        <div>
                            {dataResponse.map((item) => (
                                <div className="container container--package-setting" key={item.model}>
                                    <Typography variant="h5">Model</Typography>
                                    {item.model}
                                    <div className="option-group">
                                        <Typography variant="h5">Variables</Typography>
                                        {(item.vars.length > 0) && (
                                            <DataResultsTable varsResData={item.vars} selectedVars={selectedVars}></DataResultsTable>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isPackageStored && sidebarState == 'download' &&
                                <div className="bottom-actions">
                                    <Tooltip
                                        TransitionComponent={Fade}
                                        TransitionProps={{ timeout: 600 }}
                                        title="Delete stored data package"
                                    >
                                        <IconButton onClick={() => handleLocalPackageClear()}>
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        TransitionComponent={Fade}
                                        TransitionProps={{ timeout: 600 }}
                                        title="Review your package settings"
                                    >
                                        <IconButton onClick={() => (setSidebarState('settings'))}>
                                            <UndoOutlinedIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            }
                        </div>
                    ) : 'Loading...'}
                </div>
            )}
            {sidebarState === 'settings' && (
                <form onSubmit={handleSubmit} noValidate>
                    <div className="package-contents">
                        <Typography variant="h5">
                            Review Your Data Package
                        </Typography>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Dataset</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about datasets"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>

                                <p>{localPackageSettings.dataset}</p>


                            </div>

                        </div>


                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Scenario(s)</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about scenarios"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
                                <p>{localPackageSettings.scenarios}</p>
                            </div>
                        </div>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Models</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about models"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
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
                            </div>
                        </div>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Variables</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about variables"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
                                <Autocomplete
                                    multiple
                                    value={selectedVars}
                                    onChange={(event: any, newValue: string[]) => {
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
                                            helperText={formErrorState.vars ? 'One or more variables need to be selected in order to continue' : ''}
                                        />
                                    )}
                                    sx={{ mt: '15px', width: '380px' }}

                                />
                            </div>
                        </div>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Spatial Extent</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about spatial extent"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
                            </div>

                            <div className="option-group">
                                <Typography variant="body2">Type</Typography>
                                {localPackageSettings.boundaryType}
                            </div>

                            <div>
                                <Typography variant="body2">Counties</Typography>

                                <Autocomplete
                                    multiple
                                    value={selectedCounties}
                                    onChange={(event: any, newValue: string[]) => {
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
                                            helperText={formErrorState.counties ? 'One or more counties need to be selected in order to continue' : ''}
                                        />
                                    )}
                                    sx={{ mt: '15px', width: '380px' }}

                                />
                            </div>

                        </div>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Range</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about range"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
                                <p>{localPackageSettings.rangeStart} - {localPackageSettings.rangeEnd}</p>
                            </div>
                        </div>

                        <div className="container container--package-setting">
                            <div className="option-group">
                                <Typography className="option-group__title" variant="body2">Data Format</Typography>
                                <Tooltip
                                    TransitionComponent={Fade}
                                    TransitionProps={{ timeout: 600 }}
                                    title="Informational text about data format"
                                    placement="right-end"
                                ><InfoOutlinedIcon></InfoOutlinedIcon></Tooltip>
                                <p>{localPackageSettings.dataFormat}</p>
                            </div>
                        </div>

                        <div className="cta">
                            <Button onClick={() => {
                                handleSubmit()
                            }} variant="contained">Download your data</Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}

export default PackageForm
