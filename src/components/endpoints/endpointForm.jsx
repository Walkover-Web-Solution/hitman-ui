import React from 'react'
import { Modal, Dropdown } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { connect } from 'react-redux'
import { onEnter } from '../common/utility'
import {
  addEndpoint
} from './redux/endpointsActions'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_endpoint: (newEndpoint, groupId, callback) =>
      dispatch(addEndpoint(ownProps.history, newEndpoint, groupId, callback))
  }
}
class EndpointForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: { name: '' },
      errors: {}
    }
    this.schema = {
      name: Joi.string().required().min(2).max(30).trim().label('Endpoint Name')
    }
  }

  async componentDidMount () {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.collectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    this.setState({ versions, groups })
  }

  async doSubmit () {
    if (!this.state.selectedVersionId) {
      this.setState({ versionRequired: true })
      return
    }
    if (!this.state.selectedGroupId) {
      this.setState({ groupRequired: true })
      return
    }
    this.props.onHide()
    const endpoint = {
      uri: '',
      name: this.state.data.name,
      requestType: 'GET',
      body: { type: 'none', value: null },
      headers: {},
      params: {},
      pathVariables: {},
      BASE_URL: null,
      bodyDescription: {},
      authorizationType: null
    }
    this.props.add_endpoint(endpoint, this.state.selectedGroupId, null)
  }

  renderGroupList () {
    if (this.state.groups) {
      return (
        Object.keys(this.state.groups).map(
          (id, index) => (
            this.state.groups[id].versionId?.toString() === this.state.selectedVersionId?.toString() &&
              <Dropdown.Item key={index} onClick={() => this.setState({ selectedGroupId: id, groupRequired: false })}>
                {this.state.groups[id]?.name}
              </Dropdown.Item>
          ))
      )
    }
  }

  renderVersionList () {
    if (this.state.versions) {
      return (
        Object.keys(this.state.versions).map(
          (id, index) => (
            <Dropdown.Item key={index} onClick={() => this.setState({ selectedVersionId: id, versionRequired: false })}>
              {this.state.versions[id]?.number}
            </Dropdown.Item>
          ))
      )
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
          centered
        >
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput('name', 'Endpoint Name', 'endpoint name')}
              <div className='dropdown-label'>
                Select Version
                <Dropdown>
                  <Dropdown.Toggle variant='' id='dropdown-basic'>
                    {this.state.versions?.[this.state.selectedVersionId]?.number || 'Select'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {this.renderVersionList()}
                  </Dropdown.Menu>
                </Dropdown>
                {this.state.versionRequired && <div className='dropdown-validation'>Please select version</div>}
                {this.state.selectedVersionId &&
                  <div style={{ marginTop: '10px' }}>
                    Select Group
                    <Dropdown>
                      <Dropdown.Toggle variant='' id='dropdown-basic'>
                        {this.state.groups?.[this.state.selectedGroupId]?.name || 'Select'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {this.renderGroupList()}
                      </Dropdown.Menu>
                    </Dropdown>
                    {this.state.groupRequired && <div className='dropdown-validation'>Please select group</div>}
                  </div>}
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

export default connect(null, mapDispatchToProps)(EndpointForm)
