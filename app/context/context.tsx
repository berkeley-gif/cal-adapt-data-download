import React, { ReactNode, useState, useEffect, createContext, useContext, } from 'react'

interface DashboardContextType {
    isSidePanelOpen: boolean;
    setSidePanelOpen: (value: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)


export const DashboardContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false)

    useEffect(() => {
        console.log('sidepanel boolean set to: ' + isSidePanelOpen)
    }, [isSidePanelOpen])
    
    return (
        <DashboardContext.Provider value={{ isSidePanelOpen, setSidePanelOpen }}>
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboardContextProvider = () => {
    const context = useContext(DashboardContext)

    if (context === undefined) {
        throw new Error('useDashboardContextProvider must be used within a DashboardContextProvider')
    }

    return context
}