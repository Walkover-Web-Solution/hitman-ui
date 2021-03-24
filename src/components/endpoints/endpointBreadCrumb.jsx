import React, { Component } from 'react'
import { connect } from 'react-redux'
import './displayDescription.scss'
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg'

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
      groupName: null,
      versionName: null,
      collectionName: null,
      isPublished: false
    }
  }

  componentDidMount () {
    const pageId = this.props?.match?.params.pageId
    if (pageId && this.props.pages[pageId]) {
      this.setState({
        endpointTitle: this.props.pages[pageId].name,
        isPublished: this.props.pages[pageId].isPublished
      })
    } else if (this.props?.data?.name) {
      this.setState({ endpointTitle: this.props.data.name })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const pageId = this.props?.match?.params.pageId
    if (this.props.isEndpoint && this.props?.data?.name !== prevProps?.data?.name) {
      this.setState({ endpointTitle: this.props.data.name })
    }
    if (pageId && this.props.pages[pageId]) {
      if (this.props.pages[pageId].name !== prevProps.pages[pageId]?.name) {
        console.log('page', 'update')
        this.setState({ endpointTitle: this.props.pages[pageId].name, isPublished: this.props.pages[pageId].isPublished })
      }
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
        data.name = this.state.endpointTitle
        this.props.update_endpoint(data)
      } else {
        const page = this.props.page
        page.name = this.state.endpointTitle
        this.props.update_page(page)
      }
    }
  }

  setEndpointData () {
    this.groupId = this.props.endpoint?.groupId
    this.groupName = this.groupId ? this.props.groups[this.groupId].name : null
    this.versionId = this.groupId ? this.props.groups[this.groupId].versionId : null
    this.versionName = this.versionId ? this.props.versions[this.versionId].number : null
    this.collectionId = this.versionId ? this.props.versions[this.versionId].collectionId : null
    this.collectionName = this.collectionId ? this.props.collections[this.collectionId].name : null
  }

  setPageData () {
    const { pages, groups, versions, collections } = this.props
    const pageId = this.props?.match?.params.pageId
    const page = pages[pageId]
    console.log(this.props?.pageId)
    if (page) {
      const { versionId, groupId } = page
      this.groupName = groupId ? groups[groupId].name : null
      this.versionName = versionId ? versions[versionId].number : null
      this.collectionId = versionId ? versions[versionId].collectionId : null
      this.collectionName = this.collectionId ? collections[this.collectionId].name : null
    }
  }

  render () {
    this.props.isEndpoint ? this.setEndpointData() : this.setPageData()
    return (
      <div className='endpoint-header'>
        <div
          className='panel-endpoint-name-container'
        >
          <div className='d-flex align-items-center form-group'>
            {this.collectionName && <span className='description'>{`${this.collectionName}  > `}</span>}
            {this.versionName && <span className='description ml-2'>{`${this.versionName}  > `}</span>}
            {this.groupName && <span className='description ml-2'>{`${this.groupName}  > `}</span>}
            <input
              ref={this.nameInputRef}
              className={['form-control', this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}
              name='enpoint-title'
              style={{ width: 'auto' }}
              onChange={this.handleInputChange.bind(this)}
              value={this.state.endpointTitle}
              onBlur={() => { this.handleInputBlur() }}
              maxlength={30}
              minlength={2}
            />
            <div
              onClick={() => {
                this.setState({ nameEditable: true }, () => {
                  this.nameInputRef.current.focus()
                })
              }}
              className={['endpoint-name-container ml-2', !this.state.nameEditable ? 'd-block' : 'd-none'].join(' ')}
            >
              <span className='description-endpoint'>{this.state.endpointTitle ? this.state.endpointTitle : 'Untitled'}</span>
              <EditIcon className='fa fa-pencil-square-o' />

            </div>

            {this.props?.endpoint?.publishedEndpoint?.isPublished && <div className='api-label POST request-type-bgcolor ml-2'> Live </div>}
            {this.state.isPublished && <div className='api-label POST request-type-bgcolor ml-2'> Live </div>}
          </div>

        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(EndpointBreadCrumb)
