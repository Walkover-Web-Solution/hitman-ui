import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import tabService from './tabService'
import { useQueryClient } from 'react-query'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()
    return <WrappedComponent {...props} queryClient={queryClient} />
  }
}
class SavePromptModal extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async handleSave() {
    debugger
    const { tabs, activeTabId } = this.props.tabs
    const tab = tabs[activeTabId]
    switch (tab.type) {
      case 'page':
        await this.props.handle_save_page(true, this.props.tab_id)
        break
      case 'endpoint':
        await this.props.handle_save_endpoint(true, this.props.tab_id)
        break
      case 'history':
        await this.props.handle_save_endpoint(true, this.props.tab_id)
        break
      default:
        break
    }
    this.props.onConfirm(this.props.tab_id)
    const endpointStatus = this.props.tabs.tabs[this.props.tab_id].status
    if (endpointStatus !== 'NEW') {
      tabService.removeTab(this.props.tab_id, { ...this.props })
    } else {
      tabService.selectTab({ ...this.props }, this.props.tab_id)
    }
  }

  handleDontSave() {
    tabService.removeTab(this.props.tab_id, { ...this.props })
    this.props.onConfirm(this.props.tab_id)
    if (this.props?.pages?.[this.props?.tab_id]?.type === 3 || this.props?.pages?.[this.props?.tab_id]?.type === 1) {
      return this.props?.queryClient?.removeQueries(['pageContent', this.props?.tab_id])
    } else {
      return this.props?.queryClient?.removeQueries(['endpoint', this.props?.tab_id])
    }
  }

  getTabName(tabId) {
    const tab = this.props.tabs.tabs[tabId]
    let name = ''
    if (!tab) return
    switch (tab.type) {
      case 'history':
        name = this.props.historySnapshots[tabId]?.endpoint?.name || tab.state.data?.name || 'Random Trigger'
        break
      case 'endpoint':
        if (tab.status === 'SAVED') name = this.props.endpoints[tabId]?.name || ''
        else name = tab.state.data?.name || 'Untitled'
        break
      case 'page':
        name = this.props.pages[tabId]?.name || ''
        break
      default:
        name = ''
    }
    return name
  }

  render() {
    const tabId = this.props.tab_id
    return (
      <Modal show onHide={this.props.onHide} animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>DO YOU WANT TO SAVE?</Modal.Title>
        </Modal.Header>
        <Modal.Body id='custom-delete-modal-body'>
          <div>
            <p>
              {' '}
              This tab <strong>{this.getTabName(tabId)}</strong> has unsaved changes which will be lost if you choose to close it. Save
              these changes to avoid losing your work.
            </p>
          </div>
          <div className='text-left mt-4 mb-2'>
            <button id='custom-delete-modal-delete' className='btn btn-primary btn-lg' onClick={() => this.handleSave()}>
              Save
            </button>

            <button id='custom-delete-modal-cancel' className='btn btn-danger btn-lg ml-2' onClick={() => this.handleDontSave()}>
              Don't Save
            </button>

            <button id='custom-delete-modal-cancel' className='btn btn-secondary outline btn-lg ml-2' onClick={this.props.onHide}>
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default withQuery(SavePromptModal)
