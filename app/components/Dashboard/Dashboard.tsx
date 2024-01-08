'use client'

import Image from 'next/image'
import packageIcon from '@/public/img/icons/package.svg'
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react"

import Autocomplete from '@mui/material/Autocomplete';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';


import SidePanel from './SidePanel'
import './../../styles/components/dashboard.scss'

import { stringToArray, arrayToCommaSeparatedString } from "@/app/utils/utilFn"
import { FormControl } from '@mui/material';

const DRAWER_WIDTH = 212;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export default function Dashboard({ packagesData, countiesData, modelsData }) {
    type SetValue<T> = Dispatch<SetStateAction<T>>;

    const isFirstRender = useRef(true)
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false)
    const [overwriteDialogOpen, openOverwriteDialog] = useState<boolean>(false)
    const [availableVars, setAvailableVars] = useState<any>([])
    const [tentativePackage, setTentativePackage] = useState<number>(0)

    // Code for climate variables / indicators
    const [selectedVars, setSelectedVars] = useState<any>([])
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return
        }
        const selectedVarsStr = arrayToCommaSeparatedString(selectedVars)
        setPackageSettings({
            ...localPackageSettings,
            vars: selectedVarsStr
        })
    }, [selectedVars])
    // End of code for climate variables / indicators

    // Code for counties
    const [selectedCounties, setSelectedCounties] = useState<any>([])
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

    // End of code for climate variables / indicators

    // Variables that are stored in local state
    function useLocalStorageState<T>(
        key: string,
        initialValue: T
    ): [T, SetValue<T>] {

        // Get initial value from local storage or use the provided initial value
        const storedValue = typeof window !== 'undefined' ? localStorage.getItem(key) : null
        const initial = storedValue ? JSON.parse(storedValue) : initialValue

        // Set up state to manage the value
        const [value, setValue] = useState<T>(initial);

        // Update local storage when the state changes
        useEffect(() => {
            localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);

        return [value, setValue];
    }

    const [selectedPackage, setSelectedPackage] = useLocalStorageState<number>('selectedPackage', 0)
    const [localPackageSettings, setPackageSettings] = useLocalStorageState('package', {
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

    const modelsList: string[] = modelsData.map((obj) => obj.name)

    console.log(modelsList)
    const [modelsSelected, setModelsSelected] = useState<any>([])
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

    const isAllModelsSelected =
        modelsList.length > 0 && modelsSelected.length === modelsList.length;

    // End of configurations for Models Select field dropdown


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

    function handlePackageSave() {
        setPackageSettings({
            dataset: packagesData[selectedPackage].dataset,
            scenarios: packagesData[selectedPackage].scenarios,
            models: packagesData[selectedPackage].model,
            vars: packagesData[selectedPackage].vars,
            boundaryType: packagesData[selectedPackage].boundaryType,
            boundaries: '',
            frequency: packagesData[selectedPackage].frequency,
            dataFormat: packagesData[selectedPackage].dataFormat,
            rangeStart: packagesData[selectedPackage].rangeStart,
            rangeEnd: packagesData[selectedPackage].rangeEnd,
            units: packagesData[selectedPackage].units
        })

        setAvailableVars(stringToArray(packagesData[selectedPackage].vars))
        setSelectedVars(stringToArray(packagesData[selectedPackage].vars))
        setIsPkgStored(true)
        toggleDrawer(true)
    }

    function selectPackageToSave(id: number) {
        setTentativePackage(id)

        if (isPackageStored) {
            openOverwriteDialog(true)
        } else {
            setSelectedPackage(tentativePackage)
            handlePackageSave()
        }
    }

    function handleOverwriteDialog(overwrite: boolean) {
        if (overwrite) {
            // package should be overwritten
            openOverwriteDialog(false)
            setSelectedPackage(tentativePackage)
            handlePackageSave()
        } else {
            openOverwriteDialog(false)
            setTentativePackage(0)
        }
    }

    function handleClear() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear()
            setIsPkgStored(false)
        }
    }

    function toggleDrawer(open: boolean) {
        setSidePanelOpen(open);
    }

    useEffect(() => {
        setAvailableVars(stringToArray(packagesData[0].vars))
        setSelectedVars(stringToArray(localPackageSettings.vars))
        // setModelsSelected(stringToArray(localPackageSettings.models))
        setSelectedCounties(stringToArray(localPackageSettings.boundaries))
    }, [])

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`, backgroundColor: `#fffff` }}
            >
                <Toolbar sx={{ justifyContent: `space-between` }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/">
                            Dashboard
                        </Link>
                        <Typography color="text.primary">Getting Started</Typography>
                    </Breadcrumbs>
                    <IconButton onClick={() => toggleDrawer(true)}>
                        <Image
                            src={packageIcon}
                            alt="Package icon that you can click on to see your current data package"
                        />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar />
                <List>
                    {['Getting Started'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Box

                sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
                {/** Packages container */}
                <div className="container container--full">
                    <Typography variant="h5">
                        Data Packages
                    </Typography>
                    <Typography variant="body1">
                        Select a data package preset from the options listed below
                    </Typography>
                    <div className="grid">
                        <div className="package container container--package">
                            <Typography className="package__name" variant="h6">
                                {packagesData[0].name}
                            </Typography>
                            <ul className="package__settings">
                                <li><Typography variant="body2">Boundary Type:</Typography> {packagesData[0].boundaryType}</li>
                                <li><Typography variant="body2">Dataset:</Typography> {packagesData[0].dataset}</li>
                                <li><Typography variant="body2">Range:</Typography> {packagesData[0].rangeStart} - {packagesData[0].rangeEnd}</li>
                                <li><Typography variant="body2">Frequency:</Typography> {packagesData[0].frequency}</li>
                                <li><Typography variant="body2">Data Format:</Typography> {packagesData[0].dataFormat}</li>
                                <li><Typography variant="body2">Units:</Typography> {packagesData[0].units}</li>
                            </ul>
                            <Button onClick={() => selectPackageToSave(0)} variant="contained">Customize and download</Button>
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
                            If you proceed, the current package data that is saved will be overwritten by the package that you're selecting
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleOverwriteDialog(false)}>Cancel</Button>
                        <Button onClick={() => handleOverwriteDialog(true)} autoFocus>
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
                    <IconButton onClick={() => toggleDrawer(false)}>
                        <CloseIcon />
                    </IconButton>

                    {isPackageStored &&
                        <IconButton onClick={() => handleClear()}>
                            <DeleteOutlineIcon />
                        </IconButton>
                    }

                    {isPackageStored &&
                        <div className="package-contents">
                            <Typography variant="h5">
                                Review Your Data Package
                            </Typography>

                            <div className="container container--package-setting">
                                <Typography variant="body2">Dataset</Typography> {localPackageSettings.dataset}
                            </div>


                            <div className="container container--package-setting">
                                <Typography variant="body2">Scenario(s)</Typography> {localPackageSettings.scenarios}
                            </div>

                            <div className="container container--package-setting">
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
                            </div>
                            <div className="container container--package-setting">
                                <Typography variant="body2">Variables</Typography>
                                <Autocomplete
                                    multiple
                                    value={selectedVars}
                                    onChange={(event: any, newValue: string | null) => {
                                        setSelectedVars(newValue)
                                    }}
                                    id="tags-outlined"
                                    options={availableVars}
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
                            </div>
                            <div className="container container--package-setting">
                                <Typography variant="body2">Spatial Extent</Typography>
                                <Typography variant="body2">Type</Typography>{localPackageSettings.boundaryType}
                                <Typography variant="body2">Counties</Typography>
                                <Autocomplete
                                    multiple
                                    value={selectedCounties}
                                    onChange={(event: any, newValue: string | null) => {
                                        setSelectedCounties(newValue)
                                    }}
                                    id="tags-outlined"
                                    options={countiesData}
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
                            </div>

                            <div className="container container--package-setting">
                                <Typography variant="body2">Range</Typography> {localPackageSettings.rangeStart} - {localPackageSettings.rangeEnd}
                            </div>
                            <div className="container container--package-setting">
                                <Typography variant="body2">Data Format</Typography> {localPackageSettings.dataFormat}
                            </div>
                        </div>
                    }
                    {!isPackageStored &&
                        <Typography variant="h5">
                            No package available...
                        </Typography>
                    }
                </SidePanel>
            </Box>
        </Box>
    );
}