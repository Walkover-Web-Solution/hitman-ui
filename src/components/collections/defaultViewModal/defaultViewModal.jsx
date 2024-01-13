import React, { Component } from 'react'
import DocIcon from '../../../assets/icons/doc.svg'
import ApiIcon from '../../../assets/icons/api.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import './defaultViewModal.scss'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { addNewTab } from '../../tabs/redux/tabsActions'
import { onEnter } from '../../common/utility'
import Form from '../../common/form'
import PageForm from '../../pages/pageForm'
export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_new_tab: () => dispatch(addNewTab()),
  }
}
export class DefaultViewModal extends Form {

  constructor(props) {
    super(props);
    this.state = {
      showPageForm: {
        addPage: false,
      }
    }
    this.renderCollectionDetailsForm = this.renderCollectionDetailsForm.bind(this);
  }
  
    renderCollectionDetailsForm() {
    const showPageForm = { addPage: true }
    this.setState({
      showPageForm,
    })
      return (
        this.state.showPageForm.addPage && (
          <PageForm
            {...this.props}
            show={this.state.showPageForm.addPage}
            onHide={() => this.closeParentPageForm()}
            title={this.state.parentPageFormName}
            selectedCollection={this.state.selectedCollection}
            pageType={1}
          />
        )
      )
    }
    renderSaveButton() {
      return (
        <button className='btn btn-primary' onClick={() => this.saveCollection(defaultViewTypes.TESTING, 'edit')}>
          Save
        </button>
      )
    }
  renderTestingButton() {
    return (
      <button className='block-view-btn mr-3' onClick={() => this.props.add_new_tab()}>
        <img src={ApiIcon} alt='' />
        { 'Create Endpoint'}
      </button>
    )
  }

  renderDocButton() {
    return (
      <button className='block-view-btn' onClick={() => 
      this.renderCollectionDetailsForm()}>
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
              <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
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