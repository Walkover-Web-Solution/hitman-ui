import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  isDashboardRoute,
  getParentIds,
  getUrlPathById,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
  isOnPublishedPage
} from '../common/utility'
import { reorderEndpoint } from '../endpoints/redux/endpointsActions'
import ShareGroupForm from '../groups/shareGroupForm'
import './groups.scss'
import groupsService from './groupsService'
import filterService from '../../services/filterService'
import AddEntity from '../main/addEntity/addEntity'
import { ReactComponent as Plus } from '../../assets/icons/plus-square.svg'
import ExpandedIcon from '../../assets/icons/expand-arrow.svg'
import CombinedCollections from '../combinedCollections/combinedCollections.jsx'
import { addIsExpandedAction, updataForIsPublished } from '../../store/clientData/clientDataActions.js'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal.jsx'
import { deletePage } from '../pages/redux/pagesActions.js'
import SubPageForm from './subPageForm.jsx'
import editsign from '../../assets/icons/editsign.svg'
import deleteIcon from '../../assets/icons/delete-icon.svg'

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
    clientData: state.clientData,
    modals: state.modals
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    reorder_endpoint: (sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId) =>
      dispatch(reorderEndpoint(sourceEndpointIds, groupId, destinationEndpointIds, destinationGroupId, endpointId)),
    update_isExpand_for_subPages: (payload) => dispatch(addIsExpandedAction(payload)),
    setIsCheckForParenPage: (payload) => dispatch(updataForIsPublished(payload)),
    delete_page: (page) => dispatch(deletePage(page))
  }
}

