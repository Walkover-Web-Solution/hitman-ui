import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import SideBarV2 from '../main/sideBarV2'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import { store } from '../../store/store'
import { getCurrentUser } from '../auth/authServiceV2'
import UserInfo from '../common/userInfo'
// import ThumbUp from '../../assets/icons/thumb_up.svg'
// import ThumbDown from '../../assets/icons/thumb_down.svg'
import { setTitle, setFavicon, comparePositions, hexToRgb } from '../common/utility'
import { Style } from 'react-style-tag'
import { Modal } from 'react-bootstrap'
import SplitPane from 'react-split-pane'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'



const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetch_all_public_endpoints: (collectionIdentifier, domain) =>
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier, domain)),
      add_collection_and_pages: (orgId, queryParams) => dispatch(addCollectionAndPages(orgId, queryParams))
  }
}

class PublicEndpoint extends Component {
  state = {
    publicCollectionId: '',
    publicEndpointId: '',
    publicPageId: '',
    collectionName: '',
    collectionTheme: null,
    isNavBar: false,
    isSticky: false,
    likeActive: false,
    dislikeActive: false,
    review: {
      feedback: {},
      endpoint: {}
    },
    openReviewModal: false
  }

  async componentDidMount() {
    // [info] => part 1 scroll options
    window.addEventListener('scroll', () => {
      let sticky = false
      if (window.scrollY > 20) {
        sticky = true
      } else {
        sticky = false
      }
      this.setState({ isSticky: sticky })
    })

    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : []
    const currentDomain = window.location.href.split('/')[2]
    let url =  new URL(window.location.href);

    var queryParamApi2 = {}
     // example `https://localhost:300/path`
    // [info] part 2 get sidebar data and collection data  also set queryParmas for 2nd api call
    if(url.pathname.split('/')[1] == 'p' ) { // internal case
      const collectionId = url.pathname.split('/')[2]
      queryParamApi2.collectionId = collectionId
      this.props.add_collection_and_pages(null,{collectionId:collectionId}) 
    }else if(!domainsList.includes(currentDomain) && window.location.href.split('/')[1] !== 'p'){   // external case
      queryParamApi2.custom_domain = currentDomain;
      queryParamApi2.versionName = url.searchParams.has('VersionName');
      queryParamApi2.path = url.pathname.substring(1);
      this.props.add_collection_and_pages(null,{custom_domain:currentDomain}) 

    }

    // setting query params value
    let queryParamsString = `?`;
    for(let key in queryParamApi2){queryParamsString += `${key}=${queryParamApi2[key]}`}

    try {
      const response = await generalApiService.getPublishedContent(queryParamsString);
      
      if (response) {
        let data = response?.data?.publishedContent?.type === 4 ? { publicEndpointId: response?.data?.publishedContent?.id } : { publicPageId: response?.data?.publishedContent?.id };
        this.setState(data);
      }
    } catch (error) {
      console.error(error);
    }
    

    // [info] to unsubscribe if a certain condition is met 
    const unsubscribe = store.subscribe(() => {
      const collectionId = Object.keys(this.props.collections)[0];
      if (collectionId) {
        this.setState({ publicCollectionId: collectionId});
        unsubscribe()  // [info] if this.props.collections[collectionId] is found then there will be no further updates to redux
      }
    })
  }

  redirectToDefaultPage() {
   
  }

  openLink(link) {
    window.open(`${link}`, '_blank')
  }

