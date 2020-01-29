import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import groupsService from '../services/groupsService'

class Groups extends Component {
  state = {
    groups: []
  }

  async componentDidMount () {
    const { data: groups } = await groupsService.getGroups(this.props.versionId)
    this.setState({ groups })
  }

  render () {
    return (
      <div>
        {this.props.groups
          .filter(g => g.versionId === this.props.versionId)
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
                      // onClick={() => this.handleUpdate(collectionVersion)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='2'
                      // onClick={() => this.handleDelete(collectionVersion)}
                    >
                      Delete
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
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
