import React from 'react'

import Drawer, { DrawerProps } from '@mui/material/Drawer'

import '@/app/styles/dashboard/sidepanel.scss'

interface SidePanelProps extends DrawerProps {
    classes?: Record<string, string>;
    children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = (props) => {

    return (
        <Drawer PaperProps={{
            sx: {
                backgroundColor: "#F7F9FB"
            },
            className: "sidepanel"
        }}

            {...props}>
            <div tabIndex={0}>{props.children}</div>
        </Drawer >
    )
}

export default SidePanel
