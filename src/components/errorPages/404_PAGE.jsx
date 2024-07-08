import React, { Component } from 'react'
import { withRouter } from 'react-router'

class ERROR_404_PAGE extends Component {
  state = {}
  render() {
    const message = this.props.location.error?.response?.data
    return (
      <div className='text-center errorPage'>
        <h4>OOPS! 404</h4>
        {message ? <h3>{message}</h3> : null}
        <button
          onClick={() => {
            this.props.navigate({ pathname: '/' })
          }}
          mat-button
        >
          Return to Dashboard
        </button>
      </div>
    )
  }
}

export default withRouter(ERROR_404_PAGE)
