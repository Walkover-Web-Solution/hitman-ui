import React from 'react';
import { SortableHandle, SortableContainer, SortableElement } from 'react-18-sortable-hoc'
import { ReactComponent as DragHandleIcon } from '../../assets/icons/drag-handle.svg'
import DeleteIcon from '../../assets/icons/delete-icon.svg'

const SortableItem = SortableElement(({ children }) => {
    return <>{children}</>
  })
  const SortableList = SortableContainer(({ children }) => {
    return <>{children}</>
  })
  const DragHandle = SortableHandle(() => (
    <div className='dragIcon'>
      <DragHandleIcon />
    </div>
  ))

const DocViewContent = ({ docViewData, setQueryUpdatedData, renderPublicItem,endpointContent }) => {
  if (!docViewData) return null;

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (newIndex !== oldIndex) {
      const newData = [...docViewData];
      const [removed] = newData.splice(oldIndex, 1);
      newData.splice(newIndex, 0, removed);
      setQueryUpdatedData({ ...endpointContent, docViewData: newData });
    }
  };
  
  const removePublicItem = (item, index) => {
    const showRemoveButton = !['body', 'host', 'params', 'pathVariables', 'headers', 'sampleResponse'].includes(item.type)
    const handleOnClick = () => {
      const docData = [...docViewData]
      docData.splice(index, 1)
      setQueryUpdatedData({ ...endpointContent, docViewData: docData })
    }
    return (
      showRemoveButton && (
        <div className='' onClick={handleOnClick.bind(this)}>
          {' '}
          <img src={DeleteIcon} alt='' />{' '}
        </div>
      )
    )
  };

  const renderDragHandle = (item) => {
    if (item.type === 'pathVariables') {
      if (endpointContent?.pathVariables && endpointContent?.pathVariables.length) return <DragHandle />;
      return 
    }
    return <DragHandle />;
  };

  return (
    <SortableList lockAxis="y" useDragHandle onSortEnd={onSortEnd}>
      {docViewData.map((item, index) => (
        <SortableItem key={index} index={index}>
          <div className="doc-secs-container mb-3">
            <div className="doc-secs">{renderPublicItem(item, index)}</div>
            <div className="addons">
              {renderDragHandle(item)}
              {removePublicItem(item, index)}
            </div>
          </div>
        </SortableItem>
      ))}
    </SortableList>
  );
};

export default DocViewContent;