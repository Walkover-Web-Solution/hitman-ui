import React, { Component } from 'react'
import { Dropdown } from 'react-bootstrap'

class PublishDocsReview extends Component {
  renderHostedApiHeading (heading) {
    return (
      <div className='hosted-doc-heading'>
        <div>{heading}</div>
      </div>
    )
  }

  showCollections () {
    if (this.props.collections) {
      return (
        Object.keys(this.props.collections).map(
          (id, index) => (
            !this.props.collections[id]?.importedFromMarketPlace &&
              <Dropdown.Item key={index}>
                {this.props.collections[id]?.name}
              </Dropdown.Item>
          ))
      )
    }
  }

  renderPageSelectOption () {
    return (
      <Dropdown>
        <Dropdown.Toggle variant='' id='dropdown-basic'>
          Select Page
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.showCollections()}
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