class Groups extends Component {
  constructor(props) {
    super(props)
    this.state = {
      GroupFormName: '',
      selectedPage: {},
      showSubPageForm: {
        addPage: false,
        edit: false,
        share: false
      },
      theme: '',
      filter: '',
      checkboxChecked: false
    }
    this.eventkey = {}
    this.scrollRef = {}
  }

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({ theme: this.props.collections[this.props.collection_id].theme })
    }
  }

  openShareSubPageForm(groupId) {
    const showSubPageForm = { share: true, addPage: false }
    this.setState({
      showSubPageForm,
      groupFormName: 'Share Subpage',
      selectedGroup: { ...this.props.pages[groupId] }
    })
  }

  closeSubPageForm() {
    const edit = false
    const addPage = false
    const showSubPageForm = { edit, addPage }
    this.setState({ showSubPageForm })
  }

  showShareSubPageForm() {
    return (
      this.state.showSubPageForm.share && (
        <ShareGroupForm
          show={this.state.showSubPageForm.share}
          onHide={() => this.closeSubPageForm()}
          title={this.state.groupFormName}
          selectedGroup={this.props.rootParentId}
        />
      )
    )
  }

  showEditPageModal() {
    return (
      this.state.showSubPageForm.edit && (
        <SubPageForm
          {...this.props}
          title='Rename'
          show={this.state.showSubPageForm.edit}
          onCancel={() => {
            this.setState({ showSubPageForm: false })
          }}
          onHide={() => {
            this.setState({ showSubPageForm: false })
          }}
          selectedPage={this.props?.rootParentId}
          pageType={3}
        />
      )
    )
  }

  openEditSubPageForm(selectedGroup) {
    const showSubPageForm = { edit: true }
    this.setState({
      showSubPageForm,
      selectedGroup
    })
  }

  openDeleteSubPageModal(groupId) {
    this.setState({
      showDeleteModal: true,
      selectedGroup: {
        ...this.props.pages[groupId]
      }
    })
  }

  closeDeleteGroupModal() {
    this.setState({ showDeleteModal: false })
  }
  openAddSubPageModal(groupId) {
    this.setState({
      showAddCollectionModal: true,
      selectedPage: {
        ...this.props.pages[groupId]
      }
    })
  }

  showAddPageEndpointModal() {
    return (
      this.state.showAddCollectionModal && (
        <DefaultViewModal
          {...this.props}
          title='Add Sub Page'
          show={this.state.showAddCollectionModal}
          onCancel={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          onHide={() => {
            this.setState({ showAddCollectionModal: false })
          }}
          selectedPage={this.props?.rootParentId}
          pageType={3}
        />
      )
    )
  }


  handleCheckboxChange = () => {
    this.props.setIsCheckForParenPage({
      id: this.props?.rootParentId,
      isChecked: !this.props?.clientData?.[this?.props?.rootParentId]?.checkedForPublished
    })
  }

  renderBody(subPageId) {
    const expanded = this.props.clientData?.[this.props.rootParentId]?.isExpanded ?? isOnPublishedPage()
    const isSelected = isOnPublishedPage() && sessionStorage.getItem('currentPublishIdToShow') === subPageId ? 'selected' : ''
    return (
      <>
        {/* for publish side barrrr */}
        {this.props.isPublishData && this.props.modals.publishData ? (
          <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
            <button
              tabIndex={-1}
              ref={(newRef) => {
                this.scrollRef[subPageId] = newRef
              }}
              className={expanded ? 'expanded' : ''}
            >
              <div className='d-flex align-items-center cl-name'>
                {/* <span className='versionChovron'>
                    <img src={ExpandedIcon} alt='' />
                  </span> */}
                <input
                  type='checkbox'
                  checked={this.props?.clientData?.[this.props?.rootParentId]?.checkedForPublished || false}
                  onChange={this.handleCheckboxChange}
                />
                <div className='sidebar-accordion-item d-inline text-truncate'>{this.props.pages[subPageId]?.name}</div>
              </div>
            </button>
            {expanded ? (
              <div className='linkWrapper versionPages'>
                <Card.Body>
                  <CombinedCollections
                    {...this.props}
                  />
                </Card.Body>
              </div>
            ) : null}
            {/* </Card> */}
          </div>
        ) : (
          <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
            <button
              tabIndex={-1}
              ref={(newRef) => {
                this.scrollRef[subPageId] = newRef
              }}
              className={`${expanded ? 'expanded' : ''} ${isSelected}`}
            >
              <div className='d-flex align-items-center cl-name' onClick={() => this.toggleSubPageIds(subPageId)}>
                <span className='versionChovron'>
                  <img src={ExpandedIcon} alt='' />
                </span>
                <div className='sidebar-accordion-item d-inline text-truncate'>{this.props.pages[subPageId]?.name}</div>
              </div>
              {
                // [info] options not to show on publihsed page
                isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
                  <div className='sidebar-item-action d-flex align-items-center'>
                    <div onClick={() => this.openAddSubPageModal(subPageId)} className='mr-1 d-flex align-items-center'>
                      <Plus />
                    </div>
                    <div className='sidebar-item-action-btn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                      <i className='uil uil-ellipsis-v' />
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      <div className='dropdown-item' onClick={() => this.openEditSubPageForm(this.props.pages[subPageId])}>
                        <img src= {editsign} />{' '}
                        Rename
                      </div>
                      <div
                        className='dropdown-item'
                        onClick={() => {
                          this.openDeleteSubPageModal(subPageId)
                        }}
                      >
                        <img src= {deleteIcon} />{' '}
                        Delete
                      </div>
                      {/* <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.groups[subPageId])}>
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                          d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z'
                          stroke='#E98A36'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75'
                          stroke='#E98A36'
                          strokeWidth='1.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>{' '}
                      Duplicate
                    </div> */}
                      {/* <div className='dropdown-item' onClick={() => this.openShareSubPageForm(subPageId)}>
                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M13.5 6C14.7426 6 15.75 4.99264 15.75 3.75C15.75 2.50736 14.7426 1.5 13.5 1.5C12.2574 1.5 11.25 2.50736 11.25 3.75C11.25 4.99264 12.2574 6 13.5 6Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M4.5 11.25C5.74264 11.25 6.75 10.2426 6.75 9C6.75 7.75736 5.74264 6.75 4.5 6.75C3.25736 6.75 2.25 7.75736 2.25 9C2.25 10.2426 3.25736 11.25 4.5 11.25Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M13.5 16.5C14.7426 16.5 15.75 15.4926 15.75 14.25C15.75 13.0074 14.7426 12 13.5 12C12.2574 12 11.25 13.0074 11.25 14.25C11.25 15.4926 12.2574 16.5 13.5 16.5Z'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M6.4425 10.1323L11.565 13.1173'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M11.5575 4.88232L6.4425 7.86732'
                            stroke='#E98A36'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>{' '}
                        Share
                      </div> */}
                    </div>
                  </div>
                ) : null
              }
            </button>
            {expanded ? (
              <div className='linkWrapper versionPages'>
                <Card.Body>
                  <CombinedCollections
                    {...this.props}
                  />
                </Card.Body>
              </div>
            ) : null}
            {/* </Card> */}
          </div>
        )}
      </>
    )
  }

  toggleSubPageIds(id) {
    const isExpanded = this.props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    this.props.update_isExpand_for_subPages({
      value: !isExpanded,
      id: id
    })

    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/dashboard/page/${id}`
      })
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      let pathName = getUrlPathById(id, this.props.pages)
      pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
      this.props.history.push(pathName)
    }
  }

  render() {
    return (
      <>
        {this.showShareSubPageForm()}
        {this.showAddPageEndpointModal()}
        {this.showEditPageModal()}
        {this.state.showDeleteModal &&
          groupsService.showDeleteGroupModal(
            this.props,
            this.closeDeleteGroupModal.bind(this),
            'Delete Page',
            `Are you sure you wish to delete this page?
              All your pages and endpoints present in this page will be deleted.`,
            this.props?.pages[this.props?.rootParentId]
          )}

        {<div className='linkWith'>{this.renderBody(this.props?.rootParentId)}</div>}
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Groups))
