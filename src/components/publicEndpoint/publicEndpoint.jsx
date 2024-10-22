'use client'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import { setFavicon, hexToRgb, isTechdocOwnDomain, SESSION_STORAGE_KEY } from '../common/utility'
import { Modal } from 'react-bootstrap'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'
import { useQueryClient, useMutation } from 'react-query'
import { background } from '../backgroundColor.js'
import withRouter from '../common/withRouter.jsx'
import '../collections/collections.scss'
import './publicEndpoint.scss'
import '../collectionVersions/collectionVersions.scss'
import 'react-toastify/dist/ReactToastify.css'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()
    const setQueryUpdatedData = (type, id, data) => {
      queryClient.setQueryData([type, id], data)
      return
    }

    const keyExistInReactQuery = (id) => {
      return queryClient.getQueryData(id) == undefined
    }

    const mutation = useMutation(
      (data) => {
        return data
      },
      {
        onSuccess: (data) => {
          queryClient.setQueryData([data.type, data.id], data?.content || '', {
            staleTime: Number.MAX_SAFE_INTEGER,
            retry: 2
          })
        }
      }
    )
    return (
      <WrappedComponent
        {...props}
        setQueryUpdatedData={setQueryUpdatedData}
        mutationFn={mutation}
        keyExistInReactQuery={keyExistInReactQuery}
      />
    )
  }
}

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
      dispatch(fetchAllPublicEndpoints(ownProps.navigate, collectionIdentifier, domain)),
    add_collection_and_pages: (orgId, queryParams) => dispatch(addCollectionAndPages(orgId, queryParams))
  }
}

class PublicEndpoint extends Component {
  constructor() {
    super()
    this.state = {
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
      openReviewModal: false,
      idToRenderState: null
    }
    this.iconRef = React.createRef()
    this.hamburgerIconRef = React.createRef()
    this.logoName = React.createRef()
    this.closeIconRef = React.createRef()
  }

  async componentDidMount() {
    window.addEventListener('scroll', () => {
      let sticky = false
      if (window.scrollY > 20) {
        sticky = true
      } else {
        sticky = false
      }
      this.setState({ isSticky: sticky })
    })


    let url = new URL(window.location.href)
    if (window.location?.search) {
      var queryParams = new URLSearchParams(window.location.search)
    }
    if (queryParams?.has('collectionId')) {
      var collectionId = queryParams.get('collectionId')
      sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
    } else if (sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID) != null) {
      var collectionId = sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
    }
    this.setState({ publicCollectionId: collectionId })
    var queryParamApi2 = {}

    if (isTechdocOwnDomain()) {
      queryParamApi2.collectionId = collectionId
      queryParamApi2.path = url.pathname.slice(3)
      this.props.add_collection_and_pages(null, { collectionId: collectionId, public: true })
    } else if (!isTechdocOwnDomain()) {
      queryParamApi2.custom_domain = window.location.hostname
      queryParamApi2.path = url.pathname.slice(1)
      this.props.add_collection_and_pages(null, { custom_domain: window.location.hostname })
    }

    if (queryParams?.has('version')) {
      queryParamApi2.versionName = queryParams.get('version')
    }

