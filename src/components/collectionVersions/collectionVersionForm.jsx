import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { URL_VALIDATION_REGEX } from '../common/constants'
import { connect } from 'react-redux'
import { onEnter, toTitleCase, ADD_VERSION_MODAL_NAME, DEFAULT_URL } from '../common/utility'
import { addParentPageVersion, updateVersion } from '../collectionVersions/redux/collectionVersionsActions'
import { moveToNextStep } from '../../services/widgetService'
import shortid from 'shortid'

const mapDispatchToProps = (dispatch) => {
  return {
    add_parentpage_version: (newCollectionVersion, parentPageId, callback) =>
      dispatch(addParentPageVersion(newCollectionVersion, parentPageId, callback)),
    update_version: (editedVersion) => dispatch(updateVersion(editedVersion))
  }
}
class CollectionVersionForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: { name: '', state: 0 },
      errors: {},
      versionId: null,
      parentPageId: ''
    }

    this.schema = {
      name: Joi.string().required().label('Version Name').max(20),
      state: Joi.valid(0, 1).optional()
    }
  }

  async componentDidMount() {
    let data = {}
    const parentPageId = ''
    let versionId = ''
    if (this.props.title === ADD_VERSION_MODAL_NAME) return
    if (this.props.selectedVersion) {
      const { name, type, id } = this.props.selectedVersion
      data = {
        name,
        type
      }
      versionId = id
    }
    this.setState({ data, versionId, parentPageId })
  }

  redirectToForm(version) {
    if (this.props.setDropdownList) this.props.setDropdownList(version)
  }

  async doSubmit() {
    this.props.onHide()
    let { name } = { ...this.state.data }
    name = toTitleCase(name)
    if (this.props.title === 'Edit Collection Version') {
      const { id, parentPageId } = this.props.selectedVersion
      const editedCollectionVersion = { ...this.state.data, parentPageId, id, name }
      this.props.update_version(editedCollectionVersion)
    }
    if (this.props.title === ADD_VERSION_MODAL_NAME) {
      const parentPageId = this.props.parentPage_id
      const newVersion = { ...this.state.data, requestId: shortid.generate(), name }
      this.props.add_parentpage_version(newVersion, parentPageId, this.redirectToForm.bind(this))
      moveToNextStep(2)
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
                <div className='col-6'>
                  {this.renderInput(
                    'name',
                    'Version Name',
                    'Version Name',
                    true,
                    true,
                    false,
                    '*version name accepts min 1 & max 20 characters'
                  )}
                </div>
                <div className='col-6'>{this.renderInput('host', 'Version Endpoint', 'https://v1.example.com', false, false, true)}</div>
              </div>
              <div className='text-left mt-4 mb-2'>
                {this.renderButton('Submit')}
                <button className='btn btn-secondary outline btn-sm fs-4 ml-2' onClick={this.props.onHide}>
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
