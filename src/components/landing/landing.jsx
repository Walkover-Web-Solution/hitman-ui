import React, { Component } from 'react'

class Landing extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    this.props.history.push({
      pathname: '/dashboard'
    })
    return (<div />)
  }
}

export default Landing
