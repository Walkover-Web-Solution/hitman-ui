import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { updateCollection } from '../collections/redux/collectionsActions'
import { toast } from 'react-toastify'
const URI = require('urijs')

const publishDocFormEnum = {
  NULL_STRING: '',
  ERROR_MESSSAGE: 'Title cannot be empty'
}

const mapDispatchToProps = (dispatch) => {
  return {

    update_collection: (collection) => dispatch(updateCollection(collection))
  }
}

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

class PublishDocForm extends Component {
  state = {
    data: {
      title: '',
      domain: '',
      logoUrl: '',
      theme: ''
    }
  }

  componentDidMount() {
    this.setSelectedCollection()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.setSelectedCollection()
    }
  }

  setSelectedCollection() {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    let collection = {}
    let title, logoUrl, domain, theme
    if (this.props.collections) {
      collection = this.props.collections[collectionId]
      if (collection && Object.keys(collection).length > 0) {
        title = collection?.docProperties?.defaultTitle || publishDocFormEnum.NULL_STRING
        logoUrl = collection?.docProperties?.defaultLogoUrl || publishDocFormEnum.NULL_STRING
        domain = collection?.customDomain || publishDocFormEnum.NULL_STRING
        theme = collection?.theme || publishDocFormEnum.NULL_STRING
        const data = { title, logoUrl, domain, theme }
        this.setState({ data })
      }
    }
  }

  handleChange = (e) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.setState({ data })
  }

  saveCollectionDetails() {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    const collection = { ...this.props.collections[collectionId] }
    const data = { ...this.state.data }
    collection.customDomain = data.domain
    collection.theme = data.theme

    collection.docProperties = {
      defaultTitle: data.title,
      domainList: [],
      defaultLogoUrl: data.logoUrl
    }
    if (this.state.data.title.trim()) {
      this.props.update_collection(collection)
    } else {
      toast.error(publishDocFormEnum.ERROR_MESSSAGE)
    }
  }

  setTheme(theme) {
    const data = { ...this.state.data }
    data.theme = theme
    this.setState({ data })
  }

  render() {
    return (
      <>
        <div className='grid-column-one'>
          <div className='domain'>
            <>
              <div style={{ display: 'flex', padding: '5px' }} className="form-group">
                <label style={{ minWidth: '70px' }}>
                  Domain:
                </label>
                <input type='text' className='form-control' name='domain' value={this.state.data.domain} onChange={(e) => this.handleChange(e)} />
              </div>
              <div style={{ display: 'flex', padding: '5px' }} className="form-group">
                <label style={{ minWidth: '70px' }}>
                  Title:
                </label>
                <input type='text' className='form-control' name='title' value={this.state.data.title} onChange={(e) => this.handleChange(e)} />
              </div>
              <div style={{ display: 'flex', padding: '5px' }} className="form-group">
                <label style={{ minWidth: '70px' }}>
                  LogoUrl:
                </label>
                <input type='text' className='form-control' name='logoUrl' value={this.state.data.logoUrl} onChange={(e) => this.handleChange(e)} />
              </div>
            </>
          </div>
        </div>
        <div className='grid-column-two rightBorder'>
          <div className="colorTitle">
           <p> Pick your favorite color for website</p>  
          </div>
          <div className="d-flex justify-content-between">
            <CustomColorPicker set_theme={this.setTheme.bind(this)} theme={this.state.data.theme} />
            <Button className="btn-extra-lg" onClick={() => this.saveCollectionDetails()}> Save</Button>
          </div>

        </div>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocForm)
