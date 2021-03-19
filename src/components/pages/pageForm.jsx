import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import shortid from 'shortid'
import Form from '../common/form'
import { addGroupPage, addPage } from '../pages/redux/pagesActions'
import { onEnter } from '../common/utility'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (versionId, newPage) =>
      dispatch(addPage(ownProps.history, versionId, newPage)),
    add_group_page: (versionId, groupId, newPage) =>
      dispatch(addGroupPage(ownProps.history, versionId, groupId, newPage))
  }
}

class PageForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        name: ''
      },
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Page name')
    }
  }

  async doSubmit (props) {
    this.props.onHide()
    if (this.props.title === 'Add new Group Page') {
      const data = { ...this.state.data }
      const newPage = { ...data, requestId: shortid.generate() }
      this.props.add_group_page(
        this.props.selectedVersion,
        this.props.selectedGroup.id,
        newPage
      )
    }
    if (this.props.title === 'Add New Version Page') {
      const versionId = this.props.selectedVersion.id
      const data = { ...this.state.data }
      const newPage = { ...data, requestId: shortid.generate() }
      this.props.add_page(versionId, newPage)
    }
  }

  render () {
    return (
      <div onKeyPress={(e) => onEnter(e, this.handleKeyPress.bind(this))}>
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput('name', 'Page name', 'page name')}
              <div className='text-left mt-2 mb-1'>
                {this.renderButton('Submit')}

                <button
                  className='btn btn-secondary ml-2'
                  onClick={this.props.onHide}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default withRouter(connect(null, mapDispatchToProps)(PageForm))
