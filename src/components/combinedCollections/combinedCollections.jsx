import React , {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CollectionParentPages from '../collectionVersions/collectionParentPages'
import Groups from '../groups/groups'
import Endpoints from '../endpoints/endpoints'
import { toast } from 'react-toastify'
import { updateDragDrop } from '../pages/redux/pagesActions'

function CombinedCollections(props) {
  const [draggingOverId, setDraggingOverId] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const dispatch = useDispatch()

  const { childIds, pages } = useSelector((state) => {
    return {
      childIds: state?.pages?.[props?.rootParentId]?.child || [],
      pages: state.pages
    }
  })

  const handleOnDragOver = (e)  =>  {
    e.preventDefault()
  }

  const onDragEnter = (e, draggingOverId) => {
    e.preventDefault();
    setDraggingOverId(draggingOverId);
  }
  const onDragEnd = (e) => {
    e.preventDefault()
    setDraggingOverId(null)
  }

  const onDragStart = (draggedId) => {
    setDraggedId(draggedId);
  }

  const onDrop = (e, droppedOnId) => {
    e.preventDefault()
    setDraggingOverId(null);

    if (draggedId === droppedOnId) return ;

    let draggedIdParentId = pages?.[draggedId]?.parentId
    let droppedOnIdParentId = pages?.[droppedOnId]?.parentId

    // if both data is not from same parent then stop the user 
    if(draggedIdParentId != droppedOnIdParentId){
      toast.error("Reordering is allowed inside the same parent")        
      return ;
    }

    dispatch(updateDragDrop(draggedId,  droppedOnId))
  }

  const componentMap = {
    1: CollectionParentPages,
    3: Groups,
    4: Endpoints,
  };
  
  return (
    <div>
      {childIds.map((singleId) => {
        const type = pages?.[singleId]?.type || null;
        const Component = componentMap[type];
  
        if (!Component) return null;
        const commonProps = {
          key: singleId,
          ...props,
          rootParentId: singleId,
          handleOnDragOver: handleOnDragOver,
          onDragStart: onDragStart,
          onDrop: onDrop,
          onDragEnter: onDragEnter,
          draggingOverId: draggingOverId,
          onDragEnd:onDragEnd
        };
        if (type === 4) commonProps.endpointId = singleId; 
        
        return <Component {...commonProps} />;
      })}
    </div>
  );
  
}

export default CombinedCollections