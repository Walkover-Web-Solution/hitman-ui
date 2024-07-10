import React from 'react'
import { useNavigate } from 'react-router-dom'
import { setNavigate } from './navigationService'

const NavigationSetter = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return null
}

export default NavigationSetter
