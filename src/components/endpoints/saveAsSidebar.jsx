import Joi from 'joi-browser'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import Form from '../common/form'
import './endpoints.scss'

import CollectionForm from '../collections/collectionForm'
import CollectionVersionForm from '../collectionVersions/collectionVersionForm'
import GroupForm from '../groups/groupForm'

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  }
}

class SaveAsSidebar extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        name: '',
        description: ''
      },
      list: {
        type: 'collections',
        parentId: null
      },
      groupId: null,
      errors: {}
    }

    this.schema = {
      name: Joi.string()
        .required()
        .label('Username'),
      description: Joi.string()
        .allow(null, '')
        .label('description')
    }
  }

  componentDidMount () {
    const data = { ...this.state.data }
    data.name = this.props.name
    this.setState({ data })
  }

  setList (item) {
    const list = {}
    switch (this.state.list.type) {
      case 'collections':
        list.type = 'versions'
        list.parentId = item.id
        this.setState({ list })
        return
      case 'versions':
        list.type = 'groups'
        list.parentId = item.id
        this.setState({ list })
        return
      case 'groups':
        list.type = 'endpoints'
        list.parentId = item.id
        this.setState({ list })
        break
      default:
    }
  }

  openAddModal () {
    switch (this.state.list.type) {
      case 'collections':
        this.setState({ showCollectionForm: true })
        break
      case 'versions':
        this.setState({ showCollectionVersionForm: true })
        break
      case 'groups':
        this.setState({ showGroupForm: true })
        break
      case 'endpoints':
        break
      default:
        break
    }
  }

  showCollectionForm () {
    return (
      this.state.showCollectionForm && (
        <CollectionForm
          {...this.props}
          onHide={() => {
            this.setState({ showCollectionForm: false })
          }}
          show
          title='Add new Collection'
        />
      )
    )
  }

  showCollectionVersionForm () {
    return (
      this.state.showCollectionVersionForm && (
        <CollectionVersionForm
          {...this.props}
          collection_id={this.state.list.parentId}
          onHide={() => {
            this.setState({ showCollectionVersionForm: false })
          }}
          show
          title='Add new Collection Version'
        />
      )
    )
  }

  showGroupForm () {
    return (
      this.state.showGroupForm && (
        <GroupForm
          {...this.props}
          selectedVersion={{ id: this.state.list.parentId }}
          onHide={() => {
            this.setState({ showGroupForm: false })
          }}
          show
          title='Add new Group'
        />
      )
    )
  }

  renderList () {
    let listItems = []
    switch (this.state.list.type) {
      case 'collections':
        listItems = Object.keys(this.props.collections).map(collectionId => ({
          name: this.props.collections[collectionId].name,
          id: this.props.collections[collectionId].id
        }))
        break
      case 'versions':
        listItems = Object.keys(this.props.versions)
          .filter(
            vId =>
              this.props.versions[vId].collectionId === this.state.list.parentId
          )
          .map(versionId => ({
            name: this.props.versions[versionId].number,
            id: this.props.versions[versionId].id
          }))
        break
      case 'groups':
        listItems = Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.state.list.parentId
          )
          .map(groupId => ({
            name: this.props.groups[groupId].name,
            id: this.props.groups[groupId].id
          }))
        break
      case 'endpoints':
        listItems = Object.keys(this.props.endpoints)
          .filter(
            eId =>
              this.props.endpoints[eId].groupId === this.state.list.parentId
          )
          .map(endpointId => ({
            name: this.props.endpoints[endpointId].name,
            id: this.props.endpoints[endpointId].id
          }))
        break
      default:
        break
    }
    return listItems
  }

  renderListTitle () {
    switch (this.state.list.type) {
      case 'collections':
        return 'All Collections'
      case 'versions':
        return this.props.collections[this.state.list.parentId].name
      case 'groups':
        return this.props.versions[this.state.list.parentId].number
      case 'endpoints':
        return this.props.groups[this.state.list.parentId].name
      default:
    }
  }

  goBack () {
    const list = { ...this.state.list }
    switch (this.state.list.type) {
      case 'versions':
        list.type = 'collections'
        list.parentId = null
        this.setState({ list })
        break
      case 'groups':
        list.type = 'versions'
        list.parentId = this.props.versions[
          this.state.list.parentId
        ].collectionId
        this.setState({ list })
        break
      case 'endpoints':
        list.type = 'groups'
        list.parentId = this.props.groups[this.state.list.parentId].versionId
        this.setState({ list })
        break
      default:
        break
    }
  }

  async doSubmit () {
    this.props.onHide()
    this.props.set_group_id(this.state.list.parentId, this.state.data.name)
  }

  render () {
    const { staticContext, ...props } = this.props
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '101',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '35vw',
      // border: "1px solid red",
      boxShadow: '-10px 0px  25px #888888'
    }
    const darkBackgroundStyle = {
      position: 'fixed',
      background: 'black',
      opacity: 0.1,
      zIndex: '100',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '100vw'
    }
    return (
      // <Modal
      //   {...props}
      //   size="lg"
      //   animation={false}
      //   aria-labelledby="contained-modal-title-vcenter"
      //   centered
      //   id="endpoint-modal"
      // >
      <div>
        <div
          onClick={() => {
            this.props.onHide()
          }}
          style={darkBackgroundStyle}
        >
          wd
        </div>
        <div style={saveAsSidebarStyle}>
          {this.showCollectionForm()}
          {this.showCollectionVersionForm()}
          {this.showGroupForm()}
          <div>
            <div className='d-flex justify-content-between p-3'>
              <p className='h4'>Save As</p>
              <button
                className='btn'
                onClick={() => {
                  this.props.onHide()
                }}
              >
                <i className='fas fa-times' />
              </button>
            </div>
            <Modal.Body>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput('name', 'Name', 'Endpoint Name')}
                {this.renderTextArea(
                  'description',
                  'Description',
                  'Description'
                )}
              </form>
              <div className='card' id='endpoint-form-collection-list'>
                <div className='card-title'>
                  {this.state.list.type === 'collections' ? (
                    <div className='d-flex justify-content-between'>
                      <div>All Collections</div>
                      <button
                        className='btn'
                        onClick={() => {
                          this.openAddModal()
                        }}
                      >
                        <i className='fas fa-plus' />
                      </button>
                    </div>
                  ) : this.state.list.type === 'endpoints' ? (
                    <button className='btn' onClick={() => this.goBack()}>
                      <i className='fas fa-chevron-left' />
                      {this.renderListTitle()}
                    </button>
                  ) : (
                    <div className='d-flex justify-content-between'>
                      <button className='btn' onClick={() => this.goBack()}>
                        <i className='fas fa-chevron-left' />
                        {this.renderListTitle()}
                      </button>
                      <button
                        className='btn'
                        onClick={() => {
                          this.openAddModal()
                        }}
                      >
                        <i className='fas fa-plus' />
                      </button>
                    </div>
                  )}
                </div>
                <ul className='list-group' id='folder-list'>
                  {this.state.list.type === 'endpoints' ? (
                    this.renderList().map(item => (
                      <li key={item} id='endpoint-list'>
                        <div
                          className={this.props.endpoints[item.id].requestType}
                        >
                          {this.props.endpoints[item.id].requestType}
                        </div>
                        <div className='list-item-wrapper'>{item.name}</div>
                      </li>
                    ))
                  ) : this.renderList().length ? (
                    this.renderList().map(item => (
                      <li className='list-group-item' key={item.id}>
                        <button
                          className='btn'
                          onClick={() => this.setList(item)}
                        >
                          <div className='list-item-wrapper'>
                            <i className='fas fa-folder' />
                            {item.name}
                          </div>
                          <i className='fas fa-chevron-right' />
                        </button>
                      </li>
                    ))
                  ) : (
                    <div className='not-found-label'>
                      {this.state.list.type + ' not found in this folder'}
                    </div>
                  )}
                </ul>
              </div>
              <button
                className='btn btn-default custom-button'
                onClick={() => this.props.onHide()}
              >
                Cancel
              </button>
              <button
                className='btn'
                onClick={this.handleSubmit}
                disabled={this.state.list.type !== 'endpoints'}
              >
                Save{' '}
                {this.state.list.type === 'endpoints' &&
                  `to ${this.renderListTitle()}`}
              </button>
            </Modal.Body>
          </div>
        </div>
      </div>
      // </Modal>
    )
  }
}

export default connect(mapStateToProps, null)(SaveAsSidebar)
