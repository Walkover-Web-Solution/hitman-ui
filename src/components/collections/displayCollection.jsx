import React, { Component } from 'react'
import store from '../../store/store'
import ReactHtmlParser from 'react-html-parser'

class DisplayCollection extends Component {
  constructor (props) {
    super(props)
    this.state = {
      description: ''
    }
  }

  async componentDidMount () {
    if (!this.props.location.collection) {
      const collectionId = this.props.location.pathname.split('/')[2]
      this.fetchCollection(collectionId)
      store.subscribe(() => {
        this.fetchCollection(collectionId)
      })
    }
  }

  fetchCollection (collectionId) {
    const { collections } = store.getState()
    const collection = collections[collectionId]
    if (collection) {
      const { description } = collection
      this.setState({ description })
    }
  }

  render () {
    if (this.props.location.collection) {
      const description = this.props.location.collection.description
      this.setState({ description })
      this.props.history.push({ collection: null })
    }
    return (
      <div className='collection-description'>
        {ReactHtmlParser(this.state.description)}
      </div>
    )
  }
}

export default DisplayCollection
