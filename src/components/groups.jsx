import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import GroupPages from './groupPages'
import Endpoints from './endpoints'

class Groups extends Component {
  state = {
    groupDnDFlag: true
  }

  groupDnD(groupDnDFlag) {
    this.props.version_dnd(groupDnDFlag)
    this.setState({ groupDnDFlag })
  }

  onDragStart = (e, groupId) => {
    if (!this.state.groupDnDFlag) return
    this.props.version_dnd(false)
    this.draggedItem = groupId
  }

  onDragOver = (e, groupId) => {
    if (!this.state.groupDnDFlag) return
    e.preventDefault()
    this.draggedOverItem = groupId
  }

  async onDragEnd(e, props) {
    if (!this.state.groupDnDFlag) return
    this.props.version_dnd(true)
    if (this.draggedItem === this.draggedOverItem) {
      return
    }
    let groupIds = this.props.group_ids.filter(
      item => item !== this.draggedItem
    )
    const index = this.props.group_ids.findIndex(
      vId => vId === this.draggedOverItem
    )
    groupIds.splice(index, 0, this.draggedItem)
    this.props.set_group_id(groupIds)
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    })
  }

  handleAddEndpoint(groupId, versionId, collectionId, versions, groups) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints`,
      versions: versions,
      groups: groups,
      groupId: groupId,
      title: 'Add New Endpoint',
      groupFlag: true
    })
  }

  render() {
    return (
      <div>
        {this.props.groups &&
          this.props.group_ids &&
          this.props.group_ids
            .filter(
              gId => this.props.groups[gId].versionId === this.props.version_id
            )
            .map(groupId => (
              <Accordion defaultActiveKey='0' key={groupId}>
                <Card>
                  <Card.Header
                    draggable
                    onDragOver={e => this.onDragOver(e, groupId)}
                    onDragStart={e => this.onDragStart(e, groupId)}
                    onDragEnd={e => this.onDragEnd(e, groupId, this.props)}
                  >
                    <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                      {this.props.groups[groupId].name}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=''
                      id='dropdown-menu-align-right'
                      style={{ float: 'right' }}
                    >
                      <Dropdown.Item
                        eventKey='1'
                        onClick={() => {
                          this.props.history.push({
                            pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.version_id}/groups/${groupId}/edit`,
                            editGroup: this.props.groups[groupId]
                          })
                        }}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => {
                          if (
                            window.confirm(
                              'Are you sure you wish to delete this group? ' +
                              '\n' +
                              'All your pages and endpoints present in this group will be deleted.'
                            )
                          )
                            this.props.history.push({
                              pathname: '/dashboard/collections',
                              deletedGroupId: groupId
                            })
                        }}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='3'
                        onClick={() =>
                          this.handleAddPage(
                            groupId,
                            this.props.groups[groupId].versionId,
                            this.props.collection_id
                          )
                        }
                      >
                        Add Page
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='3'
                        onClick={() =>
                          this.handleAddEndpoint(
                            groupId,
                            this.props.groups[groupId].versionId,
                            this.props.collection_id,
                            this.props.versions,
                            this.props.groups
                          )
                        }
                      >
                        Add Endpoint
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey='1'>
                    <Card.Body>
                      <GroupPages
                        {...this.props}
                        version_id={this.props.groups[groupId].versionId}
                        group_id={parseInt(groupId)}
                        group_dnd={this.groupDnD.bind(this)}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                  <Accordion.Collapse eventKey='1'>
                    <Card.Body>
                      <Endpoints
                        {...this.props}
                        group_id={parseInt(groupId)}
                        endpoints_order={this.props.groups[groupId].endpointsOrder}
                        group_dnd={this.groupDnD.bind(this)}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
    )
  }
}

export default Groups
