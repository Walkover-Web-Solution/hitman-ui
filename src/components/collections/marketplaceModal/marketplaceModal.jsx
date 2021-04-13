import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { getAllPublicCollections } from '../collectionsApiService'
import './marketplaceModal.scss'

export class MarketplaceModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
      responseResults: {},
      searchResults: {}
    }
  }

  componentDidMount () {
    this.getPublicCollections()
  }

  getPublicCollections () {
    getAllPublicCollections().then((response) => {
      this.setState({ responseResults: response.data, searchResults: response.data })
    })
  }

  searchResponse () {
    const searchResults = {}
    Object.values(this.state.responseResults).forEach((result) => {
      if (result.name.includes(this.state.searchText)) {
        searchResults[result.id] = result
      }
    })
    return searchResults
  }

  handleSearchChange (e) {
    this.setState({ searchText: e.target.value })
  }

  renderSearchBar () {
    return (
      <input placeholder='Search' value={this.state.searchText} onChange={(e) => this.handleSearchChange(e)} className='collection-search-input' />
    )
  }
  // <img src={`data:image/png;base64,${this.state.binaryFile}`} height='60' width='60' />

  renderSearchResults () {
    const searchResults = this.searchResponse()
    return (
      <div className='d-flex align-items-center collection-search-results'>
        {Object.values(searchResults).map((result) => (
          <div className='search-item' key={result.id}>
            <img src={`data:image/png;base64,${result.favicon}`} height='60' width='60' />
            <div className=''>
              {result.name}
            </div>
          </div>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div>
        <Modal
          size='xl'
          centered
          onHide={this.props.onHide}
          show={this.props.show}
        >
          <div>
            <Modal.Header
              className='custom-collection-modal-container'
              closeButton
            >
              <Modal.Title id='contained-modal-title-vcenter'>
                Import Collection From Marketplace
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className='marketplace-modal'>
              {this.renderSearchBar()}
              {this.renderSearchResults()}
            </Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }
}

export default MarketplaceModal
