import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import GroupPages from './groupPages'

class Groups extends Component {
  state = {}

  handleAddPage (groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    })
  }

  render () {
    return (
      <div>
        {this.props.groups
          .filter(g => g.versionId === this.props.version_id)
          .map(group => (
            <Accordion defaultActiveKey='0' key={group.id}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                    {group.name}
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
                          pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.version_id}/groups/${group.id}/edit`,
                          editGroup: group
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
                            deletedGroupId: group.id
                          })
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='3'
                      onClick={() =>
                        this.handleAddPage(
                          group.id,
                          group.versionId,
                          this.props.collection_id
                        )
                      }
                    >
                      Add Page
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='1'>
                  <Card.Body>
                    <GroupPages
                      {...this.props}
                      versionId={group.versionId}
                      pages={this.props.pages}
                      groupId={group.id}
                      title={'Group Pages'}
                    />
                  </Card.Body>
                </Accordion.Collapse>
                <Accordion.Collapse eventKey='1'>
                  <Card.Body>End points</Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
      </div>
    )
  }
}

export default Groups
