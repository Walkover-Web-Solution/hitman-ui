import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton,
  ListGroup
} from 'react-bootstrap'

class Pages extends Component {
  state = {}

  onDragStart = (e, pageId) => {
    this.draggedItem = pageId
  }

  onDragOver = (e, pageId) => {
    e.preventDefault()
    this.draggedOverItem = pageId
  }

  async onDragEnd (e) {
    console.log(this.draggedItem, this.draggedOverItem)
    if (this.draggedItem === this.draggedOverItem) {
      return
    }
    let pageIds = this.props.page_ids.filter(item => item !== this.draggedItem)
    const index = this.props.page_ids.findIndex(
      vId => vId === this.draggedOverItem
    )
    pageIds.splice(index, 0, this.draggedItem)
    this.props.set_page_id(pageIds)
  }

  handleDelete (pageId) {
    console.log('sf', pageId)
    this.props.history.push({
      pathname: '/dashboard/collections',
      deletePageId: pageId
    })
  }
  handleDisplay (page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}`,
      page: page
    })
  }

  render () {
    return (
      <div>
        {this.props.pages &&
          this.props.page_ids
            .filter(
              pageId =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === null
            )
            .map(pageId => (
              <Accordion
                defaultActiveKey='1'
                key={pageId}
                draggable
                onDragOver={e => this.onDragOver(e, pageId)}
                onDragStart={e => this.onDragStart(e, pageId)}
                onDragEnd={e => this.onDragEnd(e, pageId)}
              >
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      onClick={() =>
                        this.handleDisplay(this.props.pages[pageId])
                      }
                      variant='link'
                      eventKey='1'
                    >
                      {this.props.pages[pageId].name}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=''
                      id='dropdown-menu-align-right'
                      style={{ float: 'right' }}
                    >
                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => {
                          if (
                            window.confirm(
                              'Are you sure you wish to delete this item?'
                            )
                          )
                            this.handleDelete(pageId)
                        }}
                      >
                        Delete
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                </Card>
              </Accordion>
            ))}
      </div>
    )
  }
}

export default Pages