    let queryParamsString = '?'
    for (let key in queryParamApi2) {
      if (queryParamApi2.hasOwnProperty(key)) {
        queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi2[key])}&`
      }
    }
    queryParamsString = queryParamsString.slice(0, -1)
    try {
      const response = await generalApiService.getPublishedContentByPath(queryParamsString)
      this.setDataToReactQueryAndSessionStorage(response)
    } catch (e) {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, 'undefined')
      this.setState({ idToRenderState: 'undefined' })
    }
  }

  async componentDidUpdate() {
    window.onpopstate = async (event) => {
      if (event.state) {
        const url = new URL(window.location.href)
        const queryParams = this.props?.location?.search ? new URLSearchParams(this.props.location.search) : null

        let collectionId = queryParams?.get('collectionId') || sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
        if (collectionId) {
          sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
        }

        this.setState({ publicCollectionId: collectionId })

        const queryParamApi2 = {}
        if (isTechdocOwnDomain()) {
          queryParamApi2.collectionId = collectionId
          queryParamApi2.path = url.pathname.slice(3)
          this.props.add_collection_and_pages(null, { collectionId, public: true })
        } else {
          queryParamApi2.custom_domain = window.location.hostname
          queryParamApi2.path = url.pathname.slice(1)
          this.props.add_collection_and_pages(null, { custom_domain: window.location.hostname })
        }

        if (queryParams?.has('version')) {
          queryParamApi2.versionName = queryParams.get('version')
        }

        const queryParamsString = new URLSearchParams(queryParamApi2).toString()

        try {
          const response = await generalApiService.getPublishedContentByPath(`?${queryParamsString}`)
          this.setDataToReactQueryAndSessionStorage(response)
        } catch (e) {
          sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, 'undefined')
          this.setState({ idToRenderState: 'undefined' })
        }
      }
    }
  }

  setDataToReactQueryAndSessionStorage(response) {
    if (response) {
      var id = response?.data?.publishedContent?.id
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      this.setState({ idToRenderState: id })
    }
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
      const data = this.props.params.endpointId
      this.setState({ endpoint: data })
      const review = { ...this.state.review.endpoint }
      review.endpoint = this.props.params
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
      review.endpoint = this.props.params
      if (this.state.likeActive) {
        review.feedback = 'liked'
      }
      window.localStorage.setItem('review', JSON.stringify(review))
    })
  }

  handleLike() {
    this.setLike()
  }

  handleDislike() {
    this.setDislike()
  }

  handleShowSideBar() {
    const splitPaneElement = document.querySelector('.split-sidebar-public')
    const hamburgerElement = document.querySelector('#hamburgerIcon')
    const logoElement = document.querySelector('#logoName')
    const closeElement = document.querySelector('#closeIcon')
    if (this.iconRef.current && splitPaneElement) {
      if (this.iconRef.current.classList.contains('close-icon') && splitPaneElement.classList.contains('open')) {
        this.iconRef.current.classList.remove('close-icon')
        splitPaneElement.classList.remove('open')
        closeElement.classList.add('icon-none')
        hamburgerElement.classList.remove('icon-none')
      } else {
        this.iconRef.current.classList.add('close-icon')
        splitPaneElement.classList.add('open')
        hamburgerElement.classList.add('icon-none')
        closeElement.classList.remove('icon-none')
      }
    }
  }

  render() {
    let idToRender = this.props?.pageContentDataSSR?.id || sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || this.state.idToRenderState
    let type = this.props?.pageContentDataSSR?.type || this.props?.pages?.[idToRender]?.type
    let collectionId = this.props?.pages?.[idToRender]?.collectionId ?? null
    if (collectionId) {
      const docFaviconLink = this.props.collections[collectionId]?.favicon ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}` : this.props.collections[collectionId]?.docProperties?.defaultLogoUrl
      setFavicon(docFaviconLink)
      var collectionTheme = this.props.collections[collectionId]?.theme
    }
    const dynamicColor = hexToRgb(collectionTheme, 0.04)
    const staticColors = background['background_mainPage']

    return (
      <main role='main' className={'mainpublic-endpoint-main hm-wrapper stickyCode flex-grow-1'}>
        <div className={'hm-right-content overflow-auto'}>
          {idToRender ? (
            <div>
              {(type == 4 || type == 5) && <DisplayEndpoint {...this.props} fetch_entity_name={this.fetchEntityName.bind(this)} publicCollectionTheme={collectionTheme}/>}
              {this.state.openReviewModal && this.reviewModal()}
            </div>
          ) : (
            <div className='custom-loading-container'>
              <progress class='pure-material-progress-linear w-25' />
            </div>
          )}
        </div>
      </main>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(PublicEndpoint)))