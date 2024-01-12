import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { getAllPublicCollections } from '../collectionsApiService'
import { connect } from 'react-redux'
import { importCollection } from '../redux/collectionsActions'
import { moveToNextStep } from '../../../services/widgetService'
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
  constructor(props) {
    super(props)
    this.state = {
      searchText: '',
      responseResults: null,
      selectedCollection: null
    }
  }

  componentDidMount() {
    this.getPublicCollections()
  }

  getPublicCollections() {
    getAllPublicCollections().then((response) => {
      this.setState({ responseResults: response.data })
    })
  }

  searchResponse() {
    const searchResults = {}
    const responseResults = this.state.responseResults
    responseResults &&
      Object.values(responseResults).forEach((result) => {
        if (result.name.toLowerCase().includes(this.state.searchText.toLowerCase())) {
          searchResults[result.id] = result
        }
      })
    return searchResults
  }

  handleSearchChange(e) {
    this.setState({ searchText: e.target.value })
  }

  renderSearchBar() {
    return (
      <input
        placeholder='Search'
        value={this.state.searchText}
        onChange={(e) => this.handleSearchChange(e)}
        className='collection-search-input'
      />
    )
  }

  import() {
    this.props.import_collection(this.state.selectedCollection)
    moveToNextStep(1)
    this.props.onHide()
  }

  selectOption(selectedCollection) {
    let currentCollection = selectedCollection
    if (this.state.selectedCollection?.id === selectedCollection?.id) {
      currentCollection = null
    }
    this.setState({ selectedCollection: currentCollection })
  }

  checkImportStatus() {
    const currentCollection = this.state.selectedCollection
    let status = false
    if (currentCollection) {
      status = Object.keys(this.props.collections).find((collectionId) => collectionId === currentCollection?.id)
    }
    return status
  }

  renderCollectionIcon(collection) {
    return collection.favicon || collection.docProperties.defaultLogoUrl ? (
      <img
        src={
          collection.docProperties.defaultLogoUrl ? collection.docProperties.defaultLogoUrl : `data:image/png;base64,${collection.favicon}`
        }
        height='60'
        width='60'
      />
    ) : (
      <div className='collection-avatar'>
        <div className='name'>{collection?.name.charAt(0)}</div>
      </div>
    )
  }

  renderSearchResults() {
    const searchResults = this.searchResponse()
    return (
      <div className='d-flex align-items-center collection-search-results'>
        {Object.values(searchResults).map((result) => (
          <div
            key={result.id}
            onClick={() => this.selectOption(result)}
            className={['search-item', this.state.selectedCollection?.id === result.id ? 'selected-item' : ''].join(' ')}
          >
            {this.renderCollectionIcon(result)}
            <div className=''>{result.name}</div>
          </div>
        ))}
        {this.state.responseResults && Object.keys(searchResults).length === 0 && <div> No Results Found </div>}
        {this.state.responseResults === null && (
          <div>
            <i className='fas fa-spinner fa-spin mr-2' />
            Getting Results
          </div>
        )}
      </div>
    )
  }

  renderFooterButtons() {
    const status = this.checkImportStatus()
    return (
      <div className='marketplace-footer-btns'>
        <button className='btn btn-secondary outline' onClick={() => this.props.onCancel()}>
          Cancel
        </button>
        {this.state.selectedCollection && (
          <button
            className={['btn btn-primary', 'ml-2', status ? 'disabled' : ''].join(' ')}
            id='add_collection_marketplace_import_btn'
            disabled={!!status}
            onClick={() => this.import()}
          >
            {status ? 'Already Imported' : 'Import'}
          </button>
        )}
      </div>
    )
  }

  renderContent() {
    return (
      <>
        {this.renderSearchBar()}
        {this.renderSearchResults()}
        {this.renderFooterButtons()}
      </>
    )
  }

  renderInModal() {
    return (
      <Modal size='xl' centered onHide={this.props.onHide} show>
        <div>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>Import Collection From Marketplace</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.renderContent()}</Modal.Body>
        </div>
      </Modal>
    )
  }

  render() {
    return this.props.showOnlyContent ? this.renderContent() : this.renderInModal()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal)
