import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import Form from '../common/form'
import { onEnter, ADD_GROUP_MODAL_NAME, validate, getOnlyUrlPathById } from '../common/utility'
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
      data: { name: '', urlName: '' },
      errors: {}
    }
    this.schema = {
      name: Joi.string().min(1).max(100).required().label('Name'),
      urlName: Joi.string()
        .optional()
        .allow(/[^a-zA-Z0-9\-_\.~]+/g)
    }
  }

  async componentDidMount() {
    const subPage = this.props?.pages?.[this.props?.selectedPage]
    const endpoint = this.props?.endpoints?.[this.props?.selectedEndpoint]

    if (this.props.title === ADD_GROUP_MODAL_NAME) return
    let data = {}
    if (this.props.selectedPage || this.props.selectedEndpoint) {
      const name = subPage?.name || endpoint?.name
      const urlName = subPage?.urlName || endpoint?.urlName
      data = { name, urlName }
    }
    this.setState({ data })
  }

  async doSubmit() {
    const errors = validate({ name: this.state.data.name }, this.schema)
    if (errors) {
      this.setState({ errors })
      return null
    }
    this.props.onHide()
    let { name, urlName } = { ...this.state.data }

    if (this.props.title === 'Rename') {
    const subPage = this.props?.pages?.[this.props.selectedPage]
      const endpoint = this.props?.endpoints?.[this.props.selectedEndpoint]
      const editedPage = {
        ...this.state.data,
        name,
        urlName,
        id: subPage?.id || endpoint?.id,
        state: subPage?.state || endpoint?.state
      }
      this.props.update_page(editedPage)
    }
  }

  render() {
    const nameTitle = this.props.isEndpoint ? 'Endpoint Name' : 'Page Name'
    const redirectUrl = ' Enter URL'
    const pageSlug = 'Page Slug'
    const tagLine = getOnlyUrlPathById(
      this.props?.match?.params?.pageId || this.props?.match?.params?.endpointId,
      this.props.pages,
      'internal'
    )
    if (this.props.title === 'Rename') {
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
                  {this.renderInput('name', 'Name', nameTitle, true, false, false, '*name accepts min 1 & max 100 characters')}
                </div>
                <div className='col-12'>
                  {this.renderInput(
                    'urlName',
                    'URL Name',
                    pageSlug,
                    true,
                    false,
                    false,
                    '*Page slug can only contain alphanumeric values and reserved keywords like - _ . ~'
                  )}
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
}

export default connect(null, mapDispatchToProps)(SubPageForm)
