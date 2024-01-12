import Joi from 'joi-browser'
import React from 'react'
import { Modal, Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import shortid from 'shortid'
import Form from '../common/form'
import { addGroup, updateGroup } from '../groups/redux/groupsActions'
import { onEnter, toTitleCase, ADD_GROUP_MODAL_NAME } from '../common/utility'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import { moveToNextStep } from '../../services/widgetService'
import sidebarActions from '../main/sidebar/redux/sidebarActions'

const mapDispatchToProps = (dispatch) => {
  return {
    add_group: (versionId, group, callback) => dispatch(addGroup(versionId, group, callback)),
    update_group: (group) => dispatch(updateGroup(group))
  }
}

class GroupForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: { name: '' },
      groupId: '',
      versionId: '',
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Group Name').max(20)
    }
  }

  async componentDidMount() {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.collectionId, this.props)
    this.setState({ versions })
    if (this.props.title === ADD_GROUP_MODAL_NAME) return
    let data = {}
    if (this.props.selected_group) {
      const { name } = this.props.selected_group
      data = { name }
    }
    this.setState({ data })
  }

  focusSelectedGroup({ groupId, versionId, collectionId }) {
    sidebarActions.focusSidebar()
    sidebarActions.toggleItem('collections', collectionId, true)
    sidebarActions.toggleItem('versions', versionId, true)
    sidebarActions.toggleItem('groups', groupId, true)
  }

  redirectToForm(group) {
    if (this.props.setDropdownList) this.props.setDropdownList(group)
    const versionId = group.versionId
    const collectionId = this.props.versions[versionId]?.collectionId
    this.focusSelectedGroup({ groupId: group.id, versionId, collectionId })
  }

  async doSubmit() {
    // if (!this.state.selectedVersionId && this.props.addEntity) {
    //   this.setState({ versionRequired: true })
    //   return
    // }
    this.props.onHide()
    let { name } = { ...this.state.data }
    name = toTitleCase(name)
    // if (this.props.title === ADD_GROUP_MODAL_NAME) {
    //   const data = { ...this.state.data, name }
    //   // const versionId = this.props.addEntity ? this.state.selectedVersionId : this.props.selectedVersion.id
    //   const newGroup = {
    //     ...data,
    //     requestId: shortid.generate()
    //   }
    //   this.props.add_group(versionId, newGroup, this.redirectToForm.bind(this))
    //   moveToNextStep(3)
    // }

    if (this.props.title === 'Edit Group') {
      const editedGroup = {
        ...this.state.data,
        name,
        id: this.props.selected_group.id,
        versionId: this.props.selected_group.versionId
      }
      this.props.update_group(editedGroup)
    }
  }

  renderVersionList() {
    if (this.state.versions) {
      return Object.keys(this.state.versions).map((id, index) => (
        <Dropdown.Item key={index} onClick={() => this.setState({ selectedVersionId: id, versionRequired: false })}>
          {this.state.versions[id]?.number}
        </Dropdown.Item>
      ))
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
                {this.props.addEntity && (
                  <div className='col-12'>
                    <div className='dropdown-label dropDownversion'>
                      <label> Select Version</label>
                      <Dropdown>
                        <Dropdown.Toggle variant='' id='dropdown-basic'>
                          {this.state.versions?.[this.state.selectedVersionId]?.number || 'Select'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>{this.renderVersionList()}</Dropdown.Menu>
                      </Dropdown>
                      {this.state.versionRequired && <div className='dropdown-validation'>Please select version</div>}
                    </div>
                  </div>
                )}
                <div className='col-12'>
                  {this.renderInput('name', 'Group Name', 'group name', true, true, false, '*group name accepts min 1 & max 20 characters')}
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

export default connect(null, mapDispatchToProps)(GroupForm)
