import React, { useState, useEffect, useRef } from 'react'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { addUrlWithAdditionalPath, deleteMappedUrl } from './redirectionApiServices'
import { getUrlPathById } from '../common/utility'
import './redirections.scss'

const Redirections = () => {
  const params = useParams()
  const userPathRef = useRef(null)

  const { pages, collections, childIds } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      childIds: state?.pages?.[state.collections?.[params.collectionId]?.rootParentId]?.child || []
    }
  })

  const [redirectUrls, setRedirectUrls] = useState([])
  const [selectedPageId, setselectedPageId] = useState(null)
  const [latestUrl, setLatestUrl] = useState('')

  const visiblePath = `${process.env.REACT_APP_UI_URL}/p/`

  useEffect(() => {
    loadUrls()
  }, [params?.collectionId])

  const addOldUrlsOfChilds = (pagesHaveOldUrls, pageId) => {
    {
      pages[pageId]?.oldUrls && Object.keys(pages[pageId]?.oldUrls).length > 0 && Object.entries(pages[pageId]?.oldUrls).forEach(([index, oldUrl]) => {
        pagesHaveOldUrls.push({ pageId, oldUrl, oldUrlId: index })
      })
    }
    if (pages?.[pageId]?.child.length > 0) {
      pages[pageId].child.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId))
    }
  }

  const loadUrls = async () => {
    const collectionId = params.collectionId
    const rootParentId = collections?.[collectionId]?.rootParentId
    const rootParentChilds = pages?.[rootParentId]?.child
    const pagesHaveOldUrls = []
    try {
      rootParentChilds.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId))
      console.log(pagesHaveOldUrls, 12345678)
      setRedirectUrls(pagesHaveOldUrls)
    } catch (error) {
      console.error('Failed to fetch URLs:', error.message)
    }
  }

  const handleAddUrl = async () => {
    try {
      const url = getWholeUrl(userPathRef.current.value)
      const result = (await addUrlWithAdditionalPath(selectedPageId, params.collectionId, url)).data
      const updatedRedirectUrls = [...redirectUrls, { pageId: result.pageId, oldUrl: url, oldUrlId: result.id }]
      setRedirectUrls(updatedRedirectUrls)
    } catch (error) {
      console.error('Failed to create URL:', error)
    }
  }

  const handleDeleteUrl = async (id, url) => {
    try {
      await deleteMappedUrl(id)
    } catch (error) {
      console.error('Failed to delete URL:', error)
    }
  }

  const setLatestUrlForPage = (id, setInUseState = true) => {
    if (setInUseState) setselectedPageId(id)
    let pathName = getUrlPathById(id, pages)
    pathName = `${pathName}`
    pathName = pathName.replace('null', params.collectionId)
    if (setInUseState) setLatestUrl(pathName)
    return pathName
  }

  const renderAllVersionOfParentPage = (versionId) => {
    const versionChilds = pages?.[versionId]?.child
    return (
      <>
        {versionChilds.length === 0 ? null : (
          <div className='mt-2'>
            <span>{pages?.[versionId]?.name}</span>
            <div className='pl-2'>{renderAllPagesOfParent(versionChilds)}</div>
          </div>
        )}
      </>
    )
  }

  const renderParentPage = (pageId) => {
    const parentPageChildIds = pages?.[pageId]?.child
    return (
      <div className='mt-2'>
        <span className='parent-page-heading cursor-pointer' onClick={() => setLatestUrlForPage(pageId)}>
          {pages?.[pageId]?.name}
        </span>
        <div className='pl-2'>{renderAllVersionOfParentPage(parentPageChildIds)}</div>
      </div>
    )
  }

  const renderSubPage = (subPageId) => {
    const subPageChildIds = pages?.[subPageId]?.child
    return (
      <div className='mt-2'>
        <span className='cursor-pointer' onClick={() => setLatestUrlForPage(subPageId)}>
          {pages?.[subPageId]?.name}
        </span>
        <div className='pl-2'>{renderAllPagesOfParent(subPageChildIds)}</div>
      </div>
    )
  }

  const renderEndpoint = (endpointId) => {
    return (
      <div className='mt-2 cursor-pointer'>
        <span onClick={() => setLatestUrlForPage(endpointId)}>{pages?.[endpointId]?.name}</span>
      </div>
    )
  }

  const renderAllPagesOfParent = (parentChilds) => {
    return (
      <div>
        {parentChilds?.map((singleId) => {
          const type = pages?.[singleId]?.type || null
          switch (type) {
            case 1:
              return renderParentPage(singleId)
            case 3:
              return renderSubPage(singleId)
            case 4:
              return renderEndpoint(singleId)
            default:
              return null
          }
        })}
      </div>
    )
  }

  const getWholeUrl = (value) => {
    const customDomain = collections?.[params.collectionId]?.customDomain
    const urlPrefix = customDomain ? 'http://' + customDomain + '/p/' : visiblePath;
    const urlSuffix = '?collectionId=' + params.collectionId
    return urlPrefix + value + urlSuffix;
  }

  const getLatestUrl = (pageId) => {
    const path = setLatestUrlForPage(pageId, false)
    return `${visiblePath}${path}`
  }

  const renderTable = () => {
    return (
      <div>
        {redirectUrls.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th className='center-heading'>Old URL</th>
                <th className='center-heading'>Latest URL</th>
                <th className='center-heading'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirectUrls.map((redirectUrlDetails, index) => {
                return (
                  <tr key={index}>
                    <td>{redirectUrlDetails.oldUrl}</td>
                    <td>{getLatestUrl(redirectUrlDetails?.pageId)}</td>
                    <td>
                      <DeleteIcon onClick={() => handleDeleteUrl(index, redirectUrlDetails?.oldUrlId)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className='empty-table-heading d-flex justify-content-center align-items-center'> No Data is present here </div>
        )}
      </div>
    )
  }

  return (
    <div className='redirections d-flex h-100'>
      <div className='d-flex justify-content-start sidebar-pages-container'>
        <div className='p-4'>{renderAllPagesOfParent(childIds)}</div>
      </div>
      <div className='saperation'></div>
      <div className='d-flex justify-content-center redirection-table-container mt-4'>
        <div className='main-content'>
          <h3>{collections?.[params.collectionId]?.name.charAt(0).toUpperCase() + collections?.[params.collectionId]?.name.slice(1)} Redirections</h3>
          <div className='form'>
            <div className='d-flex flex-column flex-shrink-1 flex-grow-1'>
              <input
                ref={userPathRef}
                type='text'
                class='input-part editable h-100'
                id='part2'
                placeholder='Enter your path'
              />
              <span>
                Domain for the path:- <span className='domain-name'>{visiblePath}</span>
              </span>
            </div>
            <input
              disabled
              type='text'
              className='h-100'
              placeholder='Click on page and endpoint to add latest url'
              value={latestUrl}
              readOnly
            />
            <button className='h-100 fs-4' onClick={handleAddUrl}>
              Add
            </button>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  )
}

export default Redirections
