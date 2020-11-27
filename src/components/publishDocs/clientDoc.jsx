import React, { Component } from 'react'
import collectionsApiService from '../collections/collectionsApiService'
import LoadingScreen from 'react-loading-screen'

class ClientDoc extends Component {
    state = {}
    async redirectToClientDomain () {
      const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
      const currentDomain = window.location.href.split('/')[2]
      if (!domainsList.includes(currentDomain) && window.location.href.split('/')[3] !== 'p') {
        const { data: clientCollection } = await collectionsApiService.getCollectionsByCustomDomain(currentDomain)
        console.log(clientCollection)
        if (Object.keys(clientCollection) && Object.keys(clientCollection)[0]) {
          const clientCollectionId = Object.keys(clientCollection)[0]
          this.props.history.push({ pathname: `/p/${clientCollectionId}` })
        } else {
          this.props.history.push({ pathname: '/p/error' })
        }
      }
    }

    render () {
      this.redirectToClientDomain()
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

export default ClientDoc
