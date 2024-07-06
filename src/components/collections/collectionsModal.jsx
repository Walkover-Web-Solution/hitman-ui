import React, { useState } from 'react';
import CollectionForm from './collectionForm';
import { Modal } from 'react-bootstrap';
import './collectionsModal.scss';

const collectionsModalEnum = {
  NEW: 'new',
};

const choices = {
  [collectionsModalEnum.NEW]: {
    key: collectionsModalEnum.NEW,
    label: 'Create New',
    disabled: false,
    modalTitle: 'Create New Collection',
    modalSize: 'sm',
    id: 'add_collection_create_new_btn',
  },
};

const CollectionsModal = (props) => {
  const [choiceSelected, setChoiceSelected] = useState(null);

  const selectChoice = (choice) => {
    setChoiceSelected(choice);
  };

  const renderChoices = () => (
    <div className='d-flex justify-content-center'>
      {Object.values(choices).map((choice) => (
        <div
          key={choice.key}
          className={['add-collection-item', choice.disabled ? 'disabled' : ''].join(' ')}
          onClick={() => (choice.disabled ? {} : selectChoice(choice.key))}
        >
          <div>
            <span>{choice.label}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const removeSelection = () => {
    setChoiceSelected(null);
  };

  const renderAddCollectionForm = () => (
    <CollectionForm
      {...props}
      title='Add new Collection'
      showOnlyForm
      onCancel={removeSelection}
      onHide={props.onHide}
    />
  );

  const renderSelectedForm = () => {
    if (choiceSelected === collectionsModalEnum.NEW) {
      return renderAddCollectionForm();
    }
    return null;
  };

  /** Get Current Choice Selection */
  const selectedChoice = choices[choiceSelected];

  /** Set Default values */
  let dialogClassName = 'collection-choice-modal';
  let modalSize = 'sm';
  let modalTitle = props.title;
  let modalBody = renderChoices();

  if (selectedChoice) {
    dialogClassName = '';
    modalSize = selectedChoice.modalSize;
    modalTitle = selectedChoice.modalTitle;
    modalBody = renderSelectedForm();
  }

  return (
    <Modal size={modalSize} onHide={props.onHide} show={props.show} dialogClassName={dialogClassName}>
      <div>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBody}</Modal.Body>
      </div>
    </Modal>
  );
};

export default CollectionsModal;
