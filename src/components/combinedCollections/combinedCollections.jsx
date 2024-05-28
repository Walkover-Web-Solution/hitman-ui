import React , {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'
import { toast } from 'react-toastify'
<<<<<<< HEAD
=======
import { updateDragDrop, updateDragDropV2 } from '../pages/redux/pagesActions'
>>>>>>> 5fd82cbc0e9be94a3bd3b29e52499250dc2adc3f

function CombinedCollections(props) {
  const dispatch = useDispatch()

  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
    }
  })

  
  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null;
        const commonProps = {
          key: singleId,
          ...props,
          handleOnDragOver: props.handleOnDragOver,
          onDragStart: props.onDragStart,
          onDrop: props.onDrop,
          onDragEnter: props.onDragEnter,
<<<<<<< HEAD
          draggingOverId: props.draggingOverId,
=======
          draggingOverId: draggingOverId,
>>>>>>> 5fd82cbc0e9be94a3bd3b29e52499250dc2adc3f
          onDragEnd: props.onDragEnd
        }
        switch (type) {
          case 1:
            return (
              <CollectionParentPages
                {...commonProps}
                rootParentId={singleId}
              />
            )
          case 3:
            return (
              <Groups
                {...commonProps}
                rootParentId={singleId}
              />
            )
          case 4:
            return (
              <Endpoints
                {...commonProps}
                endpointId={singleId}
              />
            )
          default:
            break
        }
      })}
    </div>
  );
  
}

export default CombinedCollections