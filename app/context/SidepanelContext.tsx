'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type SidepanelContextType = {
    open: boolean;
    toggleOpen: () => void;
}

const SidepanelContext = createContext<SidepanelContextType | undefined>(undefined)

export const SidepanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false)

    const toggleOpen = () => {
        setOpen(prev => !prev)
    }

    return (
        <SidepanelContext.Provider value={{ open, toggleOpen }}>
            {children}
        </SidepanelContext.Provider>
    )
}

export const useSidepanel = () => {
    const context = useContext(SidepanelContext)

    if (!context) {
        throw new Error('useSidepanel must be used within a SidepanelProvider')
    }

    return context
} 