  getCTALinks() {
    const collectionId = this.props.match.params.collectionIdentifier
    let { cta, links } = this.props.collections[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = cta.length !== 0 || links.length !== 0
    return { cta, links, isCTAandLinksPresent }
  }

  displayCTAandLink() {
    const { cta, links, isCTAandLinksPresent } = this.getCTALinks()
    return (
      <>
        <div className={this.state.isSticky ? 'd-flex public-navbar stickyNav' : 'public-navbar d-flex'}>
          {/* <div className='entityTitle'>
            {this.state.currentEntityName}
          </div> */}
          {isCTAandLinksPresent && (
            <div className='d-flex align-items-center'>
              {links.map((link, index) => (
                <div key={`link-${index}`}>
                  <label
                    className='link'
                    htmlFor={`link-${index}`}
                    onClick={() => {
                      this.openLink(link.link)
                    }}
                  >
                    {link.name}
                  </label>
                </div>
              ))}
              {cta.map((cta, index) => (
                <div className='cta-button-wrapper' key={`cta-${index}`}>
                  <button
                    style={{
                      backgroundColor: this.state.collectionTheme,
                      borderColor: this.state.collectionTheme,
                      color: this.state.collectionTheme
                    }}
                    name={`cta-${index}`}
                    onClick={() => {
                      this.openLink(cta.value)
                    }}
                  >
                    {cta.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  fetchEntityName(entityName) {
    if (entityName) {
      this.setState({ currentEntityName: entityName })
    } else {
      this.setState({ currentEntityName: '' })
    }
  }

  toggleReviewModal = () => this.setState({ openReviewModal: !this.state.openReviewModal })

  reviewModal() {
    return (
      <div onHide={() => this.props.onHide()} show top>
        <Modal show top>
          <div className=''>
            <Modal.Header closeButton>
              <Modal.Title>API FeedBack</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className='form-group d-flex flex-column'>
                <label>
                  User Name:
                  <input type='text' name='name' className='form-control w-75 mb-2' />
                </label>
                <label>
                  Comment:
                  <textarea type='text' name='name' className='form-control w-75 mb-3' />
                </label>
                <input type='submit' value='Submit' className='btn btn-primary w-25' />
              </form>
            </Modal.Body>

            <Modal.Footer>
              <button
                className='btn btn-custom-dark'
                onClick={() => this.subscribeToExtendedLog()}
                onHide={() => this.setState({ showExtendedLog: false })}
              >
                Subscribe For Extended Log
              </button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    )
  }

  setDislike() {
    this.setState({ dislikeActive: !this.state.dislikeActive }, () => {
      const data = this.props.match.params.endpointId
      // const endpoint = this.state
      this.setState({ endpoint: data })
      const review = { ...this.state.review.endpoint }
      review.endpoint = this.props.match.params
      if (this.state.dislikeActive) {
        review.feedback = 'disliked'
      }
      window.localStorage.setItem('review', JSON.stringify(review))
    })
    this.toggleReviewModal()
  }

  setLike() {
    this.setState({ likeActive: !this.state.likeActive }, () => {
      const review = { ...this.state.review }
      review.endpoint = this.props.match.params
      if (this.state.likeActive) {
        review.feedback = 'liked'
      }
      window.localStorage.setItem('review', JSON.stringify(review))
    })
  }

  handleLike() {
    if (this.state.dislikeActive) {
      // this.setLike();
      // this.setDislike();
    }
    this.setLike()
  }

  handleDislike() {
    if (this.state.likeActive) {
      // this.setDislike();
      // this.setLike();
    }
    this.setDislike()
  }

  render() {
    // [info] part 1  set collection data
    const collectionId = this.state.publicCollectionId
    const docFaviconLink = this.props.collections[collectionId]?.favicon
      ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}`
      : this.props.collections[collectionId]?.docProperties?.defaultLogoUrl
    const docTitle = this.props.collections[collectionId]?.docProperties?.defaultTitle
    setTitle(docTitle)
    setFavicon(docFaviconLink)

    // [info] part 2 seems not necessary 
    // TODO later
    if (
      this.props.collections[this.props.location.pathname.split('/')[2]] &&
      this.props.collections[this.props.location.pathname.split('/')[2]].name &&
      this.state.collectionName === ''
    ) {
      const collectionName = this.props.collections[this.props.location.pathname.split('/')[2]].name
      const collectionTheme = this.props.collections[this.props.location.pathname.split('/')[2]].theme

      this.setState({ collectionName, collectionTheme })
    }

    // [info] part 3 seems not necessary 
    // TODO later
    const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'
    if (
      this.props.location.pathname.split('/')[1] === 'p' &&
      (this.props.location.pathname.split('/')[3] === undefined || this.props.location.pathname.split('/')[3] === '') &&
      this.state.collectionName !== ''
    ) {
      this.redirectToDefaultPage()
    }

    // [info] part 3 seems not necessary 
    // TODO later
    const { isCTAandLinksPresent } = this.getCTALinks()

    return (
      <>
      {/* [info] part 1 style component */}
        <Style>
          {`
          .link {
            &:hover {
              color: ${this.state.collectionTheme};
            }
  
          }
        `}
        </Style>
        <nav className='public-endpoint-navbar'>

          {/* [info] part 2 only do this if from own origin TODO Later */}
          {process.env.REACT_APP_UI_URL === window.location.origin + '/' ?
           (
            getCurrentUser() === null ? (
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
            ) : (
              <UserInfo />
            )
          ) : null}
        </nav>
        <main
          role='main'
          className={this.state.isSticky ? 'mainpublic-endpoint-main hm-wrapper stickyCode' : 'mainpublic-endpoint-main hm-wrapper'}
        >

          
          {/* [info] part 3 */}
          <SplitPane split='vertical' className='split-sidebar'>
            {/* [info] part 3 subpart 1 sidebar data left content */}
            <div className='hm-sidebar' style={{ backgroundColor: hexToRgb(this.state.collectionTheme, '0.03') }}>
              <SideBarV2 {...this.props} collectionName={this.state.collectionName} />
            </div>
            {/*  [info] part 3 subpart 1 sidebar data right content */}
            <div
              className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}
              style={{ backgroundColor: hexToRgb(this.state.collectionTheme, '0.01') }}
            >
              {this.state.collectionName !== '' ? (
                <div
                  onScroll={(e) => {
                    if (e.target.scrollTop > 20) {
                      this.setState({ isSticky: true })
                    } else {
                      this.setState({ isSticky: false })
                    }
                  }}
                  className='display-component'
                >
                  
                 {(this.state.publicEndpointId)  && <DisplayEndpoint
                    {...this.props}
                    fetch_entity_name={this.fetchEntityName.bind(this)}
                    publicCollectionTheme={this.state.collectionTheme}
                  />
                 }
              
              {(this.state.publicPageId) &&   <DisplayPage
                    {...this.props}
                    fetch_entity_name={this.fetchEntityName.bind(this)}
                    publicCollectionTheme={this.state.collectionTheme}
                  />
                }
                {!(this.state.publicEndpointId) && (this.state.publicPageId) &&
                     <p>API Doc is loading....</p>
                
                }
                     
                  {this.displayCTAandLink()}
                  {/* <div className='d-flex flex-row justify-content-start'>
                      <button onClick={() => { this.handleLike() }} className='border-0 ml-5 icon-design'> <img src={ThumbUp} alt='' /></button>
                      <button onClick={() => { this.handleDislike() }} className='border-0 ml-2 icon-design'> <img src={ThumbDown} alt='' /></button>
                    </div> */}
                  {this.state.openReviewModal && this.reviewModal()}
                </div>
              ) : null}
            </div>
          </SplitPane>
        </main>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint)
