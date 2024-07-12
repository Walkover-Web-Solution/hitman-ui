import React, { Component } from 'react'

class ERROR_403_PAGE extends Component {
  state = {}
  render() {
    const message = this.props.location.error?.response?.data
    return (
      <div className='text-center errorPage'>
        <h4>Access Forbidden</h4>
        {message ? <h3>{message}</h3> : <h3>You do not have access to this entity. Please ask organization admin to give access.</h3>}
        <button
          onClick={() => {
            this.props.history.push({ pathname: '/' })
          }}
        >
          {' '}
          Return to Dashboard
        </button>
      </div>
    )
  }
}

export default ERROR_403_PAGE
