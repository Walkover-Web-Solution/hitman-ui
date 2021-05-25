import React, { Component } from 'react'
import collectionsApiService from '../collections/collectionsApiService'
import '../styles.scss'
import './main.scss'
// import auth from '../auth/authService'
import filterService from '../../services/filterService'
// import UserInfo from '../common/userInfo'
import { ReactComponent as HitmanIcon } from '../../assets/icons/hitman.svg'

const logoUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url='

class PublicView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filteredPublicCollections: {}
    }
  }

  async componentDidMount () {
    const {
      data: response
    } = await collectionsApiService.getAllPublicCollections()
    this.publicCollections = response
    this.setState({ filteredPublicCollections: response })
  }

  filterPublicCollections (e) {
    if (e.currentTarget.value.length === 0) {
      this.setState({ filteredPublicCollections: this.publicCollections })
    }
    const filteredPublicCollectionIds = filterService.filter(
      this.publicCollections,
      e.currentTarget.value,
      'publicView'
    )
    const filteredPublicCollections = {}
    for (let i = 0; i < filteredPublicCollectionIds.length; i++) {
      filteredPublicCollections[
        filteredPublicCollectionIds[i]
      ] = this.publicCollections[filteredPublicCollectionIds[i]]
    }
    this.setState({ filteredPublicCollections })
  }

  openCollection (collectionId) {
    const publicDocsUrl = `${process.env.REACT_APP_UI_URL}/p/${collectionId}`
    window.open(publicDocsUrl, '_blank')
  }

  getImgSrc (collection) {
    if (collection.docProperties?.defaultLogoUrl) return collection.docProperties.defaultLogoUrl
    else return `${logoUrl}${collection.website}`
  }

  render () {
    // const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
    const filteredPublicCollections = this.state.filteredPublicCollections
    return (
      <>
        <div className='public-dashboard-header'>
          <div className='public-dashboard-container'>
            <div className='mar-top-header'>
              <div className='mar-righ-wrapper'>
                <div className='hitman-logo'>
                  <HitmanIcon /> HITMAN
                </div>
                <div className='marketplace'>
                  <a rel='noreferrer'>| &nbsp;&nbsp; Marketplace</a>
                </div>
              </div>
              <div className='mar-top-left-wrapper'>
                <a href='https://hitman.app/' rel='noreferrer' target='_blank'>Host You APIs</a>

                <div className='public-dashboard-action'>
                  {/* {
                    auth.getCurrentUser() === null
                      ? (
                       ""
                      )
                      : (
                        <UserInfo />
                      )
                  } */}
                </div>
              </div>
            </div>
            <div className='searchWrapper'>
              <h1>API integration was never so easy</h1>
              <h3>Expand the possibilities, connect all your apps via "Hitman"</h3>
              <div className='public-dashboard-searchbox'>
                <i className='uil uil-search' />
                <input
                  type='text'
                  placeholder='Search Collections'
                  onChange={this.filterPublicCollections.bind(this)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='collection-wrap'>
          {
            Object.keys(filteredPublicCollections).map((collectionId) =>
              (
                <div
                  key={collectionId}
                  onClick={() => this.openCollection(collectionId)}
                  className='collection-box'
                >
                  <div className='collection-image'>
                    <img
                      src={this.getImgSrc(filteredPublicCollections[collectionId])}
                      alt=''
                    />
                  </div>
                  <h1>{filteredPublicCollections[collectionId].name}</h1>
                </div>
              )
            )
          }
        </div>
      </>
    )
  }
}

export default PublicView
