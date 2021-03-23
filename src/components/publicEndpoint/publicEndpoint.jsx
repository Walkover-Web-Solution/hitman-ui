import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import DisplayCollection from '../collections/displayCollection'
import SideBar from '../main/sidebar'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import store from '../../store/store'
import auth from '../auth/authService'
import UserInfo from '../common/userInfo'
import Footer from '../main/Footer'
import { setTitle, setFavicon, comparePositions } from '../common/utility'
import { Style } from 'react-style-tag'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    groups: state.groups,
    endpoints: state.endpoints,
    versions: state.versions,
    pages: state.pages
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetch_all_public_endpoints: (collectionIdentifier) =>
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier))
  }
}

class PublicEndpoint extends Component {
  state = {
    publicCollectionId: '',
    collectionName: '',
    collectionTheme: null,
    isNavBar: false,
    isSticky: false
  };

  componentDidMount() {
    window.addEventListener('scroll', () => {
      let sticky = false
      if (window.scrollY > 20) {
        sticky = true
      } else {
        sticky = false
      }
      this.setState({ isSticky: sticky })
    })
    if (this.props.location.pathname) {
      const collectionIdentifier = this.props.location.pathname.split('/')[2]
      this.props.fetch_all_public_endpoints(collectionIdentifier)
      this.props.history.push({
        collectionIdentifier: collectionIdentifier,
        Environment: 'publicCollectionEnvironment'
      })
    }

    const unsubscribe = store.subscribe(() => {
      // const baseUrl = window.location.href.split('/')[2]
      const collectionId = this.props.location.collectionIdentifier
      // const domain = this.props.location.pathname.split("/");
      if (this.props.collections[collectionId]) {
        // const index = this.props.collections[
        //   collectionId
        // ].docProperties.domainsList.findIndex((d) => d.domain === baseUrl)
        // document.title = this.props.collections[
        //   collectionId
        // ].docProperties.domainsList[index].title;
        unsubscribe()
      }
    })
  }

  redirectToDefaultPage() {
    const collectionId = this.props.match.params.collectionIdentifier
    const versionIds = Object.keys(this.props.versions)
    if (versionIds.length > 0) {
      const defaultVersion = versionIds[0]
      let defaultGroup = null
      let defaultPage = null
      let defaultEndpoint = null
      // Search for Version Pages
      const versionPages = Object.values(this.props.pages).filter(page => page.versionId === defaultVersion && page.groupId === null)
      versionPages.sort(comparePositions)
      defaultPage = versionPages[0]
      if (defaultPage) {
        this.props.history.push({
          pathname: `/p/${collectionId}/pages/${defaultPage.id}/${this.state.collectionName}`
        })
      } else {
        // Search for Group with minimum position
        const versionGroups = Object.values(this.props.groups).filter(group => group.versionId === defaultVersion)
        versionGroups.sort(comparePositions)
        defaultGroup = versionGroups[0]
        if (defaultGroup) {
          // Search for Group Pages with minimum position
          const groupPages = Object.values(this.props.pages).filter(page => page.versionId === defaultVersion && page.groupId === defaultGroup.id)
          groupPages.sort(comparePositions)
          defaultPage = groupPages[0]
          if (defaultPage) {
            this.props.history.push({
              pathname: `/p/${collectionId}/pages/${defaultPage.id}/${this.state.collectionName}`
            })
          } else {
            // Search for Endpoint with minimum position
            const groupEndpoints = Object.values(this.props.endpoints).filter(endpoint => endpoint.groupId === defaultGroup.id)
            groupEndpoints.sort(comparePositions)
            defaultEndpoint = groupEndpoints[0]
            if (defaultEndpoint) {
              this.props.history.push({
                pathname: `/p/${collectionId}/e/${defaultEndpoint.id}/${this.state.collectionName}`
              })
            }
          }
        }
      }
    }
  }

  openLink(link) {
    window.open(`${link}`, '_blank')
  }

