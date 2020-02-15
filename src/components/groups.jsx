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
  state = {}

  onDragStart = (e, groupId) => {
    this.draggedItem = groupId
  }

  onDragOver = (e, groupId) => {
    e.preventDefault()
    this.draggedOverItem = groupId
  }

  async onDragEnd (e, props) {
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

  handleAddPage (groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    })
  }

  handleAddEndpoint (groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/endpoints/new`,
      groupId: groupId
    })
  }

  render () {
    return (
      <div>
        {this.props.groups &&
          this.props.group_ids &&
          this.props.group_ids
            .filter(
              gId => this.props.groups[gId].versionId === this.props.version_id
            )
            .map(groupId => (
              <Accordion
                defaultActiveKey='0'
                key={groupId}
                draggable
                onDragOver={e => this.onDragOver(e, groupId)}
                onDragStart={e => this.onDragStart(e, groupId)}
                onDragEnd={e => this.onDragEnd(e, groupId, this.props)}
              >
                <Card>
                  <Card.Header>
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
                            this.props.collection_id
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
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                  <Accordion.Collapse eventKey='1'>
                    <Card.Body>
                      <Endpoints {...this.props} group_id={parseInt(groupId)} />
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
