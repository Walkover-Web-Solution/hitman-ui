import React, { Component } from 'react'
import collectionsApiService from '../collections/collectionsApiService'
import { getDomainName } from '../common/utility'
class ClientDoc extends Component {
  state = {}
  async redirectToClientDomain () {
    const isDesktop = process.env.REACT_APP_IS_DESKTOP
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    if ((!domainsList.includes(currentDomain) && window.location.href.split('/')[3] !== 'p') && !isDesktop) {
      const { data: clientCollection } = await collectionsApiService.getCollectionsByCustomDomain(currentDomain)
      if (Object.keys(clientCollection) && Object.keys(clientCollection)[0]) {
        const clientCollectionId = Object.keys(clientCollection)[0]
        this.props.history.push({ pathname: `/p/${clientCollectionId}` })
      } else {
        this.props.history.push({ pathname: '/p/error' })
      }
    }
  }

  getDocName () {
    const docName = getDomainName(window.location.hostname)
    if (docName) { return docName.toUpperCase() + ' ' } else { return '' }
  }

  render () {
    this.redirectToClientDomain()
    return (
      <div className='custom-loading-container'>
        <div className='loading-content'>
          <h2>{this.getDocName}</h2>
          <p>API Doc is loading....</p>
        </div>
      </div>
    )
  }
}

export default ClientDoc
