import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import SideBar from '../main/sidebar'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import store from '../../store/store'
import auth from '../auth/authService'
import UserInfo from '../common/userInfo'
import Footer from '../main/Footer'
// import ThumbUp from '../../assets/icons/thumb_up.svg'
// import ThumbDown from '../../assets/icons/thumb_down.svg'
import { setTitle, setFavicon, comparePositions, hexToRgb } from '../common/utility'
import { Style } from 'react-style-tag'
import SplitPane from 'react-split-pane'
// import { Modal } from 'react-bootstrap'

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
    fetch_all_public_endpoints: (collectionIdentifier, domain) =>
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier, domain))
  }
}

class PublicEndpoint extends Component {
  state = {
    publicCollectionId: '',
    collectionName: '',
    collectionTheme: null,
    isNavBar: false,
    isSticky: false,
    likeActive: false,
    dislikeActive: false,
    review: [{
      feedback: 'like',
      endpoint: null
    }],
    key: {
      endpoint: 'like'
    },
    openReviewModal: false,
    hideReviewbutton: true
  };

  componentDidMount () {
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
      this.props.fetch_all_public_endpoints(collectionIdentifier, window.location.hostname)
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

  redirectToDefaultPage () {
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

  openLink (link) {
    window.open(`${link}`, '_blank')
  }

  getCTALinks () {
    const collectionId = this.props.match.params.collectionIdentifier
    let { cta, links } = this.props.collections[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = (cta.length !== 0 || links.length !== 0)
    return { cta, links, isCTAandLinksPresent }
  }

  displayCTAandLink () {
    const { cta, links, isCTAandLinksPresent } = this.getCTALinks()
    return (
      <>
        <div
          className={this.state.isSticky ? 'd-flex public-navbar stickyNav' : 'd-flex public-navbar'}
        >
          <div className='entityTitle  p-3'>
            {this.state.currentEntityName}
          </div>
          {
            isCTAandLinksPresent &&
              <div className='d-flex  p-3 pr-3'>
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
          }
        </div>
      </>
    )
  }

  fetchEntityName (entityName) {
    if (entityName) { this.setState({ currentEntityName: entityName }) } else { this.setState({ currentEntityName: '' }) }
  }

  toggleReviewModal= () => this.setState({ openReviewModal: !this.state.openReviewModal });

  // reviewModal () {
  //   return (
  //     <div onHide={() => this.props.onHide()} show top>
  //       <Modal show top>
  //         <div className=''>
  //           <Modal.Header closeButton>
  //             <Modal.Title>API FeedBack</Modal.Title>
  //           </Modal.Header>
  //           <Modal.Body>
  //             <form className='form-group d-flex flex-column'>
  //               <label>
  //                 User Name:
  //                 <input type='text' name='name' className='form-control w-75 mb-2' />
  //               </label>
  //               <label>
  //                 Comment:
  //                 <textarea type='text' name='name' className='form-control w-75 mb-3' />
  //               </label>
  //               <input type='submit' value='Submit' className='btn btn-primary w-25' />
  //             </form>
  //           </Modal.Body>
  // handleSubmit = (e) =>{
  //   e.preventDefault()
  // }
  // handleInputs = (e) =>{
  //   e.preventDefault()
  //   let name,value;
  //   name = e.target.name;
  //   value = e.target.value;

  //  // setUser({...user, [name]:value})
  // }
  // reviewModal (){
  //   return (
  //       <Modal onHide={() => this.setState({ openReviewModal: false })} show={this.state.openReviewModal} top>
  //         <div className=''>
  //           <Modal.Header closeButton>
  //             <Modal.Title>API FeedBack</Modal.Title>
  //           </Modal.Header>
  //           <Modal.Body>
  //             <form onSubmit={this.handleSubmit()}>
  //               <label>
  //                 User Name:<br/>
  //                 <input type='text' name='name' onChange={this.handleInputs()}/><br/>
  //               </label><br/>
  //               <label>
  //                 Comment<br/>
  //                 <textarea type='text' name='name' onChange={this.handleInputs()}/><br/>
  //               </label>
  //               <br  /><input type='submit' value='Submit' />
  //             </form>
  //           </Modal.Body>

  //           <Modal.Footer>
  //           </Modal.Footer>
  //         </div>
  //       </Modal>
  //   )
  // }

  savelocalstorage (key2, value) {
    const review = '{}'
    const key = JSON.parse(review)
    const key1 = key2
    key[key1] = value
    window.localStorage.setItem('review', JSON.stringify(this.state.key))
    console.log(this.state.key)
    this.setState(prevState => ({ key: [...prevState.key, key] }))
  }

  setDislike () {
    this.setState({ dislikeActive: !this.state.dislikeActive }, () => {
      const endpoint = this.props.location.pathname.split('/')
      this.savelocalstorage(endpoint[4], 'dislike')
      // this.setState({ endpoint: endpointId })
      // const review = { ...this.state.review.endpoint }
      // review.endpoint = endpointId[4]
      // if (this.state.dislikeActive) { review.feedback = 'disliked' }
      // window.localStorage.setItem('review', JSON.stringify(review))
    })
    this.toggleReviewModal()
  }

  setLike () {
    this.setState({ likeActive: !this.state.likeActive })
    const endpoint = [...this.props.location.pathname.split('/')]
    this.savelocalstorage(endpoint[4], 'like')
    // const review = '{}';
    // //if(this.state.likeActive){ this.setState({feedback'liked'}) }
    // const key = JSON.parse(review);
    // const key1 = endpoint[4]
    // key[key1] = 'like'
    // // let newReview = {endpoint,feedback}
    // // this.state.review.endpoint = endpoint[4]
    // // this.state.review.feedback = this.state.likeActive
    // window.localStorage.setItem('review', JSON.stringify(this.state.key))
    // console.log(this.state.key)
    // this.setState(prevState => ({ key: [...prevState.key, key] }))
  }

  handleLike () {
    // this.setState({ hideReviewbutton:!this.state.hideReviewbutton })
    if (this.state.dislikeActive) {
      // this.setLike();
      // this.setDislike();
    }
    this.setLike()
  }

  handleDislike () {
    // this.setState({ hideReviewbutton:!this.state.hideReviewbutton })
    if (this.state.likeActive) {
      // this.setDislike();
      // this.setLike();
    }
    this.setDislike()
  }

  render () {
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
                                data-source='hitman'
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
        <main role='main' className={this.state.isSticky ? 'mainpublic-endpoint-main hm-wrapper stickyCode' : 'mainpublic-endpoint-main hm-wrapper'}>
          <SplitPane split='vertical' className='split-sidebar'>
            <div className='hm-sidebar' style={{ backgroundColor: hexToRgb(this.state.collectionTheme, '0.03') }}>
              <SideBar {...this.props} collectionName={this.state.collectionName} />
            </div>
            <div className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}>
              {this.displayCTAandLink()}
              {
              this.state.collectionName !== ''
                ? (
                  <div
                    onScroll={(e) => {
                      if (e.target.scrollTop > 20) { this.setState({ isSticky: true }) } else { this.setState({ isSticky: false }) }
                    }}
                    className='display-component'
                  >
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
                    </Switch>
                    {/* <div className='d-flex flex-row justify-content-start'>
                      <button onClick={() => { this.handleLike() }} className='border-0 ml-5 icon-design'> <img src={ThumbUp} alt='' /></button>
                      <button onClick={() => { this.handleDislike() }} className='border-0 ml-2 icon-design'> <img src={ThumbDown} alt='' /></button>
                    </div> */}
                    {this.state.openReviewModal && this.reviewModal()}
                    {/* { this.state.hideReviewbutton && <div>
                    <button onClick={() => { this.handleLike() }}>like</button>
                    <span>'    '</span>
                    <button onClick={() => { this.handleDislike() }}> dislike </button>
                    </div>}
                    {this.state.openReviewModal && this.reviewModal()} */}
                  </div>
                  )
                : null
            }
              <Footer theme={this.state.collectionTheme} />

            </div>
          </SplitPane>

        </main>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint)
