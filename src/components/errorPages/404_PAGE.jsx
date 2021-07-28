import React, { Component } from 'react'

class ERROR_404_PAGE extends Component {
  state = { }
  render () {
    const message = this.props.location.error?.response?.data
    return (
      <div className='text-center'>
        <h4>Not Found</h4>
        {message ? <div>{message}</div> : null}
        <div>Return to <span className='text-link' onClick={() => { this.props.history.push({ pathname: '/' }) }}>Dashboard</span></div>
      </div>
    )
  }
}

export default ERROR_404_PAGE
