import React, { Component } from 'react'

class ERROR_404_PAGE extends Component {
  state = { }
  render () {
    const message = this.props.location.error?.response?.data
    return (
      <div className='text-center errorPage'>
        <h4>OOPS! 404</h4>
        {message ? <h3>{message}</h3> : null}
        <button mat-button>Return to <span className='text-link' onClick={() => { this.props.history.push({ pathname: '/' }) }}>Dashboard</span></button>
      </div>
    )
  }
}

export default ERROR_404_PAGE
