import React, { Component } from 'react'

class ERROR_403_PAGE extends Component {
  state = { }
  render () {
    const message = this.props.location.error?.response?.data
    return (
      <div className='text-center'>
        <h4>Access Forbidden</h4>
        {message
          ? <div>{message}</div>
          : <div>You do not have access to this entity. Please ask organization admin to give access.</div>}
        <div>Return to <span className='text-link' onClick={() => { this.props.history.push({ pathname: '/' }) }}>Dashboard</span></div>
      </div>
    )
  }
}

export default ERROR_403_PAGE
