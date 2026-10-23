import { createContext, useContext } from 'react'

// Interface customization (theme + whether the feed shows content/images)
export const SettingsContext = createContext(null)
export const useSettings = () => useContext(SettingsContext)
