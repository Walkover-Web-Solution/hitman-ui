import React from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../../common/form'
import { toTitleCase, onEnter, DEFAULT_URL } from '../../common/utility'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { moveToNextStep } from '../../../services/widgetService'
import { URL_VALIDATION_REGEX } from '../../common/constants'
import DefaultViewModal from '../../collections/defaultViewModal/defaultViewModal'
import { addPage } from '../../pages/redux/pagesActions'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  }
}

class PageEndpointForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        name: ''
      },
      collectionId: '',
      errors: {},
      show: true,
      step: 1,
      viewLoader: {
        testing: false,
        doc: false
      },
      updating: false
    }
    this.schema = {
      name: Joi.string().required().label('Page name')
    }
  }

  async onAddPageSubmit(props) {
    let { name } = { ...this.state.data }
    name = toTitleCase(name)
    const collections = this.props.selectedCollection

    const rootParentId = this.props.addEntity ? collections : this.props.collections.rootParentId
    const data = { ...this.state.data, name }
    const newPage = {
      ...data,
      requestId: shortid.generate(),
      versionId: this.props.pageType === 1 ? shortid.generate() : null,
      pageType: this.props.pageType
    }
    this.props.add_page(rootParentId, newPage)
    moveToNextStep(1)
  }

  renderDefaultViewForm() {
    return (
      <DefaultViewModal
        viewLoader={this.state.viewLoader}
        saveCollection={this.saveCollection.bind(this)}
        onHide={() => this.props.onHide()}
      />
    )
  }

  renderForm() {
    const { step } = this.statecp
    return <>{step === 1 && this.renderDefaultViewForm()}</>
  }

  handleCancel(e) {
    e.preventDefault()
    this.props.showOnlyForm ? this.props.onCancel() : this.props.onHide()
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
            <Modal.Body>{this.renderForm()}</Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }

  render() {
    return this.props.showOnlyForm ? this.renderForm() : this.renderInModal()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PageEndpointForm)
