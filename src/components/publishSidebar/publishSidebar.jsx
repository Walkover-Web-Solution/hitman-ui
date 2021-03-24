import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dropdown, Accordion } from 'react-bootstrap'
import { bulkPublish } from './redux/bulkPublishAction'

import './publishSidebar.scss'

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

    this.props.bulk_publish(this.state.selectedCollectionId, requestData)
    // console.log('hello', requestData)
  }

  makeVersionData () {
    const versions = {}
    Object.values(this.props.versions).forEach((version) => {
      // if(version?.collectionId === this.props.collectionId){
      versions[version.id] = {
        pages: [],
        groups: []
      }
      // }
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
    // this.setState({ checkedData: { ...this.state.checkedData, ...elementsArray,...newArray } })
  }

  findCheckedItems (data1, data2, type) {
    let status = true
    const newCheckedData = { ...this.state.checkedData }
    // data1.forEach((dataId) => {
    //   if (!newCheckedData[`check.groupPage.${dataId}`]) {
    //     status = false
    //   }
    // })

    data2.forEach((dataId) => {
      if (!newCheckedData[`check.${type}.${dataId}`]) {
        status = false
      }
    })
    return status
  }

  handleBulkCheck (e, itemtype, itemId) {
    const newData = {}
    if (itemtype === 'endpoint') {
      const { pages, endpoints } = this.state.groupData[this.props.endpoints[itemId]?.groupId]
      if (this.findCheckedItems(pages, endpoints, 'endpoint')) {
        newData[`check.group.${this.props.endpoints[itemId]?.groupId}`] = true
      }
    }

    if (itemtype === 'groupPage') {
      const { pages, endpoints } = this.state.groupData[this.props.pages[itemId]?.groupId]
      if (this.findCheckedItems(endpoints, pages, 'groupPage')) {
        newData[`check.group.${this.props.pages[itemId]?.groupId}`] = true
      }
    }

    if (itemtype === 'versionPage') {
      const { pages, groups } = this.state.versionData[this.props.pages[itemId]?.versionId]
      if (this.findCheckedItems(groups, pages, 'versionPage') && this.findCheckedItems(groups, groups, 'group')) {
        newData[`check.version.${this.props.pages[itemId]?.versionId}`] = true
      }
    }

    if (itemtype === 'group') {
      const { pages, groups } = this.state.versionData[this.props.groups[itemId]?.versionId]
      if (this.findCheckedItems(pages, groups, 'group') && this.findCheckedItems(groups, pages, 'versionPage')) {
        newData[`check.version.${this.props.groups[itemId]?.versionId}`] = true
      }
    }

    // if(itemtype === "versionPage" && this.state.checkedData[`check.version.${this.props.pages[itemId]?.versionId}`]){
    //   checkedData[`check.version.${this.props.pages[itemId]?.versionId}`] = e.target.checked;
    // }
    // return newData;
    this.setState({ checkedData: { ...this.state.checkedData, ...newData } }, () => {
      if (itemtype === 'endpoint') {
        this.handleBulkCheck(e, 'group', this.props.endpoints[itemId]?.groupId)
      }
    })
  }

  handleSidebarCheckbox (e, itemtype, itemId) {
    // console.log('hello', e.target.name, e.target.checked)
    // this.setState({ checkedData: { ...this.state.checkedData, [`check.${e.target.name}`]: e.target.checked } })

    if (itemtype === 'groupPage' || itemtype === 'versionPage' || itemtype === 'endpoint') {
      const checkedData = {}
      const prevChoice = !this.state.checkedData[`check.${e.target.name}`]
      // checkedData = {...checkedData,...this.handleBulkCheck(e, itemtype, itemId)}
      if (itemtype === 'endpoint' && this.state.checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`]) {
        checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`] = e.target.checked
        // console.log("hello",this.state.checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`],itemId)
        if (this.state.checkedData[`check.version.${this.props.groups[this.props.endpoints[itemId]?.groupId]?.versionId}`]) {
          checkedData[`check.version.${this.props.groups[this.props.endpoints[itemId]?.groupId]?.versionId}`] = e.target.checked
        }
      }

      if (itemtype === 'groupPage' && this.state.checkedData[`check.group.${this.props.pages[itemId]?.groupId}`]) {
        checkedData[`check.group.${this.props.pages[itemId]?.groupId}`] = e.target.checked
        // console.log("hello",this.state.checkedData[`check.group.${this.props.endpoints[itemId]?.groupId}`],itemId)
      }

      if (itemtype === 'versionPage' && this.state.checkedData[`check.version.${this.props.pages[itemId]?.versionId}`]) {
        checkedData[`check.version.${this.props.pages[itemId]?.versionId}`] = e.target.checked
        //  console.log("hello",this.props.pages[itemId]?.versionId,itemId)
      }

      checkedData[`check.${e.target.name}`] = prevChoice
      // checkedData = {...this.handleBulkCheck(e, itemtype, itemId),...checkedData}
      this.setState({ checkedData: { ...this.state.checkedData, /* [`check.${e.target.name}`]: prevChoice */ ...checkedData } },
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }

    if (itemtype === 'group') {
      // let newArray = {}
      // let elementsArray = this.state.checkedData;
      // let {endpoints,pages} = this.state.groupData[itemId];
      // endpoints.forEach((endpointId)=>{
      //   newArray[`check.endpoint.${endpointId}`] = true;
      // })
      // pages.forEach((pageId)=>{
      //   newArray[`check.groupPage.${pageId}`] = true;
      // })
      // this.setState({ checkedData: { ...this.state.checkedData, ...elementsArray,...newArray } })
      let checkedGroupData = {}

      if (this.state.checkedData[`check.version.${this.props.groups[itemId]?.versionId}`]) {
        checkedGroupData[`check.version.${this.props.groups[itemId]?.versionId}`] = false
      }

      checkedGroupData = { ...checkedGroupData, ...this.handleGroupCheckbox(itemId, e) }
      this.setState({ checkedData: { ...this.state.checkedData, ...checkedGroupData } },
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }

    if (itemtype === 'version') {
      let checkedGroupData = {}
      checkedGroupData[`check.version.${itemId}`] = e.target.checked
      const { groups, pages } = this.state.versionData[itemId]
      groups.forEach((groupId) => {
        // checkedGroupData[`check.group.${groupId}`] = e.target.checked;
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
            <span className='mr-2'>{this.renderCheckBox('versionPage', page?.id)}</span>
            <div> {page?.name} </div>
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
            <div> {page?.name} </div>
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
            <div className='d-flex'>
              <span className='mr-2'>{this.renderCheckBox('endpoint', endpoint?.id)}</span>
              <div className={`api-label ${endpoint?.requestType} request-type-bgcolor`}>
                {endpoint?.requestType}
              </div>
              <span>{endpoint?.name} </span>
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
            <div className='d-flex'>
              <span className='mr-2'>{this.renderCheckBox('group', group?.id)}</span>
              <span>{group?.name}</span>
            </div>
            <div> {this.renderGroupPages(group)} </div>
            <div> {this.renderEndpoints(group)} </div>
          </div>
        ))}
      </div>
    )
  }

  renderCollectionDropDown () {
    return (
      <div>
        <div>Collection</div>
        <Dropdown>
          <Dropdown.Toggle variant='success' id='dropdown-basic'>
            {this.props.collections[this.state.selectedCollectionId]?.name}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {Object.values(this.props.collections || {}).filter(
              (collection) =>
                !collection.isPublic
            ).map((collection, index) => (
              <Dropdown.Item key={collection?.id} onClick={() => this.setState({ selectedCollectionId: collection?.id, checkedData: {} })}>{collection?.name}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    )
  }

  renderVersionList () {
    return (
      <div>
        <div>Select API Enpoints and Pages to publish</div>
        <div className='publish-versions-list'>
          <div>{this.props.collections[this.state.selectedCollectionId]?.name}</div>
          <div className='items'>
            {Object.values(this.props.versions).filter(
              (version) =>
                version.collectionId ===
                  this.state.selectedCollectionId
            ).map((version, index) => (
              <div className='d-flex' key={version?.id}>
                <span className='mr-2'>{this.renderCheckBox('version', version?.id)}</span>
                <Accordion>
                  <Accordion.Toggle eventKey={version?.id}>
                    <div>{version?.number}</div>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={version?.id}>
                    <div>
                      {this.renderVersionPages(version)}
                      {this.renderGroups(version)}
                    </div>
                  </Accordion.Collapse>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  renderFooter () {
    return (
      <div className='d-flex'>
        <button onClick={() => this.sendPublishRequest()}>Next</button>
        <button onClick={() => { this.props.closePublishSidebar() }}>Cancel</button>
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
          onClick={() => { }}
          style={darkBackgroundStyle}
        >
          {' '}
        </div>
        <div style={saveAsSidebarStyle}>
          <div>Publish API Documentation</div>
          {this.renderCollectionDropDown()}
          {this.renderVersionList()}
          {this.renderFooter()}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishSidebar)
