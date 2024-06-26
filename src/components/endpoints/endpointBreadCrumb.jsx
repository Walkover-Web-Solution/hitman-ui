import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg'
import { getOnlyUrlPathById, isElectron, trimString } from '../common/utility'
import { onPageUpdated, updateNameOfPages } from '../pages/redux/pagesActions'
import { MdHttp } from "react-icons/md";
import { GrGraphQl } from "react-icons/gr";
import { updateTab } from '../tabs/redux/tabsActions'
import { prototype } from 'form-data'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.pages,
    tabState: state.tabs.tabs,
    activeTabId: state.tabs.activeTabId,
    history: state.history
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update_name: (payload) => dispatch(updateNameOfPages(payload)),
    update_tab: (id, data) => dispatch(updateTab(id, data)),
  }
}

class EndpointBreadCrumb extends Component {
  constructor(props) {
    super(props)
    this.nameInputRef = React.createRef()
    this.state = {
      nameEditable: false,
      endpointTitle: '',
      previousTitle: '',
      groupName: null,
      versionName: null,
      collectionName: null,
      isPagePublished: false,
      protocols: [{ type: 'HTTP', icon: <MdHttp color='green' size={16} /> }, { type: 'GraphQL', icon: <GrGraphQl color='rgb(170, 51, 106)' size={14} /> }]
    }
  }

