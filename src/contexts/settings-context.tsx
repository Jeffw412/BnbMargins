"use client"

import { createContext, useContext, useEffect, useState } from 'react'

export type AirbnbFeeModel = 'split' | 'host-only'

interface SettingsContextType {
  airbnbFeeModel: AirbnbFeeModel
  setAirbnbFeeModel: (model: AirbnbFeeModel) => void
  currency: string
  setCurrency: (currency: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [airbnbFeeModel, setAirbnbFeeModelState] = useState<AirbnbFeeModel>('split')
  const [currency, setCurrencyState] = useState<string>('USD')

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFeeModel = localStorage.getItem('airbnbFeeModel') as AirbnbFeeModel
      const savedCurrency = localStorage.getItem('currency')

      if (savedFeeModel && (savedFeeModel === 'split' || savedFeeModel === 'host-only')) {
        setAirbnbFeeModelState(savedFeeModel)
      }

      if (savedCurrency) {
        setCurrencyState(savedCurrency)
      }
    }
  }, [])

  const setAirbnbFeeModel = (model: AirbnbFeeModel) => {
    setAirbnbFeeModelState(model)
    if (typeof window !== 'undefined') {
      localStorage.setItem('airbnbFeeModel', model)
    }
  }

  const setCurrency = (currency: string) => {
    setCurrencyState(currency)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        airbnbFeeModel,
        setAirbnbFeeModel,
        currency,
        setCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