  getCTALinks() {
    const collectionId = this.props.match.params.collectionIdentifier
    let { cta, links } = this.props.collections[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = (cta.length !== 0 || links.length !== 0)
    return { cta, links, isCTAandLinksPresent }
  }

  displayCTAandLink() {
    const { cta, links, isCTAandLinksPresent } = this.getCTALinks()
    return (
      <>
        {isCTAandLinksPresent &&
          <div className={this.state.isSticky ? 'd-flex public-navbar stickyNav' : 'd-flex public-navbar'}>
            <div className="entityTitle">
              {this.state.currentEntityName}
            </div>
            <div className="d-flex">
            {links.map((link, index) => (
              <div key={`link-${index}`}>
                <label className='link' htmlFor={`link-${index}`} onClick={() => { this.openLink(link.link) }}>{link.name}</label>
              </div>
            ))}
            {cta.map((cta, index) => (
              <div className='cta-button-wrapper' key={`cta-${index}`}>
                <button style={{ backgroundColor: this.state.collectionTheme, borderColor: this.state.collectionTheme, color: this.state.collectionTheme }} name={`cta-${index}`} onClick={() => { this.openLink(cta.value) }}>{cta.name}</button>
              </div>
            ))}
            </div>
          </div>}
      </>
    )
  }

  fetchEntityName(entityName) {
    if (entityName) { this.setState({ currentEntityName: entityName }) } else { this.setState({ currentEntityName: '' }) }
  }

  render() {
    const collectionId = this.props.match.params.collectionIdentifier
    const docFaviconLink = (this.props.collections[collectionId]?.favicon)
      ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}`
      : this.props.collections[collectionId]?.docProperties?.defaultLogoUrl
    const docTitle = this.props.collections[collectionId]?.docProperties?.defaultTitle
    setTitle(docTitle)
    setFavicon(docFaviconLink)
    if (
      this.props.collections[this.props.location.pathname.split('/')[2]] &&
      this.props.collections[this.props.location.pathname.split('/')[2]].name &&
      this.state.collectionName === ''
    ) {
      const collectionName = this.props.collections[
        this.props.location.pathname.split('/')[2]
      ].name
      const collectionTheme = this.props.collections[
        this.props.location.pathname.split('/')[2]
      ].theme

      this.setState({ collectionName, collectionTheme })
    }
    const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
    if (
      this.props.location.pathname.split('/')[1] === 'p' &&
      (this.props.location.pathname.split('/')[3] === undefined ||
        this.props.location.pathname.split('/')[3] === '') &&
      this.state.collectionName !== ''
    ) {
      this.redirectToDefaultPage()
    }

    const { isCTAandLinksPresent } = this.getCTALinks()
    return (

      <>

        <Style>{`
          .public-navbar .link {
            &:hover {
              color: ${this.state.collectionTheme};
            }
  
          }
        `}
        </Style>
        <nav className='public-endpoint-navbar'>
          {
            process.env.REACT_APP_UI_URL === window.location.origin + '/'
              ? (
                auth.getCurrentUser() === null
                  ? (
                    <div className='dropdown user-dropdown'>
                      <div className='user-info'>
                        <div className='user-avatar'>
                          <i className='uil uil-signin' />
                        </div>
                        <div className='user-details '>
                          <div className='user-details-heading not-logged-in'>
                            <div
                              id='sokt-sso'
                              data-redirect-uri={redirectionUrl}
                              data-source='sokt-app'
                              data-token-key='sokt-auth-token'
                              data-view='button'
                              data-app-logo-url='https://hitman.app/wp-content/uploads/2020/12/123.png'
                              signup_uri={redirectionUrl + '?signup=true'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                  : (
                    <UserInfo />
                  )
              )
              : null
          }
        </nav>
        <main role='main' className='mainpublic-endpoint-main hm-wrapper'>
          <div className='hm-sidebar'>
            <SideBar {...this.props} collectionName={this.state.collectionName} />
          </div>
          <div className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}>
            {this.displayCTAandLink()}
            {
              this.state.collectionName !== ''
                ? (
                  <Switch>
                    <Route
                      path={`/p/:collectionId/e/:endpointId/${this.state.collectionName}`}
                      render={(props) => <DisplayEndpoint
                        {...props}
                        fetch_entity_name={this.fetchEntityName.bind(this)}
                        publicCollectionTheme={this.state.collectionTheme}
                      />}
                    />
                    <Route
                      path={`/p/:collectionId/pages/:pageId/${this.state.collectionName}`}
                      render={(props) => <DisplayPage
                        {...props}
                        fetch_entity_name={this.fetchEntityName.bind(this)}
                        publicCollectionTheme={this.state.collectionTheme}
                      />}
                    />
                    <Route
                      path={`/p/:collectionId/description/${this.state.collectionName}`}
                      render={(props) => <DisplayCollection {...props} {...this.props} publicCollectionTheme={this.state.collectionTheme} />}
                    />
                  </Switch>
                )
                : null
            }
            <Footer />

          </div>
        </main>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint)
