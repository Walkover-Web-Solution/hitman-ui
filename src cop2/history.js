import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { setNavigate, setParams } from './navigationService'

const NavigationSetter = () => {
  const navigate = useNavigate()
  const params = useParams()

  React.useEffect(() => {
    setNavigate(navigate)
    setParams(params)
  }, [navigate, params])

  return null
}

export default NavigationSetter
