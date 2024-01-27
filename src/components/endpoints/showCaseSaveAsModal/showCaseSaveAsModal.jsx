import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import RenderData from './renderData/renderData'
import './showCaseSaveAsModal.scss'

export default function ShowCaseSaveAsModal() {
  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections
    }
  })

  const [pathData, setPathData] = useState(['organisation'])

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
    debugger
    let tempPathData = pathData
    if (index >= 0 && index < tempPathData.length - 1) {
      tempPathData.splice(index + 1)
      setPathData([...tempPathData]);
    } else {
      console.error('Invalid index provided.')
    }
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
                {index === 0 ? JSON.parse(localStorage.getItem(singleId)).name : getName(singleId)}
              </div>
            </div>
          )
        })}
      </div>
      <div className='showcase_modal_container'>
        <RenderData data={pathData} setPathData={setPathData} />
        <div className='mt-5 d-flex align-items-center justify-content-end pb-2 pr-1'>
          <button className='btn btn-primary mr-2' disabled>Save</button>
          <button className='btn btn-secondary outline  api-cancel-btn'>Cancel</button>
        </div>
      </div>
    </div>
  )
}