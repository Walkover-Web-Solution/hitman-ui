import React, { Component } from 'react'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg'
import { isElectron, toTitleCase } from '../common/utility'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    groups: state.groups,
    endpoints: state.endpoints
  }
}

class EndpointBreadCrumb extends Component {
  constructor (props) {
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

  componentDidMount () {
    const pageId = this.props?.match?.params.pageId
    if (!this.props.isEndpoint && pageId && this.props.pages[pageId]) {
      this.setState({
        endpointTitle: this.props.pages[pageId].name,
        isPagePublished: this.props.pages[pageId].isPublished,
        previousTitle: this.props.pages[pageId].name
      })
    } else if (this.props?.data) {
      this.setState({
        endpointTitle: this.props.data.name,
        previousTitle: this.props.data.name
      })
    }

    const endpoint = this.props.endpoint
    if (endpoint && (!endpoint.id) && this.props.data.name === '') {
      this.setState({ endpointTitle: 'Untitled', previousTitle: 'Untitled' })
    }

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', this.handleShortcuts)
    }
  }

  componentWillUnmount () {
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

  componentDidUpdate (prevProps, prevState) {
    const pageId = this.props?.match?.params.pageId
    if (this.props.isEndpoint && this.props?.data?.name !== prevProps?.data?.name) {
      this.setState({
        endpointTitle: this.props.data.name,
        previousTitle: this.props.data.name
      })
    }
    if (!this.props.isEndpoint && pageId && this.props.pages[pageId]) {
      if (this.props.pages[pageId].name !== prevState.previousTitle) {
        this.setState({
          endpointTitle: this.props.pages[pageId].name,
          isPagePublished: this.props.pages[pageId].isPublished,
          previousTitle: this.props.pages[pageId].name
        })
      }
    }
    this.changeEndpointName()
  }

  changeEndpointName () {
    const endpoint = this.props.endpoint
    if (endpoint && (!endpoint.id) && this.props.data.name === '') {
      this.props.alterEndpointName('Untitled')
      this.setState({ endpointTitle: 'Untitled', previousTitle: 'Untitled' })
    }
  }

  handleInputChange (e) {
    this.setState({ endpointTitle: e.currentTarget.value })
  }

  handleInputBlur () {
    this.setState({ nameEditable: false })
    if (this.state.endpointTitle !== '') {
      if (this.props.isEndpoint) {
        const data = this.props.endpoint
        data.name = toTitleCase(this.state.endpointTitle)
        if (data.id) {
          this.props.update_endpoint(data)
        }
        this.props.alterEndpointName(data.name)
      } else {
        const page = this.props.page
        page.name = toTitleCase(this.state.endpointTitle)
        this.props.update_page(page)
      }
      const title = toTitleCase(this.state.endpointTitle)
      this.setState({ previousTitle: title })
      this.setState({})
    } else {
      const title = this.state.previousTitle
      this.setState({ endpointTitle: title })
    }
  }

  setEndpointData () {
    this.groupId = this.props.groupId
    this.groupName = this.groupId ? this.props.groups[this.groupId]?.name : null
    this.versionId = this.groupId ? this.props.groups[this.groupId]?.versionId : null
    this.versionName = this.versionId ? this.props.versions[this.versionId]?.number : null
    this.collectionId = this.versionId ? this.props.versions[this.versionId]?.collectionId : null
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId]?.name : null
  }

  setPageData () {
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

  renderLeftAngle (title) {
    return (title && <span className='ml-1 mr-1'>/</span>)
  }

  render () {
    this.props.isEndpoint ? this.setEndpointData() : this.setPageData()
    return (
      <div className='endpoint-header'>
        <div
          className='panel-endpoint-name-container'
        >
          <div className='page-title-name'>
            <input
              ref={this.nameInputRef}
              className={['endpoint-name-input form-control', this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}
              name='enpoint-title'
              style={{ width: 'auto', textTransform: 'capitalize' }}
              onChange={this.handleInputChange.bind(this)}
              value={this.state.endpointTitle}
              onBlur={() => { this.handleInputBlur() }}
            />
            <h3
              className={['page-title mb-0', !this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}
            >
              {(this.state.endpointTitle && this.state.endpointTitle !== '') ? this.state.endpointTitle : null}
              {(this.state.endpointTitle === '' && this.props.groupId) ? 'Untitled' : null}
              <EditIcon
                className='fa fa-pencil-square-o ml-2 cursor-pointer '
                onClick={() => {
                  this.setState({ nameEditable: true }, () => {
                    this.nameInputRef.current.focus()
                  })
                }}
              />
            </h3>
          </div>
          <div className='d-flex bread-crumb-wrapper align-items-center text-nowrap'>
            {this.collectionName && <span className=''>{`${this.collectionName}`}</span>}
            {this.renderLeftAngle(this.collectionName)}
            {this.versionName && <span>{`${this.versionName}`}</span>}
            {this.renderLeftAngle(this.versionName)}
            {this.groupName && <span>{`${this.groupName}`}</span>}
            {this.renderLeftAngle(this.groupName)}
            <span>
              {this.state.endpointTitle}
            </span>
            {this.props?.endpoint?.publishedEndpoint?.isPublished && <div className='api-label POST request-type-bgcolor ml-2'> Live </div>}
            {this.state.isPagePublished && <div className='api-label POST request-type-bgcolor ml-2'> Live </div>}
          </div>

        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(EndpointBreadCrumb)
