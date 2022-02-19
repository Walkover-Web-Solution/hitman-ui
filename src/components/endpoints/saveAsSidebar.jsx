import Joi from 'joi-browser'
import React, { createRef } from 'react'
import { connect } from 'react-redux'
import Form from '../common/form'
import './endpoints.scss'

import CollectionForm from '../collections/collectionForm'
import CollectionVersionForm from '../collectionVersions/collectionVersionForm'
import GroupForm from '../groups/groupForm'
import { ADD_GROUP_MODAL_NAME, ADD_VERSION_MODAL_NAME } from '../common/utility'
import AddIcon from '../../assets/icons/add.svg'
import { Dropdown } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'

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
      dropdownList: {
        type: 'collections',
        parentId: null,
        selectedCollectionId: null,
        selectedVersionId: null,
        selectedGroupId: null
      },
      groupId: null,
      errors: {},
      showEditor: false
    }

    // if (this.props.history.location.groupId) {
    //   this.state.list.type = 'endpoints'
    //   this.state.list.parentId = this.props.history.location.groupId
    // }

    if (this.props.history.location.groupId) {
      this.state.list.type = 'endpoints'
      this.state.list.parentId = this.props.history.location.groupId
      this.state.dropdownList.type = 'endpoints'
      this.state.dropdownList.parentId = this.props.history.location.groupId
      this.state.dropdownList.selectedCollectionId = this.props.versions[this.props.groups[this.state.dropdownList.parentId].versionId].collectionId
      this.state.dropdownList.selectedVersionId = this.props.groups[this.state.dropdownList.parentId].versionId
      this.state.dropdownList.selectedGroupId = this.props.history.location.groupId
    }

    this.saveAsSidebar = createRef()

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
    this.saveAsSidebar.focus()
  }

  // setList (item) {
  //   const list = {}
  //   switch (this.state.list.type) {
  //     case 'collections':
  //       list.type = 'versions'
  //       list.parentId = item.id
  //       this.setState({ list })
  //       return
  //     case 'versions':
  //       list.type = 'groups'
  //       list.parentId = item.id
  //       this.setState({ list })
  //       return
  //     case 'groups':
  //       list.type = 'endpoints'
  //       list.parentId = item.id
  //       this.setState({ list })
  //       break
  //     default:
  //   }
  // }

  setDropdownList (item) {
    const list = {}
    const dropdownList = { ...this.state.dropdownList }
    switch (this.state.dropdownList.type) {
      case 'collections':
        list.type = 'versions'
        list.parentId = item.id
        this.setState({ list })
        dropdownList.type = 'versions'
        dropdownList.parentId = item.id
        dropdownList.selectedCollectionId = item.id
        this.setState({ dropdownList })
        return
      case 'versions':
        list.type = 'groups'
        list.parentId = item.id
        this.setState({ list })
        dropdownList.type = 'groups'
        dropdownList.parentId = item.id
        dropdownList.selectedVersionId = item.id
        this.setState({ dropdownList })
        return
      case 'groups':
        list.type = 'endpoints'
        list.parentId = item.id
        this.setState({ list })
        dropdownList.type = 'endpoints'
        dropdownList.parentId = item.id
        dropdownList.selectedGroupId = item.id
        this.setState({ dropdownList })
        break
      default:
    }
  }

  openAddModal () {
    // switch (this.state.list.type) {
    switch (this.state.dropdownList.type) {
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
          title={ADD_VERSION_MODAL_NAME}
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
          title={ADD_GROUP_MODAL_NAME}
        />
      )
    )
  }

  renderDropdownItems (type) {
    let dropdownItems = []
    switch (type) {
      case 'collections':
        dropdownItems = Object.values(this.props.collections).filter(collection => !collection?.importedFromMarketPlace).map(collection => ({
          name: collection.name,
          id: collection.id
        }))
        break
      case 'versions':
        dropdownItems = Object.keys(this.props.versions)
          .filter(
            vId =>
              this.props.versions[vId].collectionId === this.state.dropdownList.selectedCollectionId
          )
          .map(versionId => ({
            name: this.props.versions[versionId].number,
            id: this.props.versions[versionId].id
          }))
        break
      case 'groups':
        dropdownItems = Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.state.dropdownList.selectedVersionId
          )
          .map(groupId => ({
            name: this.props.groups[groupId].name,
            id: this.props.groups[groupId].id
          }))
        break
      case 'endpoints':
        dropdownItems = Object.keys(this.props.endpoints)
          .filter(
            eId =>
              this.props.endpoints[eId].groupId === this.state.dropdownList.selectedGroupId
          )
          .map(endpointId => ({
            name: this.props.endpoints[endpointId].name,
            id: this.props.endpoints[endpointId].id
          }))
        break
      default:
        break
    }
    return dropdownItems
  }

  // renderList () {
  //   let listItems = []
  //   switch (this.state.list.type) {
  //     case 'collections':
  //       listItems = Object.values(this.props.collections).filter(collection => !collection?.importedFromMarketPlace).map(collection => ({
  //         name: collection.name,
  //         id: collection.id
  //       }))
  //       break
  //     case 'versions':
  //       listItems = Object.keys(this.props.versions)
  //         .filter(
  //           vId =>
  //             this.props.versions[vId].collectionId === this.state.list.parentId
  //         )
  //         .map(versionId => ({
  //           name: this.props.versions[versionId].number,
  //           id: this.props.versions[versionId].id
  //         }))
  //       break
  //     case 'groups':
  //       listItems = Object.keys(this.props.groups)
  //         .filter(
  //           gId => this.props.groups[gId].versionId === this.state.list.parentId
  //         )
  //         .map(groupId => ({
  //           name: this.props.groups[groupId].name,
  //           id: this.props.groups[groupId].id
  //         }))
  //       break
  //     case 'endpoints':
  //       listItems = Object.keys(this.props.endpoints)
  //         .filter(
  //           eId =>
  //             this.props.endpoints[eId].groupId === this.state.list.parentId
  //         )
  //         .map(endpointId => ({
  //           name: this.props.endpoints[endpointId].name,
  //           id: this.props.endpoints[endpointId].id
  //         }))
  //       break
  //     default:
  //       break
  //   }
  //   return listItems
  // }

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

  // goBack () {
  //   const list = { ...this.state.list }
  //   switch (this.state.list.type) {
  //     case 'versions':
  //       list.type = 'collections'
  //       list.parentId = null
  //       this.setState({ list })
  //       break
  //     case 'groups':
  //       list.type = 'versions'
  //       list.parentId = this.props.versions[
  //         this.state.list.parentId
  //       ].collectionId
  //       this.setState({ list })
  //       break
  //     case 'endpoints':
  //       list.type = 'groups'
  //       list.parentId = this.props.groups[this.state.list.parentId].versionId
  //       this.setState({ list })
  //       break
  //     default:
  //       break
  //   }
  // }

  goDropdownBack (type) {
    const dropdownList = { ...this.state.dropdownList }
    switch (type) {
      case 'collections':
        dropdownList.type = 'collections'
        dropdownList.parentId = null
        this.setState({ dropdownList })
        break
      case 'versions':
        dropdownList.type = 'versions'
        dropdownList.parentId = this.state.dropdownList.selectedCollectionId
        this.setState({ dropdownList })
        break
      case 'groups':
        dropdownList.type = 'groups'
        dropdownList.parentId = this.state.dropdownList.selectedVersionId
        this.setState({ dropdownList })
        break
      default:
        break
    }
  }

  async doSubmit () {
    this.props.set_group_id(this.state.list.parentId, { endpointName: this.state.data.name, endpointDescription: this.state.data.description })
  }

  render () {
    const title = this.state.data.name
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '35vw',
      boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
      overflow: 'auto'
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
        <div tabIndex={-1} ref={(e) => { this.saveAsSidebar = e }} style={saveAsSidebarStyle} className='save-as-sidebar-container'>
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
              <form className='desc-box form-parent' onSubmit={this.handleSubmit}>
                <div className='p-form-group mb-3'>
                  {this.renderInput('name', 'Name', 'Endpoint Name')}
                  <div><small className='muted-text'>*endpoint name accepts minimum 1 character</small></div>
                  {title.trim() === '' || title === 'Untitled' ? <small className='text-danger'>Please enter the Title</small> : <div />}
                </div>

                {
                  !this.state.showEditor
                    ? (
                      <label className='click-link mb-3 d-flex align-items-center' onClick={() => this.setState({ showEditor: true })}>
                        <img className='mr-1' src={AddIcon} alt='' />Add Description to Endpoint
                      </label>
                      )
                    : this.renderQuillEditor('description')
                }
              </form>

              {/* <div className='card saveAsWrapper' id='endpoint-form-collection-list'>
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
                            + Add
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
                              + Add
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
                        <div className='not-found-label p-3'>
                          {`No ${this.state.list.type} found`}
                        </div>
                        )}
                </ul>
              </div> */}

              <div>
                <div className='mb-2'>Collection to which you wish to save this to</div>
                <Dropdown className='cst'>
                  <div onClick={() => { this.goDropdownBack('collections') }}>
                    <Dropdown.Toggle variant='default' id='dropdown-basic'>
                      {this.state.dropdownList.type === 'collections' ? 'Select Collection' : this.props.collections[this.state.dropdownList.selectedCollectionId].name}
                    </Dropdown.Toggle>
                  </div>
                  <Dropdown.Menu>
                    <DropdownItem>Select Collection</DropdownItem>
                    <DropdownItem onClick={() => { this.openAddModal() }}>+ Add New</DropdownItem>
                    {this.renderDropdownItems('collections').length
                      ? (this.renderDropdownItems('collections').map(item => (
                        <DropdownItem value={item.id} key={item.id} onClick={() => { this.setDropdownList(item) }}>
                          {item.name}
                        </DropdownItem>
                        )))
                      : (
                        <DropdownItem className='disabled'>
                          No Collection Found
                        </DropdownItem>
                        )}
                  </Dropdown.Menu>
                </Dropdown>

                {this.state.dropdownList.parentId != null &&
                  <>
                    <div className='mb-2 mt-3'>Version</div>
                    <Dropdown className='cst'>
                      <div onClick={() => { this.goDropdownBack('versions') }}>
                        <Dropdown.Toggle variant='default' id='dropdown-basic'>
                          {this.state.dropdownList.type === 'versions' ? 'Select Version' : this.props.versions[this.state.dropdownList.selectedVersionId].number}
                        </Dropdown.Toggle>
                      </div>
                      <Dropdown.Menu>
                        <DropdownItem>Select Version</DropdownItem>
                        <DropdownItem onClick={() => { this.openAddModal() }}>+ Add New</DropdownItem>
                        {this.renderDropdownItems('versions').length
                          ? (this.renderDropdownItems('versions').map(item => (
                            <DropdownItem value={item.id} key={item.id} onClick={() => { this.setDropdownList(item) }}>
                              {item.name}
                            </DropdownItem>
                            )))
                          : (
                            <DropdownItem className='disabled'>
                              No Version Found
                            </DropdownItem>
                            )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </>}

                {(this.state.dropdownList.type === 'groups' || this.state.dropdownList.type === 'endpoints') &&
                  <>
                    <div className='mb-2 mt-3'>Groups</div>
                    <Dropdown className='cst'>
                      <div onClick={() => { this.goDropdownBack('groups') }}>
                        <Dropdown.Toggle variant='default' id='dropdown-basic'>
                          {this.state.dropdownList.type === 'groups' ? 'Select Group' : this.props.groups[this.state.dropdownList.selectedGroupId].name}
                        </Dropdown.Toggle>
                      </div>
                      <Dropdown.Menu>
                        <DropdownItem>Select Group</DropdownItem>
                        <DropdownItem onClick={() => { this.openAddModal() }}>+ Add New</DropdownItem>
                        {this.renderDropdownItems('groups').length
                          ? (this.renderDropdownItems('groups').map(item => (
                            <DropdownItem value={item.id} key={item.id} onClick={() => { this.setDropdownList(item) }}>
                              {item.name}
                            </DropdownItem>
                            )))
                          : (
                            <DropdownItem className='disabled'>
                              No Group Found
                            </DropdownItem>
                            )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </>}
              </div>

              <div className='mt-5'>
                <button
                  className='btn btn-secondary outline btn-lg mr-2'
                  onClick={() => this.props.onHide()}
                >
                  Cancel
                </button>
                <button
                  className={this.props.saveAsLoader ? 'btn btn-primary btn-lg buttonLoader' : 'btn btn-primary btn-lg'}
                  onClick={this.handleSubmit}
                  disabled={this.state.dropdownList.type !== 'endpoints' || title.trim() === '' || title === 'Untitled' ? 'disabled' : ''}
                >
                  Save{' '}
                  {this.state.dropdownList.type === 'endpoints' &&
                    `to ${this.props.groups[this.state.dropdownList.selectedGroupId].name}`}
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
