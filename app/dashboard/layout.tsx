'use client'

import React, { ReactNode, useState, useEffect } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


import { SidepanelProvider } from '@/app/context/SidepanelContext';
declare module '@mui/material/Alert' {
    interface AlertPropsVariantOverrides {
        purple: true;
        grey: true;
    }
}

import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material'
import { styled } from '@mui/system'
import { useTheme } from '@mui/material/styles'

import Button from '@mui/material/Button'
import DatasetOutlinedIcon from '@mui/icons-material/DatasetOutlined'
//import Drawer from '@mui/material/Drawer'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import '@/app/styles/dashboard/dashboard.scss'

import CalDashToolbar from '@/app/components/Dashboard/DashboardToolbar'
import { extractSegment } from '@/app/utils/functions'

import packageIcon from '@/public/img/icons/package.svg'
import settingsIcon from '@/public/img/icons/SettingsOutlined.svg'
import sidebarBg from '@/public/img/photos/ocean-thumbnail.png'
import logo from '@/public/img/logos/cal-adapt-data-download.png'

const drawerWidth = 212
interface LayoutProps {
    children: ReactNode;
}

const DrawerHeader = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',
    padding: '0 16px',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1201
}))

const ResponsiveSidebar = styled('div')(({ theme, open }: { theme: any; open: boolean }) => ({
    width: open ? drawerWidth : theme.spacing(9),
    flexShrink: 0,
    minHeight: '100vh',
    height: 'auto',
    transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
    backgroundImage: `url(${sidebarBg.src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    paddingTop: '64px',
    '& .MuiDrawer-paper': {
        width: open ? drawerWidth : theme.spacing(9),
        boxSizing: 'border-box',
        minHeight: '100%',
        border: 'none',
        overflowX: 'hidden',
        transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
    },
}))

const menuItems = [
    { text: 'Data Download Tool', icon: <DatasetOutlinedIcon />, path: '/dashboard/data-download-tool' },
    { text: 'Solar Drought Visualizer', icon: <WbSunnyOutlinedIcon />, path: '/dashboard/solar-drought-visualizer' },
]

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [open, setOpen] = useState(true);
    const pathname = usePathname()
    const selectedPage: string | null = extractSegment(pathname, 'dashboard/', '/')
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    //const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false)

    const toggleDrawer = () => setOpen((prev) => !prev);

    const renderCalDashToolBar = (): ReactNode => {
        switch (selectedPage) {
            case 'data-download-tool':
                return <CalDashToolbar drawerWidth={drawerWidth} sidebarOpen={open} toolName='Data Download Tool' tooltipTitle='Review your selected package' iconSrc={packageIcon} iconAlt='Package icon that you can click on to see your current data package' />
            case 'solar-drought-visualizer':
                return <CalDashToolbar drawerWidth={drawerWidth} sidebarOpen={open} toolName='Solar Drought Visualizer' tooltipTitle='Change your visualization parameters' iconSrc={settingsIcon} iconAlt='Settings icon that you can click on to change your visualization' />
            default:
                return <CalDashToolbar drawerWidth={drawerWidth} sidebarOpen={open} toolName='Getting Started' tooltipTitle='Change your visualization parameters' iconSrc={packageIcon} iconAlt='Settings icon that you can click on to change your visualization' />
        }
    }

    /** const handleResize = () => {
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
    }, [])  **/

    return (
        <SidepanelProvider>
            <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', height: '100%' }}>
                <CssBaseline />
                <ResponsiveSidebar theme={theme} open={open}>
                    <DrawerHeader>
                        {open && (
                            <Image src={logo} alt="Cal Adapt California state logo" style={{ height: '40px' }} />
                        )}

                        <IconButton onClick={toggleDrawer} aria-label="toggle drawer">
                            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </DrawerHeader>

                    <List
                        sx={{
                            '& .MuiListItemIcon-root': { color: '#000' },
                            '&& .Mui-selected, && .Mui-selected:hover': { bgcolor: 'rgba(247, 249, 251, 0.9)' },
                            '& .MuiListItemButton-root:hover': { bgcolor: 'rgba(247, 249, 251, 0.6)', borderRadius: '12px' },
                        }}
                    >
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding component={Link} href={item.path}>
                                <ListItemButton>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text || 'Untitled'} sx={{ opacity: open ? 1 : 0 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </ResponsiveSidebar>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgColor: 'background.default',
                        p: 3,
                        mt: "64px",
                        transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1)',
                        overflowY: 'auto',
                        height: 'calc(100vh - 64px)'
                    }}
                >
                    <AppBar
                        position="fixed"
                        sx={{
                            width: `calc(100% - ${open ? drawerWidth : theme.spacing(9)}px)`,
                            ml: open ? `${drawerWidth}px` : theme.spacing(9),
                            backgroundColor: '#ffffff',
                            boxShadow: 'none',
                            borderBottom: '1px solid #e8e8e8',
                            zIndex: 1100,
                        }}
                    >
                        {renderCalDashToolBar()}
                    </AppBar>
                    {children}
                </Box>
            </Box>

            {/*             <div>
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
            </div> */}
        </SidepanelProvider>
    )
}