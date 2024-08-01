'use client'

import React, { ReactNode, useState, useEffect } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import packageIcon from '@/public/img/icons/package.svg'
import sidebarBg from '@/public/img/photos/ocean-thumbnail.png'
import logo from '@/public/img/logos/cal-adapt-data-download.png'
import { SidepanelProvider } from '@/app/context/SidepanelContext';
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import DatasetOutlinedIcon from '@mui/icons-material/DatasetOutlined'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import '@/app/styles/dashboard/dashboard.scss'

import CalDashToolbar from '@/app/components/Dashboard/DashboardToolbar'
import { extractSegment } from '@/app/utils/functions'

const DRAWER_WIDTH = 212

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname()
    const selectedPage: string | null = extractSegment(pathname, 'dashboard/', '/')
    const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false)

    const renderCalDashToolBar = (): ReactNode => {
        switch (selectedPage) {
            case 'data-download-tool':
                return <CalDashToolbar toolName='Data Download Tool' tooltipTitle='Review your selected package' iconSrc={packageIcon} iconAlt='Package icon that you can click on to see your current data package' />
            case 'solar-drought-visualizer':
                return <CalDashToolbar toolName='Solar Drought Visualizer' tooltipTitle='Change your visualization parameters' iconSrc={packageIcon} iconAlt='Settings icon that you can click on to change your visualization' />
            default:
                return <CalDashToolbar toolName='Getting Started' tooltipTitle='Change your visualization parameters' iconSrc={packageIcon} iconAlt='Settings icon that you can click on to change your visualization' />
        }
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
        <SidepanelProvider>
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
                            <ListItem key='data-download-tool' disablePadding component={Link} href="/dashboard/data-download-tool">
                                <ListItemButton>
                                    <ListItemIcon>
                                        <DatasetOutlinedIcon />
                                    </ListItemIcon>
                                    <ListItemText primary='Data Download Tool' />
                                </ListItemButton>
                            </ListItem>
                            <ListItem key='solar-drought-visualizer' disablePadding component={Link} href="/dashboard/solar-drought-visualizer">
                                <ListItemButton>
                                    <ListItemIcon>
                                        <WbSunnyOutlinedIcon />
                                    </ListItemIcon>
                                    <ListItemText primary='Solar Drought Visualizer' />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Drawer>
                    <Box
                        component="main"
                        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: "64px" }}
                    >
                        {children}
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
        </SidepanelProvider>
    )
}