'use client'

import Image from 'next/image'
import packageIcon from '@/public/img/icons/package.svg'
import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react"

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import InboxIcon from '@mui/icons-material/MoveToInbox'
import MailIcon from '@mui/icons-material/Mail'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


import SidePanel from './SidePanel'
import './../../styles/components/dashboard.scss'

import { stringToArray } from "@/app/utils/utilFn"
import { getPropertyValueById } from "@/app/utils/utilFn"
import { arrayToCommaSeparatedString } from "@/app/utils/utilFn"

const drawerWidth = 212;

export default function Dashboard({ packagesData }) {

    type SetValue<T> = Dispatch<SetStateAction<T>>;

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

    const isFirstRender = useRef(true)
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false)
    const [overwriteDialogOpen, openOverwriteDialog] = useState<boolean>(false)
    const [availableVars, setAvailableVars] = useState<any>([])
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
    
    const [selectedPackage, setSelectedPackage] = useLocalStorageState<number>('selectedPackage', 0)
    const [tentativePackage, setTentativePackage] = useState<number>(0)
    const [localPackageSettings, setPackageSettings] = useLocalStorageState('package', {
        dataset: '',
        model: '',
        vars: '',
        boundaryType: '',
        boundary: '',
        frequency: '',
        dataFormat: '',
        rangeStart: '',
        rangeEnd: '',
        units: ''
    })

    function handleSave() {
        setPackageSettings({
            dataset: packagesData[selectedPackage].dataset,
            model: packagesData[selectedPackage].model,
            vars: packagesData[selectedPackage].vars,
            boundaryType: packagesData[selectedPackage].boundaryType,
            boundary: '',
            frequency: packagesData[selectedPackage].frequency,
            dataFormat: packagesData[selectedPackage].dataFormat,
            rangeStart: packagesData[selectedPackage].rangeStart,
            rangeEnd: packagesData[selectedPackage].rangeEnd,
            units: packagesData[selectedPackage].units
        })

        setAvailableVars(stringToArray(packagesData[selectedPackage].vars))
        setSelectedVars(stringToArray(packagesData[selectedPackage].vars))
    }

    function selectPackage(id: number) {
        setTentativePackage(id)
        openOverwriteDialog(true)
    }

    function handleOverwriteDialog(overwrite: boolean) {
        if (overwrite) {
            openOverwriteDialog(false)
            setSelectedPackage(tentativePackage)
            handleSave()
            toggleDrawer(true)
        } else {
            setTentativePackage(0)
            openOverwriteDialog(false)
        }
    }

    function handleClear() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.clear();
        }
    }

    function toggleDrawer(open: boolean) {
        setSidePanelOpen(open);
    }

    useEffect(() => {
        setAvailableVars(stringToArray(packagesData[0].vars))
        setSelectedVars(stringToArray(localPackageSettings.vars))
    }, [])

    return (
        <Box sx={{ display: 'flex', width: '100%' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, backgroundColor: `#fffff` }}
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
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
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
                                <li><Typography variant="body2">Model:</Typography> {packagesData[0].model}</li>
                                <li><Typography variant="body2">Dataset:</Typography> {packagesData[0].dataset}</li>
                                <li><Typography variant="body2">Range:</Typography> {packagesData[0].range}</li>
                                <li><Typography variant="body2">Data Format:</Typography> {packagesData[0].dataFormat}</li>
                            </ul>
                            <Button onClick={() => selectPackage(0)} variant="contained">Customize and download</Button>
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
                    <IconButton onClick={() => handleClear()}>
                        <DeleteOutlineIcon />
                    </IconButton>

                    <Typography variant="h5">
                        Review Your Data Package
                    </Typography>

                    <div className="container container--package-setting">
                        <Typography variant="body2">Dataset</Typography> {localPackageSettings.dataset}
                    </div>
                    <div className="container container--package-setting">
                        <Typography variant="body2">Model</Typography> {localPackageSettings.model}
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
                        <Typography variant="body2">Boundary Type</Typography> {localPackageSettings.boundaryType}
                    </div>

                    <div className="container container--package-setting">
                        <Typography variant="body2">Range</Typography> {localPackageSettings.rangeStart} - {localPackageSettings.rangeEnd}
                    </div>
                    <div className="container container--package-setting">
                        <Typography variant="body2">Data Format</Typography> {localPackageSettings.dataFormat}
                    </div>
                </SidePanel>
            </Box>
        </Box>
    );
}