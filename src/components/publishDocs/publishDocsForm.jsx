import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { Button } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
import { HOSTNAME_VALIDATION_REGEX } from '../common/constants'
import { handleChangeInUrlField, handleBlurInUrlField } from '../common/utility'
import { moveToNextStep } from '../../services/widgetService'

const MAPPING_DOMAIN = process.env.REACT_APP_TECHDOC_MAPPING_DOMAIN

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

  componentDidMount() {
    this.setSelectedCollection()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      this.setSelectedCollection()
    }
  }

  setSelectedCollection() {
    const collectionId = this.props.selected_collection_id
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

  handleChange = (e, isURLInput = false) => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    if (isURLInput) {
      data[e.currentTarget.name] = handleChangeInUrlField(data[e.currentTarget.name])
    }
    this.setState({ data })
  }

  handleBlur = (e, isURLInput = false) => {
    const data = { ...this.state.data }
    if (isURLInput) {
      data[e.currentTarget.name] = handleBlurInUrlField(data[e.currentTarget.name])
    }
    this.setState({ errors: {}, data })
  }

  handleChangeLink = (e) => {
    const [type, index, name] = e.target.name.split('-')

    const data = [...this.state[type]]
    data[index][name] = e.target.value
    this.setState({ [type]: data })
  }

  schema = {
    title: Joi.string().required().trim().label(publishDocFormEnum.LABELS.title),
    domain: Joi.string()
      .allow('')
      .regex(HOSTNAME_VALIDATION_REGEX, { name: 'URL' })
      .trim()
      .required()
      .label('domain')
      .error(() => {
        return { message: 'Domain must be valid' }
      }),
    logoUrl: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.logoUrl),
    theme: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.theme)
  }

  validate(data) {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, this.schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  saveCollectionDetails() {
    const collectionId = this.props.selected_collection_id
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
    let errors = this.validate({ ...this.state.data })
    const fileSize = Math.round(this.state.uploadedFile?.size / 1024)
    if (fileSize > 50) {
      errors = { ...errors, icon: "Image size shouldn't be greater than 50KB" }
    }
    this.setState({ errors: errors || {} })
    if (errors) return
    this.setState({ loader: true })
    this.props.update_collection(collection, () => {
      this.setState({ loader: false })
    })
  }

  setTheme(theme) {
    const data = { ...this.state.data }
    data.theme = theme
    this.setState({ data })
  }

  renderCTAButtons() {
    return (
      <div className='form-group'>
        <label>{publishDocFormEnum.LABELS.cta}</label>
        {this.state.cta.map((cta, index) => (
          <div key={`cta-${index}`} className={cta.name.trim() && cta.value.trim() ? 'd-flex highlight' : 'd-flex'}>
            <input
              type='text'
              className='form-control mb-2 mr-2'
              placeholder={`CTA Name ${index + 1}`}
              name={`cta-${index}-name`}
              value={cta.name}
              onChange={(e) => this.handleChangeLink(e)}
            />
            <input
              type='text'
              className='form-control mb-2 mr-2'
              placeholder={`CTA Link ${index + 1}`}
              name={`cta-${index}-value`}
              value={cta.value}
              onChange={(e) => this.handleChangeLink(e)}
            />
          </div>
        ))}
      </div>
    )
  }

  renderLinkButtons() {
    return (
      <div className='form-group'>
        <label>{publishDocFormEnum.LABELS.links}</label>
        {this.state.links.map((link, index) => (
          <div key={`cta-${index}`} className={link.name.trim() && link.link.trim() ? 'd-flex highlight' : 'd-flex'}>
            <input
              type='text'
              className='form-control mb-2 mr-2'
              placeholder={`Link Name ${index + 1}`}
              name={`links-${index}-name`}
              value={link.name}
              onChange={(e) => this.handleChangeLink(e)}
            />
            <input
              type='text'
              className='form-control mb-2 mr-2'
              placeholder={`Referral Link ${index + 1}`}
              name={`links-${index}-link`}
              value={link.link}
              onChange={(e) => this.handleChangeLink(e)}
            />
          </div>
        ))}
      </div>
    )
  }

  renderFooter() {
    return (
      <div className='d-flex align-items-center'>
        {this.props.isSidebar && (
          <Button
            className='btn btn-secondary outline mr-2'
            onClick={() => {
              this.props.onHide()
            }}
          >
            {' '}
            Cancel
          </Button>
        )}
        <Button
          className={this.state.loader ? 'buttonLoader' : ''}
          disabled={!this.state.data.title.trim()}
          id='publish_doc_settings_save_btn'
          onClick={() => this.saveCollectionDetails()}
        >
          {this.props.isSidebar ? 'Update' : 'Save'}
        </Button>
      </div>
    )
  }

  renderColorPicker() {
    return (
      <div className='form-group'>
        <label>{publishDocFormEnum.LABELS.theme}</label>
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

  onFileChange(e) {
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

  getDisabledStyle(disabled) {
    return disabled ? { cursor: 'not-allowed', opacity: 0.4 } : { cursor: 'pointer' }
  }

  renderUploadModule(disabled) {
    return (
      <>
        <div>
          <label style={this.getDisabledStyle(disabled)} htmlFor='upload-button'>
            <UploadIcon />
          </label>
          <input
            type='file'
            id='upload-button'
            disabled={disabled}
            style={{ display: 'none' }}
            accept='.png'
            onChange={(e) => this.onFileChange(e)}
          />
        </div>
      </>
    )
  }

  renderUploadBox(name, mandatory = false, disabled) {
    const { errors } = this.state
    return (
      <>
        <div className='d-flex'>
          <div className='uploadBox' style={this.getDisabledStyle(this.state.data.logoUrl)}>
            {!this.state.binaryFile && <div className='d-flex align-items-center'>{this.renderUploadModule(this.state.data.logoUrl)}</div>}
            {this.state.binaryFile && <img src={`data:image/png;base64,${this.state.binaryFile}`} height='60' width='60' alt='data' />}
          </div>
          <div className='uplod-info'>
            {this.state.uploadedFile && <p>{this.state.uploadedFile.name}</p>}
            {this.state.binaryFile && (
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const errors = this.state.errors || {}
                  delete errors.icon
                  this.setState({ binaryFile: null, uploadedFile: null, errors })
                }}
              >
                Remove
              </span>
            )}
          </div>
        </div>
        {errors && errors[name] && <small className='text-danger'>{errors[name]}</small>}
      </>
    )
  }

  renderInput(name, mandatory = false, disabled, placeholder, isURLInput = false) {
    const { data, errors } = this.state
    return (
      <div className='form-group'>
        <label>{publishDocFormEnum.LABELS[name]}</label>
        <input
          type='text'
          placeholder={placeholder}
          disabled={disabled}
          className='form-control'
          name={name}
          value={data[name]}
          onChange={(e) => this.handleChange(e, isURLInput)}
          onBlur={(e) => this.handleBlur(e, isURLInput)}
        />
        {name === 'domain' && (
          <span className='domain-info f-10 mt-1 d-block'>{`Point c name of the above domain to ${MAPPING_DOMAIN}`}</span>
        )}
        {name === 'title' && (
          <span className='domain-info f-10 mt-1 d-block'>{`Your default title will be ${
            this.props?.collections?.[this.props?.match?.params?.collectionId]?.name
          }`}</span>
        )}
        {errors && errors[name] && <small className='alert alert-danger'>{errors[name]}</small>}
      </div>
    )
  }

  getSelectedCollection() {
    const collectionId = this.props.selected_collection_id
    const collection = { ...this.props.collections[collectionId] }
    return collection
  }

  isCollectionPublished(selectedCollection) {
    return selectedCollection?.isPublic || false
  }

  publishCollection(selectedCollection) {
    if (selectedCollection?.isPublic !== true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = true
      this.props.update_collection(editedCollection)
      moveToNextStep(6)
    }
  }

  renderPublishCollectionButton() {
    const selectedCollection = this.getSelectedCollection()
    if (!this.isCollectionPublished(selectedCollection)) {
      return (
        <Button
          id='publish_collection_btn'
          variant='success publish-collection-button ml-4 mt-4'
          onClick={() => this.publishCollection(selectedCollection)}
          disabled={!selectedCollection?.docProperties?.defaultTitle}
        >
          Publish Collection
        </Button>
      )
    }
  }

  render() {
    return (
      <div className={this.props.onTab && 'publish-on-tab'}>
        <div className='d-flex mb-3 justify-content-between'>
          <h3 className='page-title mb-0'>Manage Public Doc</h3>
          <div className='publish-mo-btn'>
            {(this.props.isSidebar || this.props.onTab) && this.props.isCollectionPublished() ? (
              <Button id='unpublish_doc_btn' variant='btn btn-outline danger ml-2' onClick={() => this.props.unPublishCollection()}>
                Unpublish Doc
              </Button>
            ) : (
              this.renderPublishCollectionButton()
            )}
          </div>
        </div>
        <div className='small-input'>
          {this.renderInput('title', true, false, 'brand name')}
          {this.renderInput('domain', false, false, 'docs.example.com')}
        </div>
        <div className='d-flex favicon'>
          <div className='form-group'>
            <label> Fav Icon </label>
            <div className='favicon-uploader'>{this.renderUploadBox('icon')}</div>
          </div>
          <div className='or-wrap d-flex align-items-center'>
            <p className='mb-0'>OR</p>
          </div>
          {this.renderInput('logoUrl', false, this.state.binaryFile, '')}
        </div>

        <div className='color-picker'>{this.renderColorPicker()}</div>
        <div className='cta-buton'>
          {this.renderCTAButtons()}
          {this.renderLinkButtons()}
        </div>
        <div className='foot-warpper'>{this.renderFooter()}</div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocForm)
