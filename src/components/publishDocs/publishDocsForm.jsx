import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { Button } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
import { HOSTNAME_VALIDATION_REGEX } from '../common/constants'
const URI = require('urijs')

const UI_IP = process.env.REACT_APP_UI_IP

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
    logoUrl: 'Logo URL',
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
    domain: Joi.string().allow('').regex(HOSTNAME_VALIDATION_REGEX, { name: 'URL' }).trim().required().label('domain').error(() => { return { message: 'Domain must be valid' } }),
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
      versionHosts: {},
      defaultTitle: data.title.trim(),
      defaultLogoUrl: data.logoUrl.trim(),
      cta,
      links
    }
    delete collection.isPublic
    const errors = this.validate({ ...this.state.data })
    this.setState({ errors: errors || {} })
    if (errors) return
    this.setState({ loader: true })
    this.props.update_collection(collection, () => { this.setState({ loader: false }) })
    if (collectionId) {
      this.props.history.replace({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collectionId}`,
        showConfirmModal: !this.props?.isSidebar
      })
    }
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
        <Button className={this.state.loader ? 'btn-extra-lg buttonLoader' : 'btn-extra-lg'} id='publish_doc_settings_save_btn' onClick={() => this.saveCollectionDetails()}>{this.props.isSidebar ? 'Update' : 'Save'}</Button>
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

  handleReaderLoaded = (readerEvt) => {
    const binaryString = readerEvt.target.result
    this.setState({
      binaryFile: window.btoa(binaryString)
    })
  }

  onFileChange (e) {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const reader = new window.FileReader()
      reader.onload = this.handleReaderLoaded.bind(this)
      reader.readAsBinaryString(selectedFile)
    }
    if (selectedFile) {
      this.setState({ uploadedFile: selectedFile })
    } else {
      this.setState({ uploadedFile: null })
    }
  }

  renderUploadModule (disabled) {
    return (
      <div>
        <label style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: '.4' }} htmlFor='upload-button'>
          <UploadIcon />
        </label>
        <input type='file' id='upload-button' disabled={disabled} style={{ display: 'none' }} accept='.png' onChange={(e) => this.onFileChange(e)} />
      </div>
    )
  }

  renderUploadBox (name, mandatory = false, disabled) {
    return (
      <div className='d-flex'>
        <div className='uploadBox'>
          {!this.state.binaryFile &&
            <div className='d-block'>
              {this.renderUploadModule(this.state.data.logoUrl)}
              <div className='upload-box-text'>Upload</div>
            </div>}
          {this.state.binaryFile && <img src={`data:image/png;base64,${this.state.binaryFile}`} height='60' width='60' />}
        </div>
        <div className='uplod-info'>
          {
            this.state.uploadedFile &&
              <p>
                {this.state.uploadedFile.name}
              </p>
          }
          {this.state.binaryFile && (
            <span style={{ cursor: 'pointer' }} onClick={() => { this.setState({ binaryFile: null, uploadedFile: null }) }}>Remove</span>
          )}
        </div>
      </div>
    )
  }

  renderInput (name, mandatory = false, disabled, placeholder) {
    return (
      <div className='form-group'>
        <label>
          {publishDocFormEnum.LABELS[name]} {mandatory ? <span className='alert alert-danger'>*</span> : ''}
        </label>
        <input type='text' placeholder={placeholder} disabled={disabled} className='form-control' name={name} value={this.state.data[name]} onChange={(e) => this.handleChange(e)} />
        {this.state.errors && this.state.errors[name] && <small className='alert alert-danger'>{this.state.errors[name]}</small>}
        {name === 'domain' && <label className='domain-info'>{`Point the A record of the above domain to ${UI_IP}`}</label>}
      </div>
    )
  }

  render () {
    return (
      <>
        <div className='publish-mo-btn'>
          {
            this.props.isSidebar && this.props.isCollectionPublished() &&
              <Button
                id='unpublish_doc_btn'
                variant='btn btn-outline danger ml-4 mt-4'
                onClick={() => this.props.unPublishCollection()}
              >
                Unpublish Doc
              </Button>
          }
        </div>
        <div className='small-input'>
          {this.renderInput('title', true, false, 'brand name')}
          {this.renderInput('domain', false, false, 'https://docs.example.com')}
        </div>
        <label className='fav-icon-text'> Fav Icon </label>
        <div className='d-flex'>
          <div className='favicon-uploader'>
            {this.renderUploadBox()}
          </div>
          <div className='or-wrap'>
            <p>OR</p>
          </div>
          {this.renderInput('logoUrl', false, this.state.binaryFile)}
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
