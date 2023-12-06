import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dropdown, Accordion } from 'react-bootstrap'
import { bulkPublish, bulkPublishSelectedData} from './redux/bulkPublishAction'

import './publishSidebar.scss'
import { ReactComponent as DownChevron } from '../../assets/icons/downChevron.svg'
import { ReactComponent as GlobeIcon } from '../../assets/icons/globe-icon.svg'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import { redirectToDashboard, getOrgId} from '../../components/common/utility'
import { toast } from 'react-toastify'

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
    bulk_publish: (collectionId, data) => dispatch(bulkPublish(collectionId, data)),
    bulk_publishSelectedData : (publishData) => dispatch(bulkPublishSelectedData(publishData))
  }
}

const stateIcon = {
  Pending: 'Pending',
  Approved: <GlobeIcon />
}

const defaultData = {
  versionData: {
    pages: [],
    groups: []
  },
  groupData: {
    pages: [],
    endpoints: []
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
      checkedData: {},
      versionsToggle: {},
      versions: {},
      groups: {},
      pages: {},
      endpoints: {},
      checkedData: {}
    }
  }

  componentDidMount () {
    const selectedCollectionId = this.props.collectionId
    if (selectedCollectionId) {
      this.setState({ selectedCollectionId })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.selectedCollectionId !== prevState.selectedCollectionId ||
        (this.props.endpoints !== prevProps.endpoints || this.props.groups !== prevProps.groups ||
           this.props.pages !== prevProps.pages || this.props.versions !== prevProps.versions)) {
      this.setState({ checkedData: {} }, () => {
        this.getAllData()
      })
    }
  }

  getAllData () {
    const collectionId = this.state.selectedCollectionId || this.props.collectionId
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(collectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    const pages = extractCollectionInfoService.extractPagesFromVersions(versions, this.props)
    const endpoints = extractCollectionInfoService.extractEndpointsFromGroups(groups, this.props)
    this.setState({ versions, groups, pages, endpoints, selectedCollectionId: collectionId }, () => {
      this.makeVersionData()
      this.makeGroupData()
    })
  }

  sendPublishRequest () {
    const checkedData = this.state.checkedData
    const requestData = {
      pages: [],
      endpoints: []
    }
     
    const dataToPublish = {}
    dataToPublish.endpointsData = {}
    dataToPublish.pagesData = {}
    let collId = this.state.selectedCollectionId;
    
    dataToPublish.collectionName =
    this.props.collections[collId]?.docProperties?.defaultTitle?.length &&
    this.props.collections[collId]?.docProperties?.defaultTitle?.length !== 0
    ? this.props.collections[collId]?.docProperties.defaultTitle
    : this.props.collections[collId]?.name;
 
    Object.entries(checkedData).forEach((data) => {
      const item = data[0].split('.')
      var pageId = item[2];
      var endpointId = item[2];
      if (item[1] === 'endpoint' && data[1] && !this.state.endpoints[endpointId]?.isPublished) {
        requestData.endpoints.push(endpointId)

        // multiple endpoints publish make data
        let groupId = this.state.endpoints[endpointId]?.groupId;
        let groupName = this.state.groups[groupId]?.name;

        if(!dataToPublish.endpointsData[groupId]){
          dataToPublish.endpointsData[groupId] = {};
          dataToPublish.endpointsData[groupId].groupName = groupName
          dataToPublish.endpointsData[groupId].endpointsId = []
        }
        dataToPublish.endpointsData[groupId].endpointsId.push(endpointId)
      }

      if ((item[1] === 'groupPage' || item[1] === 'versionPage') && data[1] && !this.state.pages[pageId]?.isPublished) {
        requestData.pages.push(pageId)

        // multiple pages publish make data
        let groupId = this.state.pages[pageId]?.groupId
        let versionId = this.state.pages[pageId]?.versionId
        if(!dataToPublish.pagesData[versionId]){
          dataToPublish.pagesData[versionId] = {};
          dataToPublish.pagesData[versionId].withoutGroups = []
          dataToPublish.pagesData[versionId].withGroups = {}
        }

        if(!groupId){
          dataToPublish.pagesData[versionId].withoutGroups.push(pageId)
        }
        else{
          if(!dataToPublish.pagesData[versionId].withGroups[groupId]){
            dataToPublish.pagesData[versionId].withGroups[groupId] = [];
            
          }
          dataToPublish.pagesData[versionId].withGroups[groupId].push(pageId)
        }
      }
    })
   let isAdmin = true;
    if (isAdmin) {
      if(!requestData?.endpoints?.length && !requestData?.pages?.length){
        toast.success('Already Published')
      }else{
      this.props.bulk_publishSelectedData({ publishData: dataToPublish, requestData :requestData });
      const isPublic = this.props.collections[collId]?.isPublic || false
      if (!isPublic) {
        this.props.openPublishSettings();
        }
      }
    }
    else if (requestData.pages.length || requestData.endpoints.length) {
      this.props.bulk_publish(this.state.selectedCollectionId, requestData)
    }
    this.props.closePublishSidebar()
  }

  makeVersionData () {
    const versions = {}
    Object.values(this.state.versions).forEach((version) => {
      versions[version.id] = {
        pages: [],
        groups: []
      }
    })

    Object.values(this.state.pages).forEach((page) => {
      if (page.versionId && !page.groupId) {
        versions[page?.versionId].pages = [...versions[page?.versionId].pages, page?.id]
      }
    })

    Object.values(this.state.groups).forEach((group) => {
      versions[group?.versionId].groups = [...versions[group?.versionId].groups, group?.id]
    })

    this.setState({ versionData: versions })
  }

  makeGroupData () {
    let groups = {}
    if (Object.keys(this.state.groups).length) {
      Object.keys(this.state.groups).forEach((groupId) => {
        groups[groupId] = {
          pages: [],
          endpoints: []
        }
      })
      groups = this.selectRequiredData(groups, this.state.pages, 'pages')
      groups = this.selectRequiredData(groups, this.state.endpoints, 'endpoints')
    }
    this.setState({ groupData: groups })
  }

  selectRequiredData (groups, data, type) {
    Object.values(data).forEach((item) => {
      if (item?.groupId) {
        groups[item?.groupId][type] = [...groups[item?.groupId][type], item?.id]
      }
    })
    return groups
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

  handleVersionBulkCheck (data, newData, itemId) {
    const { pages, groups } = this.state.versionData[data[itemId]?.versionId] || defaultData.versionData
    if (this.findCheckedItems(pages, 'versionPage') && this.findCheckedItems(groups, 'group')) {
      newData[`check.version.${data[itemId]?.versionId}`] = true
    }
    return newData
  }

  handleGroupBulkCheck (data, newData, itemId) {
    const { pages, endpoints } = this.state.groupData[data[itemId]?.groupId] || defaultData.groupData
    if (this.findCheckedItems(endpoints, 'endpoint') && this.findCheckedItems(pages, 'groupPage')) {
      newData[`check.group.${data[itemId]?.groupId}`] = true
    }
    return newData
  }

  handleBulkCheck (e, itemtype, itemId) {
    let newData = { ...this.state.checkedData }
    if (itemtype === 'groupPage' || itemtype === 'endpoint') {
      newData = this.handleGroupBulkCheck(itemtype === 'groupPage' ? this.state.pages : this.state.endpoints, newData, itemId)
    }

    if (itemtype === 'group' || itemtype === 'versionPage') {
      newData = this.handleVersionBulkCheck(itemtype === 'versionPage' ? this.state.pages : this.state.groups, newData, itemId)
    }

    this.setState({ checkedData: { ...this.state.checkedData, ...newData } }, () => {
      if (itemtype === 'endpoint') {
        this.handleBulkCheck(e, 'group', this.state.endpoints[itemId]?.groupId)
      }
      if (itemtype === 'groupPage') {
        this.handleBulkCheck(e, 'group', this.state.pages[itemId]?.groupId)
      }
    })
  }

  handleCheckboxUnderGroup (e, data, itemId, checkedData) {
    if (this.state.checkedData[`check.group.${data[itemId]?.groupId}`]) {
      checkedData[`check.group.${data[itemId]?.groupId}`] = e.target.checked
      if (this.state.checkedData[`check.version.${this.state.groups[data[itemId]?.groupId]?.versionId}`]) {
        checkedData[`check.version.${this.state.groups[data[itemId]?.groupId]?.versionId}`] = e.target.checked
      }
    }
    return checkedData
  }

  handleCheckboxUnderVersion (e, data, itemId, checkedData) {
    if (this.state.checkedData[`check.version.${data[itemId]?.versionId}`]) {
      checkedData[`check.version.${data[itemId]?.versionId}`] = e.target.checked
    }
    return checkedData
  }

  handleSidebarCheckbox (e, itemtype, itemId) {
    if (itemtype === 'groupPage' || itemtype === 'versionPage' || itemtype === 'endpoint') {
      let checkedData = { ...this.state.checkedData }
      const prevChoice = !this.state.checkedData[`check.${e.target.name}`]

      if (itemtype === 'endpoint' || itemtype === 'groupPage') {
        checkedData = { ...checkedData, ...this.handleCheckboxUnderGroup(e, itemtype === 'endpoint' ? this.state.endpoints : this.state.pages, itemId, checkedData) }
      }

      if (itemtype === 'versionPage') {
        checkedData = { ...checkedData, ...this.handleCheckboxUnderVersion(e, this.state.pages, itemId, checkedData) }
      }

      checkedData[`check.${e.target.name}`] = prevChoice
      this.setState({ checkedData: { ...this.state.checkedData, ...checkedData } },
        () => this.handleBulkCheck(e, itemtype, itemId)
      )
    }

    if (itemtype === 'group') {
      let checkedGroupData = { ...this.state.checkedData }
      checkedGroupData = { ...checkedGroupData, ...this.handleCheckboxUnderVersion(e, this.state.groups, itemId, checkedGroupData) }

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

  renderCheckBox(itemtype, itemId) {
    let isCheckboxDisabled = false;
    const checkedData = this.state.checkedData[`check.${itemtype}.${itemId}`] || false;
    if ((itemtype == 'endpoint' && this.state.endpoints[itemId]?.isPublished) ||
      ((itemtype == 'groupPage' || itemtype == 'versionPage') && this.state.pages[itemId]?.isPublished)) {
      isCheckboxDisabled = true;
    }
    return (
      <div>
        <input disabled={isCheckboxDisabled} name={`${itemtype}.${itemId}`} type='checkbox' checked={isCheckboxDisabled ? true : checkedData} onChange={(e) => this.handleSidebarCheckbox(e, itemtype, itemId)} />
      </div>
    )
  }

  renderVersionPages (version) {
    return (
      <div>
        {Object.values(this.state.pages).filter(
          (page) =>
            page.versionId === version.id && page.groupId === null
        ).map((page, index) => (
          <div className='d-flex my-2' key={page?.id}>
            <span className='mr-2 '>{this.renderCheckBox('versionPage', page?.id)}</span>
            <div className='sidebar-entity-name d-flex justify-content-between w-100'>
              <div className='text-break'>{page?.name}</div>
              <div className='mr-3 text-info'>{stateIcon[page.state]}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderGroupPages (group) {
    return (
      <div>
        {Object.values(this.state.pages).filter(
          (page) =>
            page.groupId === group.id
        ).map((page, index) => (
          <div className='d-flex' key={page?.id}>
            <span className='mr-2'>{this.renderCheckBox('groupPage', page?.id)}</span>
            <div className='sidebar-entity-name d-flex justify-content-between w-100'>
              <div className='text-break'>{page?.name}</div>
              <div className='mr-3 text-info text-capitalize'>{stateIcon[page.state]}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderEndpoints (group) {
    return (
      <div>
        {Object.values(this.state.endpoints).filter(
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
                <div className='mr-3 text-info text-capitalize'>{stateIcon[endpoint.state]}</div>
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
            <div className='d-flex mt-2 mb-1'>
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
          <Dropdown.Toggle variant='' className=' w-100 d-flex sidebar-dropdown outline-border publish-api-dropdown'>
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

  toggleVersion (versionId) {
    const versionsToggle = {}
    versionsToggle[versionId] = !this.state.versionsToggle[versionId]
    this.setState({ versionsToggle })
  }

  renderVersionList () {
    return (
      <div>
        <div className='mt-3 collection-api-doc-heading'>Select API Enpoints and Pages to publish</div>
        <div className='publish-versions-list'>
          <div className='items'>
            {Object.values(this.state.versions)
              .map((version, index) => (
                <div className='d-flex mx-3 mt-3' key={version?.id}>
                  <div className=' d-flex align-items-start w-100'>
                    <span className='mr-2 sidebar-version-checkbox'>{this.renderCheckBox('version', version?.id)}</span>
                    <Accordion className='version-accordian w-100' defaultActiveKey={version?.id}>
                      <Accordion.Toggle eventKey={version?.id} className='version-accordian-toggle w-100 version-outline-border' onClick={() => this.toggleVersion(version?.id)}>
                        <div className='d-flex align-items-center justify-content-between w-100'>
                          <div className=''>{version?.number}</div>
                          <div className={['down-arrow', this.state.versionsToggle[version.id] ? 'rotate-toggle' : ' '].join(' ')}> <DownChevron /> </div>
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
      <div className='d-flex mt-3'>
        <button className='btn btn-primary justify-content-center api-save-btn' onClick={() => this.sendPublishRequest()}>Publish</button>
        <button className='ml-2 btn btn-secondary justify-content-center api-cancel-btn' onClick={() => { this.props.closePublishSidebar() }}>Cancel</button>
      </div>
    )
  }

  render () {
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: '#F8F8F8',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '500px',
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
          onClick={() => { this.props.closePublishSidebar() }}
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
