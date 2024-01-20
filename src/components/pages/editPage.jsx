import React, { Component } from 'react'
import { connect } from 'react-redux'
import { useMutation, useQueryClient } from 'react-query'
import { withRouter } from 'react-router-dom'
// import { markTabAsModified } from '../tabs/tabService'
import WarningModal from '../common/warningModal'
import { updateContent, updatePage, updatePageData } from '../pages/redux/pagesActions'
import './page.scss'
import { toast } from 'react-toastify'
import * as _ from 'lodash'
import { updateTab } from '../tabs/redux/tabsActions'
import tabService from '../tabs/tabService'
import Tiptap from '../tiptapEditor/tiptap'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()
    const pageId = props.match.params.pageId
    const orgId = props.match.params.orgId
    const pageContentData = queryClient.getQueryData(['pageContent', pageId])
    const mutation = useMutation(updateContent, {
      onSuccess: (data) => {
        queryClient.setQueryData(['pageContent', pageId], data?.contents || '')
        props.history.push(`/orgs/${orgId}/dashboard/page/${pageId}`)
      }
    })
    return <WrappedComponent {...props} pageContentData={pageContentData} mutationFn={mutation} />
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) => dispatch(updatePage(ownProps.history, editedPage, pageId)),
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
  constructor(props) {
    super(props)
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: '', contents: '', state: '' },
      showEditor: false
    }
    this.name = React.createRef()
    this.contents = React.createRef()
  }

  async fetchPage(pageId) {
    let data = {}
    const { pages } = this.props
    const page = pages[pageId]
    if (page) {
      const { id, versionId, groupId, name, contents, isPublished, state } = page
      data = {
        id,
        versionId,
        groupId,
        name,
        contents,
        isPublished,
        state
      }

      this.setState({ data, originalData: data, draftDataSet: true })
    }
  }

  async componentDidMount() {
    await this.setPageData()
    this.setState({ showEditor: true })
  }

  componentDidUpdate(prevProps, prevState) {
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

  async setPageData() {
    const {
      tab,
      pages,
      match: {
        params: { pageId }
      }
    } = this.props
    const { draftDataSet } = this.state

    if (tab && pageId) {
      if (tab.isModified && !draftDataSet) {
        await this.setState({ ...tab.state, draftDataSet: true })
      } else if (pageId !== 'new' && pages[tab.id] && !this.state.originalData?.id) {
        await this.fetchPage(tab.id)
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
  }

  setUnsavedTabDataInIDB() {
    if (this.props.tab.id === this.props.tabs.activeTabId) {
      clearTimeout(this.saveTimeOut)
      this.saveTimeOut = setTimeout(() => {
        this.props.update_tab(this.props.tab.id, { state: _.cloneDeep(this.state) })
      }, 1000)
    }
  }

  handleNameChange = (e) => {
    const data = { ...this.state.data }
    const newPageName = e.currentTarget.value
    if (newPageName !== this.state.originalData.name) {
      data.name = newPageName
      this.setState({ data }, () => {
        if (this.isModified()) {
          tabService.markTabAsModified(this.props.tab.id)
          this.setUnsavedTabDataInIDB()
        }
      })
    }
  }

  handleSubmit = (e) => {
    if (e) e.preventDefault()
    const editedPage = { ...this.state.data }
    if (editedPage.name.trim() === '') {
      toast.error('Page name cannot be empty.')
      return
    }
    delete editedPage['isPublished']
    this.props.mutationFn.mutate({ pageData: editedPage, id: editedPage.id })
    tabService.markTabAsSaved(this.props.tab.id)
  }

  handleCancel() {
    const pageId = this.props.match.params.pageId
    if (pageId) {
      // Redirect to displayPage Route Component
      tabService.unmarkTabAsModified(this.props.tab.id)
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${pageId}`
      })
    }
  }

  isModified() {
    const contents = this.state.data?.contents
    const originalContents = this.state.originalData?.contents
    if (
      typeof contents !== 'undefined' &&
      typeof originalContents !== 'undefined' &&
      this.state.data.contents !== this.state.originalData.contents
    ) {
      return true
    } else {
      return false
    }
  }

  renderTiptapEditor(item, index) {
    return (
      this.state.showEditor && (
        <Tiptap
          onChange={this.handleChange}
          initial={this.props?.pageContentData}
          match={this.props.match}
          isInlineEditor={false}
          disabled={false}
          minHeight
          key={index}
        />
      )
    )
  }

  renderEditPageOperations() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className='d-flex flex-row justify-content-end mb-2'>
            <button onSubmit={this.handleSubmit} type='submit' className='btn btn-primary btn-extra-lg mr-2 btn-width'>
              Save
            </button>
            <button
              onClick={() => {
                this.isModified() ? this.setState({ warningModalFlag: true }) : this.handleCancel()
              }}
              type='button'
              className='btn btn-secondary outline btn-extra-lg btn-width'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  render() {
    return (
      <div className='custom-edit-page page-display mt-3'>
        <WarningModal
          show={this.state.warningModalFlag}
          onHide={() => {
            this.setState({ warningModalFlag: false })
          }}
          ignoreButtonCallback={() => {
            this.handleCancel()
          }}
          message='Your unsaved changes will be lost.'
        />

        <div className='form-group'>
          <div className='d-flex justify-content-between align-items-center'>
            <label htmlFor='name'>Page Name</label>
            {this.renderEditPageOperations()}
          </div>
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

        <div>{this.renderTiptapEditor()}</div>
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(EditPage)))
