import React, { Component } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
// import { markTabAsModified } from '../tabs/tabService'
import WarningModal from '../common/warningModal'
import { updatePage } from '../pages/redux/pagesActions'
import './page.scss'
import { toast } from 'react-toastify'
import * as _ from 'lodash'
import { updateTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
const Link = Quill.import('formats/link')
const builtInFunc = Link.sanitize
Link.sanitize = function customSanitizeLinkInput (linkValueInput) {
  let val = linkValueInput
  if (/^\w+:/.test(val));
  else if (!/^https?:/.test(val)) val = 'https://' + val
  return builtInFunc.call(this, val)
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) =>
      dispatch(updatePage(ownProps.history, editedPage, pageId)),
    update_tab: (id, data) => dispatch(updateTab(id, data))
  }
}

const mapStateToProps = (state) => {
  return {
    tabs: state.tabs,
    pages: state.pages
  }
}

class EditPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '' }
    }
    this.name = React.createRef()
    this.contents = React.createRef()

    this.modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],

        [({ list: 'ordered' }, { list: 'bullet' })],
        ['link']
      ]
    }

    this.formats = [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'bullet',
      'link'
    ]
  }

  fetchPage (pageId) {
    let data = {}
    const { pages } = this.props
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents } = page
      data = {
        id,
        versionId,
        groupId,
        name,
        contents
      }

      this.setState({ data, originalData: data, draftDataSet: true })
    }
  }

  async componentDidMount () {
    this.setPageData()
  }

  componentDidUpdate (prevProps, prevState) {
    this.setPageData()
    const { save_page_flag: prevSavePageFlag } = prevProps
    const { save_page_flag: savePageFlag, tab, handle_save_page: handleSavePage } = this.props
    if (savePageFlag !== prevSavePageFlag) {
      if (savePageFlag) {
        this.handleSubmit()
        handleSavePage(false, tab.id)
      }
    }
  }

  setPageData () {
    const { tab, pages, match: { params: { pageId } } } = this.props
    const { draftDataSet } = this.state

    if (tab && pageId) {
      if (tab.isModified && !draftDataSet) {
        this.setState({ ...tab.state, draftDataSet: true })
      } else if (pageId !== 'new' && pages[tab.id] && !this.state.originalData?.id) {
        this.fetchPage(tab.id)
      }
    }
  }

  handleChange = (value) => {
    const data = { ...this.state.data }

    data.contents = value

    this.setState({ data }, () => {
      if (this.isModified()) {
        tabService.markTabAsModified(this.props.tab.id)
        this.setUnsavedTabDataInIDB()
      }
    })
  };

  setUnsavedTabDataInIDB () {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        this.props.update_tab(this.props.tab.id, { state: _.cloneDeep(this.state) })
      }, 1000)
    }
  }

  handleNameChange = (e) => {
    const data = { ...this.state.data }
    data.name = e.currentTarget.value
    this.setState({ data })
  };

  handleSubmit = (e) => {
    if (e) e.preventDefault()
    const editedPage = { ...this.state.data }
    if (editedPage.name.trim() === '') {
      toast.error('Page name cannot be empty.')
      return
    }
    this.props.update_page(editedPage, editedPage.id)
    tabService.markTabAsSaved(this.props.tab.id)
    this.props.history.push({
      pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${editedPage.id}`
    })
  };

  handleCancel () {
    const pageId = this.props.match.params.pageId
    if (pageId) {
      // Redirect to displayPage Route Component
      tabService.unmarkTabAsModified(this.props.tab.id)
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${pageId}`
      })
    }
  }

  isModified () {
    const contents = this.state.data?.contents
    const originalContents = this.state.originalData?.contents
    if (typeof contents !== 'undefined' && typeof originalContents !== 'undefined' && this.state.data.contents !== this.state.originalData.contents) {
      return true
    } else {
      return false
    }
  }

  render () {
    return (
      <div className='custom-edit-page'>
        <WarningModal
          show={this.state.warningModalFlag}
          onHide={() => { this.setState({ warningModalFlag: false }) }}
          ignoreButtonCallback={() => { this.handleCancel() }}
          message='Your unsaved changes will be lost.'
        />
        <div className='form-group'>
          <label htmlFor='name'>Page Name</label>
          <input
            name='name'
            id='name'
            value={this.state.data.name}
            onChange={this.handleNameChange}
            type='text'
            className='form-control'
            placeholder='Page Name'
          />
        </div>

        <div style={{ marginBottom: '50px' }}>
          <ReactQuill
            style={{ height: '600px' }}
            value={this.state.data.contents}
            modules={this.modules}
            formats={this.formats}
            onChange={this.handleChange}
          />
        </div>

        <div>
          <form onSubmit={this.handleSubmit}>
            <button
              onClick={() => { this.isModified() ? this.setState({ warningModalFlag: true }) : this.handleCancel() }}
              type='button'
              className='btn btn-secondary outline btn-extra-lg mt-4'
            >
              Cancel
            </button>
            <button
              onSubmit={this.handleSubmit}
              type='submit'
              className='btn btn-primary btn-extra-lg mt-4 ml-3'
            >
              Save
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EditPage))
