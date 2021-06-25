import React, { Component } from 'react'
import collectionsApiService from '../collections/collectionsApiService'
import LoadingScreen from 'react-loading-screen'

class Landing extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  async redirectToRelevantPage () {
    const isDesktop = process.env.REACT_APP_IS_DESKTOP
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    if (!domainsList.includes(currentDomain) && !isDesktop) {
      const { data: clientCollection } = await collectionsApiService.getCollectionsByCustomDomain(currentDomain)
      if (Object.keys(clientCollection) && Object.keys(clientCollection)[0]) {
        const clientCollectionId = Object.keys(clientCollection)[0]
        this.props.history.push({ pathname: `/p/${clientCollectionId}` })
      } else {
        this.props.history.push({ pathname: '/p/error' })
      }
    } else {
      const orgList = JSON.parse(window.localStorage.getItem('organisationList'))
      if (orgList) {
        const orgId = orgList[0].identifier
        this.props.history.push({
          pathname: `/orgs/${orgId}/dashboard`
        })
      } else {
        this.props.history.push({
          pathname: '/logout'
        })
      }
    }
  }

  render () {
    this.redirectToRelevantPage()
    return (
      <LoadingScreen
        loading='true'
        bgColor='#f1f1f1'
        spinnerColor='#9ee5f8'
        textColor='#676767'
        logoSrc='/static/media/hitman.8a9ab55b.svg'
        text="Hold on! You're being redirected to the doc."
      />
    )
  }
}

export default Landing
