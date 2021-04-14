import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { getAllPublicCollections } from '../collectionsApiService'
import { connect } from 'react-redux'
import { importCollection } from '../redux/collectionsActions'
import './marketplaceModal.scss'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    import_collection: (collection) => dispatch(importCollection(collection))
  }
}

export class MarketplaceModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchText: '',
      responseResults: {},
      searchResults: {},
      selectedCollection: null
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
      if (result.name.toLowerCase().includes(this.state.searchText.toLowerCase())) {
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

  import () {
    this.props.import_collection(this.state.selectedCollection)
    this.props.onHide()
  }

  selectOption (selectedCollection) {
    let currentCollection = selectedCollection
    if (this.state.selectedCollection?.id === selectedCollection?.id) {
      currentCollection = null
    }
    this.setState({ selectedCollection: currentCollection })
  }

  checkImportStatus () {
    const currentCollection = this.state.selectedCollection
    let status = false
    if (currentCollection) {
      status = Object.keys(this.props.collections).find((collectionId) => collectionId === currentCollection?.id)
    }
    return status
  }

  renderSearchResults () {
    const searchResults = this.searchResponse()
    return (
      <div className='d-flex align-items-center collection-search-results'>
        {Object.values(searchResults).map((result) => (
          <div
            key={result.id}
            onClick={() => this.selectOption(result)}
            className={['search-item', this.state.selectedCollection?.id === result.id ? 'selected-item' : ''].join(' ')}
          >
            <img src={`data:image/png;base64,${result.favicon}`} height='60' width='60' />
            <div className=''>
              {result.name}
            </div>
          </div>
        ))}
        {Object.keys(searchResults).length === 0 && <div> No Results Found </div>}
      </div>
    )
  }

  renderFooterButtons () {
    const status = this.checkImportStatus()
    return (
      <div className='marketplace-footer-btns'>
        <button className='btn btn-secondary outline' onClick={() => this.props.onCancel()}>
          Cancel
        </button>
        {this.state.selectedCollection &&
          <button className={['btn btn-primary', 'ml-2', status ? 'disabled' : ''].join(' ')} disabled={!!status} onClick={() => this.import()}>
            {status ? 'Already Imported' : 'Import'}
          </button>}
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
            {this.renderFooterButtons()}
          </div>
        </Modal>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal)
