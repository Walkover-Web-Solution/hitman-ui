import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from 'react-bootstrap'
import { Route, Switch } from 'react-router-dom'
import CollectionForm from './collectionForm'
import collectionsService from '../services/collectionsService'
import collectionVersionsService from '../services/collectionVersionsService'
import CollectionVersions from './collectionVersions'
import CollectionVersionForm from './collectionVersionForm'
import GroupForm from './groupForm'
import groupsService from '../services/groupsService'

class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    selectedcollection: {}
  }

  async fetchVersions (collectionId, index) {
    const collectionIndex = index
    const {
      data: version
    } = await collectionVersionsService.getCollectionVersions(collectionId)
    let versions = [...this.state.versions, ...version]

    this.setState({ versions })
    // this.state.collections[index].collectionVersions.map(
    //   (collectionVersion, index) => {
    //     this.fetchGroups(collectionIndex, index, collectionVersion.id)
    //   }
    // )
  }

  async fetchGroups (collectionIndex, versionIndex, versionId) {
    const { data: groups } = await groupsService.getGroups(versionId)
    var collections = this.state.collections
    collections[collectionIndex].collectionVersions[
      versionIndex
    ].groups = groups
    this.setState({ collections })
  }

  async componentDidMount () {
    const { data: collections } = await collectionsService.getCollections()
    this.setState({ collections })

    this.state.collections.map((collection, index) =>
      this.fetchVersions(collection.identifier, index)
    )
    this.props.history.replace({ newCollection: null })
  }

  async handleAdd (newCollection) {
    if (newCollection.identifier) {
      const body = { ...newCollection }
      delete body.identifier
      const index = this.state.collections.findIndex(
        collection => collection.identifier === newCollection.identifier
      )
      await collectionsService.updateCollection(newCollection.identifier, body)
      const collections = [...this.state.collections]
      collections[index] = body
      this.setState({ collections })
    } else {
      const { data: collection } = await collectionsService.saveCollection(
        newCollection
      )
      const collections = [...this.state.collections, collection]
      this.setState({ collections })
    }
  }

  async handleDelete (collection) {
    this.props.history.replace({ newCollection: null })
    const collections = this.state.collections.filter(
      c => c.identifier !== collection.identifier
    )
    this.setState({ collections })
    await collectionsService.deleteCollection(collection.identifier)
  }

  handleUpdate (collection) {
    this.state.selectedcollection = collection
    this.props.history.push(`/collections/${collection.name}/edit`)
  }

  handleAddVersion (collection) {
    this.state.selectedcollection = collection
    this.props.history.push(`/collections/${collection.name}/versions/new`)
  }

  async handleUpdateVersion (newCollectionVersion, collectionIdentifier) {
    const body = newCollectionVersion
    const CollectionVersionId = newCollectionVersion.id
    delete body.id
    var collections = this.state.collections
    const index = collections.findIndex(
      collection => collection.identifier === collectionIdentifier
    )
    const collectionVersions = collections[index].collectionVersions
    const index1 = collectionVersions.findIndex(
      collectionVersion => collectionVersion.id === CollectionVersionId
    )
    collectionVersions[index1] = body
    collections[index].collectionVersions = collectionVersions
    this.setState({ collections })
    await collectionVersionsService.updateCollectionVersion(
      CollectionVersionId,
      body
    )
  }

  async handleDeleteVersion (deletedCollectionVersionId) {
    const versions = this.state.versions.filter(
      v => v.id !== deletedCollectionVersionId
    )
    this.setState({ versions })
    await collectionVersionsService.deleteCollectionVersion(
      deletedCollectionVersionId
    )
  }

  handleAddGroup () {
    // this.setState({ groups })
  }

  render () {
    const { location } = this.props
    if (location.newGroup) {
      this.handleAddGroup(
        location.collectionId,
        location.versionId,
        location.newGroup
      )
    }

    if (location.deletedCollectionVersionId) {
      const deletedCollectionVersionId = location.deletedCollectionVersionId
      this.props.history.replace({ deletedCollectionVersionId: null })
      this.handleDeleteVersion(deletedCollectionVersionId)
    }

    if (location.newCollection) {
      const newCollection = location.newCollection
      this.props.history.replace({ newCollection: null })
      this.handleAdd(newCollection)
    }

    if (location.editedCollectionVersion) {
      const version = location.editedCollectionVersion
      this.props.history.replace({ editedCollectionVersion: null })
      const versions1 = this.state.versions.filter(v => v.id !== version.id)
      const versions = [...versions1, version]
      this.setState({ versions })
    }

    if (location.newCollectionVersion) {
      const newCollectionVersion = location.newCollectionVersion
      const collectionIdentifier = location.collectionidentifier
      this.props.history.replace({ newCollectionVersion: null })

      {
        const versions = [...this.state.versions, newCollectionVersion]
        this.setState({ versions })
      }
    }

    return (
      <div>
        <div className='App-Nav'>
          <div className='tabs'>
            <Switch>
              <Route
                path='/collections/:collectionId/versions/:versionId/groups/new'
                render={props => (
                  <GroupForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add new Group'
                    versionId={this.props.location.versionId}
                  />
                )}
              />
              <Route
                path='/collections/:id/versions/new'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add new Collection Version'
                    collectionIdentifier={
                      this.state.selectedcollection.identifier
                    }
                  />
                )}
              />
              <Route
                path='/collections/:collectionId/versions/:versionId/edit'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Edit Collection Version'
                    editCollectionVersion={this.props.editCollectionVersion}
                  />
                )}
              />
              <Route
                path='/collections/new'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Add new Collection'
                  />
                )}
              />
              <Route
                path='/collections/:id/edit'
                render={props => (
                  <CollectionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Edit Collection'
                    selectedcollection={this.state.selectedcollection}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
        <div className='App-Side'>
          <button className='btn btn-default btn-lg'>
            <Link to='/collections/new'>+ New Collection</Link>
          </button>
          {this.state.collections.map((collection, index) => (
            <Accordion key={collection.identifier}>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                    {collection.name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=''
                    id='dropdown-menu-align-right'
                    style={{ float: 'right' }}
                  >
                    <Dropdown.Item
                      eventKey='1'
                      onClick={() => this.handleUpdate(collection)}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='2'
                      onClick={() => this.handleDelete(collection)}
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey='3'
                      onClick={() => this.handleAddVersion(collection)}
                    >
                      Add Version
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey='1'>
                  <Card.Body>
                    <CollectionVersions
                      {...this.props}
                      collectionId={collection.id}
                      versions={this.state.versions}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
        </div>
      </div>
    )
  }
}
export default Collections
