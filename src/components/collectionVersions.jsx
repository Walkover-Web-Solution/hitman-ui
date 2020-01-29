import React, { Component } from 'react'
import collectionversionsservice from '../services/collectionVersionsService'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import Groups from './groups'

class CollectionVersions extends Component {
  state = {}

  async handleAdd (newCollectionVersion) {
    if (newCollectionVersion.id) {
      const body = { ...newCollectionVersion }
      delete body.id
      const index = this.state.collectionVersions.findIndex(
        cv => cv.id === newCollectionVersion.id
      )
      await collectionversionsservice.updateCollectionVersion(
        newCollectionVersion.id,
        body
      )
      const collectionVersions = [...this.state.collectionVersions]
      collectionVersions[index] = body
      this.setState({ collectionVersions })
    }
    const {
      data: collectionVersion
    } = await collectionversionsservice.saveCollectionVersion(
      newCollectionVersion
    )
    const collectionVersions = [
      ...this.state.collectionVersions,
      collectionVersion
    ]
    this.setState({ collectionVersions })
  }

  async handleDelete (collectionVersion) {
    this.props.history.push({
      pathname: '/collections',
      deletedCollectionVersionId: collectionVersion.id
    })
  }

  handleUpdate (collectionVersion) {
    this.props.history.push({
      pathname: `/collections/${this.props.collectionId}/versions/${collectionVersion.number}/edit`,
      editCollectionVersion: collectionVersion
    })
  }

  handleAddGroup (versionId, collectionId) {
    this.props.history.push({
      pathname: `/collections/${collectionId}/versions/${versionId}/groups/new`,
      versionId: versionId
    })
  }

  render () {
    return (
      <div>
        {this.props.versions &&
          this.props.versions
            .filter(version => version.collectionId === this.props.collectionId)
            .map((collectionVersion, index) => (
              <Accordion defaultActiveKey='0' key={collectionVersion.id}>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                      {collectionVersion.number}
                    </Accordion.Toggle>
                    <DropdownButton
                      alignRight
                      title=''
                      id='dropdown-menu-align-right'
                      style={{ float: 'right' }}
                    >
                      <Dropdown.Item
                        eventKey='1'
                        onClick={() => this.handleUpdate(collectionVersion)}
                      >
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => this.handleDelete(collectionVersion)}
                      >
                        Delete
                      </Dropdown.Item>
                      <Dropdown.Item
                        eventKey='3'
                        onClick={() =>
                          this.handleAddGroup(
                            collectionVersion.id,
                            this.props.collection.identifier
                          )
                        }
                      >
                        Add Group
                      </Dropdown.Item>
                    </DropdownButton>
                  </Card.Header>
                  <Accordion.Collapse eventKey='1'>
                    <Card.Body>
                      Groups
                      {/* <Groups
                      {...this.props}
                      versionId={collectionVersion.id}
                      collectionId={this.props.collection.identifier}
                      groups={collectionVersion}
                    /> */}
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
