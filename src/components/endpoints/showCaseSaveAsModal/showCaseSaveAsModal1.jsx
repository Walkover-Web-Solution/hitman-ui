import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenderData from './renderData/renderData1'
import { addPage } from '../../pages/redux/pagesActions'
import { dispatch } from 'react-redux'
import './showCaseSaveAsModal.scss'
import { set } from 'lodash'

const ShowCaseSaveAsModal = (props) => {
  const { collections, currentOrg, pages } = useSelector((state) => {
    return {
      collections: state.collections,
      currentOrg: state.organizations.currentOrg,
      pages: state.pages
    }
  })

  const [pathData, setPathData] = useState(['currentOrganisation'])

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
    let tempPathData = pathData
    if (index >= 0 && index < tempPathData.length - 1) {
      tempPathData.splice(index + 1)
      setPathData([...tempPathData])
    } else {
      console.error('Invalid index provided.')
    }
  }

  const handleSave = () => {
    const currentId = pathData[pathData.length - 1]
    props.onHide()
  }
  return (
    <div className='main_container p-2'>
      <div className='d-flex justify-content-start align-items-center flex-wrap'>
        <span>Save to </span>
        {pathData.map((singleId, index) => {
          return (
            <div className='d-flex justify-content-start align-items-center'>
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
