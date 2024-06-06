import React, { Component } from 'react'
import CustomColorPicker from './customColorPicker'
import { connect } from 'react-redux'
import Joi from 'joi-browser'
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
import { HOSTNAME_VALIDATION_REGEX } from '../common/constants'
import { handleChangeInUrlField, handleBlurInUrlField, openExternalLink } from '../common/utility'
import { moveToNextStep } from '../../services/widgetService'
import { updateCollectionIdForPublish } from '../../store/clientData/clientDataActions'
import { publishData } from '../modals/redux/modalsActions'
import PublishSidebar from '../publishSidebar/publishSidebar'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { IoInformationCircleOutline } from 'react-icons/io5'
import PublishDocsReview from './publishDocsReview'
import { FiCopy } from 'react-icons/fi';
import { FaRegTimesCircle } from "react-icons/fa";
import { updateTab } from '../tabs/redux/tabsActions'
import { store } from '../../store/store'
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
    domain: 'Custom Domain',
    logoUrl: 'Logo URL',
    theme: 'Theme',
    cta: 'CTA',
    links: 'Links'
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update_collection: (collection, stopLoader) => dispatch(updateCollection(collection, stopLoader)),
    setCollectionIdForPublish: (data) => dispatch(updateCollectionIdForPublish(data)),
    ON_PUBLISH_DOC: (data) => dispatch(publishData(data)),
    update_tab: (activeTab) => dispatch(updateTab(activeTab, { state: { pageType: 'FEEDBACK' }}))
  }
}

