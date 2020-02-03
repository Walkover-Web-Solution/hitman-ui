import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'

class GroupPages extends Component {
  state = {}

  async handleDelete (page) {
    this.props.history.push({
      pathname: '/collections',
      deletedPageId: page.id
    })
  }

  handleUpdate (page) {
    this.props.history.push({
      pathname: `/collections/${this.props.collectionId}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    })
  }

  handleDisplay (page) {
    this.props.history.push({
      pathname: `/collections/pages/${page.id}`,
      page: page
    })
  }

  render () {
    return (
      <div>
        {this.props.pages &&
          this.props.pages
            .filter(
              page =>
                page.versionId === this.props.versionId &&
                page.groupId === this.props.groupId
            )

            .map((page, index) => (
              <Accordion defaultActiveKey='0' key={page.id}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      onClick={() => this.handleDisplay(page)}
                      variant='link'
                      eventKey='1'
                    >
                      {page.name}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=''
                      id='dropdown-menu-align-right'
                      style={{ float: 'right' }}
                    >
                      <Dropdown.Item
                        eventKey='1'
                        onClick={() => this.handleUpdate(page)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => this.handleDelete(page)}
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

export default GroupPages
