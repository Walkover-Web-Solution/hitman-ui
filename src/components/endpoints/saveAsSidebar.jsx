import Joi from 'joi-browser'
import React from 'react'
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
        .label('Endpoint Name'),
      description: Joi.string()
        .allow(null, '')
        .label('Description')
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
    this.props.set_group_id(this.state.list.parentId, { endpointName: this.state.data.name, endpointDescription: this.state.data.description })
  }

  render () {
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '35vw',
      boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)'
    }
    const darkBackgroundStyle = {
      position: 'fixed',
      background: 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
      zIndex: '1040',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '100vw'
    }
    return (
      <div>
        <div
          onClick={() => { this.props.onHide() }}
          style={darkBackgroundStyle}
        >
          {' '}
        </div>
        <div style={saveAsSidebarStyle}>
          {this.showCollectionForm()}
          {this.showCollectionVersionForm()}
          {this.showGroupForm()}
          <div>
            <div className=''>
              <div className='custom-collection-modal-container modal-header'>
                <div className='modal-title h4'>
                  Save As
                </div>
                <button
                  className='close'
                  onClick={() => { this.props.onHide() }}
                >
                  <span aria-hidden='true'>×</span>
                </button>
              </div>

            </div>
            <div className='mx-3 py-3'>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput('name', 'Name', 'Endpoint Name')}
                {this.renderQuillEditor('description', 'Description (Optional)')}
              </form>
              <div className='card saveAsWrapper' id='endpoint-form-collection-list'>
                <div className='card-title'>
                  {
                    this.state.list.type === 'collections'
                      ? (
                        <div className='d-flex justify-content-between'>
                          <div>All Collections</div>
                          <button
                            className='btn'
                            onClick={() => {
                              this.openAddModal()
                            }}
                          >
                            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg>
                          </button>
                        </div>
                        )
                      : this.state.list.type === 'endpoints'
                        ? (
                          <button className='btn' onClick={() => this.goBack()}>
                            <i className='fas fa-chevron-left' />
                            {this.renderListTitle()}
                          </button>
                          )
                        : (
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
                              <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg>
                            </button>
                          </div>
                          )
                  }
                </div>
                <ul className='list-group' id='folder-list'>
                  {this.state.list.type === 'endpoints'
                    ? (
                        this.renderList().map(item => (
                          <li key={item.id} id='endpoint-list' className='endListWrapper'>
                            <label
                              className={this.props.endpoints[item.id]?.requestType}
                            >
                              {this.props.endpoints[item.id]?.requestType}
                            </label>
                            <div className='list-item-wrapper'>{item.name}</div>
                          </li>
                        )
                        )
                      )
                    : this.renderList().length
                      ? (
                          this.renderList().map(item => (
                            <li className='list-group-item' key={item.id}>
                              <button
                                className='btn'
                                onClick={() => this.setList(item)}
                              >
                                <div className='list-item-wrapper'>
                                  <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M15.75 12.0004V6.00041C15.7497 5.73737 15.6803 5.47902 15.5487 5.25129C15.417 5.02355 15.2278 4.83444 15 4.70291L9.75 1.70291C9.52197 1.57126 9.2633 1.50195 9 1.50195C8.7367 1.50195 8.47803 1.57126 8.25 1.70291L3 4.70291C2.7722 4.83444 2.58299 5.02355 2.45135 5.25129C2.31971 5.47902 2.25027 5.73737 2.25 6.00041V12.0004C2.25027 12.2635 2.31971 12.5218 2.45135 12.7495C2.58299 12.9773 2.7722 13.1664 3 13.2979L8.25 16.2979C8.47803 16.4296 8.7367 16.4989 9 16.4989C9.2633 16.4989 9.52197 16.4296 9.75 16.2979L15 13.2979C15.2278 13.1664 15.417 12.9773 15.5487 12.7495C15.6803 12.5218 15.7497 12.2635 15.75 12.0004Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                    <path d='M2.45239 5.21973L8.99989 9.00723L15.5474 5.21973' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                    <path d='M9 16.56V9' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                  </svg>

                                  {item.name}
                                </div>
                                <i className='fas fa-chevron-right' />
                              </button>
                            </li>
                          )
                          )
                        )
                      : (
                        <div className='not-found-label'>
                          {this.state.list.type + ' not found in this folder'}
                        </div>
                        )}
                </ul>
              </div>
              <div className='text-right mt-5'>
                <button
                  className='btn btn-secondary outline btn-lg mr-2'
                  onClick={() => this.props.onHide()}
                >
                  Cancel
                </button>
                <button
                  className={this.props.saveAsLoader ? 'btn btn-primary btn-lg buttonLoader' : 'btn btn-primary btn-lg'}
                  onClick={this.handleSubmit}
                  disabled={this.state.list.type !== 'endpoints'}
                >
                  Save{' '}
                  {this.state.list.type === 'endpoints' &&
                    `to ${this.renderListTitle()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      // </Modal>
    )
  }
}

export default connect(mapStateToProps, null)(SaveAsSidebar)
