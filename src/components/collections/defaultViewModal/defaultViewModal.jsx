// Reminder : mapStatetoProps -> useSelector (later)
import React, { useState, useEffect, useRef } from 'react'
import shortid from 'shortid'
import Joi from 'joi-browser'
import { Modal, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addNewTab } from '../../tabs/redux/tabsActions'
import { onEnter, toTitleCase, validate } from '../../common/utility'
import Form from '../../common/form'
import { addPage } from '../../pages/redux/pagesActions'
import DocIcon from '../../../assets/icons/doc.svg'
import ApiIcon from '../../../assets/icons/api.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import './defaultViewModal.scss'


export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_new_tab: () => dispatch(addNewTab()),
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  }
}
const DefaultViewModal = (props) => {
  const inputRef = useRef(null);
  const [showPageForm, setShowPageForm] = useState({ addPage: false });
  const [data, setData] = useState({ name: '' });
  const [errors, setErrors] = useState({ name: '' });
  const [versionRequired, setVersionRequired] = useState(false);

  const schema = {
    name: Joi.string().min(1).max(100).required().label('Name'),
    contents: Joi.string().allow(null, ''),
    state: Joi.valid(0, 1, 2, 3),
  };

  useEffect(() => {
    if (showPageForm.addPage) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [showPageForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    doSubmit();
  };


  const doSubmit = async () => {
    const validationErrors = validate({ name: data.name }, schema);
    if (validationErrors) {
      setErrors(validationErrors);
      return null;
    }
    if (!props.selectedCollection && props.addEntity) {
      setVersionRequired(true);
      return;
    }
    const collections = props?.selectedCollection;
    props.onHide();
    let { name: pageName } = { ...data };
    pageName = toTitleCase(pageName);
    if (props.title === 'Add Parent Page' || props.addEntity) {
      const rootParentId = collections?.rootParentId;
      const newPageData = { ...data, name: pageName };
      const newPage = {
        ...newPageData,
        requestId: shortid.generate(),
        versionId: props.pageType === 1 ? shortid.generate() : null,
        pageType: props.pageType,
      };
      props.add_page(rootParentId, newPage);
    }

    if (props?.title === 'Add Page' || props?.title === 'Add Sub Page' || props?.addEntity) {
      const selectedId = props?.title === 'Add Page' ? props?.selectedVersion : props?.selectedPage;
      const ParentId = selectedId;
      const newPageData = { ...data };
      const newPage = {
        ...newPageData,
        requestId: shortid.generate(),
        versionId: props?.pageType === 1 ? shortid.generate() : null,
        pageType: props?.pageType,
        state: 0,
      };
      props.add_page(ParentId, newPage);
    }
  };

  const renderCollectionDetailsForm = () => {
    return (
      <Form doSubmit={doSubmit} >
        {({ renderInput }) => (
          <div className='mt-5'>
            {renderInput('name', 'Name', this.props.title, 'Page name', false, false, '*name accepts min 1 & max 100 characters')}
            <div className='text-left mt-4 mx-2'>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        )}
      </Form>
    )
  }

  const renderTestingButton = () => {
    return (
      <button
        className='block-view-btn mr-3'
        onClick={() => {
          props.add_new_tab()
          props.onHide()
        }}
      >
        <img src={ApiIcon} alt='' />
        {'Create Endpoint'}
      </button>
    )
  }

  const renderDocButton = () => {
    return (
      <button
        className='block-view-btn'
        onClick={() => {
          this.setState({ showPageForm: { addPage: true } })
        }}
      >
        <img src={DocIcon} alt='' />
        {'Create Page'}
      </button>
    )
  }

  const renderButtons = () => {
    return (
      <>
        <div className='d-flex justify-content-center'>
          {renderTestingButton()}
          {renderDocButton()}
        </div>
        {showPageForm.addPage && renderCollectionDetailsForm()}
        <div className='info mt-5 d-flex align-items-center'>
          <img src={InfoIcon} className='mr-2' alt='' />
          <span>You can always choose to Test the API's or make the Testing API description</span>
        </div>
      </>
    )
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
                  <Modal.Title id='contained-modal-title-vcenter'>{'Start adding in your collection'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{renderButtons()}</Modal.Body>
              </div>
            </Modal>
          </div>
        )}
      </Form>
    )
  }

  return props.showOnlyForm ? renderButtons() : renderInModal()

}

export default withRouter(connect(null, mapDispatchToProps)(DefaultViewModal))
