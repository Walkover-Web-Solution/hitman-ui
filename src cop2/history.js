// NavigationSetter component

'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { setRouter, setParams } from './navigationService'

const NavigationSetter = () => {
  const router = useRouter()
  const params = useParams()

  React.useEffect(() => {
    setRouter(router)
    setParams(params)
  }, [router, params])

  return null
}

export default NavigationSetter