
import React, { useState, useEffect, useRef } from 'react'

import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl, Button } from '@mui/material'

import { stringToArray, arrayToCommaSeparatedString } from "@/app/utils/utilFn"

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

interface ChildFormProps {
    modelsList: string[],
    modelsSelected: string[],
    varsList: string[],
    selectedVars: string[],
    countiesList: string[],
    selectedCounties: string[],
    localPackageSettings: any,
    apiResData: unknown,
    setPackageSettings: (localPackageSettings: string[]) => void,
    setSelectedVars: (selectedVars: unknown) => void,
    setModelsSelected: (selectedModels: unknown) => void,
    setSelectedCounties: (selectedCounties: unknown) => void,
    onFormDataSubmit: () => void,
    handleClear: () => void
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

const PackageForm: React.FC<ChildFormProps> = ({ apiResData, localPackageSettings, setPackageSettings, modelsSelected, setModelsSelected, modelsList, selectedVars, setSelectedVars, varsList, selectedCounties, setSelectedCounties, countiesList, onFormDataSubmit, handleClear }) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const isFirstRender = useRef(true)


    // Models handling code
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return
        }
        const selectedModelsStr = arrayToCommaSeparatedString(modelsSelected)
        setPackageSettings({
            ...localPackageSettings,
            models: selectedModelsStr
        })
    }, [modelsSelected])

    const handleModelsChange = (event: SelectChangeEvent<typeof modelsSelected>) => {
        const {
            target: { value },
        } = event;
        if (value[value.length - 1] === "all") {
            setModelsSelected(modelsSelected.length === modelsList.length ? [] : modelsList);
            return;
        }
        setModelsSelected(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const isAllModelsSelected =
        modelsList.length > 0 && modelsSelected.length === modelsList.length;
    // end of Models handling code


    // Counties handling code
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return
        }
        const selectedCountiesStr = arrayToCommaSeparatedString(selectedCounties)
        setPackageSettings({
            ...localPackageSettings,
            boundaries: selectedCountiesStr
        })
    }, [selectedCounties])

    // end of counties handling code 

    const handleSubmit = () => {
        // validate form data

        if (typeof onFormDataSubmit === 'function') {
            onFormDataSubmit()


            console.log(apiResData)

        }

        setIsSuccess(true);
        setIsError(false);
    }

    const handleReset = () => {
        handleClear()
        setIsSuccess(false)
        setIsError(false)
    };

    return (
        <div className="package-form">
            {isSuccess && (
                <div>
                    <Typography variant="h4">Form submitted successfully!</Typography>
                </div>
            )}
            {isError && (
                <div>
                    <Typography variant="h4">Error submiting form</Typography>
                </div>
            )}
            {!isSuccess && !isError && (
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
                                <FormControl>
                                    <Select
                                        multiple
                                        value={modelsSelected}
                                        onChange={handleModelsChange}
                                        renderValue={(selected) => selected.join(', ')}
                                        MenuProps={MenuProps}
                                        sx={{ mt: '15px', width: '380px' }}
                                    >
                                        <MenuItem
                                            value="all"
                                        >
                                            <ListItemIcon>
                                                <Checkbox
                                                    checked={isAllModelsSelected}
                                                    indeterminate={
                                                        modelsSelected.length > 0 && modelsSelected.length < modelsList.length
                                                    }
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Select All"
                                            />
                                        </MenuItem>
                                        {modelsList.map((model) => (
                                            <MenuItem key={model} value={model}>
                                                <Checkbox checked={modelsSelected.indexOf(model) > -1} />
                                                <ListItemText primary={model} />
                                            </MenuItem>
                                        ))}
                                    </Select>
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
