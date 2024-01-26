import React, { useEffect, useState } from 'react'
import folderImg from '../../../assets/icons/google-folder-icon.svg'
import { useSelector } from 'react-redux'
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
          <button className='btn btn-primary mr-2'>Save</button>
          <button className='btn btn-secondary outline  api-cancel-btn'>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const RenderData = (props) => {
  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections
    }
  })

  const [listData, setListData] = useState([])

  console.log(listData,234567890)

  useEffect(() => {
    debugger
    if (props.data.length === 1) {
      setListData(Object.keys(collections))
    } else {
      const currentId = props?.data[props?.data.length - 1]
      setListData(pages?.[currentId]?.child)
    }
  }, [props?.data])

  const getType = (id) => {
    if (props?.data.length === 1) {
      return 'collection'
    } else {
      const type = pages?.[id]?.type
      switch (type) {
        case 1:
        case 3:
          return 'page'
        case 2:
          return 'version'
        case 4:
          return 'endpoint'
        default:
          break
      }
    }
  }

  const addIdInPathdata = (id, slug) => {
    if (slug === 'collection') {
      const invisiblePageId = collections?.[id]?.rootParentId
      props.setPathData((prev) => {
        prev.push(invisiblePageId)
        return prev
      })
      setListData(pages?.[invisiblePageId]?.child)
    } else {
      props.setPathData((prev) => {
        prev.push(id)
        return prev
      })
      setListData(pages?.[id]?.child)
    }
  }

  if (listData.length === 0) {
    return <p className='d-flex justify-content-center p-2 m-5 empty-warning'>You Can Save Here</p>
  }

  return (
    <div>
      {listData?.map((singleId, index) => {
        const type = getType(singleId)
        switch (type) {
          case 'collection':
            return (
              <div
                onClick={() => addIdInPathdata(singleId, 'collection')}
                key={index}
                className='folder-box d-flex justify-content-start align-items-center p-1'
              >
                <img src={folderImg} alt='Folder' />
                <div className='ml-1'>{collections?.[singleId]?.name}</div>
              </div>
            )
          case 'page':
            return (
              <div
                onClick={() => addIdInPathdata(singleId)}
                key={index}
                className='folder-box d-flex justify-content-start align-items-center p-1'
              >
                <img src={folderImg} alt='Folder' />
                <div className='ml-1'>{pages?.[singleId]?.name}</div>
              </div>
            )
          case 'version':
            return (
              <div
                onClick={() => addIdInPathdata(singleId)}
                key={index}
                className='folder-box d-flex justify-content-start align-items-center p-1'
              >
                <img src={folderImg} alt='version' />
                <div className='ml-1'>{pages?.[singleId]?.name}</div>
              </div>
            )
          case 'endpoint':
            return (
              <div key={index} className='folder-box d-flex justify-content-start align-items-center p-1'>
                <div className='api-label GET request-type-bgcolor'>GET</div>
                <div className='ml-1'>{pages?.[singleId]?.name}</div>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
