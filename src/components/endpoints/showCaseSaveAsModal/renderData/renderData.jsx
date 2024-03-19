import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaFolder } from 'react-icons/fa'

export default function RenderData(props) {
  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections
    }
  })

  const [listData, setListData] = useState([])

  useEffect(() => {
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

  return (
    <div>
      {listData?.map((singleId, index) => {
        const type = getType(singleId)
        debugger
        switch (type) {
          case 'collection':
            return (
              <div
                onClick={() => addIdInPathdata(singleId, 'collection')}
                key={index}
                className='folder-box d-flex justify-content-start align-items-center p-1'
              >
                <FaFolder color='#e98a36' size='21px' />
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
                <FaFolder color='#e98a36' size='21px' />
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
                <FaFolder color='#e98a36' size='21px' />
                <div className='ml-1'>{pages?.[singleId]?.name}</div>
              </div>
            )
          case 'endpoint':
            return (
              <div key={index} className='folder-box d-flex justify-content-start align-items-center p-1'>
                <div className={`api-label ${pages?.[singleId]?.requestType} request-type-bgcolor`}>{pages?.[singleId]?.requestType}</div>
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
