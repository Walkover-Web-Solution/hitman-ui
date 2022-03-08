import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'

class PublishDocsReview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isItemSelected: false,
      selectedItemType: 'endpoint',
      selectedItemId: null,
    }
  }

  renderHostedApiHeading (heading) {
    return (
      <div className='hosted-doc-heading'>
        <div>{heading}</div>
      </div>
    )
  }

  showEndpointsAndPages () {
    const collectionId = this.props.selected_collection_id
    const versionIds = Object.keys(this.props.versions).filter(
      (vId) => this.props.versions[vId].collectionId === collectionId
    )
    const groupIds = Object.keys(this.props.groups)
    const groupsArray = []
    for (let i = 0; i < groupIds.length; i++) {
      const groupId = groupIds[i]
      const group = this.props.groups[groupId]

      if (versionIds.includes(group.versionId)) {
        groupsArray.push(groupId)
      }
    }

    const endpointIds = Object.keys(this.props.endpoints)
    const pageIds = Object.keys(this.props.pages)
    const endpointsArray = []
    const pagesArray = []

    for (let i = 0; i < endpointIds.length; i++) {
      const endpointId = endpointIds[i]
      const endpoint = this.props.endpoints[endpointId]

      if (groupsArray.includes(endpoint.groupId)) {
        if (this.props.endpoints[endpointId].isPublished) { endpointsArray.push(endpointId) }
      }
    }

    for (let i = 0; i < pageIds.length; i++) {
      const pageId = pageIds[i]
      const pages = this.props.pages[pageId]

      if (groupsArray.includes(pages.groupId)) {
        if (this.props.pages[pageId].isPublished) { pagesArray.push(pageId) }
      }
    }

    return (
      <>
        {(endpointsArray.length === 0 && pagesArray.length === 0)
          ? 'No published endpoints or pages'
          : endpointsArray.length > 0
            ? endpointsArray.map(
                (id, index) => (
                  <Dropdown.Item key={index} onClick={() => {
                    this.setState({ isItemSelected: true });
                    this.setState({ selectedItemType: 'endpoint' });
                    this.setState({ selectedItemId: id });
                  }}>
                    {this.props.endpoints[id]?.name}
                  </Dropdown.Item>
                ))
            : pagesArray.map(
              (id, index) => (
                <Dropdown.Item key={index} onClick={() => {
                  this.setState({ isItemSelected: true });
                  this.setState({ selectedItemType: 'page' });
                  this.setState({ selectedItemId: id });
                }}>
                  {this.props.pages[id]?.name}
                </Dropdown.Item>
              ))}
      </>
    )
  }

  renderPageSelectOption () {
    return (
      <Dropdown>
        <Dropdown.Toggle variant='' id='dropdown-basic'>
          {!this.state.isItemSelected ? "Select Page" : (this.state.selectedItemType==='endpoint') ? this.props.endpoints[this.state.selectedItemId]?.name : this.props.pages[this.state.selectedItemId]?.name }
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.showEndpointsAndPages()}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderPageReview () {
    return (
      <div className='hosted-doc-wrapper'>
        <div className='row'>
          <div className='col'>Page</div>
          <div className='col'>Email</div>
          <div className='col'>Quality</div>
          <div className='col'>Comment</div>
        </div>
        {this.renderFeedback()}
        <div className='row'>
          <div className='col'>
            Total Score: -1
          </div>
        </div>
      </div>
    )
  }

  renderFeedback () {
    return (
      <div className='row'>
        <div className='col'>API send</div>
        <div className='col'>rachit@msg91.com</div>
        <div className='col'>-1</div>
        <div className='col'>API doc is not clear</div>
      </div>
    )
  }

  render () {
    return (
      <>
        {this.renderHostedApiHeading('API Doc Feedback')}
        {this.renderPageSelectOption()}
        {this.renderPageReview()}
      </>
    )
  }
}

export default PublishDocsReview
