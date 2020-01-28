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
import collectionsservice from '../services/collectionsService'
import collectionversionsservice from '../services/collectionVersionServices'
import CollectionVersions from './collectionVersions'
import CollectionVersionForm from './collectionVersionForm'
import collectionVersionServices from '../services/collectionVersionServices'
import GroupForm from './groupForm'
import groupService from '../services/groupService'
import Groups from './groups'

class Collections extends Component {
  state = {
    collections: [],
    versions: [],
    groups: [],
    selectedcollection: {},
    selectedCollectionVersion: {}
  }

  async fetchVersions (collectionId, index) {
    const collectionIndex = index
    const {
      data: version
    } = await collectionversionsservice.getCollectionVersions(collectionId)
    let versions = [...this.state.versions, ...version]

    this.setState({ versions })
    // this.state.collections[index].collectionVersions.map(
    //   (collectionVersion, index) => {
    //     this.fetchGroups(collectionIndex, index, collectionVersion.id)
    //   }
    // )
  }

  async fetchGroups (collectionIndex, versionIndex, versionId) {
    const { data: groups } = await groupService.getGroups(versionId)
    var collections = this.state.collections
    collections[collectionIndex].collectionVersions[
      versionIndex
    ].groups = groups
    this.setState({ collections })
  }

  async componentDidMount () {
    const { data: collections } = await collectionsservice.getCollections()
    this.setState({ collections })

    this.state.collections.map((collection, index) =>
      this.fetchVersions(collection.identifier, index)
    )
    this.props.history.replace({ newCollection: null })
    console.log(this.state)
  }

  async handleAdd (newCollection) {
    if (newCollection.identifier) {
      const body = { ...newCollection }
      delete body.identifier
      const index = this.state.collections.findIndex(
        collection => collection.identifier === newCollection.identifier
      )
      await collectionsservice.updateCollection(newCollection.identifier, body)
      const collections = [...this.state.collections]
      collections[index] = body
      this.setState({ collections })
    } else {
      const { data: collection } = await collectionsservice.saveCollection(
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
    await collectionsservice.deleteCollection(collection.identifier)
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
    await collectionVersionServices.updateCollectionVersion(
      CollectionVersionId,
      body
    )
  }

  async handleDeleteVersion (deletedCollectionVersionId, collectionIdentifier) {
    const collections = [...this.state.collections]
    const index = collections.findIndex(
      collection => collection.identifier === collectionIdentifier
    )
    const collectionVersions = collections[index].collectionVersions
    const index1 = collectionVersions.findIndex(
      collectionVersion => collectionVersion.id === deletedCollectionVersionId
    )
    delete collectionVersions[index1]
    collections[index].collectionVersions = collectionVersions
    this.setState({ collections })
    await collectionversionsservice.deleteCollectionVersion(
      deletedCollectionVersionId
    )
  }

  handleAddGroup (collectionId, versionId, newGroup) {
    var collections = [...this.state.collections]
    const index = collections.findIndex(
      collection => collection.identifier === collectionId
    )
    const collectionVersions = [...collections[index].collectionVersions]
    // collections[index].collectionVersions = collectionVersions
    const index1 = collectionVersions.findIndex(
      collectionVersion => collectionVersion.id === versionId
    )
    const groups = [...collectionVersions[index].groups]

    this.setState({ collections })
  }

  render () {
    // console.log('collections rendered', this.state.collections)
    console.log(this.state.versions)
    if (this.props.location.newGroup) {
      this.handleAddGroup(
        this.props.location.collectionId,
        this.props.location.versionId,
        this.props.location.newGroup
      )
    }

    if (
      this.props.location.state &&
      this.props.location.state.deletedCollectionVersionId
    ) {
      const deletedCollectionVersionId = this.props.location.state
        .deletedCollectionVersionId
      const collectionIdentifier = this.props.location.state
        .collectionIdentifier
      this.props.history.replace({ state: null })
      this.handleDeleteVersion(deletedCollectionVersionId, collectionIdentifier)
    }

    if (this.props.location.state && this.props.location.state.newCollection) {
      const newCollection = this.props.location.state.newCollection
      this.props.history.replace({ state: null })
      this.handleAdd(newCollection)
    }

    if (this.props.location.newCollectionVersion) {
      const newCollectionVersion = this.props.location.newCollectionVersion
      const collectionIdentifier = this.props.location.collectionidentifier
      this.props.history.replace({ newCollectionVersion: null })
      // if (newCollectionVersion.id) {
      //   this.handleUpdateVersion(newCollectionVersion, collectionIdentifier)
      // } else
      {
        // var collections = [...this.state.collections]
        // const index = collections.findIndex(
        //   collection =>
        //     collection.identifier ===
        //     this.props.location.state.collectionidentifier
        // )
        // const collectionVersions = [
        //   ...collections[index].collectionVersions,
        //   newCollectionVersion
        // ]
        // collections[index].collectionVersions = collectionVersions
        const versions = [...this.state.versions, newCollectionVersion]
        this.setState({ versions })
      }
    }

    // if (this.props.location.editedCollectionVersion) {
    //   this.state.selectedCollectionVersion = this.props.location.state.editedCollectionVersion
    //   this.state.selectedcollection.identifier = this.props.location.state.collectionIdentifier
    // }

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
                path='/collections/:collectionId/versions/:collectioVersionNumber/edit'
                render={props => (
                  <CollectionVersionForm
                    {...props}
                    show={true}
                    onHide={() => {}}
                    title='Edit Collection Version'
                    collectionIdentifier={this.state.collectionIdentifier}
                    editedCollectionVersion={this.state.editedCollectionVersion}
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
