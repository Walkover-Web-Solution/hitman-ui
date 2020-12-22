import React, { Component } from 'react'
import collectionsApiService from '../collections/collectionsApiService'
import '../styles.scss'
import './main.scss'
import auth from '../auth/authService'
import filterService from '../../services/filterService'
import UserInfo from '../common/userInfo'

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

  render () {
    const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
    const filteredPublicCollections = this.state.filteredPublicCollections
    return (
      <>
        <div className='public-dashboard-header'>
          <div className='public-dashboard-container'>
            <div className='public-dashboard-searchbox'>
              <i className='uil uil-search' />
              <input
                type='text'
                placeholder='Search Collections'
                onChange={this.filterPublicCollections.bind(this)}
              />
            </div>
            <div className='public-dashboard-action'>
              {
                auth.getCurrentUser() === null
                  ? (
                    <div
                      id='sokt-sso'
                      data-redirect-uri={redirectionUrl}
                      data-source='sokt-app'
                      data-token-key='sokt-auth-token'
                      data-view='button'
                      data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'

                    />
                    )
                  : (
                    <UserInfo />
                    )
              }
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
                      src={`//logo.clearbit.com/${filteredPublicCollections[collectionId].name}.com`}
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
