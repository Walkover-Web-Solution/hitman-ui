import Joi from 'joi-browser'
import React from 'react'
import { Modal, Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import shortid from 'shortid'
import Form from '../common/form'
import { addGroup, updateGroup } from '../groups/redux/groupsActions'
import { onEnter } from '../common/utility'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'

const mapDispatchToProps = (dispatch) => {
  return {
    add_group: (versionId, group) => dispatch(addGroup(versionId, group)),
    update_group: (group) => dispatch(updateGroup(group))
  }
}

class GroupForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: { name: '' },
      groupId: '',
      versionId: '',
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Group Name')
    }
  }

  async componentDidMount () {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.collectionId, this.props)
    this.setState({ versions })
    if (this.props.title === 'Add new Group') return
    let data = {}
    if (this.props.selected_group) {
      const { name } = this.props.selected_group
      data = { name }
    }
    this.setState({ data })
  }

  async doSubmit () {
    if (!this.state.selectedVersionId && this.props.addEntity) {
      this.setState({ versionRequired: true })
      return
    }
    this.props.onHide()
    if (this.props.title === 'Add new Group') {
      const data = { ...this.state.data }
      const versionId = this.props.addEntity ? this.state.selectedVersionId : this.props.selectedVersion.id
      const newGroup = {
        ...data,
        requestId: shortid.generate()
      }
      this.props.add_group(versionId, newGroup)
    }

    if (this.props.title === 'Edit Group') {
      const editedGroup = {
        ...this.state.data,
        id: this.props.selected_group.id,
        versionId: this.props.selected_group.versionId
      }
      this.props.update_group(editedGroup)
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
              <div className='row'>
                <div className='col-6'>
                  {this.renderInput('name', 'Group Name', 'group name')}
                </div>
                <div className='col-6'>
                  {this.props.addEntity &&
                    <div className='dropdown-label dropDownversion'>
                      <label>   Select Version</label>
                      <Dropdown>
                        <Dropdown.Toggle variant='' id='dropdown-basic'>
                          {this.state.versions?.[this.state.selectedVersionId]?.number || 'Select'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {this.renderVersionList()}
                        </Dropdown.Menu>
                      </Dropdown>
                      {this.state.versionRequired && <div className='dropdown-validation'>Please select version</div>}
                    </div>}
                </div>
              </div>

              <div className='text-left'>

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

export default connect(null, mapDispatchToProps)(GroupForm)
