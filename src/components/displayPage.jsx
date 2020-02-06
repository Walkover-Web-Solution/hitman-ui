import React, { Component } from 'react'
import pageService from '../services/pageService'

class DisplayPage extends Component {
  state = {}

  handleEdit (page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}/edit`,
      page: page
    })
  }
  render () {
    console.log(this.props.location.page)
    return (
      <div>
        <button
          style={{ float: 'right' }}
          className='btn btn-primary btn-sm'
          onClick={() => {
            this.handleEdit(this.props.location.page)
          }}
        >
          Edit page
        </button>
        <span>
          <p>{this.props.location.page.name}</p>
        </span>
        <span>
          <p>{this.props.location.page.contents}</p>
        </span>
      </div>
    )
  }
}

export default DisplayPage
