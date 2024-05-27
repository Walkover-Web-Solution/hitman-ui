import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import CollectionParentPages from "../collectionVersions/collectionParentPages"
import Groups from "../groups/groups"
import Endpoints from "../endpoints/endpoints"
import { toast } from "react-toastify"
import { updateDragDrop } from "../pages/redux/pagesActions"

function CombinedCollections(props) {
  const [draggingOverId, setDraggingOverId] = useState(null)
  const [draggedIdSelected, setDraggedIdSelected] = useState(null)
  const dispatch = useDispatch()

  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
    }
  })

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

  const onDragStart = (draggedIdSelected) => {
    setDraggedIdSelected(draggedIdSelected)
  }

  const onDrop = (e, droppedOnId) => {
    e.preventDefault()
    setDraggingOverId(null)

    if (draggedIdSelected === droppedOnId) return

    let draggedIdParentId = pages?.[draggedIdSelected]?.parentId
    let droppedOnIdParentId = pages?.[droppedOnId]?.parentId

    // if both data is not from same parent then stop the user
    if (draggedIdParentId != droppedOnIdParentId) {
      toast.error("Reordering is allowed inside the same parent")
      return
    }

    dispatch(updateDragDrop(draggedIdSelected, droppedOnId))
  }

  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null
        const commonProps = {
          key: singleId,
          ...props,
          handleOnDragOver: handleOnDragOver,
          onDragStart: onDragStart,
          onDrop: onDrop,
          onDragEnter: onDragEnter,
          draggingOverId: draggingOverId,
          onDragEnd: onDragEnd
        }
        switch (type) {
          case 1:
            return <CollectionParentPages {...commonProps} rootParentId={singleId} />
          case 3:
            return <Groups {...commonProps} rootParentId={singleId} />
          case 4:
            return <Endpoints {...commonProps} endpointId={singleId} />
          default:
            break
        }
      })}
    </div>
  )
}

export default CombinedCollections
