import { createContext, useContext } from 'react'

export const AttributesContext = createContext()

export const useAttributes = () => useContext(AttributesContext)
