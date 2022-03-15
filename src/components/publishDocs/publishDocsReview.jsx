import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'
import { connect } from 'react-redux'
import { fetchFeedbacks } from './redux/publishDocsActions'

const mapStateToProps = (state) => {
  return {
    feedbacks: state.feedbacks
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_feedbacks: (collectionId) => dispatch(fetchFeedbacks(collectionId))
  }
}
class PublishDocsReview extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedItemType: 'endpoint',
      selectedItemId: null,
      filter: false
    }
  }

  componentDidMount () {
    const { collectionId } = this.props.match.params
    collectionId && this.props.fetch_feedbacks(collectionId)
  }

  componentDidUpdate (prevProps, prevState) {
    const { collectionId } = this.props.match.params
    if (prevProps.match.params.collectionId !== collectionId) {
      collectionId && this.props.fetch_feedbacks(collectionId)
    }
  }

  dummyFeedback = [
    {
      id: 1,
      parentId: 'KN7tgPpMG',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:40:03.119Z',
      updatedAt: '2022-03-10T08:40:03.119Z'
    },
    {
      id: 2,
      parentId: 'KN7tgPpMG',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:40:28.152Z',
      updatedAt: '2022-03-10T08:40:28.152Z'
    },
    {
      id: 3,
      parentId: 'AaNy4VYBg',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:40:46.128Z',
      updatedAt: '2022-03-10T08:40:46.128Z'
    },
    {
      id: 4,
      parentId: 'AaNy4VYBg',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:42:22.144Z',
      updatedAt: '2022-03-10T08:42:22.144Z'
    },
    {
      id: 5,
      parentId: 'AaNy4VYBg',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:42:52.319Z',
      updatedAt: '2022-03-10T08:42:52.319Z'
    },
    {
      id: 6,
      parentId: 'AaNy4VYBg',
      parentType: 'endpoint',
      vote: 1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:43:09.375Z',
      updatedAt: '2022-03-10T08:43:09.375Z'
    },
    {
      id: 7,
      parentId: 'QdyTtx16k',
      parentType: 'endpoint',
      vote: -1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:46:45.133Z',
      updatedAt: '2022-03-10T08:46:45.133Z'
    },
    {
      id: 8,
      parentId: 'QdyTtx16k',
      parentType: 'page',
      vote: -1,
      user: null,
      comment: null,
      collectionId: 'Rc6tLQ8Cq',
      createdAt: '2022-03-10T08:47:23.723Z',
      updatedAt: '2022-03-10T08:47:23.723Z'
    }
  ]

  renderHostedApiHeading (heading) {
    console.log(this.props)
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
        <Dropdown.Item onClick={() => {
          this.setState({ filter: false })
        }}
        >
          All
        </Dropdown.Item>
        {endpointsArray.length > 0 && endpointsArray.map(
          (id, index) => (
            <Dropdown.Item
              key={index} onClick={() => {
                this.setState({ selectedItemType: 'endpoint' })
                this.setState({ selectedItemId: id })
                this.setState({ filter: true })
              }}
            >
              {this.props.endpoints[id]?.name}
            </Dropdown.Item>
          ))}

        {pagesArray.length > 0 && pagesArray.map(
          (id, index) => (
            <Dropdown.Item
              key={index} onClick={() => {
                this.setState({ selectedItemType: 'page' })
                this.setState({ selectedItemId: id })
                this.setState({ filter: true })
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
          {!this.state.filter ? 'All' : (this.state.selectedItemType === 'endpoint') ? this.props.endpoints[this.state.selectedItemId]?.name : this.props.pages[this.state.selectedItemId]?.name}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.showEndpointsAndPages()}
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderPageReview (feedbacks) {
    const selectedItemId = this.state.selectedItemId
    const filteredFeedbacks = (!this.state.filter)
      ? feedbacks
      : feedbacks.filter((feedback) => feedback.parentId === selectedItemId)
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
            {filteredFeedbacks.map(feedback =>
              this.renderFeedback(feedback))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                Total Score: {filteredFeedbacks.reduce((prev, current) => prev + current.vote, 0)}
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
        <td>{feedback.parentType === 'endpoint' ? this.props.endpoints[feedback.parentId]?.name : this.props.pages[feedback.parentId]?.name}</td>
        <td>{feedback.user}</td>
        <td>{feedback.vote}</td>
        <td>{feedback.comment}</td>
      </tr>
    )
  }

  renderNoFeedback () {
    return (
      <div>No feedbacks received</div>
    )
  }

  output () {
    console.log(this.props.feedbacks.parent)
  }

  render () {
    const feedbacks = this.props.feedbacks[this.props.match.params.collectionId] || []
    return (
      <div className='feedback-tab'>
        <div className='d-flex flex-row'>
          {this.renderHostedApiHeading('API Doc Feedback')}
          {feedbacks.length > 0 && this.renderPageSelectOption()}
        </div>
        {feedbacks.length > 0 ? this.renderPageReview(feedbacks) : this.renderNoFeedback()}
        {console.log('feedback', this.props.feedbacks)}
        <button onClick={() => { this.output() }}>Hii</button>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocsReview)
