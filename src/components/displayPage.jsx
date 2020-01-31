import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

class DisplayPage extends Component {
  state = {}
  render () {
    if (!this.props.location.page) {
      return <Redirect to='/collections' />
    }
    return (
      <div>
        <span>
          <p>{this.props.location.page.name}</p>
        </span>
        <span>
          <p>{this.props.location.page.contents}</p>
        </span>
        <button className='btn btn-primary btn-sm'>Edit page</button>
      </div>
    )
  }
}

export default DisplayPage
