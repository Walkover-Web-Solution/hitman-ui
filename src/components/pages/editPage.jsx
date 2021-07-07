import React, { Component } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import store from '../../store/store'
// import { markTabAsModified } from '../tabs/tabService'
import WarningModal from '../common/warningModal'
import { updatePage } from '../pages/redux/pagesActions'
import './page.scss'
import { toast } from 'react-toastify'
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
      dispatch(updatePage(ownProps.history, editedPage, pageId))
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
    const { pages } = store.getState()
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

      this.setState({ data, originalData: data })
    }
  }

  async componentDidMount () {
    let data = {}
    if (this.props.location.page) {
      const {
        id,
        versionId,
        groupId,
        name,
        contents
      } = this.props.location.page

      data = { id, versionId, groupId, name, contents }

      this.setState({ data, originalData: data })
    } else {
      const pageId = this.props.location.pathname.split('/')[5]
      this.fetchPage(pageId)
      store.subscribe(() => {
        this.fetchPage(pageId)
      })
    }
  }

  handleChange = (value) => {
    const data = { ...this.state.data }
    data.contents = value
    this.setState({ data })
  };

  handleNameChange = (e) => {
    const data = { ...this.state.data }
    data.name = e.currentTarget.value
    this.setState({ data })
  };

  handleSubmit = (e) => {
    e.preventDefault()
    const groupId = this.state.data.groupId
    if (groupId === null) {
      const editedPage = { ...this.state.data }
      if (editedPage.name.trim() === '') {
        toast.error('Page name cannot be empty.')
      } else {
        this.props.update_page(editedPage, editedPage.id)
        this.props.history.push({
          pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${editedPage.id}`
        })
      }
    } else {
      const editedPage = { ...this.state.data }
      if (editedPage.name.trim() === '') {
        toast.error('Page name cannot be empty.')
      } else {
        this.props.update_page(editedPage, editedPage.id)
        this.props.history.push({
          pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${editedPage.id}`
        })
      }
    }
  };

  handleCancel () {
    const pageId = this.props.match.params.pageId
    if (pageId) {
      // Redirect to displayPage Route Component
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
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(connect(null, mapDispatchToProps)(EditPage))
