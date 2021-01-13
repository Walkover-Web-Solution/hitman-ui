import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { updateCollection } from '../collections/redux/collectionsActions'
const URI = require('urijs')

const publishDocFormEnum = {
  NULL_STRING: '',
  ERROR_MESSSAGE: 'Title cannot be empty',
  INITIAL_CTA: [
    {
      name: '',
      value: ''
    },
    {
      name: '',
      value: ''
    }
  ],
  INITIAL_LINKS: [
    {
      name: '',
      link: ''
    },
    {
      name: '',
      link: ''
    },
    {
      name: '',
      link: ''
    }
  ]

}

const mapDispatchToProps = (dispatch) => {
  return {
    update_collection: (collection, stopLoader) => dispatch(updateCollection(collection, stopLoader))
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
      theme: '',
      loader: false
    },
    cta: publishDocFormEnum.INITIAL_CTA,
    links: publishDocFormEnum.INITIAL_LINKS

  }

  componentDidMount () {
    this.setSelectedCollection()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props) {
      this.setSelectedCollection()
    }
  }

  setSelectedCollection () {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    let collection = {}
    let title, logoUrl, domain, theme, cta, links
    if (this.props.collections) {
      collection = this.props.collections[collectionId]
      if (collection && Object.keys(collection).length > 0) {
        title = collection?.docProperties?.defaultTitle || publishDocFormEnum.NULL_STRING
        logoUrl = collection?.docProperties?.defaultLogoUrl || publishDocFormEnum.NULL_STRING
        domain = collection?.customDomain || publishDocFormEnum.NULL_STRING
        theme = collection?.theme || publishDocFormEnum.NULL_STRING
        cta = collection?.docProperties?.cta || publishDocFormEnum.INITIAL_CTA
        links = collection?.docProperties?.links || publishDocFormEnum.INITIAL_LINKS
        const data = { title, logoUrl, domain, theme }
        this.setState({ data, cta, links })
      }
    }
  }

  handleChange = (e) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.setState({ data })
  }

  handleChangeLink = (e) => {
    const [type, index, name] = e.target.name.split('-')

    const data = [...this.state[type]]
    data[index][name] = e.target.value
    this.setState({ [type]: data })
  }

  saveCollectionDetails () {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    const collection = { ...this.props.collections[collectionId] }
    const data = { ...this.state.data }
    // const cta = this.state.cta.filter((o)=>o.name.trim()&&o.value.trim());
    // const links = this.state.links.filter((o)=>o.name.trim()&&o.link.trim());
    const cta = this.state.cta
    const links = this.state.links
    const customDomain = data.domain.trim()
    collection.customDomain = customDomain.length !== 0 ? customDomain : null
    collection.theme = data.theme
    collection.docProperties = {
      defaultTitle: data.title.trim(),
      defaultLogoUrl: data.logoUrl.trim(),
      cta,
      links
    }
    this.setState({ loader: true })
    this.props.update_collection(collection, () => { this.setState({ loader: false }) })
  }

  setTheme (theme) {
    const data = { ...this.state.data }
    data.theme = theme
    this.setState({ data })
  }

  renderCTAButtons () {
    return (
      <>
        <div>
          CTA
        </div>
        <div>
          {
          this.state.cta.map((cta, index) => (
            <div key={`cta-${index}`} className={(cta.name.trim() && cta.value.trim()) ? 'd-flex highlight' : 'd-flex'}>
              <input type='text' className='form-control mr-2' placeholder={`CTA Name ${index + 1}`} name={`cta-${index}-name`} value={cta.name} onChange={(e) => this.handleChangeLink(e)} />
              <input type='text' className='form-control mr-2' placeholder={`CTA Link ${index + 1}`} name={`cta-${index}-value`} value={cta.value} onChange={(e) => this.handleChangeLink(e)} />
            </div>
          ))
        }
        </div>
      </>
    )
  }

  renderLinkButtons () {
    return (
      <>
        <div>
          Text Buttons
        </div>
        <div>
          {
          this.state.links.map((link, index) => (
            <div key={`cta-${index}`} className={(link.name.trim() && link.link.trim()) ? 'd-flex highlight' : 'd-flex'}>
              <input type='text' className='form-control mr-2' placeholder={`Link Name ${index + 1}`} name={`links-${index}-name`} value={link.name} onChange={(e) => this.handleChangeLink(e)} />
              <input type='text' className='form-control mr-2' placeholder={`Referral Link ${index + 1}`} name={`links-${index}-link`} value={link.link} onChange={(e) => this.handleChangeLink(e)} />
            </div>
          ))
        }
        </div>
      </>
    )
  }

  render () {
    return (
      <>
        <div className='grid-column-one'>
          <div className='domain'>
            <>
              <div style={{ display: 'flex', padding: '5px' }} className='form-group'>
                <label style={{ minWidth: '70px' }}>
                  Domain:
                </label>
                <input type='text' className='form-control' name='domain' value={this.state.data.domain} onChange={(e) => this.handleChange(e)} />
              </div>
              <div style={{ display: 'flex', padding: '5px' }} className='form-group'>
                <label style={{ minWidth: '70px' }}>
                  Title:
                </label>
                <input type='text' className='form-control' name='title' value={this.state.data.title} onChange={(e) => this.handleChange(e)} />
              </div>
              <div style={{ display: 'flex', padding: '5px' }} className='form-group'>
                <label style={{ minWidth: '70px' }}>
                  LogoUrl:
                </label>
                <input type='text' className='form-control' name='logoUrl' value={this.state.data.logoUrl} onChange={(e) => this.handleChange(e)} />
              </div>
            </>
          </div>
        </div>
        <div className='grid-column-two rightBorder'>
          <div className='colorTitle'>
            <p> Pick your favorite color for website</p>
          </div>
          <div className='d-flex justify-content-between colorChooser'>
            <CustomColorPicker set_theme={this.setTheme.bind(this)} theme={this.state.data.theme} />
            <Button className={this.state.loader ? 'btn-extra-lg buttonLoader' : 'btn-extra-lg'} onClick={() => this.saveCollectionDetails()}> Save</Button>
          </div>
        </div>
        {this.renderCTAButtons()}
        {this.renderLinkButtons()}
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocForm)
