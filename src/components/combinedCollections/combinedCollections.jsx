import React from 'react'
import { useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages1'
import Groups from '../subPages/subPages'
import Endpoints from '../endpoints/endpoints'

function CombinedCollections(props) {
  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
    }
  })

  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null
        const commonProps = {
          key: singleId,
          ...props,
          handleOnDragOver: props.handleOnDragOver,
          onDragStart: props.onDragStart,
          onDrop: props.onDrop,
          onDragEnter: props.onDragEnter,
          draggingOverId: props.draggingOverId,
          onDragEnd: props.onDragEnd
        }

        const endpointProps = {
          key: singleId,
          onDragStart: props.onDragStart,
          onDrop: props.onDrop,
          onDragEnter: props.onDragEnter,
          draggingOverId: props.draggingOverId,
          onDragEnd: props.onDragEnd
        }

        switch (type) {
          case 1:
            return <CollectionParentPages {...commonProps} rootParentId={singleId} />
          case 3:
            return <Groups {...commonProps} rootParentId={singleId} />
          case 4:
            return <Endpoints {...endpointProps} endpointId={singleId} />
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
