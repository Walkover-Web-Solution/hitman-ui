import React, { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import DisplayPage from '../pages/displayPage'
import SideBarV2 from '../main/sideBarV2'
import SideBar from '../main/sidebar.jsx'
import { ERROR_404_PUBLISHED_PAGE } from '../../components/errorPages'
import '../collections/collections.scss'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import SplitPane from '../splitPane/splitPane.js'
import '../collectionVersions/collectionVersions.scss'
import { setTitle, setFavicon, comparePositions, hexToRgb, isTechdocOwnDomain, SESSION_STORAGE_KEY } from '../common/utility'
import { Style } from 'react-style-tag'
import { Modal } from 'react-bootstrap'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'
import { useQueryClient, useMutation } from 'react-query'
import { MdDehaze, MdClose } from 'react-icons/md'
import { background } from '../backgroundColor.js'
import Sidebar from '../main/sidebar.jsx'

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
            staleTime: Number.MAX_SAFE_INTEGER, // Set staleTime to a large value
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
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier, domain)),
    add_collection_and_pages: (orgId, queryParams) => dispatch(addCollectionAndPages(orgId, queryParams))
  }
}
const PublicEndpoint = (props) => {
  const [idToRenderState, setIdToRenderState] = useState(null)
  const [currentEntityName, setCurrentEntityName] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const [showExtendedLog, setShowExtendedLog] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const iconRef = useRef(null)
  const [publicCollectionId, setPublicCollectionId] = useState('')
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (props?.location?.search) {
      var queryParams = new URLSearchParams(props.location.search)
    }
    if (queryParams?.has('collectionId')) {
      var collectionId = queryParams.get('collectionId')
      sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
    } else if (sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID) != null) {
      var collectionId = sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
    }
    setPublicCollectionId(collectionId)

    var queryParamApi2 = {}

    if (isTechdocOwnDomain()) {
      queryParamApi2.collectionId = collectionId
      queryParamApi2.path = url.pathname.slice(3)
      props.add_collection_and_pages(null, { collectionId: collectionId, public: true })
    } else if (!isTechdocOwnDomain()) {
      queryParamApi2.custom_domain = window.location.hostname
      queryParamApi2.path = url.pathname.slice(1)
      props.add_collection_and_pages(null, { custom_domain: window.location.hostname })
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
    const fetchData = async () => {
      try {
        const response = await generalApiService.getPublishedContentByPath(queryParamsString)
        setDataToReactQueryAndSessionStorage(response)
      } catch (e) {
        sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, 'undefined')
        setIdToRenderState('undefined')
      }
    }

    fetchData()
  }, [location.search])

  const setDataToReactQueryAndSessionStorage = (response) => {
    if (response) {
      var id = response?.data?.publishedContent?.id
      if (response?.data?.publishedContent?.type === 4) {
        // this.props.mutationFn.mutate({ type: 'endpoint', id: id, content: response?.data?.publishedContent })
      } else {
        // this.props.mutationFn.mutate({ type: 'pageContent', id: id, content: response?.data?.publishedContent?.contents })
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      setIdToRenderState(id)
    }
  }

  /*  useEffect(() => {
    const handleDataFetch = async () => {
      let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
      if (!props.keyExistInReactQuery(currentIdToShow)) {
        const response = await generalApiService.getPublishedContentByIdAndType(currentIdToShow, props.pages?.[currentIdToShow]?.type)
        if (props.pages?.[currentIdToShow]?.type == 4) {
          // this.props.mutationFn.mutate({ type: 'endpoint', id: currentIdToShow, content: response })
        } else if (props.pages?.[currentIdToShow]?.type != 4) {
          // this.props.mutationFn.mutate({ type: 'pageContent', id: currentIdToShow, content: response })
        }
      }
    }
    handleDataFetch()
  }, [historySnapshot])
 */
  const getCTALinks = () => {
    const collectionId = props?.match?.params?.collectionIdentifier
    let { cta, links } = props.collections?.[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = cta.length !== 0 || links.length !== 0
    return { cta, links, isCTAandLinksPresent }
  }
  let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || idToRenderState
  const type = props?.pages?.[idToRenderState]?.type
  const collectionId = props?.pages?.[idToRender]?.collectionId ?? null
  let collectionName, collectionTheme
  const { isCTAandLinksPresent } = getCTALinks()

  if (collectionId) {
    const collection = props.collections[collectionId]
    const docFaviconLink = collection?.favicon ? `data:image/png;base64,${collection?.favicon}` : collection?.docProperties?.defaultLogoUrl
    const docTitle = collection?.docProperties?.defaultTitle

    setTitle(docTitle)
    setFavicon(docFaviconLink)

    collectionName = props.collections[collectionId]?.name
    collectionTheme = props.collections[collectionId]?.theme
  }

  const handleShowSideBar = () => {
    const splitPaneElement = document.querySelector('.split-sidebar-public')
    const hamburgerElement = document.querySelector('#hamburgerIcon')
    const logoElement = document.querySelector('#logoName')
    const closeElement = document.querySelector('#closeIcon')
    if (iconRef.current && splitPaneElement) {
      if (iconRef.current.classList.contains('close-icon') && splitPaneElement.classList.contains('open')) {
        iconRef.current.classList.remove('close-icon')
        splitPaneElement.classList.remove('open')
        closeElement.classList.add('icon-none')
        hamburgerElement.classList.remove('icon-none')
        // logoRef.current.classList.remove('icon-none');
      } else {
        iconRef.current.classList.add('close-icon')
        splitPaneElement.classList.add('open')
        hamburgerElement.classList.add('icon-none')
        // logoRef.current.classList.add('icon-none');
        closeElement.classList.remove('icon-none')
      }
    }
  }

  const fetchEntityName = (entityName) => {
    setCurrentEntityName(entityName || '')
  }

  const backgroundStyle = {
    backgroundImage: `
      linear-gradient(to right, ${hexToRgb(collectionTheme, 0.04)}, ${hexToRgb(collectionTheme, 0.04)}),
      linear-gradient(to right, #fff, #fff)  // Example static color
    `
  }

  const handleScroll = (e) => {
    if (e.target.scrollTop > 20) {
      setIsSticky(true)
    } else {
      setIsSticky(false)
    }
  }

  const subscribeToExtendedLog = () => {
    console.log('Subscribed to extended log')
    setShowExtendedLog(false)
  }

  const openLink = (url) => {
    window.open(url, '_blank')
  }

  const displayCTAandLink = () => {
    const { cta, links, isCTAandLinksPresent } = getCTALinks()
    return (
      <>
        <div className={isSticky ? 'd-flex public-navbar stickyNav' : 'public-navbar d-flex'}>
          {isCTAandLinksPresent && (
            <div className='d-flex align-items-center'>
              {links.map((link, index) => (
                <div key={`link-${index}`}>
                  <label className='link' htmlFor={`link-${index}`} onClick={() => openLink(link.link)}>
                    {link.name}
                  </label>
                </div>
              ))}
              {cta.map((ctaItem, index) => (
                <div className='cta-button-wrapper' key={`cta-${index}`}>
                  <button
                    style={{
                      backgroundColor: collectionTheme,
                      borderColor: collectionTheme,
                      color: '#ffffff' // Assuming white text color, adjust as necessary
                    }}
                    name={`cta-${index}`}
                    onClick={() => openLink(ctaItem.value)}
                  >
                    {ctaItem.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  const reviewModal = () => {
    return (
      <div onHide={() => props.onHide()} show top>
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
              <button className='btn btn-custom-dark' onClick={() => subscribeToExtendedLog()} onHide={() => setShowExtendedLog(false)}>
                Subscribe For Extended Log
              </button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <>
      <nav className='public-endpoint-navbar'></nav>
      <main role='main' className={isSticky ? 'mainpublic-endpoint-main hm-wrapper stickyCode' : 'mainpublic-endpoint-main hm-wrapper'}>
        <span ref={iconRef} className={'hamberger-icon'}>
          <MdDehaze id='hamburgerIcon' className='icon-active fw-bold' onClick={handleShowSideBar} />
          <MdClose id='closeIcon' className='icon-none' onClick={handleShowSideBar} />
        </span>
        <SplitPane split='vertical' className={'split-sidebar-public'}>
          <div className={'hm-sidebar' + (isTechdocOwnDomain() ? ' pb-5' : '')} style={backgroundStyle}>
            {collectionId && <SideBarV2 {...props} collectionName={collectionName} OnPublishedPage={true} />}
          </div>
          <div className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}>
            {idToRender ? (
              <div onScroll={handleScroll} className='display-component'>
                {type == 4 && <DisplayEndpoint {...props} fetch_entity_name={fetchEntityName} publicCollectionTheme={collectionTheme} />}
                {(type == 1 || type == 3) && (
                  <DisplayPage {...props} fetch_entity_name={fetchEntityName} publicCollectionTheme={collectionTheme} />
                )}
                {!type && idToRender == 'undefined' && (
                  <ERROR_404_PUBLISHED_PAGE error_msg={Object.keys(props?.pages)?.length > 1 ? null : 'Collection is not published'} />
                )}
                {displayCTAandLink()}
                {openReviewModal && reviewModal()}
              </div>
            ) : (
              <div className='custom-loading-container'>
                <progress className='pure-material-progress-linear w-25' />
              </div>
            )}
          </div>
        </SplitPane>
      </main>
    </>
  )
}
export default connect(mapStateToProps, mapDispatchToProps)(withQuery(PublicEndpoint))
