import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dropdown, Accordion } from 'react-bootstrap'
import { bulkPublish } from './redux/bulkPublishAction'

import './publishSidebar.scss'
import { isAdmin } from '../auth/authService'
import { ReactComponent as DownChevron } from '../../assets/icons/downChevron.svg'
import { ReactComponent as GlobeIcon } from '../../assets/icons/globe-icon.svg'

const mapStateToProps = (state) => {
  return {
    versions: state.versions,
    groups: state.groups,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    bulk_publish: (collectionId, data) => dispatch(bulkPublish(collectionId, data))
  }
}

const stateIcon = {
  Pending: 'pending',
  Approved: <GlobeIcon />
}

export class PublishSidebar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedCollectionId: '',
      selectedPages: [],
      selectedEndpoints: [],
      groupData: {},
      versionData: {},
      checkedData: {}
    }
  }

  componentDidMount () {
    const selectedCollectionId = this.props.collectionId
    if (selectedCollectionId) {
      this.setState({ selectedCollectionId })
    }
    this.makeVersionData()
    this.makeGroupData()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.endpoints !== this.props.endpoints || prevProps.groups !== this.props.groups || prevProps.pages !== this.props.pages || prevProps.versions !== this.props.versions) {
      this.makeVersionData()
      this.makeGroupData()
    }

    if (this.state.selectedCollectionId !== prevState.selectedCollectionId) {
      this.setState({ checkedData: {} })
    }
  }

  sendPublishRequest () {
    const checkedData = this.state.checkedData
    const requestData = {
      pages: [],
      endpoints: []
    }

    Object.entries(checkedData).forEach((data) => {
      const item = data[0].split('.')
      if (item[1] === 'endpoint' && data[1]) {
        requestData.endpoints.push(item[2])
      }

      if ((item[1] === 'groupPage' || item[1] === 'versionPage') && data[1]) {
        requestData.pages.push(item[2])
      }
    })

    if (requestData.pages.length || requestData.endpoints.length) {
      this.props.bulk_publish(this.state.selectedCollectionId, requestData)
    }
    if (isAdmin()) {
      const collectionId = this.state.selectedCollectionId
      if (collectionId) {
        this.props.history.push({
          pathname: '/admin/publish',
          search: `?collectionId=${collectionId}`
        })
      }
    }
    this.props.closePublishSidebar()
  }

  makeVersionData () {
    const versions = {}
    Object.values(this.props.versions).forEach((version) => {
      versions[version.id] = {
        pages: [],
        groups: []
      }
    })

    Object.values(this.props.pages).forEach((page) => {
      if (page.versionId && !page.groupId) {
        versions[page?.versionId].pages = [...versions[page?.versionId].pages, page?.id]
      }
    })

    Object.values(this.props.groups).forEach((group) => {
      versions[group?.versionId].groups = [...versions[group?.versionId].groups, group?.id]
    })

    this.setState({ versionData: versions })
  }

  makeGroupData () {
    const groups = {}
    if (Object.keys(this.props.groups).length) {
      Object.keys(this.props.groups).forEach((groupId) => {
        groups[groupId] = {
          pages: [],
          endpoints: []
        }
      })

      Object.values(this.props.pages).forEach((page) => {
        if (page?.groupId) {
          groups[page?.groupId].pages = [...groups[page?.groupId].pages, page?.id]
        }
      })

      Object.values(this.props.endpoints).forEach((endpoint) => {
        if (endpoint?.groupId) {
          groups[endpoint?.groupId].endpoints = [...groups[endpoint?.groupId].endpoints, endpoint?.id]
        }
      })
    }
    this.setState({ groupData: groups })
  }

  handleGroupCheckbox (groupId, e) {
    const newArray = {}
    const { endpoints, pages } = this.state.groupData[groupId]
    const prevChoice = e.target.checked
    newArray[`check.group.${groupId}`] = prevChoice
    endpoints.forEach((endpointId) => {
      newArray[`check.endpoint.${endpointId}`] = prevChoice
    })
    pages.forEach((pageId) => {
      newArray[`check.groupPage.${pageId}`] = prevChoice
    })
    const checkedGroupData = { ...newArray }
    return checkedGroupData
  }

  findCheckedItems (data, type) {
    let status = true
    const newCheckedData = { ...this.state.checkedData }
    data.forEach((dataId) => {
      if (!newCheckedData[`check.${type}.${dataId}`]) {
        status = false
      }
    })
    return status
  }

  handleBulkCheck (e, itemtype, itemId) {
    const newData = { ...this.state.checkedData }
    if (itemtype === 'endpoint') {
      const { pages, endpoints } = this.state.groupData[this.props.endpoints[itemId]?.groupId]
      if (this.findCheckedItems(endpoints, 'endpoint') && this.findCheckedItems(pages, 'groupPage')) {
        newData[`check.group.${this.props.endpoints[itemId]?.groupId}`] = true
      }
    }

    if (itemtype === 'groupPage') {
      const { pages, endpoints } = this.state.groupData[this.props.pages[itemId]?.groupId]
      if (this.findCheckedItems(pages, 'groupPage') && this.findCheckedItems(endpoints, 'endpoint')) {
        newData[`check.group.${this.props.pages[itemId]?.groupId}`] = true
      }
    }

    if (itemtype === 'versionPage') {
      const { pages, groups } = this.state.versionData[this.props.pages[itemId]?.versionId]
      if (this.findCheckedItems(pages, 'versionPage') && this.findCheckedItems(groups, 'group')) {
        newData[`check.version.${this.props.pages[itemId]?.versionId}`] = true
      }
    }

    if (itemtype === 'group') {
      const { pages, groups } = this.state.versionData[this.props.groups[itemId]?.versionId]
      if (this.findCheckedItems(groups, 'group') && this.findCheckedItems(pages, 'versionPage')) {
        newData[`check.version.${this.props.groups[itemId]?.versionId}`] = true
      }
    }

    this.setState({ checkedData: { ...this.state.checkedData, ...newData } }, () => {
      if (itemtype === 'endpoint') {
        this.handleBulkCheck(e, 'group', this.props.endpoints[itemId]?.groupId)
      }
    })
  }

  handleSidebarCheckbox (e, itemtype, itemId) {
    if (itemtype === 'groupPage' || itemtype === 'versionPage' || itemtype === 'endpoint') {
      const checkedData = { ...this.state.checkedData }
      const prevChoice = !this.state.checkedData[`check.${e.target.name}`]
      if (itemtype === 'endpoint' && this.state.checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`]) {
        checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`] = e.target.checked
        if (this.state.checkedData[`check.version.${this.props.groups[this.props.endpoints[itemId]?.groupId]?.versionId}`]) {
          checkedData[`check.version.${this.props.groups[this.props.endpoints[itemId]?.groupId]?.versionId}`] = e.target.checked
        }
      }

      if (itemtype === 'groupPage' && this.state.checkedData[`check.group.${this.props.pages[itemId]?.groupId}`]) {
        checkedData[`check.group.${this.props.pages[itemId]?.groupId}`] = e.target.checked
      }

      if (itemtype === 'versionPage' && this.state.checkedData[`check.version.${this.props.pages[itemId]?.versionId}`]) {
        checkedData[`check.version.${this.props.pages[itemId]?.versionId}`] = e.target.checked
      }

      checkedData[`check.${e.target.name}`] = prevChoice
      this.setState({ checkedData: { ...this.state.checkedData, ...checkedData } },
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }

    if (itemtype === 'group') {
      let checkedGroupData = { ...this.state.checkedData }

      if (this.state.checkedData[`check.version.${this.props.groups[itemId]?.versionId}`]) {
        checkedGroupData[`check.version.${this.props.groups[itemId]?.versionId}`] = false
      }

      checkedGroupData = { ...checkedGroupData, ...this.handleGroupCheckbox(itemId, e) }
      this.setState({ checkedData: { ...this.state.checkedData, ...checkedGroupData } },
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }

    if (itemtype === 'version') {
      let checkedGroupData = { ...this.state.checkedData }
      checkedGroupData[`check.version.${itemId}`] = e.target.checked
      const { groups, pages } = this.state.versionData[itemId]
      groups.forEach((groupId) => {
        checkedGroupData = { ...checkedGroupData, ...this.handleGroupCheckbox(groupId, e) }
      })
      pages.forEach((pageId) => {
        checkedGroupData[`check.versionPage.${pageId}`] = e.target.checked
      })
      this.setState({ checkedData: { ...this.state.checkedData, ...checkedGroupData } }
        ,
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }
  }

  renderCheckBox (itemtype, itemId) {
    return (
      <div>
        <input name={`${itemtype}.${itemId}`} type='checkbox' checked={this.state.checkedData[`check.${itemtype}.${itemId}`]} onChange={(e) => this.handleSidebarCheckbox(e, itemtype, itemId)} />
      </div>
    )
  }

  renderVersionPages (version) {
    return (
      <div>
        {Object.values(this.props.pages).filter(
          (page) =>
            page.versionId === version.id && page.groupId === null
        ).map((page, index) => (
          <div className='d-flex' key={page?.id}>
            <span className='mr-2 '>{this.renderCheckBox('versionPage', page?.id)}</span>
            <div className='sidebar-entity-name d-flex justify-content-between w-100'>
              <div className='text-break'>{page?.name}</div>
              <div className='mr-3'>{stateIcon[page.state]}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderGroupPages (group) {
    return (
      <div>
        {Object.values(this.props.pages).filter(
          (page) =>
            page.groupId === group.id
        ).map((page, index) => (
          <div className='d-flex' key={page?.id}>
            <span className='mr-2'>{this.renderCheckBox('groupPage', page?.id)}</span>
            <div className='sidebar-entity-name d-flex justify-content-between w-100'>
              <div className='text-break'>{page?.name}</div>
              <div className='mr-3'>{stateIcon[page.state]}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderEndpoints (group) {
    return (
      <div>
        {Object.values(this.props.endpoints).filter(
          (endpoint) =>
            endpoint.groupId ===
                group.id
        ).map((endpoint, index) => (
          <div key={endpoint?.id}>
            <div className='d-flex align-items-center'>
              <span className='mr-2'>{this.renderCheckBox('endpoint', endpoint?.id)}</span>
              <div className={`api-label ${endpoint?.requestType} request-type-bgcolor`}>
                {endpoint?.requestType}
              </div>
              <div className='ml-2 sidebar-entity-name d-flex justify-content-between w-100'>
                <div className='text-break'>{endpoint?.name}</div>
                <div className='mr-3'>{stateIcon[endpoint.state]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderGroups (version) {
    return (
      <div>
        {Object.values(this.props.groups).filter(
          (group) =>
            group.versionId ===
                version.id
        ).map((group, index) => (
          <div key={group?.id}>
            <div className='d-flex my-3'>
              <span className='mr-2 '>{this.renderCheckBox('group', group?.id)}</span>
              <span className='sidebar-entity-name'>{group?.name}</span>
            </div>
            <div className='pl-3 '>
              <div> {this.renderGroupPages(group)} </div>
              <div> {this.renderEndpoints(group)} </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderCollectionDropDown () {
    return (
      <div className='collection-api-doc-dropdown'>
        <div className='collection-api-doc-heading'>Collection</div>
        <Dropdown className=' w-100 d-flex '>
          <Dropdown.Toggle variant='' className=' w-100 d-flex sidebar-dropdown'>
            <span className='collection-name'>{this.props.collections[this.state.selectedCollectionId]?.name}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu className='collection-dropdown-menu'>
            {Object.values(this.props.collections || {}).filter(
              (collection) =>
                !collection.isPublic
            ).map((collection, index) => (
              <Dropdown.Item key={collection?.id} onClick={() => this.setState({ selectedCollectionId: collection?.id })}>{collection?.name}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  renderVersionList () {
    return (
      <div>
        <div className='mt-3 collection-api-doc-heading'>Select API Enpoints and Pages to publish</div>
        <div className='publish-versions-list'>
          <div className='p-3 collection-name'>{this.props.collections[this.state.selectedCollectionId]?.name}</div>
          <div className='items'>
            {Object.values(this.props.versions).filter(
              (version) =>
                version.collectionId ===
                  this.state.selectedCollectionId
            ).map((version, index) => (
              <div className='d-flex ml-3 mt-3' key={version?.id}>
                <div className=' d-flex align-items-start'>
                  <span className='mr-2 sidebar-version-checkbox'>{this.renderCheckBox('version', version?.id)}</span>
                  <Accordion className='version-accordian'>
                    <Accordion.Toggle eventKey={version?.id} className='version-accordian-toggle'>
                      <div className='d-flex align-items-center justify-content-between'>
                        <div className=''>{version?.number}</div>
                        <div className='down-arrow'> <DownChevron /> </div>
                      </div>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={version?.id} className='px-3 publish-sidebar-accordian-collapse'>
                      <div className='my-2'>
                        {this.renderVersionPages(version)}
                        {this.renderGroups(version)}
                      </div>
                    </Accordion.Collapse>
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  renderFooter () {
    return (
      <div className='d-flex mt-5'>
        <button className='btn btn-primary' onClick={() => this.sendPublishRequest()}>Next</button>
        <button className='ml-2 btn btn-secondary outline' onClick={() => { this.props.closePublishSidebar() }}>Cancel</button>
      </div>
    )
  }

  render () {
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '26vw',
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
          onClick={() => { }}
          style={darkBackgroundStyle}
        >
          {' '}
        </div>
        <div style={saveAsSidebarStyle} className='publish-sidebar-container'>
          <div className='publish-api-doc-heading'>Publish API Documentation</div>
          {this.renderCollectionDropDown()}
          {this.renderVersionList()}
          {this.renderFooter()}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishSidebar)
