"use client"
import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import SideBarV2 from '../main/sideBarV2.jsx'
import { ERROR_404_PUBLISHED_PAGE } from '../../components/errorPages'
import '../collections/collections.scss'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import SplitPane from '../splitPane/splitPane.jsx'
import '../collectionVersions/collectionVersions.scss'
import {
  setTitle,
  setFavicon,
  hexToRgb,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
} from '../common/utility'
import { Style } from 'react-style-tag'
import { Modal } from 'react-bootstrap'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'
import { useQueryClient, useMutation } from 'react-query'
import { MdDehaze, MdClose } from 'react-icons/md'
import { background } from '../backgroundColor.js'
import withRouter from '../common/withRouter.jsx'
import PublicPage from '../../pages/publicPage/publicPage.jsx'
import IconButton from '../common/iconButton.jsx'

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
      dispatch(
        fetchAllPublicEndpoints(
          ownProps.navigate,
          collectionIdentifier,
          domain
        )
      ),
    add_collection_and_pages: (orgId, queryParams) =>
      dispatch(addCollectionAndPages(orgId, queryParams)),
  }
}

function PublicEndpoint(props) {
  const [publicCollectionId, setPublicCollectionId] = useState('')
  const [isSticky, setIsSticky] = useState(false)
  const [likeActive, setLikeActive] = useState(false)
  const [dislikeActive, setDislikeActive] = useState(false)
  const [openReviewModal, setOpenReviewModal] = useState(false)
  const [idToRenderState, setIdToRenderState] = useState(null)
  const [currentEntityName, setCurrentEntityName] = useState('')
  const iconRef = useRef()
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (data) => {
      return data
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData([data.type, data.id], data?.content || '', {
          staleTime: Number.MAX_SAFE_INTEGER, // Set staleTime to a large value
          retry: 2,
        })
      },
    }
  )

  const setQueryUpdatedData = (type, id, data) => {
    queryClient.setQueryData([type, id], data)
  }

  const keyExistInReactQuery = (id) => {
    return queryClient.getQueryData(id) === undefined
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)

    const fetchData = async () => {
      let url = new URL(window.location.href)
      let queryParams
      if (window.location?.search) {
        queryParams = new URLSearchParams(window.location.search)
      }
      let collectionId

      if (queryParams?.has('collectionId')) {
        collectionId = queryParams.get('collectionId')
        sessionStorage.setItem(
          SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID,
          collectionId
        )
      } else if (
        sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID) != null
      ) {
        collectionId = sessionStorage.getItem(
          SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID
        )
      }

      setPublicCollectionId(collectionId)
      var queryParamApi2 = {}

      if (isTechdocOwnDomain()) {
        queryParamApi2.collectionId = collectionId
        queryParamApi2.path = url.pathname.slice(3)
        props.add_collection_and_pages(null, {
          collectionId: collectionId,
          public: true,
        })
      } else {
        queryParamApi2.custom_domain = window.location.hostname
        queryParamApi2.path = url.pathname.slice(1)
        props.add_collection_and_pages(null, {
          custom_domain: window.location.hostname,
        })
      }

      if (queryParams?.has('version')) {
        queryParamApi2.versionName = queryParams.get('version')
      }

      const queryParamsString = `?${new URLSearchParams(queryParamApi2).toString()}`

      try {
        const response = await generalApiService.getPublishedContentByPath(
          queryParamsString
        )
        setDataToReactQueryAndSessionStorage(response)
      } catch (e) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW,
          'undefined'
        )
        setIdToRenderState('undefined')
      }
    }

    fetchData()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    window.onpopstate = async (event) => {
      if (event.state) {
        const url = new URL(window.location.href)
        const queryParams = props?.location?.search
          ? new URLSearchParams(props.location.search)
          : null

        let collectionId =
          queryParams?.get('collectionId') ||
          sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
        if (collectionId) {
          sessionStorage.setItem(
            SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID,
            collectionId
          )
        }

        setPublicCollectionId(collectionId)

        const queryParamApi2 = {}
        if (isTechdocOwnDomain()) {
          queryParamApi2.collectionId = collectionId
          queryParamApi2.path = url.pathname.slice(3)
          props.add_collection_and_pages(null, { collectionId, public: true })
        } else {
          queryParamApi2.custom_domain = window.location.hostname
          queryParamApi2.path = url.pathname.slice(1)
          props.add_collection_and_pages(null, {
            custom_domain: window.location.hostname,
          })
        }

        if (queryParams?.has('version')) {
          queryParamApi2.versionName = queryParams.get('version')
        }

        const queryParamsString = `?${new URLSearchParams(
          queryParamApi2
        ).toString()}`

        try {
          const response = await generalApiService.getPublishedContentByPath(
            queryParamsString
          )
          setDataToReactQueryAndSessionStorage(response)
        } catch (e) {
          sessionStorage.setItem(
            SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW,
            'undefined'
          )
          setIdToRenderState('undefined')
        }
      }
    }

    const fetchDataOnUpdate = async () => {
      const currentIdToShow = sessionStorage.getItem(
        SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW
      )
      if (!keyExistInReactQuery(currentIdToShow)) {
        try {
          const response =
            await generalApiService.getPublishedContentByIdAndType(
              currentIdToShow,
              props.pages?.[currentIdToShow]?.type
            )
          if (props.pages?.[currentIdToShow]?.type === 4) {
            // Handle endpoint case
            // mutation.mutate({ type: 'endpoint', id: currentIdToShow, content: response })
          } else {
            // Handle page content case
            // mutation.mutate({ type: 'pageContent', id: currentIdToShow, content: response })
          }
        } catch (e) {
          console.error('Failed to fetch content', e)
        }
      }
    }

    fetchDataOnUpdate()
  })

  const setDataToReactQueryAndSessionStorage = (response) => {
    if (response) {
      var id = response?.data?.publishedContent?.id
      if (response?.data?.publishedContent?.type === 4) {
        // mutation.mutate({ type: 'endpoint', id: id, content: response?.data?.publishedContent })
      } else {
        // mutation.mutate({ type: 'pageContent', id: id, content: response?.data?.publishedContent?.contents })
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      setIdToRenderState(id)
    }
  }

  const openLink = (link) => {
    window.open(`${link}`, '_blank')
  }

  const getCTALinks = () => {
    const collectionId = props?.params?.collectionIdentifier
    let { cta, links } =
      props.collections?.[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = cta.length !== 0 || links.length !== 0
    return { cta, links, isCTAandLinksPresent }
  }

  const displayCTAandLink = () => {
    const { cta, links, isCTAandLinksPresent } = getCTALinks()
    return (
      <>
        <div
          className={
            isSticky ? 'd-flex public-navbar stickyNav' : 'public-navbar d-flex'
          }
        >
          {/* <div className='entityTitle'>
            {currentEntityName}
          </div> */}
          {isCTAandLinksPresent && (
            <div className='d-flex align-items-center'>
              {links.map((link, index) => (
                <div key={`link-${index}`}>
                  <label
                    className='link'
                    htmlFor={`link-${index}`}
                    onClick={() => {
                      openLink(link.link)
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
                      backgroundColor: collectionTheme,
                      borderColor: collectionTheme,
                      color: collectionTheme,
                    }}
                    name={`cta-${index}`}
                    onClick={() => {
                      openLink(cta.value)
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

  const fetchEntityName = (entityName) => {
    if (entityName) {
      setCurrentEntityName(entityName)
    } else {
      setCurrentEntityName('')
    }
  }

  const toggleReviewModal = () => setOpenReviewModal(!openReviewModal)

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
                  <input
                    type='text'
                    name='name'
                    className='form-control w-75 mb-2'
                  />
                </label>
                <label>
                  Comment:
                  <textarea
                    type='text'
                    name='name'
                    className='form-control w-75 mb-3'
                  />
                </label>
                <input
                  type='submit'
                  value='Submit'
                  className='btn btn-primary w-25'
                />
              </form>
            </Modal.Body>

            <Modal.Footer>
              <button
                className='btn btn-custom-dark'
                onClick={() => {}}
                onHide={() => {}}
              >
                Subscribe For Extended Log
              </button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    )
  }

  const setDislike = () => {
    setDislikeActive(!dislikeActive)
    // Handle rest of the logic
    toggleReviewModal()
  }

  const setLike = () => {
    setLikeActive(!likeActive)
    // Handle rest of the logic
  }

  const handleLike = () => {
    if (dislikeActive) {
      // setDislikeActive(false)
    }
    setLike()
  }

  const handleDislike = () => {
    if (likeActive) {
      // setLikeActive(false)
    }
    setDislike()
  }

  const handleShowSideBar = () => {
    const splitPaneElement = document.querySelector('.split-sidebar-public')
    const hamburgerElement = document.querySelector('#hamburgerIcon')
    const closeElement = document.querySelector('#closeIcon')
    if (iconRef.current && splitPaneElement) {
      if (
        iconRef.current.classList.contains('close-icon') &&
        splitPaneElement.classList.contains('open')
      ) {
        iconRef.current.classList.remove('close-icon')
        splitPaneElement.classList.remove('open')
        closeElement.classList.add('icon-none')
        hamburgerElement.classList.remove('icon-none')
      } else {
        iconRef.current.classList.add('close-icon')
        splitPaneElement.classList.add('open')
        hamburgerElement.classList.add('icon-none')
        closeElement.classList.remove('icon-none')
      }
    }
  }

  let idToRender =
    props?.pageContentDataSSR?.id ||
    sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) ||
    idToRenderState
  let type =
    props?.pageContentDataSSR?.type || props?.pages?.[idToRender]?.type

  let collectionId = props?.pages?.[idToRender]?.collectionId ?? null

  let collectionThemeLocal = null
  let collectionNameLocal = null

  if (collectionId) {
    const docFaviconLink = props.collections[collectionId]?.favicon
      ? `data:image/png;base64,${props.collections[collectionId]?.favicon}`
      : props.collections[collectionId]?.docProperties?.defaultLogoUrl
    const docTitle = props.collections[collectionId]?.docProperties
      ?.defaultTitle
    setTitle(docTitle)
    setFavicon(docFaviconLink)
    collectionNameLocal = props.collections[collectionId]?.name
    collectionThemeLocal = props.collections[collectionId]?.theme
  }

  let collectionKeys = Object.keys(props?.collections || {})
  const { isCTAandLinksPresent } = getCTALinks()
  const dynamicColor = hexToRgb(collectionThemeLocal, 0.04)
  const staticColor = background['background_sideBar']

  const backgroundStyle = {
    backgroundImage: `
      linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
      linear-gradient(to right, ${staticColor}, ${staticColor})
    `,
  }
  const staticColors = background['background_mainPage']

  const backgroundStyles = {
    backgroundImage: `
      linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
      linear-gradient(to right, ${staticColors}, ${staticColors})
    `,
  }

  return (
    <>
      <Style>
        {`
          .link {
            &:hover {
              color: ${collectionThemeLocal};
            }
          }
        `}
      </Style>
      <main
        role='main'
        className={
          isSticky
            ? 'mainpublic-endpoint-main hm-wrapper stickyCode'
            : 'mainpublic-endpoint-main hm-wrapper'
        }
      >
        <span
          ref={iconRef}
          style={backgroundStyles}
          className={'hamberger-icon'}
        >
          <IconButton
            onClick={() => {
              handleShowSideBar()
            }}
          >
            <MdDehaze id='hamburgerIcon' className='icon-active fw-bold' />
          </IconButton>
          <IconButton
            onClick={() => {
              handleShowSideBar()
            }}
          >
            <MdClose id='closeIcon' className='icon-none' />
          </IconButton>
        </span>
        <SplitPane split='vertical' className={'split-sidebar-public'}>
          <div className='hm-sidebar' style={backgroundStyle}>
            {collectionId && (
              <SideBarV2
                {...props}
                collectionName={collectionNameLocal}
                OnPublishedPage={true}
              />
            )}
          </div>
          <div
            className={
              isCTAandLinksPresent
                ? 'hm-right-content hasPublicNavbar'
                : 'hm-right-content'
            }
          >
            {idToRender ? (
              <div
                onScroll={(e) => {
                  if (e.target.scrollTop > 20) {
                    setIsSticky(true)
                  } else {
                    setIsSticky(false)
                  }
                }}
              >
                {(type === 4 || type === 5) && (
                  <DisplayEndpoint
                    {...props}
                    fetch_entity_name={fetchEntityName}
                    publicCollectionTheme={collectionThemeLocal}
                  />
                )}

                {(type === 1 || type === 3) && (
                  <PublicPage
                    {...props}
                    fetch_entity_name={fetchEntityName}
                    publicCollectionTheme={collectionThemeLocal}
                  />
                )}

                {!type && idToRender === 'undefined' && (
                  <ERROR_404_PUBLISHED_PAGE
                    error_msg={
                      Object.keys(props?.pages)?.length > 1
                        ? null
                        : 'Collection is not published'
                    }
                  />
                )}

                {openReviewModal && reviewModal()}
              </div>
            ) : (
              <>
                <div className='custom-loading-container'>
                  <progress className='pure-material-progress-linear w-25' />
                </div>
              </>
            )}
          </div>
        </SplitPane>
      </main>
    </>
  )
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint)
)