import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'

class PublishDocsReview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isItemSelected: false,
      selectedItemType: 'endpoint',
      selectedItemId: null
    }
  }

  dummyFeedback = [
    {
      id: 'f1',
      page: 'trial',
      email: 'abc@example.com',
      quality: +1,
      comment: 'API doc is clear'
    },
    {
      id: 'f2',
      page: 'trial',
      email: 'xyz@example.com',
      quality: -1,
      comment: 'API doc is not clear'
    }
  ]

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
        {endpointsArray.length > 0 && endpointsArray.map(
          (id, index) => (
            <Dropdown.Item
              key={index} onClick={() => {
                this.setState({ isItemSelected: true })
                this.setState({ selectedItemType: 'endpoint' })
                this.setState({ selectedItemId: id })
              }}
            >
              {this.props.endpoints[id]?.name}
            </Dropdown.Item>
          ))}

        {pagesArray.length > 0 && pagesArray.map(
          (id, index) => (
            <Dropdown.Item
              key={index} onClick={() => {
                this.setState({ isItemSelected: true })
                this.setState({ selectedItemType: 'page' })
                this.setState({ selectedItemId: id })
              }}
            >
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
          {!this.state.isItemSelected ? 'Select Page' : (this.state.selectedItemType === 'endpoint') ? this.props.endpoints[this.state.selectedItemId]?.name : this.props.pages[this.state.selectedItemId]?.name}
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
        {this.dummyFeedback.map(feedback =>
          this.renderFeedback(feedback))}
        <div className='row'>
          <div className='col'>
            Total Score: {this.dummyFeedback.reduce((prev, current) => prev + current.quality, 0)}
          </div>
        </div>
      </div>
    )
  }

  renderFeedback (feedback) {
    return (
      <div className='row'>
        <div className='col'>{feedback.page}</div>
        <div className='col'>{feedback.email}</div>
        <div className='col'>{feedback.quality}</div>
        <div className='col'>{feedback.comment}</div>
      </div>
    )
  }

  renderNoFeedback () {
    return (
      <div>No feedbacks received</div>
    )
  }

  render () {
    return (
      <>
        {this.renderHostedApiHeading('API Doc Feedback')}
        {this.dummyFeedback.length > 0 && this.renderPageSelectOption()}
        {this.dummyFeedback.length > 0 ? this.renderPageReview() : this.renderNoFeedback()}
      </>
    )
  }
}

export default PublishDocsReview
