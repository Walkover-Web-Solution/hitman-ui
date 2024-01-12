import Joi from 'joi-browser'
import React, { createRef } from 'react'
import { connect } from 'react-redux'
import Form from '../common/form'
import './endpoints.scss'
import CollectionForm from '../collections/collectionForm'
import CollectionVersionForm from '../collectionVersions/collectionVersionForm'
import GroupForm from '../groups/groupForm'
import { ADD_GROUP_MODAL_NAME, ADD_VERSION_MODAL_NAME } from '../common/utility'
import { Dropdown } from 'react-bootstrap'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import _ from 'lodash'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  }
}

class SaveAsSidebar extends Form {
  constructor(props) {
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

    this.saveAsSidebar = createRef()

    this.schema = {
      name: Joi.string().required().label('Endpoint Name'),
      description: Joi.string().allow(null, '').label('Description')
    }
  }

  componentDidMount() {
    const groupId = new URLSearchParams(this.props.history.location.search).get('group')
    if (!_.isNull(groupId)) {
      const list = {
        type: 'endpoints',
        parentId: groupId
      }
      const dropdownList = {
        ...list,
        selectedCollectionId: this.props.versions[this.props.groups[groupId].versionId].collectionId,
        selectedGroupId: groupId,
        selectedVersionId: this.props.groups[groupId].versionId
      }
      this.setState({ groupId, list, dropdownList }, () => {
        this.props.history.push({
          ..._.pick(this.props.history.location, ['pathname', 'title'])
        })
      })
    }
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

  setDropdownList(item) {
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

  openAddModal() {
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

  showCollectionForm() {
    return (
      this.state.showCollectionForm && (
        <CollectionForm
          {...this.props}
          onHide={() => {
            this.setState({ showCollectionForm: false })
          }}
          setDropdownList={(item) => this.setDropdownList(item)}
          show
          title='Add new Collection'
        />
      )
    )
  }

  showCollectionVersionForm() {
    return (
      this.state.showCollectionVersionForm && (
        <CollectionVersionForm
          {...this.props}
          collection_id={this.state.dropdownList.selectedCollectionId}
          onHide={() => {
            this.setState({ showCollectionVersionForm: false })
          }}
          setDropdownList={(item) => this.setDropdownList(item)}
          show
          title={ADD_VERSION_MODAL_NAME}
        />
      )
    )
  }

  showGroupForm() {
    return (
      this.state.showGroupForm && (
        <GroupForm
          {...this.props}
          selectedVersion={{ id: this.state.dropdownList.selectedVersionId }}
          onHide={() => {
            this.setState({ showGroupForm: false })
          }}
          setDropdownList={(item) => this.setDropdownList(item)}
          show
          title={ADD_GROUP_MODAL_NAME}
        />
      )
    )
  }

  renderDropdownItems(type) {
    let dropdownItems = []
    switch (type) {
      case 'collections':
        dropdownItems = Object.values(this.props.collections)
          .filter((collection) => !collection?.importedFromMarketPlace)
          .map((collection) => ({
            name: collection.name,
            id: collection.id
          }))
        break
      case 'versions':
        dropdownItems = Object.keys(this.props.versions)
          .filter((vId) => this.props.versions[vId].collectionId === this.state.dropdownList.selectedCollectionId)
          .map((versionId) => ({
            name: this.props.versions[versionId].number,
            id: this.props.versions[versionId].id
          }))
        break
      case 'groups':
        dropdownItems = Object.keys(this.props.groups)
          .filter((gId) => this.props.groups[gId].versionId === this.state.dropdownList.selectedVersionId)
          .map((groupId) => ({
            name: this.props.groups[groupId].name,
            id: this.props.groups[groupId].id
          }))
        break
      case 'endpoints':
        dropdownItems = Object.keys(this.props.endpoints)
          .filter((eId) => this.props.endpoints[eId].groupId === this.state.dropdownList.selectedGroupId)
          .map((endpointId) => ({
            name: this.props.endpoints[endpointId].name,
            id: this.props.endpoints[endpointId].id
          }))
        break
      default:
        break
    }
    return dropdownItems
  }

  renderListTitle() {
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

  goDropdownBack(type) {
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

  async doSubmit() {
    const selectedCollection = this.props.collections[this.state.dropdownList.selectedCollectionId]
    const rootParentId = selectedCollection.rootParentId
    this.props.set_group_id(this.state.list.parentId, {
      endpointName: this.state.data.name,
      endpointDescription: this.state.data.description
    })
    this.props.set_rootParent_id(rootParentId, { endpointName: this.state.data.name, endpointDescription: this.state.data.description })
  }

  render() {
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
      overflow: 'hidden'
    }

    return (
      <div>
        <div
          onClick={() => {
            this.props.onHide()
          }}
        >
          {' '}
        </div>
        <div
          tabIndex={-1}
          ref={(e) => {
            this.saveAsSidebar = e
          }}
          style={saveAsSidebarStyle}
          className='save-as-sidebar-container'
        >
          {this.showCollectionForm()}
          {this.showCollectionVersionForm()}
          {this.showGroupForm()}
          <div className='custom-collection-modal-container modal-header align-items-center'>
            <div className='modal-title h4'>{this.props.location.pathname.split('/')[5] !== 'new' ? 'Save As' : 'Save'}</div>
            <button
              className='close'
              onClick={() => {
                this.props.onHide()
              }}
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='drawer-body'>
            <form className='desc-box form-parent' onSubmit={this.handleSubmit}>
              <div className='p-form-group mb-3'>
                {this.renderInput('name', 'Name', 'Endpoint Name')}
                {title.trim() === '' || title === 'Untitled' ? <small className='text-danger'>Please enter the Title</small> : <div />}
              </div>
            </form>
            <div>
              <div className='mb-2'>Collection to which you wish to save this to</div>
              <Dropdown className='cst'>
                <div
                  onClick={() => {
                    this.goDropdownBack('collections')
                  }}
                >
                  <Dropdown.Toggle variant='default' id='dropdown-basic'>
                    <span className='truncate'>
                      {this.state.dropdownList.type === 'collections'
                        ? 'Select Collection'
                        : this.props.collections[this.state.dropdownList.selectedCollectionId].name}
                    </span>
                  </Dropdown.Toggle>
                </div>
                <Dropdown.Menu className=''>
                  <DropdownItem>Select Collection</DropdownItem>
                  <DropdownItem
                    onClick={() => {
                      this.openAddModal()
                    }}
                  >
                    + Add New
                  </DropdownItem>
                  {this.renderDropdownItems('collections').length ? (
                    this.renderDropdownItems('collections').map((item) => (
                      <DropdownItem
                        value={item.id}
                        key={item.id}
                        onClick={() => {
                          this.setDropdownList(item)
                        }}
                      >
                        {item.name}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem className='disabled'>No Collection Found</DropdownItem>
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {this.state.dropdownList.parentId != null &&
                this.renderDropdownItems('versions').length > 0 &&
                this.renderDropdownItems('groups').length > 0 && (
                  <>
                    <div className='mb-2 mt-3'>Version</div>
                    <Dropdown className='cst'>
                      <div
                        onClick={() => {
                          this.goDropdownBack('versions')
                        }}
                      >
                        <Dropdown.Toggle variant='default' id='dropdown-basic'>
                          <span className='truncate'>
                            {this.state.dropdownList.type === 'versions'
                              ? 'Select Version'
                              : this.props.versions[this.state.dropdownList.selectedVersionId].number}
                          </span>
                        </Dropdown.Toggle>
                      </div>
                      <Dropdown.Menu className=''>
                        <DropdownItem>Select Version</DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            this.openAddModal()
                          }}
                        >
                          + Add New
                        </DropdownItem>
                        {this.renderDropdownItems('versions').length ? (
                          this.renderDropdownItems('versions').map((item) => (
                            <DropdownItem
                              value={item.id}
                              key={item.id}
                              onClick={() => {
                                this.setDropdownList(item)
                              }}
                            >
                              {item.name}
                            </DropdownItem>
                          ))
                        ) : (
                          <DropdownItem className='disabled'>No Version Found</DropdownItem>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}

              {(this.state.dropdownList.type === 'groups' || this.state.dropdownList.type === 'endpoints') && (
                <>
                  <div className='mb-2 mt-3'>Groups</div>
                  <Dropdown className='cst'>
                    <div
                      onClick={() => {
                        this.goDropdownBack('groups')
                      }}
                    >
                      <Dropdown.Toggle variant='default' id='dropdown-basic'>
                        <span className='truncate'>
                          {this.state.dropdownList.type === 'groups'
                            ? 'Select Group'
                            : this.props.groups[this.state.dropdownList.selectedGroupId].name}
                        </span>
                      </Dropdown.Toggle>
                    </div>
                    <Dropdown.Menu className=''>
                      <DropdownItem>Select Group</DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          this.openAddModal()
                        }}
                      >
                        + Add New
                      </DropdownItem>
                      {this.renderDropdownItems('groups').length ? (
                        this.renderDropdownItems('groups').map((item) => (
                          <DropdownItem
                            value={item.id}
                            key={item.id}
                            onClick={() => {
                              this.setDropdownList(item)
                            }}
                          >
                            {item.name}
                          </DropdownItem>
                        ))
                      ) : (
                        <DropdownItem className='disabled'>No Group Found</DropdownItem>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )}
            </div>
            <div className='mt-5'>
              <button className='btn btn-secondary outline mr-2 api-cancel-btn' onClick={() => this.props.onHide()}>
                Cancel
              </button>
              <button
                className={this.props.saveAsLoader ? 'btn btn-primary buttonLoader' : 'btn btn-primary'}
                onClick={this.handleSubmit}
                disabled={
                  this.state.dropdownList.selectedCollectionId === null || title.trim() === '' || title === 'Untitled' ? 'disabled' : ''
                }
              >
                Save{' '}
                {this.state.dropdownList.selectedCollectionId !== null &&
                  `to ${this.props.collections[this.state.dropdownList.selectedCollectionId].name}`}
              </button>
            </div>
          </div>
        </div>
      </div>
      // </Modal>
    )
  }
}

export default connect(mapStateToProps, null)(SaveAsSidebar)
