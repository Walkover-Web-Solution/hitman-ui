import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { connect } from 'react-redux'
import { onEnter } from '../common/utility'
import {
  addVersion,
  updateVersion
} from '../collectionVersions/redux/collectionVersionsActions'

import shortid from 'shortid'

const mapDispatchToProps = (dispatch) => {
  return {
    add_version: (newCollectionVersion, collectionId) =>
      dispatch(addVersion(newCollectionVersion, collectionId)),
    update_version: (editedVersion) => dispatch(updateVersion(editedVersion))
  }
}
class CollectionVersionForm extends Form {
  constructor(props) {
    super(props)

    this.state = {
      data: { number: '', host: '' },
      errors: {},
      versionId: null,
      collectionId: ''
    }

    this.schema = {
      number: Joi.string().required().label('Version number'),
      host: Joi.string().uri().required().label('Host')
    }
  }

  async componentDidMount() {
    let data = {}
    const collectionId = ''
    let versionId = ''
    if (this.props.title === 'Add new Collection Version') return
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

  async doSubmit() {
    this.props.onHide()
    if (this.props.title === 'Edit Collection Version') {
      const { id, collectionId } = this.props.selected_version
      const editedCollectionVersion = { ...this.state.data, collectionId, id }
      this.props.update_version(editedCollectionVersion)
    }
    if (this.props.title === 'Add new Collection Version') {
      const collectionId = this.props.collection_id
      const newVersion = { ...this.state.data, requestId: shortid.generate() }
      this.props.add_version(newVersion, collectionId)
    }
  }

  render() {
    return (
      <div onKeyPress={(e) => { onEnter(e, this.handleKeyPress.bind(this)) }}>
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
              <div className="row">
                <div className="col-6">
                  {this.renderInput('number', 'Version Number', 'version number')}
                </div>
                <div className="col-6">
                  {this.renderInput('host', 'Host', 'host')}
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
