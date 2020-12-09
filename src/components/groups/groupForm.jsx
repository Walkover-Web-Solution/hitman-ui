import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import shortid from 'shortid'
import Form from '../common/form'
import { addGroup, updateGroup } from '../groups/redux/groupsActions'

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
      data: { name: '', host: '' },
      groupId: '',
      versionId: '',
      errors: {}
    }

    this.schema = {
      name: Joi.string().required().label('Group Name'),
      host: Joi.string().uri().allow(null, '').label('Host')
    }
  }

  async componentDidMount () {
    if (this.props.title === 'Add new Group') return
    let data = {}
    if (this.props.selected_group) {
      const { name, host } = this.props.selected_group
      data = { name, host }
    }
    this.setState({ data })
  }

  async doSubmit () {
    this.props.onHide()
    if (this.props.title === 'Add new Group') {
      const data = { ...this.state.data }
      // data.position = this.extractPosition()
      const versionId = this.props.selectedVersion.id
      const newGroup = {
        ...data,
        endpointsOrder: [],
        requestId: shortid.generate()
      }
      this.props.add_group(versionId, newGroup)
    }

    if (this.props.title === 'Edit Group') {
      const editedGroup = {
        ...this.state.data,
        id: this.props.selected_group.id,
        endpointsOrder: this.props.selected_group.endpointsOrder,
        versionId: this.props.selected_group.versionId,
        position: this.props.selected_group.position
      }
      this.props.update_group(editedGroup)
    }
  }

  // extractPosition () {
  //   let count = -1
  //   for (let i = 0; i < Object.keys(this.props.groups).length; i++) {
  //     if (
  //       this.props.selectedVersion.id ===
  //       this.props.groups[Object.keys(this.props.groups)[i]].versionId
  //     ) {
  //       count = count + 1
  //     }
  //   }
  //   return count + 1
  // }

  render () {
    return (
      <Modal
        {...this.props}
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
            {this.renderInput('name', 'Group Name', 'group name')}
            {this.renderInput('host', 'Host', 'host name')}
            <div className='text-right'>
              {this.renderButton('Submit')}
              <button
                className='btn btn-secondary btn-lg ml-2'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default connect(null, mapDispatchToProps)(GroupForm)
