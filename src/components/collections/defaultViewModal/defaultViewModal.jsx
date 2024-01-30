import React, { Component } from 'react'
import DocIcon from '../../../assets/icons/doc.svg'
import ApiIcon from '../../../assets/icons/api.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import shortid from 'shortid'
import Joi from 'joi-browser'
import './defaultViewModal.scss'
import { Modal, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addNewTab } from '../../tabs/redux/tabsActions'
import { onEnter, toTitleCase } from '../../common/utility'
import Form from '../../common/form'
import { addPage1 } from '../../pages/redux/pagesActions'
export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_new_tab: () => dispatch(addNewTab()),
    add_page: (rootParentId, newPage) => dispatch(addPage1(ownProps.history, rootParentId, newPage))
  }
}
export class DefaultViewModal extends Form {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      showPageForm: {
        addPage: false
      },
      data: {
        name: ''
      },
      errors: {
        name: ''
      }
    }

    this.schema = {
      name: Joi.string().required().label('Page name'),
      contents: Joi.string().allow(null, ''),
      state: Joi.valid(0, 1, 2, 3)
    }
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.doSubmit()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showPageForm.addPage && !prevState.showPageForm.addPage) {
      if (this.inputRef.current) {
        this.inputRef.current.focus()
      }
    }
  }

  async doSubmit() {
    if (!this.state.selectedCollection && this.props.addEntity) {
      this.setState({ versionRequired: true })
      return
    }
    const collections = this.props?.selectedCollection
    this.props.onHide()
    let { name } = { ...this.state?.data }
    name = toTitleCase(name)
    if (this.props.title === 'Add Parent Page' || this.props.addEntity) {
      const rootParentId = collections?.rootParentId
      const data = { ...this.state.data, name }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props.pageType === 1 ? shortid.generate() : null,
        pageType: this.props.pageType
      }
      this.props.add_page(rootParentId, newPage)
    }
    if (this.props?.title === 'Add Page' || this.props?.title === 'Add Sub Page' || this.props?.addEntity) {
      const selectedId = this.props?.title === 'Add Page' ? this.props?.selectedVersion : this.props?.selectedPage
      const ParentId = selectedId
      const data = { ...this.state.data }
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props?.pageType === 1 ? shortid.generate() : null,
        pageType: this.props?.pageType,
        state: 0
      }
      this.props.add_page(ParentId, newPage)
    }
  }
  renderCollectionDetailsForm() {
    return (
      <div className='mt-5'>
        {/* <div className='d-flex gap-5 justify-content-center mt-5'> */}
        {this.renderInput('name', this.props.title, 'page name', true, true)}
        <div className='text-left mt-4 mx-2'>
          <Button onClick={this.handleSubmit}>Submit</Button>
        </div>
        {/* </div> */}
      </div>
    )
  }

  renderTestingButton() {
    return (
      <button
        className='block-view-btn mr-3'
        onClick={() => {
          this.props.add_new_tab()
          this.props.onHide()
        }}
      >
        <img src={ApiIcon} alt='' />
        {'Create Endpoint'}
      </button>
    )
  }

  renderDocButton() {
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

  renderButtons() {
    return (
      <>
        <div className='d-flex justify-content-center'>
          {this.renderTestingButton()}
          {this.renderDocButton()}
        </div>
        {this.state.showPageForm.addPage && this.renderCollectionDetailsForm()}
        <div className='info mt-5 d-flex align-items-center'>
          <img src={InfoIcon} className='mr-2' alt='' />
          <span>You can always choose to Test the API's or make the Testing API description</span>
        </div>
      </>
    )
  }

  renderInModal() {
    return (
      <div
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this))
        }}
      >
        <Modal
          size='sm'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
          onHide={this.props.onHide}
          show={this.props.show}
        >
          <div>
            <Modal.Header className='custom-collection-modal-container' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{'Start adding in your collection'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.renderButtons()}</Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }

  render() {
    return this.props.showOnlyForm ? this.renderButtons() : this.renderInModal()
  }
}

export default withRouter(connect(null, mapDispatchToProps)(DefaultViewModal))
