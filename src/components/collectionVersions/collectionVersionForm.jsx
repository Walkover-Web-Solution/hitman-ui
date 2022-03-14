import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { URL_VALIDATION_REGEX } from '../common/constants'
import { connect } from 'react-redux'
import { onEnter, toTitleCase, ADD_VERSION_MODAL_NAME, DEFAULT_URL } from '../common/utility'
import {
  addVersion,
  updateVersion
} from '../collectionVersions/redux/collectionVersionsActions'
import { moveToNextStep } from '../../services/widgetService'
import shortid from 'shortid'

const mapDispatchToProps = (dispatch) => {
  return {
    add_version: (newCollectionVersion, collectionId) =>
      dispatch(addVersion(newCollectionVersion, collectionId)),
    update_version: (editedVersion) => dispatch(updateVersion(editedVersion))
  }
}
class CollectionVersionForm extends Form {
  constructor (props) {
    super(props)

    this.state = {
      data: { number: '', host: DEFAULT_URL },
      errors: {},
      versionId: null,
      collectionId: ''
    }

    this.schema = {
      number: Joi.string().required().label('Version Name'),
      host: Joi.string().regex(URL_VALIDATION_REGEX, { name: 'URL' }).label('Version Endpoint')
        .error(() => { return { message: 'Version Endpoint Must be Valid URL' } })
    }
  }

  async componentDidMount () {
    let data = {}
    const collectionId = ''
    let versionId = ''
    if (this.props.title === ADD_VERSION_MODAL_NAME) return
    if (this.props.selected_version) {
      const { number, host, id } = this.props.selected_version
      data = {
        number,
        host
      }
      versionId = id
    }
    this.setState({ data, versionId, collectionId })
  }

  async doSubmit () {
    this.props.onHide()
    let { number } = { ...this.state.data }
    number = toTitleCase(number)
    if (this.props.title === 'Edit Collection Version') {
      const { id, collectionId } = this.props.selected_version
      const editedCollectionVersion = { ...this.state.data, collectionId, id, number }
      this.props.update_version(editedCollectionVersion)
    }
    if (this.props.title === ADD_VERSION_MODAL_NAME) {
      const collectionId = this.props.collection_id
      const newVersion = { ...this.state.data, requestId: shortid.generate(), number }
      this.props.add_version(newVersion, collectionId)
      moveToNextStep(2)
    }
  }

  render () {
    return (
      <div onKeyPress={(e) => { onEnter(e, this.handleKeyPress.bind(this)) }}>
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              <div className='row'>
                <div className='col-6'>
                  {this.renderInput('number', 'Version Name', 'Version Name', true, true, false, '*version name accepts min 1 character')}
                </div>
                <div className='col-6'>
                  {this.renderInput('host', 'Version Endpoint', 'https://v1.example.com', false, false, true)}
                </div>
              </div>
              <div className='text-left mt-4 mb-2'>

                {this.renderButton('Submit')}
                <button
                  className='btn btn-secondary outline btn-lg ml-2'
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

export default connect(null, mapDispatchToProps)(CollectionVersionForm)
