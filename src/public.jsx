import React, { Component } from 'react'
import { Switch } from 'react-router-dom'
import JSONPretty from 'react-json-pretty'
import httpService from './services/httpService'

class Public extends Component {
  state = { data: {} }
  async getCollections () {
    this.data = await httpService.get(
      'https://www.postman.com/collections/6e506f1ccb086d400043'
    )
  }
  render () {
    if (this.props.location.pathname.split('/')[2] === 'collections') {
      //   publicServices.getCollections(collectionId)
      this.getCollections()
    }
    return (
      <React.Fragment>
        <JSONPretty data={this.data} />
      </React.Fragment>
    )
  }
}

export default Public
