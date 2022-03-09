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
      <div className='page-title mb-3'>
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
      <Dropdown className='mb-3 ml-3'>
        <Dropdown.Toggle variant='' id='dropdown-basic' className='outline-border custom-dropdown-btn'>
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
        <table className='feedback-table'>
          <thead>
            <th>Page</th>
            <th>Email</th>
            <th>Quality</th>
            <th>Comment</th>
          </thead>
          <tbody>
            {this.dummyFeedback.map(feedback =>
              this.renderFeedback(feedback))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                Total Score: {this.dummyFeedback.reduce((prev, current) => prev + current.quality, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  renderFeedback (feedback) {
    return (
      <tr>
        <td>{feedback.page}</td>
        <td>{feedback.email}</td>
        <td>{feedback.quality}</td>
        <td>{feedback.comment}</td>
      </tr>
    )
  }

  renderNoFeedback () {
    return (
      <div>No feedbacks received</div>
    )
  }

  render () {
    return (
      <div className='feedback-tab'>
        <div className='d-flex flex-row'>
          {this.renderHostedApiHeading('API Doc Feedback')}
          {this.dummyFeedback.length > 0 && this.renderPageSelectOption()}
        </div>
        {this.dummyFeedback.length > 0 ? this.renderPageReview() : this.renderNoFeedback()}
      </div>
    )
  }
}

export default PublishDocsReview
