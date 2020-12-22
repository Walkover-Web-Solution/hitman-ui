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
      const versionId = this.props.selectedVersion.id
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

  render () {
    return (
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
            {this.renderInput('name', 'Group Name', 'group name')}
            {this.renderInput('host', 'Host', 'host name')}
            <div className='text-right'>
              <button
                className='btn btn-secondary outline btn-lg mr-2'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
              {this.renderButton('Submit')}
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default connect(null, mapDispatchToProps)(GroupForm)