const mapStateToProps = (state) => {
  return {
    isPublishSliderOpen: state.modals.publishData,
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
      republishNeeded: false
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
        title = collection?.docProperties?.defaultTitle || collection?.name || publishDocFormEnum.NULL_STRING
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
    title: Joi.string().min(3).max(50).required().trim().label(publishDocFormEnum.LABELS.title),
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

  saveAndPublishCollection(selectedCollection) {
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
      defaultTitle: data.title.trim(),
      defaultLogoUrl: data.logoUrl.trim()
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
      // Publish collection if not already published
      if (selectedCollection?.isPublic !== true) {
        const editedCollection = { ...selectedCollection }
        editedCollection.isPublic = true
        this.props.update_collection(editedCollection)
        moveToNextStep(6)
      }
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
      <div className='form-group mb-4'>
        <label>{publishDocFormEnum.LABELS.theme}</label>
        <div className='colorChooser'>
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
          <div className='uplod-info d-none'>
            {this.state.binaryFile && (
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const errors = this.state.errors || {}
                  delete errors.icon
                  this.setState({ binaryFile: null, uploadedFile: null, errors })
                }}
              >
                <FaRegTimesCircle className='text-dark' />
              </span>
            )}
          </div>
          </div>
          
        </div>
        {errors && errors[name] && <small className='text-danger'>{errors[name]}</small>}
      </>
    )
  }

  renderInput(name, mandatory = false, disabled, placeholder, isURLInput = false) {
    const { data, errors } = this.state
    return (
      <div className='form-group mb-4'>
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
          <span className='domain-info fs-4 mt-1 d-block text-danger'>{`Point c name of the above domain to ${MAPPING_DOMAIN}`}
          <a className='ml-1' href='https://techdoc.walkover.in/p/White-Labelling?collectionId=2Uv_sfKTLPI3'>Learn More</a>
          </span>
        )}
        {name === 'title' && (
          <span className='domain-info fs-4 mt-1 d-block'>Collection name will be used by default when no title is entered.</span>
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

  redirectUser() {
    this.setState({ openPublishSidebar: true })
    this.props.ON_PUBLISH_DOC(true)
    // this.props.setCollectionIdForPublish({ collectionId: this.props.selected_collection_id })
  }
  openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
    );
  };
  renderPublicUrl() {
    const isCollectionPublished = this.props.collections[this.props.selected_collection_id]?.isPublic
    const url = process.env.REACT_APP_PUBLIC_UI_URL + '/p?collectionId=' + this.props.selected_collection_id
    const isDisabled = this.IsParentPagePublishedInACollection(this.props.collections[this.props.selected_collection_id]?.rootParentId)

    if (!isCollectionPublished) return null

    return (
      <div>
        <div className='d-flex align-items-center mt-4 mb-1'>
          <span className='public-title d-block'>Preview Documentation</span>
          <div className='api-label POST request-type-bgcolor ml-2 w-auto px-1 '> published </div>
        </div>
        <OverlayTrigger
          overlay={
            <Tooltip id='tooltip-unpublished-endpoint' className={isDisabled ? 'd-none' : ''}>
              At least one endpoint/page is to be published to enable this link.
            </Tooltip>
          }
        >
           <div
        className={`sidebar-public-url d-flex align-items-center justify-content-start mb-4 ${
          isDisabled ? 'text-disable' : 'disabled-link'
        }`}
      >
        <HiOutlineExternalLink className='mr-1' size={13} />
        <span onClick={() => isDisabled && this.openExternalLink(url)}>{url}</span>
        <button
          className="copy-button-link ml-2 border-0 bg-white"
          onClick={() => this.copyToClipboard(url)}
          title="Copy URL"
        >
          <FiCopy size={13} />
        </button>
      </div>
        </OverlayTrigger>
      </div>
    )
  }

  IsParentPagePublishedInACollection(rootParentId) {
    let childs = this.props.pages?.[rootParentId]?.child
    if (childs?.length > 0) {
      for (let i = 0; i < childs?.length; i++) {
        if (this.props.pages[childs[i]]?.isPublished == true) {
          return true
        }
      }
    }
    return false
  }

  handleSeeFeedbacks = () => {
    const collectionId = this.props.selected_collection_id
    const activeTab = this.props.tabs.activeTabId
    this.props.update_tab(activeTab, { state: { pageType: 'FEEDBACK' } })
    this.props.history.push(`/orgs/${this.props.match.params.orgId}/dashboard/collection/${collectionId}/feedback`)
  }

  openPublishSidebar() {
    return (
      <>{this.props.isPublishSliderOpen && <PublishSidebar {...this.props} closePublishSidebar={this.closePublishSidebar.bind(this)} />}</>
    )
  }
  closePublishSidebar() {
    this.setState({ openPublishSidebar: false })
    this.props.ON_PUBLISH_DOC(false)
  }

  renderActionButtons(publishCheck) {
    const selectedCollection = this.getSelectedCollection()
    const isNotPublished = !this.isCollectionPublished(selectedCollection)
    const rootParentId = this.props?.collections[this.props.selected_collection_id]?.rootParentId
    const disableCondition = this.props?.pages[rootParentId]?.child?.length > 0
    return (
      <div className='mt-2'>
        <Button
          disabled={!disableCondition}
          id='publish_collection_btn'
          variant='btn btn-outline'
          className='m-1 btn-sm fs-4'
          onClick={() => this.redirectUser()}
        >
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip className='w-25 p-3 ' id='tooltip-bulk-publish'>
                This will publish all the pages and endpoints inside this collection.
              </Tooltip>
            }
          >
            <span>Bulk Publish</span>
          </OverlayTrigger>
        </Button>
        <Button
          className={this.state.loader ? 'buttonLoader m-1 btn-sm fs-4' : 'm-1 btn-sm fs-4'}
          disabled={!this.state.data.title.trim()}
          onClick={() => {
            this.saveAndPublishCollection(selectedCollection)
            this.setState({ republishNeeded: true })
          }}
          variant='btn btn-outline'
        >
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip className='w-25 p-3' id='tooltip-save-and-publish'>
                This will save as well as publish the doc
              </Tooltip>
            }
          >
            <span>{this.state.republishNeeded ? 'Save and Republish' : 'Save and Publish'}</span>
          </OverlayTrigger>
        </Button>
        {!isNotPublished && (
          <Button
            variant='btn btn-outline-danger btn-sm fs-4'
            className='m-1 btn-sm fs-4'
            onClick={() => {
              this.props.unPublishCollection()
              this.setState({ republishNeeded: false })
            }}
          >
            Unpublish Doc
          </Button>
        )}
      </div>
    )
  }

  render() {
    const publishCheck = (this.props.isSidebar || this.props.onTab) && this.props.isCollectionPublished()
    return (
      <>
      <div className='d-flex justify-content-center'>
        <div className={this.props.onTab && 'publish-on-tab'}>
          <div className='d-flex justify-content-between align-item-center'>
            <div className='d-flex align-items-center'>
              <h3 className='page-title mb-0'>Publish Collection Settings</h3>
            </div>
            <span className='hover' onClick={this.handleSeeFeedbacks} style={{display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <IoInformationCircleOutline style={{ color:'inherit', marginRight: '1px', fontSize: '20px' }}/>
              <span  style={{ fontSize: '16px' }}>Feedbacks</span>
            </span>
          </div>
        <span className='mt-2 d-inline-block'>Completing this step will make your collection available at a public URL.</span>

          {publishCheck && this.renderPublicUrl()}
          <div className='small-input mt-2'>
            {this.renderInput('title', true, false, 'brand name')}
            {this.renderInput('domain', false, false, 'docs.example.com')}
          </div>
          <div className='d-flex favicon mb-4'>
            <div className='form-group mb-0'>
              <label> Fav Icon </label>
              <div className='favicon-uploader'>{this.renderUploadBox('icon')}</div>
            </div>
            <div className='or-wrap d-flex align-items-center'>
              <p className='mb-0'>OR</p>
            </div>
            {this.renderInput('logoUrl', false, this.state.binaryFile, '')}
          </div>

          <div className='color-picker'>{this.renderColorPicker()}</div>
          {this.renderActionButtons(publishCheck)}
        </div>
        </div>
        {this.state.openPublishSidebar && this.openPublishSidebar()}
      </>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocForm)
