import Joi from 'joi-browser'
import React from 'react'
import { Modal, Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import shortid from 'shortid'
import Form from '../common/form'
import { addGroupPage, addPage } from '../pages/redux/pagesActions'
import { onEnter } from '../common/utility'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import { toast } from 'react-toastify'

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

  componentDidMount () {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.selectedCollection, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    this.setState({ versions, groups })
  }

  async doSubmit (props) {
    if (!this.state.selectedVersionId && this.props.addEntity) {
      toast.error('Please select version')
      return
    }
    const groupId = this.props.addEntity ? this.state.selectedGroupId : this.props.selectedGroup.id
    const version = this.props.addEntity ? this.state.selectedVersionId : this.props.selectedVersion
    this.props.onHide()
    if (this.props.title === 'Add new Group Page' || (this.props.addEntity && this.state.selectedGroupId)) {
      const data = { ...this.state.data }
      const newPage = { ...data, requestId: shortid.generate() }
      this.props.add_group_page(
        version,
        groupId,
        newPage
      )
    }
    if (this.props.title === 'Add New Version Page' || (this.props.addEntity && !this.state.selectedGroupId)) {
      const versionId = this.props.addEntity ? version : version.id
      const data = { ...this.state.data }
      const newPage = { ...data, requestId: shortid.generate() }
      this.props.add_page(versionId, newPage)
    }
  }

  renderGroupList () {
    if (this.state.groups) {
      return (
        Object.keys(this.state.groups).map(
          (id, index) => (
            this.state.groups[id].versionId?.toString() === this.state.selectedVersionId?.toString() &&
              <Dropdown.Item key={index} onClick={() => this.setState({ selectedGroupId: id })}>
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
            <Dropdown.Item key={index} onClick={() => this.setState({ selectedVersionId: id })}>
              {this.state.versions[id]?.number}
            </Dropdown.Item>
          ))
      )
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
              {
                this.props.addEntity &&
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
                      </div>}
                  </div>
              }
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
