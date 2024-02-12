import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg'
import { isElectron, toTitleCase } from '../common/utility'
import { updateNameOfPages } from '../pages/redux/pagesActions'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.pages,
    tabState: state.tabs.tabs,
    activeTabId: state.tabs.activeTabId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update_name: (payload) => dispatch(updateNameOfPages(payload))
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
      isPagePublished: false
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
    if (this.props?.isEndpoint) {
      const tempData = this.props?.endpointContent || {}
      tempData.data.name = e.currentTarget.value
      this.props.setQueryUpdatedData(tempData)
    }
  }

  handleInputBlur() {
    this.setState({ nameEditable: false })
  }

  setEndpointData() {
    this.groupId = this.props.groupId
    this.groupName = this.groupId ? this.props.groups[this.groupId]?.name : null
    this.versionId = this.groupId ? this.props.groups[this.groupId]?.versionId : null
    this.versionName = this.versionId ? this.props.versions[this.versionId]?.number : null
    this.collectionId = this.versionId ? this.props.versions[this.versionId]?.collectionId : null
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  setPageData() {
    const { pages, groups, versions, collections } = this.props
    const pageId = this.props?.match?.params.pageId
    const page = pages[pageId]
    if (page) {
      const { versionId, groupId } = page
      this.groupName = groupId ? groups[groupId]?.name : null
      this.versionName = versionId ? versions[versionId]?.number : null
      this.collectionId = versionId ? versions[versionId]?.collectionId : null
      this.collectionName = this.collectionId ? collections[this.collectionId]?.name : null
    }
  }

  renderLeftAngle(title) {
    return title && <span className='ml-1 mr-1'>/</span>
  }

  render() {
    this.props.isEndpoint ? this.setEndpointData() : this.setPageData()
    return (
      <div className='endpoint-header'>
        <div className='panel-endpoint-name-container'>
          <div className='page-title-name'>
            <input
              ref={this.nameInputRef}
              className={['endpoint-name-input form-control', this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}
              name='enpoint-title'
              style={{ width: 'auto', textTransform: 'capitalize' }}
              onChange={this.handleInputChange.bind(this)}
              value={this.props?.isEndpoint && (this.props?.endpointContent?.data?.name || '')}
              onBlur={() => {
                this.handleInputBlur()
              }}
              maxLength='50'
            />
            <h3 className={['page-title mb-0', !this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}>
              {this.props?.isEndpoint ? this.props?.endpointContent?.data?.name || '' : this.props?.pages?.[this.props?.match?.params?.pageId]?.name}
              {this.props?.isEndpoint && <EditIcon
                className='fa fa-pencil-square-o ml-2 cursor-pointer '
                onClick={() => {
                  this.setState({ nameEditable: true }, () => {
                    this.nameInputRef.current.focus()
                  })
                }}
              />}
            </h3>
          </div>
          {this.props.location.pathname.split('/')[5] !== 'new' && (
            <div className='d-flex bread-crumb-wrapper align-items-center text-nowrap'>
              {this.collectionName && <span className=''>{`${this.collectionName}`}</span>}
              {this.renderLeftAngle(this.collectionName)}
              {this.versionName && <span>{`${this.versionName}`}</span>}
              {this.renderLeftAngle(this.versionName)}
              {this.groupName && <span>{`${this.groupName}`}</span>}
              {this.renderLeftAngle(this.groupName)}
              <span className='end-point-title'>{this.state.endpointTitle}</span>
              {this.props?.endpoints[this.props.currentEndpointId]?.isPublished && (
                <div className='api-label POST request-type-bgcolor ml-2'> Live </div>
              )}
              {/* {this.state.isPagePublished && <div className='api-label POST request-type-bgcolor ml-2'> Live </div>} */}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EndpointBreadCrumb)
