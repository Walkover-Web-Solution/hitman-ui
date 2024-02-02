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
import { setTitle, setFavicon, comparePositions, hexToRgb, isTechdocOwnDomain, SESSION_STORAGE_KEY } from '../common/utility'
import { Style } from 'react-style-tag'
import { Modal } from 'react-bootstrap'
import SplitPane from 'react-split-pane'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'
import { useQuery, useQueryClient, useMutation } from 'react-query'
import {currentPublishId} from '../../store/publicReducer/publicReducerActions.js'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()

    const setQueryUpdatedData = (type, id, data) => {
      queryClient.setQueryData([type, id], data)
      return
    }

    const keyExistInReactQuery = (id) => {
      return queryClient.getQueryData(id) == undefined;
    }

    const mutation = useMutation(
      (data) => {return data;},
      {
        onSuccess: (data) => {
          queryClient.setQueryData([data.type, data.id], data?.content || '', {
            staleTime: Number.MAX_SAFE_INTEGER, // Set staleTime to a large value
            retry: 2
          });
        },
      }
    );
    

   

    return <WrappedComponent {...props} setQueryUpdatedData={setQueryUpdatedData} mutationFn={mutation} keyExistInReactQuery = {keyExistInReactQuery}/>
  }
}


const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetch_all_public_endpoints: (collectionIdentifier, domain) =>
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier, domain)),
    add_collection_and_pages: (orgId, queryParams) => dispatch(addCollectionAndPages(orgId, queryParams)),
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

    let url =  new URL(window.location.href);
    const queryParams = new URLSearchParams(this.props.location.search);
    // let collectionId = queryParams.get('collectionId');

    // even if user copy paste other published collection with collection Id in the params change it
    if(queryParams.has('collectionId')){
      var collectionId = queryParams.get('collectionId')
      sessionStorage.setItem(SESSION_STORAGE_KEY.SESSION_STORAGE_KEY, collectionId)
    }else{
       var collectionId = sessionStorage.getItem(SESSION_STORAGE_KEY.SESSION_STORAGE_KEY)
    }

    var queryParamApi2 = {}
     // example `https://localhost:300/path`
    // [info] part 2 get sidebar data and collection data  also set queryParmas for 2nd api call
    if(isTechdocOwnDomain()) { // internal case here collectionId will be there always
      queryParamApi2.collectionId = collectionId

      // setting path
      const pathSegments = url.pathname.split("/");
      queryParamApi2.path = pathSegments.slice(2).join("/"); // ignoring /p in pathName

      this.props.add_collection_and_pages(null,{ collectionId: collectionId}) 
    }else if(!isTechdocOwnDomain()){   // external case
      queryParamApi2.custom_domain = window.location.hostname; // setting hostname

      queryParamApi2.path = url.pathname
      this.props.add_collection_and_pages(null,{custom_domain: window.location.hostname}) 
    }

    // setting version if present
    if(url.searchParams.has('VersionName')){
      queryParamApi2.versionName = url.searchParams.get('VersionName');
    }
     
     
    let queryParamsString = "?";
    for (let key in queryParamApi2) {
      if (queryParamApi2.hasOwnProperty(key)) { // Check if the property belongs to the object (not inherited)
        queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi2[key])}&`;
      }
    } 

    // Remove the last '&' character
    queryParamsString = queryParamsString.slice(0, -1);
    const response = await generalApiService.getPublishedContentByPath(queryParamsString);
    this.setDataToReactQueryAndSessionStorage(response)
  }
  async componentDidUpdate(){
      let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
      if(!this.props.keyExistInReactQuery(currentIdToShow)){
        const response = generalApiService.getPublishedContentByIdAndType(currentIdToShow, this.props.pages?.[currentIdToShow]?.type)
        if(this.props.pages?.[currentIdToShow]?.type == 4  ){
          this.props.mutationFn.mutate({ type:'endpoint' , id:currentIdToShow, content: response })
        }else if(this.props.pages?.[currentIdToShow]?.type != 4  ){
          this.props.mutationFn.mutate({ type:'pageContent' , id:currentIdToShow, content: response })
        }
      }
  }

  setDataToReactQueryAndSessionStorage(response) {
    if (response) {
      var id = response?.data?.publishedContent?.id;
      if(response?.data?.publishedContent?.type === 4)  { 
        this.props.mutationFn.mutate({ type:'endpoint' , id:id, content: response?.data?.publishedContent })
       } 
      else { 
        this.props.mutationFn.mutate({ type:'pageContent' , id:id, content:  response?.data?.publishedContent?.contents })
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
    }
  }

  redirectToDefaultPage(response) {
  
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
    var collectionId = this.state?.publicCollectionId
    const docFaviconLink = this.props.collections[collectionId]?.favicon
      ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}`
      : this.props.collections[collectionId]?.docProperties?.defaultLogoUrl
    const docTitle = this.props.collections[collectionId]?.docProperties?.defaultTitle
    setTitle(docTitle)
    setFavicon(docFaviconLink)

    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    let type = this.props?.pages?.[idToRender]?.type

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
            <div className='hm-sidebar' style={{ backgroundColor: hexToRgb(this.state?.collectionTheme, '0.03') }}>
            { 
            Object.keys(this.props.collections)?.[0]   &&  <  SideBarV2 
            {...this.props} 
            collectionName={this.props?.collections?.[collectionId]?.name} 
            rootParentId = {this.props?.collections?.[collectionId]?.rootParentId} 
            OnPublishedPage = {true}
            />}
            </div>
            {/*  [info] part 3 subpart 1 sidebar data right content */}
            <div
              className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}
              style={{ backgroundColor: hexToRgb(this.state.collectionTheme, '0.01') }}
            >
              {this.state.idToRender !== '' ? (
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
                  
                 { (type == 4)  && <DisplayEndpoint
                    {...this.props}
                    fetch_entity_name={this.fetchEntityName.bind(this)}
                    publicCollectionTheme={this.state.collectionTheme}
                  />
                 }
              
              {(type == 1 || type == 3) &&   <DisplayPage
                    {...this.props}
                    fetch_entity_name={this.fetchEntityName.bind(this)}
                    publicCollectionTheme={this.state.collectionTheme}
                  />
                }
                     
                  {this.displayCTAandLink()}
                  {/* <div className='d-flex flex-row justify-content-start'>
                      <button onClick={() => { this.handleLike() }} className='border-0 ml-5 icon-design'> <img src={ThumbUp} alt='' /></button>
                      <button onClick={() => { this.handleDislike() }} className='border-0 ml-2 icon-design'> <img src={ThumbDown} alt='' /></button>
                    </div> */}
                  {this.state.openReviewModal && this.reviewModal()}
                </div>
              ) :
               <p>API Doc is loading....</p>}
            </div>
          </SplitPane>
        </main>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withQuery(PublicEndpoint))
