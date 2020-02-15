import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'

class Endpoints extends Component {
  handleDelete (endpoint) {
    this.props.history.push({
      pathname: '/dashboard/collections',
      deleteEndpointId: endpoint.id
    })
  }
  handleUpdate (endpoint) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props.version_id}/groups/${this.props.group_id}/endpoints/${endpoint.id}/edit`,
      editEndpoint: endpoint
    })
  }
  handleDisplay (endpoint, groups, versions) {
    this.props.history.push({
      pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
      title: 'update endpoint',
      endpoint: endpoint,
      groups: groups,
      versions: versions,
      endpointFlag: true
    })
  }
  state = {}
  render () {
    return (
      <div>
        {Object.keys(this.props.endpoints)
          .filter(
            eId => this.props.endpoints[eId].groupId === this.props.group_id
          )
          .map(endpointId => (
            <Accordion defaultActiveKey='1' key={endpointId}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle
                    onClick={() =>
                      this.handleDisplay(
                        this.props.endpoints[endpointId],
                        this.props.groups,
                        this.props.versions
                      )
                    }
                    as={Button}
                    variant='link'
                    eventKey='1'
                  >
                    {this.props.endpoints[endpointId].name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=''
                    id='dropdown-menu-align-right'
                    style={{ float: 'right' }}
                  >
                    <Dropdown.Item
                      eventKey='2'
                      onClick={() =>
                        this.handleDelete(this.props.endpoints[endpointId])
                      }
                    >
                      Delete
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='0'>
                  <Card.Body></Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
      </div>
    )
  }
}

export default Endpoints
