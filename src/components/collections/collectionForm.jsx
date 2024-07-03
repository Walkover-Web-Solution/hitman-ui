// mapDispatchtoprops
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import Joi from 'joi-browser';
import { connect } from 'react-redux';
import shortid from 'shortid';
import { addCollection, updateCollection } from './redux/collectionsActions';
import { moveToNextStep } from '../../services/widgetService';
import { defaultViewTypes } from './defaultViewModal/defaultViewModal';
import { onEnter, validate, toTitleCase } from '../common/utility';
import Form from '../common/form';

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection, openSelectedCollection, callback) =>
      dispatch(addCollection(newCollection, openSelectedCollection, callback)),
    update_collection: (editedCollection, setLoader, callback) =>
      dispatch(updateCollection(editedCollection, setLoader, callback)),
  };
};


const CollectionForm = (props) => {
  const [data, setData] = useState({
    name: '',
    description: '',
    defaultView: defaultViewTypes.TESTING,
  });
  const [collectionId, setCollectionId] = useState('');
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(1);
  const [viewLoader, setviewLoader] = useState({
    testing: false,
    doc: false,
  });
  const [updating, setUpdating] = useState(false);
  const inputRef = useRef(null);

  const schema = {
    name: Joi.string().min(3).max(50).trim().required().label('Collection Name'),
    description: Joi.string().allow(null, '').label('Description'),
    defaultView: Joi.string().allow(null, '').label('Default View')
  }

  useEffect(() => {
    if (!props.show || props.title === 'Add new Collection') return;
    let collectionData = {};
    const { edited_collection } = props;
    if (edited_collection) {
      const { id, name, description } = edited_collection;
      collectionData = { name, description };
      setCollectionId(id);
    }
    setData(collectionData);
  }, []);

  const doSubmit = async (defaultView) => {
    const validationErrors = validate({ name: data.name }, schema)
    if (validationErrors) {
      setErrors(validationErrors)
      return null
    }
    const body = { ...data }
    body.name = body.name.trim()
    if (props.title === 'Edit Collection') {
      onEditCollectionSubmit(defaultView)
    }
    if (props.title === 'Add new Collection') {
      onAddCollectionSubmit(defaultView)
      if (props.setDropdownList) props.onHide()
    }
  }

  const onEditCollectionSubmit = (defaultView) => {
    props.update_collection(
      {
        ...data,
        id: collectionId,
        defaultView
      },
      null,
      redirectToCollection
    )
  }

  const redirectToCollection = (collection) => {
    if (!collection.data) {
      console.error('collection.data is undefined')
      return // or handle this case appropriately
    }
    const { id: collectionId } = collection.data
    if (collection.success) {
      const { orgId } = props.match.params
      props.history.push({ pathname: `/orgs/${orgId}/dashboard/collection/${collectionId}/settings` })
    }
    if (props.setDropdownList) props.setDropdownList(collection.data)
    props.onHide()
  }

  const onAddCollectionSubmit = async (defaultView) => {
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: data?.title
    }
    props.add_collection(
      { ...data, docProperties: defaultDocProperties, requestId, defaultView },
      null,
      redirectToCollection)
    setData({
      name: '',
      description: '',
      defaultView: defaultViewTypes.TESTING
    })
    moveToNextStep(1)
  }

  const setViewLoader = (type, flag) => {
    if (flag === 'edit') setUpdating(true)
    else {
      setViewLoader((prevState) => ({ ...prevState, [type]: flag }))
    }
  }


  const saveCollection = (defaultView, flag) => {
    setViewLoader(defaultView, flag)
    doSubmit(defaultViewTypes.TESTING)
  }

  const renderCollectionDetailsForm = () => {
    return (
      <Form doSubmit={doSubmit} >
        {({ renderInput }) => (
          <> {renderInput('name', 'Name', 'Collection Name', true, true, false, '*collection name accepts min 3 and max 50 characters')}
            {renderSaveButton()}</>
        )}
      </Form>
    )
  }

  const renderSaveButton = () => {
    return (
      <button className='btn btn-primary btn-sm fs-4' onClick={() => saveCollection(defaultViewTypes.TESTING, 'edit')}>
        Save
      </button>
    )
  }

  const renderForm = () => {
    return <>{step === 1 && renderCollectionDetailsForm()}</>
  }

  const renderInModal = () => {
    return (
      <Form doSubmit={doSubmit}>
        {({ handleKeyPress }) => (
          <div
            onKeyPress={(e) => {
              onEnter(e, handleKeyPress)
            }}
          >
            <Modal
              size='sm'
              animation={false}
              aria-labelledby='contained-modal-title-vcenter'
              centered
              onHide={props.onHide}
              show={props.show}
            >
              <div>
                <Modal.Header className='custom-collection-modal-container' closeButton>
                  <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{renderForm()}</Modal.Body>
              </div>
            </Modal>
          </div>
        )}
      </Form>
    )
  }

  return props.showOnlyForm ? renderForm() : renderInModal()

}
export default connect(mapStateToProps, mapDispatchToProps)(CollectionForm)