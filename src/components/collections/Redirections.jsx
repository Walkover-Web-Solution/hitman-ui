import React, { useState, useEffect } from 'react'
import './Redirections.scss'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router'
import SideBarV2 from '../main/sideBarV2'
import { updateLatestUrl } from './redux/urlAction'
import { createUrl, deleteUrl, updateUrl } from './redirectionApiServices'

const Redirections = (props) => {
  const params = useParams()
  const dispatch = useDispatch()

  const { pages, collections, childIds, latestUrl } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      latestUrl: state.urlMapping.latestUrl
    }
  })
  const [redirects, setRedirects] = useState([])
  const [oldUrl, setOldUrl] = useState([])
  const [oldUrlArray, setOldUrlArray] = useState([])
  const [expandedIndex, setExpandedIndex] = useState(null)

  const handleRedirect = () => {
    setRedirects([...redirects, { latestUrl, oldUrl }])
    setOldUrl('')
    dispatch(updateLatestUrl(''))
  }

  useEffect(() => {
    loadUrls()
  }, [])

  // Inside the loadUrls function
  const loadUrls = async () => {
    try {
      const oldUrlsArray = Object.keys(pages).map((index) => {
        return {
          pageName: pages[index].name,
          pageId: pages[index].id,
          oldUrls: pages[index]?.oldUrls || ''
        }
      }).filter((item) => Object.keys(item.oldUrls).length > 0)
      console.log(oldUrlsArray, 'array')
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

  const handleDeleteUrl = async (id,url) => { 
    try {
      await deleteUrl(id)
      console.log('URL deleted successfully')
      const updatedOldUrlArray = oldUrlArray.map(item => {
        if (item.oldUrls && item.oldUrls[url]) {
          delete item.oldUrls[url];
        }
        return item;
      });
  
      setOldUrlArray(updatedOldUrlArray);
      console.log(oldUrlArray,'old urls')
    } catch (error) {
      console.error('Failed to delete URL:', error)
    }
  }

  const renderTable = () => {
    return (
      <table>
        <thead>
          <tr >
            <th className="center-heading">Old URL</th>
            <th className="center-heading">Latest URL</th>
            <th className="center-heading">Actions</th>
          </tr>
        </thead>
        <tbody>
          {oldUrlArray.map((item, index) =>
            item.oldUrls && Object.entries(item.oldUrls).map(([url, idx]) => (
              <tr key={index}>
                <td>{idx}</td>
                <td>{item.pageName}</td>
                <td>
                  <div key={url}>
                    <DeleteIcon onClick={() => handleDeleteUrl(url,idx)} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    )
  }
  const pageId = latestUrl?.split('/')[5]

  return (
    <div className='redirections d-flex'>
      <div className='sidebar'>
        <SideBarV2 collectionId={params.collectionId} isOnRedirectionPage={true} />
      </div>
      <div className='d-flex justify-content-center w-75'>
        <div className='main-content'>
          <h1>Redirections</h1>
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
