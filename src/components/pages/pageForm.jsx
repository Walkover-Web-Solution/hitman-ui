import Joi from 'joi-browser'
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import shortid from 'shortid'
import Form from '../common/form'
import { addPage } from '../pages/redux/pagesActions'
import { onEnter, toTitleCase } from '../common/utility'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  }
}

const PageForm = (props) => {

  const [data, setData] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [versionRequired, setVersionRequired] = useState(false)

  const schema = {
    name: Joi.string().min(1).max(100).required().label('Page name'),
    contents: Joi.string().allow(null, ''),
    state: Joi.valid(0, 1, 2, 3)
  }


  const doSubmit = async () => {
    if (props.addEntity) {                    // to confirm
      setVersionRequired(true)
      return null
    }
    const collections = props?.selectedCollection
    props.onHide()
    let { name } = { ...data }
    name = toTitleCase(name)
    if (props.title === 'Add Parent Page' || props.addEntity) {
      const rootParentId = collections?.rootParentId
      const data = { ...data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: props.pageType === 1 ? shortid.generate() : null,
        pageType: props.pageType
      }
      props.add_page(rootParentId, newPage)
    }
    if (props?.title === 'Add Page' || props?.title === 'Add Sub Page' || props?.addEntity) {
      const selectedId = props?.title === 'Add Page' ? props?.selectedVersion : props?.selectedPage
      const ParentId = selectedId
      const data = { ...data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: props?.pageType === 1 ? shortid.generate() : null,
        pageType: props?.pageType,
        state: 0
      }
      props.add_page(ParentId, newPage)
    }
  }

  return (
    <Form doSubmit={doSubmit} >
      {({ handleKeyPress, handleSubmit, renderInput, renderButton }) => (
        <div onKeyPress={(e) => onEnter(e, handleKeyPress)}>
          <Modal
            show={props.show}
            onHide={props.onHide}
            size='lg'
            animation={false}
            aria-labelledby='contained-modal-title-vcenter'
          >
            <Modal.Header className='custom-collection-modal-container' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit}>
                <div className='row'>
                  <div className='col-6'>{renderInput('name', 'Page name', 'page name', true, true)}</div>
                </div>
                <div className='text-left mt-2 mb-1'>
                  {renderButton('Submit')}
                  <button className='btn btn-secondary ml-2' onClick={props.onHide}>
                    Cancel
                  </button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      )
      }
    </Form >
  )
}


export default withRouter(connect(null, mapDispatchToProps)(PageForm))
