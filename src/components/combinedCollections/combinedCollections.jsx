import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'
import { toast } from 'react-toastify'
import { updateDragDrop } from '../pages/redux/pagesActions'

function CombinedCollections(props) {
  const [draggingOverId, setDraggingOverId] = useState(null)
  const [draggedIdSelected, setDraggedIdSelected] = useState(null)

  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages,
      clientData: state.clientData
    }
  })

  const dispatch = useDispatch()

  const handleOnDragOver = (e) => {
    e.preventDefault()
  }

  const onDragEnter = (e, draggingOverId) => {
    e.preventDefault()
    setDraggingOverId(draggingOverId)
  }

  const onDragEnd = (e) => {
    e.preventDefault()
    setDraggingOverId(null)
  }

  const onDragStart = (draggedId) => {
    setDraggedIdSelected(draggedId)
  }

  const onDrop = (e, droppedOnId) => {
    e.preventDefault()

    setDraggingOverId(null)

    let draggedId = draggedIdSelected
    if (draggedId === droppedOnId) {
      return
    }

    let draggedIdParentId = pages?.[draggedId]?.parentId
    let droppedOnIdParentId = pages?.[droppedOnId]?.parentId

    // if both data is not from same parent then stop the user
    if (draggedIdParentId != droppedOnIdParentId) {
      toast.error('Reordering is allowed inside the same parent')
      return
    }

    dispatch(updateDragDrop(draggedId, droppedOnId))
  }

  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null
        switch (type) {
          case 1:
            return (
              <CollectionParentPages
                key={singleId}
                {...props}
                rootParentId={singleId}
                handleOnDragOver={handleOnDragOver}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragEnd={onDragEnd}
                draggingOverId={draggingOverId}
              />
            )
          case 3:
            return (
              <Groups
                key={singleId}
                {...props}
                rootParentId={singleId}
                handleOnDragOver={handleOnDragOver}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragEnd={onDragEnd}
                draggingOverId={draggingOverId}
              />
            )
          case 4:
            return (
              <Endpoints
                key={singleId}
                {...props}
                endpointId={singleId}
                handleOnDragOver={handleOnDragOver}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragEnd={onDragEnd}
                draggingOverId={draggingOverId}
              />
            )
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
