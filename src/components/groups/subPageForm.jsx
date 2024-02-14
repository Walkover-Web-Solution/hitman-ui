import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import Form from '../common/form'
import { onEnter, toTitleCase, ADD_GROUP_MODAL_NAME } from '../common/utility'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import { updatePage } from '../pages/redux/pagesActions'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (page) => dispatch(updatePage(ownProps.history, page))
  }
}

class SubPageForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: { name: '' },
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Group Name').max(20)
    }
  }

  async componentDidMount() {
    const subPage = this.props.pages[this.props.selectedPage]
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.collectionId, this.props)
    this.setState({ versions })
    if (this.props.title === ADD_GROUP_MODAL_NAME) return
    let data = {}
    if (this.props.selectedPage) {
      const name = subPage.name
      data = { name }
    }
    this.setState({ data })
  }

  async doSubmit() {
    this.props.onHide()
    let { name } = { ...this.state.data }
    name = toTitleCase(name)

    if (this.props.title === 'Edit') {
      const subPage = this.props.pages[this.props.selectedPage]
      const editedPage = {
        ...this.state.data,
        name,
        id: this.props.selectedPage,
        state: subPage.state
      }
      this.props.update_page(editedPage)
    }
  }

  render() {
    return (
      <div
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this))
        }}
      >
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              <div className='row'>
                <div className='col-12'>
                  {this.renderInput('name', 'Name', 'Page Name', true, true, false, '*page name accepts min 1 & max 20 characters')}
                </div>
              </div>

              <div className='text-left'>
                {this.renderButton('Submit')}
                <button className='btn btn-secondary outline btn-lg ml-2' onClick={this.props.onHide}>
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

export default connect(null, mapDispatchToProps)(SubPageForm)
