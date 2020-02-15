import React, { Component } from 'react'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import Groups from './groups'
import Pages from './versionPages'

class CollectionVersions extends Component {
  state = {
    versionIds: []
  }

  componentDidMount () {
    const versionIds = this.props.version_ids
    this.setState({ versionIds })
  }

  onDragStart = (e, versionId) => {
    this.draggedItem = versionId
  }

  onDragOver = (e, versionId) => {
    e.preventDefault()
    this.draggedOverItem = versionId
  }

  async onDragEnd (e) {
    if (this.draggedItem === this.draggedOverItem) {
      return
    }
    let versionIds = this.state.versionIds.filter(
      item => item !== this.draggedItem
    )
    const index = this.state.versionIds.findIndex(
      vId => vId === this.draggedOverItem
    )
    versionIds.splice(index, 0, this.draggedItem)
    await this.setState({ versionIds })
    this.props.set_version_id(this.state.versionIds)
  }

  async handleDelete (collectionVersion) {
    this.props.history.push({
      pathname: '/dashboard/collections',
      deletedCollectionVersionId: collectionVersion.id
    })
  }

  handleUpdate (collectionVersion) {
    this.props.history.push({
      pathname: `/dashboard/collections/${this.props.collection_id}/versions/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion
    })
  }

  handleAddPage (versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/collections/${collectionId}/versions/${versionId}/pages/new`,
      versionId: versionId
    })
  }

  render () {
    return (
      <div>
        {this.props.versions &&
          this.props.version_ids &&
          this.props.version_ids
            .filter(
              versionId =>
                this.props.versions[versionId].collectionId ===
                this.props.collection_id
            )
            .map(versionId => (
              <Accordion
                defaultActiveKey='0'
                key={versionId}
                draggable
                onDragOver={e => this.onDragOver(e, versionId)}
                onDragStart={e => this.onDragStart(e, versionId)}
                onDragEnd={e => this.onDragEnd(e, versionId)}
              >
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                      {this.props.versions[versionId].number}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=''
                      id='dropdown-menu-align-right'
                      style={{ float: 'right' }}
                    >
                      <Dropdown.Item
                        eventKey='1'
                        onClick={() =>
                          this.handleUpdate(this.props.versions[versionId])
                        }
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => {
                          if (
                            window.confirm(
                              'Are you sure you want to delete this versions? ' +
                                '\n' +
                                'All your groups, pages and endpoints present in this version will be deleted.'
                            )
                          )
                            this.handleDelete(this.props.versions[versionId])
                        }}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='3'
                        onClick={() => {
                          this.props.history.push({
                            pathname: `/dashboard/collections/${this.props.collection_id}/versions/${versionId}/groups/new`
                          })
                        }}
                      >
                        Add Group
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='3'
                        onClick={() =>
                          this.handleAddPage(
                            versionId,
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
                      <Groups
                        {...this.props}
                        version_id={parseInt(versionId)}
                      />
                      <Pages {...this.props} version_id={parseInt(versionId)} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            ))}
      </div>
    )
  }
}
export default CollectionVersions
