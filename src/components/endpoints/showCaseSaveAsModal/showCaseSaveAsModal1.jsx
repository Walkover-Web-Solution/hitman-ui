import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenderData from './renderData/renderData1'
import { addPage } from '../../pages/redux/pagesActions'
import { useParams, useNavigate } from 'react-router-dom'
import './showCaseSaveAsModal.scss'
import shortid from 'shortid'

const ShowCaseSaveAsModal = (props) => {
  const params = useParams()
  const { pageId } = params
  const navigate = useNavigate()
  const { collections, currentOrg, pages, draftContent } = useSelector((state) => {
    return {
      collections: state.collections,
      currentOrg: state.organizations.currentOrg,
      pages: state.pages,
      draftContent: state.tabs.tabs[pageId]?.draft
    }
  })

  const [pathData, setPathData] = useState(['currentOrganisation'])
  const [selectedId, setSelectedId] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    if (pathData.length > 0) {
      const lastId = pathData[pathData.length - 1]
      const type = pages?.[lastId]?.type
      if (type === 0) {
        const parentId = pages?.[lastId]?.collectionId
        setSelectedId(parentId)
      } else {
        setSelectedId(pages?.[lastId]?.id)
      }
    }
  }, [pathData, pages])

  const getName = (id) => {
    const type = pages?.[id]?.type
    if (type === 0) {
      const parentId = pages?.[id]?.collectionId
      return collections?.[parentId]?.name
    } else {
      return pages?.[id]?.name
    }
  }

  const handleGoBack = (index) => {
    if (index >= 0 && index < pathData.length - 1) {
      const tempPathData = pathData.slice(0, index + 1)
      setPathData(tempPathData)
    } else {
      console.error('Invalid index provided.')
    }
  }

  const handleSave = () => {
    const data = { name: props.name, contents: draftContent }
    let rootParentId = collections[selectedId]?.rootParentId
    let c1 = 0
    if (rootParentId === undefined) {
      rootParentId = pages[selectedId]?.parentId
      console.log(rootParentId)
      c1++
    }
    const newPage = {
      ...data,
      requestId: shortid.generate(),
      versionId: shortid.generate(),
      pageType: c1 == 0 ? 1 : 3
    }
    dispatch(addPage(navigate, rootParentId, newPage))
  }

  return (
    <div className='main_container p-2'>
      <div className='d-flex justify-content-start align-items-center flex-wrap'>
        <span>Save to </span>
        {pathData.map((singleId, index) => {
          return (
            <div className='d-flex justify-content-start align-items-center' key={index}>
              {index !== 0 && <span className='ml-1'>/</span>}
              <div onClick={() => handleGoBack(index)} className='ml-1 tab-line'>
                {index === 0 ? currentOrg?.name : getName(singleId)}
              </div>
            </div>
          )
        })}
      </div>
      <div className='showcase_modal_container'>
        <RenderData data={pathData} setPathData={setPathData} />
        <div className='mt-5 d-flex align-items-center justify-content-end pb-2 pr-1'>
          <button onClick={handleSave} className='btn btn-primary mr-2 btn-sm'>
            Save
          </button>
          <button onClick={props.onHide} className='btn btn-secondary outline api-cancel-btn btn-sm'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShowCaseSaveAsModal
