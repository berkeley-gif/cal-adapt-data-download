'use client'

import Image from 'next/image'
import packageIcon from '@/public/img/icons/package.svg'
import sidebarBg from '@/public/img/photos/ocean-thumbnail.png'
import logo from '@/public/img/logos/cal-adapt-data-download.png'

import React, { useState, useEffect, useRef } from 'react'
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import DatasetOutlinedIcon from '@mui/icons-material/DatasetOutlined'
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
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';

import './../../styles/components/dashboard.scss'

import DataDownload from '../Data Download Tool/DataDownload'
import CalDashToolbar from './CalDashToolbar'

const DRAWER_WIDTH = 212

interface DashboardProps {
    data: any,
    packagesData: any,
}

export default function Dashboard({ data, packagesData }: DashboardProps) {
    const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false)
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<string>('')

    const handleItemClick = (item: string) => {
        setSelectedItem(item);
    }

    const renderCalDashToolBar = () => {
        switch (selectedItem) {
            case 'Data Download Tool':
                return <CalDashToolbar toolName='Data Download Tool' tooltipTitle='Review your selected package' toggleDrawer={toggleDrawer} iconSrc={packageIcon} iconAlt='Package icon that you can click on to see your current data package' isSidePanelOpen={isSidePanelOpen} setSidePanelOpen={setSidePanelOpen} />
            case 'Solar Drought Visualizer':
                return <CalDashToolbar toolName='Solar Drought Visualizer' tooltipTitle='Change your visualization parameters' toggleDrawer={toggleDrawer} iconSrc={packageIcon} iconAlt='Settings icon that you can click on to change your visualization' isSidePanelOpen={isSidePanelOpen} setSidePanelOpen={setSidePanelOpen} />
            default:
                return <CalDashToolbar toolName='Getting Started' tooltipTitle='Change your visualization parameters' toggleDrawer={toggleDrawer} iconSrc={packageIcon} iconAlt='Settings icon that you can click on to change your visualization' isSidePanelOpen={isSidePanelOpen} setSidePanelOpen={setSidePanelOpen} />
        }
    }

    const renderContent = () => {
        switch (selectedItem) {
            case 'Data Download Tool':
                return <DataDownload isSidePanelOpen={isSidePanelOpen} setSidePanelOpen={setSidePanelOpen} data={data} packagesData={packagesData} />
            case 'Solar Drought Visualizer':
                return <div>Solar Drought Visualizer</div>;
            default:
                return <div>Getting Started</div>;
        }
    };

    function toggleDrawer(open: boolean) {
        setSidePanelOpen(open)
    }

    const handleResize = () => {
        const width: number = window.innerWidth
        const tabletBreakpoint: number = 768

        setIsMobileOrTablet(width < tabletBreakpoint)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)

        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <div>
            {!isMobileOrTablet ? <Box className="dashboard" sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px`, backgroundColor: `#fffff`, boxShadow: `none`, borderBottom: `1px solid #e8e8e8` }}
                >
                    {renderCalDashToolBar()}
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
                        {['Data Download Tool', 'Solar Drought Visualizer'].map((text, index) => (
                            <ListItem key={text} disablePadding onClick={() => handleItemClick(text)}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        {text == "Data Download Tool" ? <DatasetOutlinedIcon /> : <WbSunnyOutlinedIcon /> }
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <Box
                    component="main"
                    sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: "64px" }}
                >

                    {renderContent()}
                </Box>
            </Box >
                :
                <div className="mobile-view">
                    <div className="mobile-view__container">
                        <Image
                            src={logo}
                            alt="Cal Adapt logo"
                            className="cal-adapt-logo__mobile"
                        />
                        <Typography variant="body1">Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or laptop computer</Typography>
                        <Button variant="contained" href="https://cal-adapt.org">Go to the homepage</Button>
                    </div>
                </div>
            }
        </div>
    )
}