  componentDidMount() {
    if (this.props.isEndpoint) {
      const endpointId = this.props?.match?.params.endpointId
      if (this.props?.pages?.[endpointId]) {
        this.setState({
          endpointTitle: this.props.pages[endpointId]?.name || '',
          isPagePublished: this.props.pages[endpointId]?.isPublished || false,
          previousTitle: this.props.pages[endpointId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    } else {
      const pageId = this.props?.match?.params.pageId
      if (this.props?.pages?.[pageId]) {
        this.setState({
          endpointTitle: this.props.pages[pageId]?.name || '',
          isPagePublished: this.props.pages[pageId]?.isPublished || false,
          previousTitle: this.props.pages[pageId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    }
    // if (!this.props.isEndpoint && endpointId && this.props.pages[endpointId] && endpointId !== 'new') {
    //   this.setState({
    //     endpointTitle: this.props.pages[endpointId].name,
    //     isPagePublished: this.props.pages[endpointId].isPublished,
    //     previousTitle: this.props.pages[endpointId].name
    //   })
    // } else if (this.props?.data) {
    //   this.setState({
    //     endpointTitle: this.props.data.name,
    //     previousTitle: this.props.data.name
    //   })
    // }

    // const endpoint = this.props.endpoint
    // if (endpoint && !endpoint.id && this.props.data.name === '') {
    //   this.setState({ endpointTitle: 'Untitled', previousTitle: 'Untitled' })
    // }

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // const endpointId = this.props?.match?.params.endpointId
    // if (this.props.isEndpoint && this.props?.data?.name !== prevProps?.data?.name) {
    //   this.setState({
    //     endpointTitle: this.props.data.name,
    //     previousTitle: this.props.data.name
    //   })
    // }
    // if (!this.props.isEndpoint && endpointId && this.props.pages[endpointId]) {
    //   if (this.props.pages[endpointId].name !== prevState.previousTitle) {
    //     this.setState({
    //       endpointTitle: this.props.pages[endpointId].name,
    //       isPagePublished: this.props.pages[endpointId].isPublished,
    //       previousTitle: this.props.pages[endpointId].name
    //     })
    //   }
    // }
    // this.changeEndpointName()
    if (this.props.isEndpoint) {
      if (prevProps.match?.params.endpointId === this.props?.match?.params.endpointId) return
      const endpointId = this.props?.match?.params.endpointId
      if (this.props?.pages?.[endpointId]) {
        this.setState({
          endpointTitle: this.props.pages[endpointId]?.name || '',
          isPagePublished: this.props.pages[endpointId]?.isPublished || false,
          previousTitle: this.props.pages[endpointId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    } else {
      if (prevProps.match?.params.pageId === this.props?.match?.params.pageId) return
      const pageId = this.props?.match?.params.pageId
      if (this.props?.pages?.[pageId]) {
        this.setState({
          endpointTitle: this.props.pages[pageId]?.name || '',
          isPagePublished: this.props.pages[pageId]?.isPublished || false,
          previousTitle: this.props.pages[pageId]?.name || ''
        })
      } else {
        this.setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        })
      }
    }
  }

  componentWillUnmount() {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.removeListener('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  handleShortcuts = (e, actionType) => {
    if (actionType === 'RENAME_ENDPOINT') {
      this.setState({ nameEditable: true }, () => {
        this.nameInputRef.current.focus()
      })
    }
  }

  changeEndpointName() {
    const endpoint = this.props.endpoint
    if (endpoint && !endpoint.id && this.props.data.name === '') {
      this.props.alterEndpointName('Untitled')
      this.setState({ endpointTitle: 'Untitled', previousTitle: 'Untitled' })
    }
  }

  handleInputChange(e) {
    this.setState({ changesMade: true });
    if (this.props?.isEndpoint) {
      const tempData = this.props?.endpointContent || {}
      tempData.data.name = e.currentTarget.value
      this.props.setQueryUpdatedData(tempData)
      this.props.update_name({ id: this.props?.match?.params?.endpointId, name: e.currentTarget.value })
    }
  }

  handleInputBlur() {
    this.setState({ nameEditable: false })
    if (this.props?.match?.params?.endpointId !== 'new' && trimString(this.props?.endpointContent?.data?.name).length === 0) {
      const tempData = this.props?.endpointContent || {}
      tempData.data.name = this.props?.pages?.[this.props?.match?.params?.endpointId]?.name
      this.props.setQueryUpdatedData(tempData)
    } else if (this.props?.match?.params?.endpointId === 'new' && !this.props?.endpointContent?.data?.name) {
      const tempData = this.props?.endpointContent || {}
      tempData.data.name = 'Untitled'
      this.props.setQueryUpdatedData(tempData)
    }
  }

  setEndpointData() {
    this.endpointId = this.props?.match?.params.endpointId
    this.collectionId = this.props.pages[this.endpointId]?.collectionId
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  setPageData() {
    this.pageId = this.props?.match?.params.pageId
    this.collectionId = this.props.pages[this.pageId]?.collectionId
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  renderLeftAngle(title) {
    return title && <span className='ml-1 mr-1'>/</span>
  }

  handleProtocolTypeClick(index) {
    this.props.setQueryUpdatedData({ ...this.props.endpointContent, protocolType: index + 1 })
    this.props.update_tab(this.props?.match?.params.endpointId === 'new' && this.props.activeTabId, { isModified: true })
    this.props.setActiveTab()
  }

  switchProtocolTypeDropdown() {
    return (
      <div className='dropdown'>
        <button
          className='protocol-selected-type mr-2'
          id='dropdownMenuButton'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          {this.state.protocols[(this.props?.endpointContent?.protocolType - 1)]?.icon}
        </button>
        <div className='dropdown-menu protocol-dropdown' aria-labelledby='dropdownMenuButton'>
          {this.state.protocols.map((protocolDetails, index) => (
            <button className='dropdown-item' key={index} onClick={() => this.handleProtocolTypeClick(index)}>
              {protocolDetails.icon}
              <span className='protocol-type-text'>{protocolDetails.type}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  render() {
    this.props.isEndpoint ? this.setEndpointData() : this.setPageData()
    return (
      <div className='endpoint-header'>
        <div className='panel-endpoint-name-container'>
          <div className='page-title-name d-flex align-items-center'>
            {this.props?.match?.params?.endpointId === 'new' && this.switchProtocolTypeDropdown()}
            {(this.props?.match?.params?.endpointId != 'new' && this.props?.endpointContent?.protocolType === 1 && this.state?.protocols?.[0]?.icon) &&
              <button className='protocol-selected-type cursor-text mr-2'>{this.state.protocols?.[0]?.icon}</button>}
            {(this.props?.match?.params?.endpointId != 'new' && this.props?.endpointContent?.protocolType === 2 && this.state?.protocols?.[1]?.icon) &&
              <button className='protocol-selected-type cursor-text mr-2'>{this.state.protocols?.[1]?.icon}</button>}
            <input
              name='enpoint-title'
              ref={this.nameInputRef}
              style={{ textTransform: 'capitalize' }}
              className={['page-title mb-0', !this.state.nameEditable ? 'd-block' : ''].join(' ')}
              onChange={this.handleInputChange.bind(this)}
              value={this.props?.isEndpoint
                ? this.props?.pages?.[this.props?.match?.params?.endpointId]?.name ||
                this.props?.history?.[this.props?.match?.params?.historyId]?.endpoint?.name ||
                this.props?.endpointContent?.data?.name
                : this.props?.pages?.[this.props?.match?.params?.pageId]?.name}
            />
          </div>
          {this.props.location.pathname.split('/')[5] !== 'new' && (
            <div className='d-flex bread-crumb-wrapper align-items-center text-nowrap'>
              {this.collectionName && <span className='collection-name-path'>{`${this.collectionName}/`}</span>}
              {
                <span>
                  {getOnlyUrlPathById(
                    this.props?.match?.params?.pageId || this.props?.match?.params?.endpointId,
                    this.props.pages,
                    'internal'
                  )}
                </span>
              }
              {this.props?.endpoints[this.props.currentEndpointId]?.isPublished && (
                <div className='api-label POST request-type-bgcolor ml-2'> Live </div>
              )}
              {this.props.pages?.[this.props?.match?.params?.pageId]?.isPublished && (
                <div className='api-label POST request-type-bgcolor ml-2'> Live </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointBreadCrumb)
