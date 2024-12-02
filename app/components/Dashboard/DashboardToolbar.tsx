import React from 'react'
import Image from 'next/image'

import Breadcrumbs from '@mui/material/Breadcrumbs'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import { useSidepanel } from '@/app/context/SidepanelContext'

interface ToolbarProps {
    toolName: string,
    tooltipTitle: string | null,
    iconSrc: any | null,
    iconAlt: string | null,
    sidebarOpen: boolean,
    drawerWidth: number
}

export default function CalDashToolbar({ toolName, tooltipTitle, iconSrc, iconAlt, sidebarOpen, drawerWidth }: ToolbarProps) {
    const { open, toggleOpen } = useSidepanel()

    return (
        <Toolbar className="toolbar-main" sx={{ ml: sidebarOpen ? 0 : `72px`, justifyContent: `space-between` }}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">
                    Cal-Adapt Dashboard
                </Link>
                <Typography color="text.primary">{toolName}</Typography>
            </Breadcrumbs>
            {iconSrc &&
                <Tooltip
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                    title={tooltipTitle}
                >

                    <IconButton onClick={toggleOpen}>
                        <Image
                            src={iconSrc}
                            alt={iconAlt}
                        />
                    </IconButton>

                </Tooltip>
            }
        </Toolbar>
    )
}

