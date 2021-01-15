import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { Button } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
const URI = require('urijs')

const publishDocFormEnum = {
  NULL_STRING: '',
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
  ],
  LABELS: {
    title: 'Title',
    domain: 'Domain',
    logoUrl: 'Fav Icon',
    theme: 'Theme',
    cta: 'CTA',
    links: 'Links'
  }

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
      theme: ''
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
    let title, logoUrl, domain, theme, cta, links, favicon
    if (this.props.collections) {
      collection = this.props.collections[collectionId]
      if (collection && Object.keys(collection).length > 0) {
        title = collection?.docProperties?.defaultTitle || publishDocFormEnum.NULL_STRING
        logoUrl = collection?.docProperties?.defaultLogoUrl || publishDocFormEnum.NULL_STRING
        domain = collection?.customDomain || publishDocFormEnum.NULL_STRING
        theme = collection?.theme || publishDocFormEnum.NULL_STRING
        cta = collection?.docProperties?.cta || publishDocFormEnum.INITIAL_CTA
        links = collection?.docProperties?.links || publishDocFormEnum.INITIAL_LINKS
        favicon = collection?.favicon || publishDocFormEnum.NULL_STRING
        const data = { title, logoUrl, domain, theme }
        this.setState({ data, cta, links, binaryFile: favicon })
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

  schema = {
    title: Joi.string().required().trim().label(publishDocFormEnum.LABELS.title),
    domain: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.domain),
    logoUrl: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.logoUrl),
    theme: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.theme)
  }

  validate (data) {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, this.schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  };

  saveCollectionDetails () {
    const collectionId = URI.parseQuery(this.props.location.search).collectionId
    const collection = { ...this.props.collections[collectionId] }
    const data = { ...this.state.data }
    const cta = this.state.cta
    const links = this.state.links
    const customDomain = data.domain.trim()
    collection.customDomain = customDomain.length !== 0 ? customDomain : null
    collection.theme = data.theme
    collection.favicon = this.state.binaryFile
    collection.docProperties = {
      defaultTitle: data.title.trim(),
      defaultLogoUrl: data.logoUrl.trim(),
      cta,
      links
    }
    const errors = this.validate({ ...this.state.data })
    this.setState({ errors: errors || {} })
    if (errors) return
    this.setState({ loader: true })
    // uploadLogoApi({favIcon:this.state.binaryFile},collectionId);
    this.props.update_collection(collection, () => { this.setState({ loader: false }) })
  }

  setTheme (theme) {
    const data = { ...this.state.data }
    data.theme = theme
    this.setState({ data })
  }

  renderCTAButtons () {
    return (
      <div className='form-group'>
        <label>
          {publishDocFormEnum.LABELS.cta}
        </label>
        {this.state.cta.map((cta, index) => (
          <div key={`cta-${index}`} className={(cta.name.trim() && cta.value.trim()) ? 'd-flex highlight' : 'd-flex'}>
            <input type='text' className='form-control my-2 mr-2' placeholder={`CTA Name ${index + 1}`} name={`cta-${index}-name`} value={cta.name} onChange={(e) => this.handleChangeLink(e)} />
            <input type='text' className='form-control my-2 mr-2' placeholder={`CTA Link ${index + 1}`} name={`cta-${index}-value`} value={cta.value} onChange={(e) => this.handleChangeLink(e)} />
          </div>
        ))}
      </div>
    )
  }

  renderLinkButtons () {
    return (
      <div className='form-group'>
        <label>
          {publishDocFormEnum.LABELS.links}
        </label>
        {this.state.links.map((link, index) => (
          <div key={`cta-${index}`} className={(link.name.trim() && link.link.trim()) ? 'd-flex highlight' : 'd-flex'}>
            <input type='text' className='form-control my-2 mr-2' placeholder={`Link Name ${index + 1}`} name={`links-${index}-name`} value={link.name} onChange={(e) => this.handleChangeLink(e)} />
            <input type='text' className='form-control my-2 mr-2' placeholder={`Referral Link ${index + 1}`} name={`links-${index}-link`} value={link.link} onChange={(e) => this.handleChangeLink(e)} />
          </div>
        ))}
      </div>
    )
  }

  renderFooter () {
    return (
      <>
        {this.props.isSidebar && <Button className='btn btn-secondary outline btn-extra-lg mr-2' onClick={() => { this.props.onHide() }}> Cancel</Button>}
        <Button className={this.state.loader ? 'btn-extra-lg buttonLoader' : 'btn-extra-lg'} onClick={() => this.saveCollectionDetails()}>{this.props.isSidebar ? 'Update' : 'Save'}</Button>
      </>
    )
  }

  renderColorPicker () {
    return (
      <div className='form-group'>
        <label>
          {publishDocFormEnum.LABELS.theme}
        </label>
        <div className='d-flex justify-content-between colorChooser'>
          <CustomColorPicker set_theme={this.setTheme.bind(this)} theme={this.state.data.theme} />
        </div>
      </div>
    )
  }

  handleReaderLoaded =(readerEvt) => {
    const binaryString = readerEvt.target.result
    this.setState({
      binaryFile: btoa(binaryString)
    })
  }

  onFileChange (e) {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = this.handleReaderLoaded.bind(this)
      reader.readAsBinaryString(selectedFile)
    }
    if (selectedFile) {
      this.setState({ uploadedFile: selectedFile})
    } else {
      this.setState({ uploadedFile: null})
    }
  }

  renderUploadModule () {
    return (
      <div>
        <label htmlFor="upload-button">
          <UploadIcon /> 
       </label>
       <input type='file' id="upload-button" style={{ display: "none" }} accept='.png' onChange={(e)=>this.onFileChange(e)}/>
       </div>
    )
  }

  renderUploadBox () {
    return (
      <div className='d-flex'>
      <div className='uploadBox'>
        {!this.state.binaryFile && this.renderUploadModule() }
        {this.state.binaryFile && <img src={`data:image/png;base64,${this.state.binaryFile}`} height='60' width='60' />}
      </div>
      {this.state.uploadedFile&& <div>{this.state.uploadedFile.name}</div>}
      </div>
    )
  }

  renderInput (name, mandatory = false,disabled) {
    return (
      <div className='form-group'>
        <label>
          {publishDocFormEnum.LABELS[name]} {mandatory ? <span className='alert alert-danger'>*</span> : ''}
        </label>
        <input type='text' disabled={disabled} className='form-control' name={name} value={this.state.data[name]} onChange={(e) => this.handleChange(e)} />
        {this.state.errors && this.state.errors[name] && <small className='alert alert-danger'>{this.state.errors[name]}</small>}
      </div>
    )
  }

  render () {
    return (
      <>
        <div className='small-input'>
          {this.renderInput('title', true)}
          {this.renderInput('domain')}
          {/* {this.renderUploadModal()} */}
          <div classname='d-flex'>
            <div>{this.renderUploadBox()}
              {this.state.binaryFile && (
                <span style={{ cursor: 'pointer' }} onClick={() => { this.setState({ binaryFile: null, uploadedFile: null }) }}>Remove</span>
              )}
            </div>
            {this.renderInput('logoUrl',false,this.state.binaryFile)}
          </div>
        </div>
        <div className='color-picker'>
          {this.renderColorPicker()}
        </div>
        <div className='cta-buton'>
          {this.renderCTAButtons()}
          {this.renderLinkButtons()}
        </div>
        <div className='foot-warpper'>
          {this.renderFooter()}
        </div>
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocForm)
