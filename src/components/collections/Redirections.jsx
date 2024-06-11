import React, { useState, useEffect } from 'react'
import './redirections.scss'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import { createUrl, deleteUrl, updateUrl } from './redirectionApiServices'

const Redirections = (props) => {
  const params = useParams()

  const { pages, collections, childIds, latestUrl } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      childIds: state?.pages?.[state.collections?.[params.collectionId]?.rootParentId]?.child || [],
      latestUrl: state.urlMapping.latestUrl
    }
  })

  const [oldUrl, setOldUrl] = useState([])
  const [oldUrlArray, setOldUrlArray] = useState([])

  const pageId = latestUrl?.split('/')[5]

  useEffect(() => {
    loadUrls()
  }, [params?.collectionId])

  // Inside the loadUrls function
  const loadUrls = async () => {
    try {
      const oldUrlsArray = Object.keys(pages)
        .map((index) => {
          return {
            pageName: pages[index].name,
            pageId: pages[index].id,
            oldUrls: pages[index]?.oldUrls || ''
          }
        })
        .filter((item) => Object.keys(item.oldUrls).length > 0)
      setOldUrlArray(oldUrlsArray)
    } catch (error) {
      console.error('Failed to fetch URLs:', error)
    }
  }

  const handleAddUrl = async (page_id, collection_id, old_url) => {
    try {
      const result = await createUrl(page_id, collection_id, old_url)
      console.log('URL created successfully:', result)
    } catch (error) {
      console.error('Failed to create URL:', error)
    }
  }

  const handleUpdateUrl = async (id) => {
    try {
      await updateUrl(id)
      console.log('URL updated successfully')
    } catch (error) {
      console.error('Failed to update URL:', error)
    }
  }

  const handleDeleteUrl = async (id, url) => {
    try {
      await deleteUrl(id)
      console.log('URL deleted successfully')
      const updatedOldUrlArray = oldUrlArray.map((item) => {
        if (item.oldUrls && item.oldUrls[url]) {
          delete item.oldUrls[url]
        }
        return item
      })

      setOldUrlArray(updatedOldUrlArray)
      console.log(oldUrlArray, 'old urls')
    } catch (error) {
      console.error('Failed to delete URL:', error)
    }
  }

  const renderTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th className='center-heading'>Old URL</th>
            <th className='center-heading'>Latest URL</th>
            <th className='center-heading'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {oldUrlArray.map(
            (item, index) =>
              item.oldUrls &&
              Object.entries(item.oldUrls).map(([url, idx]) => (
                <tr key={index}>
                  <td>{idx}</td>
                  <td>{item.pageName}</td>
                  <td>
                    <div key={url}>
                      <DeleteIcon onClick={() => handleDeleteUrl(url, idx)} />
                    </div>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    )
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
        <span className='parent-page-heading'>{pages?.[pageId]?.name}</span>
        <div className='pl-2'>{renderAllVersionOfParentPage(parentPageChildIds)}</div>
      </div>
    )
  }

  const renderSubPage = (subPageId) => {
    const subPageChildIds = pages?.[pageId]?.child
    return (
      <div className='mt-2'>
        <span>{pages?.[subPageId]?.name}</span>
        <div className='pl-2'>{renderAllPagesOfParent(subPageChildIds)}</div>
      </div>
    )
  }

  const renderEndpoint = (endpointId) => {
    return (
      <div className='mt-2'>
        <span>{pages?.[endpointId]?.name}</span>
      </div>
    )
  }

  const renderAllPagesOfParent = (parentChilds) => {
    return (
      <div>
        {parentChilds?.map((singleId) => {
          const type = pages?.[singleId]?.type || null
          console.log(type)
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

  return (
    <div className='redirections d-flex h-100'>
      <div className='d-flex justify-content-start sidebar-pages-container'>
        <div className='p-4'>{renderAllPagesOfParent(childIds)}</div>
      </div>
      <div className='saperation'></div>
      <div className='d-flex justify-content-center redirection-table-container mt-4'>
        <div className='main-content'>
          <h1>
            {collections?.[params.collectionId]?.name.charAt(0).toUpperCase() + collections?.[params.collectionId]?.name.slice(1)}{' '}
            Redirections
          </h1>
          <div className='form'>
            <input type='text' placeholder='Old URL' onChange={(e) => setOldUrl(e.target.value)} />
            <input type='disable' placeholder='Latest URL' value={latestUrl} />
            <button onClick={(id) => handleAddUrl(pageId, params.collectionId, oldUrl)}>Add</button>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  )
}

export default Redirections
