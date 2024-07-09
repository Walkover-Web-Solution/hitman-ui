import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomColorPicker from './customColorPicker'
import Joi from 'joi-browser'
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
import { HOSTNAME_VALIDATION_REGEX } from '../common/constants'
import { handleChangeInUrlField, handleBlurInUrlField } from '../common/utility'
import { moveToNextStep } from '../../services/widgetService'
import { publishData } from '../modals/redux/modalsActions'
import PublishSidebar from '../publishSidebar/publishSidebar'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { FiCopy } from 'react-icons/fi'
import { FaRegTimesCircle } from 'react-icons/fa'
import { updateTab } from '../tabs/redux/tabsActions'
import withRouter from '../common/withRouter'

const MAPPING_DOMAIN = process.env.REACT_APP_TECHDOC_MAPPING_DOMAIN
const publishDocFormEnum = {
  NULL_STRING: '',
  LABELS: {
    title: 'Title',
    domain: 'Custom Domain',
    logoUrl: 'Logo URL',
    theme: 'Theme'
  }
}

const PublishDocForm = (props) => {
  const dispatch = useDispatch()

  const { collections, isPublishSliderOpen, tabs, pages } = useSelector((state) => ({
    collections: state.collections,
    isPublishSliderOpen: state.modals.publishData,
    tabs: state.tabs,
    pages: state.pages
  }))
  const [data, setData] = useState({
    title: '',
    domain: '',
    logoUrl: '',
    theme: '',
    republishNeeded: false
  })
  const [errors, setErrors] = useState({})
  const [binaryFile, setBinaryFile] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loader, setLoader] = useState(false)
  const [openPublishSidebar, setOpenPublishSidebar] = useState(false)
  const [republishNeeded, setRepublishNeeded] = useState(false)

  useEffect(() => {
    setSelectedCollection()
  }, [props.selected_collection_id, collections])

  const setSelectedCollection = () => {
    const collectionId = props.selected_collection_id
    let collection = {}
    let title, logoUrl, domain, theme, cta, links, favicon
    if (collections) {
      collection = collections[collectionId]
      if (collection && Object.keys(collection).length > 0) {
        title = collection?.docProperties?.defaultTitle || collection?.name || publishDocFormEnum.NULL_STRING
        logoUrl = collection?.docProperties?.defaultLogoUrl || publishDocFormEnum.NULL_STRING
        domain = collection?.customDomain || publishDocFormEnum.NULL_STRING
        theme = collection?.theme || publishDocFormEnum.NULL_STRING
        favicon = collection?.favicon || publishDocFormEnum.NULL_STRING
        setData({ title, logoUrl, domain, theme })
        setBinaryFile(favicon)
      }
    }
  }

  const handleChange = (e, isURLInput = false) => {
    const newData = { ...data }
    newData[e.currentTarget.name] = e.currentTarget.value
    if (isURLInput) {
      newData[e.currentTarget.name] = handleChangeInUrlField(newData[e.currentTarget.name])
    }
    setData(newData)
  }

  const handleBlur = (e, isURLInput = false) => {
    const newData = { ...data }
    if (isURLInput) {
      newData[e.currentTarget.name] = handleBlurInUrlField(newData[e.currentTarget.name])
    }
    setErrors({})
    setData(newData)
  }

  const schema = {
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

  const validate = (data) => {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  const saveAndPublishCollection = (selectedCollection) => {
    const collectionId = props.selected_collection_id
    const collection = { ...collections[collectionId] }
    const newData = { ...data }
    const customDomain = newData.domain.trim()
    collection.customDomain = customDomain.length !== 0 ? customDomain : null
    collection.theme = newData.theme
    collection.favicon = binaryFile
    collection.docProperties = {
      defaultTitle: newData.title.trim(),
      defaultLogoUrl: newData.logoUrl.trim()
    }
    delete collection.isPublic
    let newErrors = validate({ ...data })
    const fileSize = Math.round(uploadedFile?.size / 1024)
    if (fileSize > 50) {
      newErrors = { ...newErrors, icon: "Image size shouldn't be greater than 50KB" }
    }
    setErrors(newErrors || {})
    if (newErrors) return
    setLoader(true)
    dispatch(
      updateCollection(collection, () => {
        setLoader(false)
        if (selectedCollection?.isPublic !== true) {
          const editedCollection = { ...selectedCollection }
          editedCollection.isPublic = true
          dispatch(updateCollection(editedCollection))
          moveToNextStep(6)
        }
        setRepublishNeeded(true)
      })
    )
  }

  const setTheme = (theme) => {
    setData((prevData) => ({
      ...prevData,
      theme
    }))
  }

  const renderColorPicker = () => (
    <div className='form-group mb-4'>
      <label>{publishDocFormEnum.LABELS.theme}</label>
      <div className='colorChooser'>
        <CustomColorPicker set_theme={setTheme} theme={data.theme} />
      </div>
    </div>
  )

  const handleReaderLoaded = (readerEvt) => {
    const binaryString = readerEvt.target.result
    setBinaryFile(window.btoa(binaryString))
  }

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const reader = new window.FileReader()
      reader.onload = handleReaderLoaded
      reader.readAsBinaryString(selectedFile)
    }
    setUploadedFile(selectedFile || null)
  }

  const getDisabledStyle = (disabled) => (disabled ? { cursor: 'not-allowed', opacity: 0.4 } : { cursor: 'pointer' })

  const renderUploadModule = (disabled) => (
    <>
      <div>
        <label style={getDisabledStyle(disabled)} htmlFor='upload-button'>
          <UploadIcon />
        </label>
        <input
          type='file'
          id='upload-button'
          disabled={disabled}
          style={{ display: 'none' }}
          accept='.png'
          onChange={(e) => onFileChange(e)}
        />
      </div>
    </>
  )

  const renderUploadBox = (name) => {
    const error = errors[name]
    return (
      <>
        <div className='d-flex'>
          <div className='uploadBox' style={getDisabledStyle(data.logoUrl)}>
            {!binaryFile && <div className='d-flex align-items-center'>{renderUploadModule(data.logoUrl)}</div>}
            {binaryFile && <img src={`data:image/png;base64,${binaryFile}`} height='60' width='60' alt='data' />}
            <div className='uplod-info d-none'>
              {binaryFile && (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const newErrors = { ...errors }
                    delete newErrors.icon
                    setBinaryFile(null)
                    setUploadedFile(null)
                    setErrors(newErrors)
                  }}
                >
                  <FaRegTimesCircle className='text-dark' />
                </span>
              )}
            </div>
          </div>
        </div>
        {error && <small className='text-danger'>{error}</small>}
      </>
    )
  }

  const renderInput = (name, disabled, placeholder, isURLInput = false) => {
    const value = data[name]
    const error = errors[name]
    return (
      <div className='form-group mb-4'>
        <label>{publishDocFormEnum.LABELS[name]}</label>
        <input
          type='text'
          placeholder={placeholder}
          disabled={disabled}
          className='form-control'
          name={name}
          value={value}
          onChange={(e) => handleChange(e, isURLInput)}
          onBlur={(e) => handleBlur(e, isURLInput)}
        />
        {name === 'domain' && (
          <span className='domain-info fs-4 mt-1 d-block text-danger'>
            {`Point c name of the above domain to ${MAPPING_DOMAIN}`}
            <a className='ml-1' href='https://techdoc.walkover.in/p/White-Labelling?collectionId=2Uv_sfKTLPI3'>
              Learn More
            </a>
          </span>
        )}
        {name === 'title' && (
          <span className='domain-info fs-4 mt-1 d-block'>Collection name will be used by default when no title is entered.</span>
        )}
        {error && <small className='alert alert-danger'>{error}</small>}
      </div>
    )
  }

  const getSelectedCollection = () => {
    const collectionId = props.selected_collection_id
    return { ...collections[collectionId] }
  }

  const isCollectionPublished = (selectedCollection) => selectedCollection?.isPublic || false

  const redirectUser = () => {
    setOpenPublishSidebar(true)
    dispatch(publishData(true))
  }

  const openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const renderPublicUrl = () => {
    const collectionId = props.selected_collection_id
    const isCollectionPublished = collections[collectionId]?.isPublic
    const url = process.env.REACT_APP_PUBLIC_UI_URL + '/p?collectionId=' + collectionId
    const isDisabled = IsParentPagePublishedInACollection(collections[collectionId]?.rootParentId)

    if (!isCollectionPublished) return null

    return (
      <div>
        <div className='published-post d-flex align-items-center mt-4 mb-1'>
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
            <span onClick={() => isDisabled && openExternalLink(url)}>{url}</span>
            <button className='copy-button-link ml-2 border-0 bg-white' onClick={() => copyToClipboard(url)} title='Copy URL'>
              <FiCopy size={13} />
            </button>
          </div>
        </OverlayTrigger>
      </div>
    )
  }

  const IsParentPagePublishedInACollection = (rootParentId) => {
    const childs = pages?.[rootParentId]?.child
    if (childs?.length > 0) {
      for (const child of childs) {
        if (pages[child]?.isPublished === true) {
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
    this.props.navigate(`/orgs/${this.props.params.orgId}/dashboard/collection/${collectionId}/feedback`)
  }

  const openPublishSidebars = () => <>{isPublishSliderOpen && <PublishSidebar {...props} closePublishSidebar={closePublishSidebar} />}</>

  const closePublishSidebar = () => {
    setOpenPublishSidebar(false)
    dispatch(publishData(false))
  }

  const renderActionButtons = (publishCheck) => {
    const selectedCollection = getSelectedCollection()
    const isNotPublished = !isCollectionPublished(selectedCollection)
    const rootParentId = collections[props.selected_collection_id]?.rootParentId
    const disableCondition = pages[rootParentId]?.child?.length > 0

    return (
      <div className='mt-2'>
        <Button
          disabled={!disableCondition}
          id='publish_collection_btn'
          variant='btn btn-outline'
          className='m-1 btn-sm fs-4'
          onClick={redirectUser}
          title='This will publish all the pages and endpoints inside this collection.'
        >
          Bulk Publish
        </Button>
        <Button
          className={loader ? 'buttonLoader m-1 btn-sm fs-4' : 'm-1 btn-sm fs-4'}
          disabled={!data.title.trim()}
          onClick={() => {
            saveAndPublishCollection(selectedCollection)
          }}
          variant='btn btn-outline'
          title='This will save as well as publish the doc'
        >
          {republishNeeded ? 'Save and Republish' : 'Save and Publish'}
        </Button>
        {!isNotPublished && (
          <Button
            variant='btn btn-outline-danger btn-sm fs-4'
            className='m-1 btn-sm fs-4'
            onClick={() => {
              props.unPublishCollection()
              setRepublishNeeded(false)
            }}
          >
            Unpublish Doc
          </Button>
        )}
      </div>
    )
  }

  const publishCheck = (props.isSidebar || props.onTab) && props.isCollectionPublished()

  return (
    <>
      <div className='d-flex justify-content-center'>
        <div className={props.onTab && 'publish-on-tab'}>
          <div className='d-flex justify-content-between align-item-center'>
            <div className='d-flex align-items-center'>
              <h3 className='page-title mb-0'>Publish Collection Settings</h3>
            </div>
            <span
              className='hover'
              onClick={handleSeeFeedbacks}
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <IoInformationCircleOutline style={{ color: 'inherit', marginRight: '1px', fontSize: '20px' }} />
              <span style={{ fontSize: '16px' }}>Feedbacks</span>
            </span>
          </div>
          <span className='mt-2 d-inline-block'>Completing this step will make your collection available at a public URL.</span>

          {publishCheck && renderPublicUrl()}
          <div className='small-input mt-2'>
            {renderInput('title', false, 'brand name', false)}
            {renderInput('domain', false, 'docs.example.com', false)}
          </div>
          <div className='d-flex favicon mb-4'>
            <div className='form-group mb-0'>
              <label>Fav Icon</label>
              <div className='favicon-uploader'>{renderUploadBox('icon')}</div>
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
            {renderInput('logoUrl', false, false, binaryFile, '')}
          </div>

          <div className='color-picker'>{renderColorPicker()}</div>
          {renderActionButtons(publishCheck)}
        </div>
      </div>
      {openPublishSidebar && openPublishSidebars()}
    </>
  )
}

export default PublishDocForm
