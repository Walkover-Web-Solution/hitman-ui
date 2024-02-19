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
import {ReactComponent as EditSign} from '../../assets/icons/editsign.svg'
import {ReactComponent as DeleteIcon} from '../../assets/icons/delete-icon.svg'
// import {ReactComponent as Duplicate} from '../../assets/icons/duplicateSign.svg'
// import {ReactComponent as ShareIcon} from '../../assets/icons/sharesign.svg'

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
                  <CombinedCollections {...this.props} />
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
                        <EditSign/>{' '}
                        Rename
                      </div>
                      <div
                        className='dropdown-item'
                        onClick={() => {
                          this.openDeleteSubPageModal(subPageId)
                        }}
                      >
                        <DeleteIcon/> {' '}
                        Delete
                      </div>
                      {/* <div className='dropdown-item' onClick={() => this.handleDuplicate(this.props.groups[subPageId])}>
                      <Duplicate/> {' '}
                      Duplicate
                    </div> */}
                      {/* <div className='dropdown-item' onClick={() => this.openShareSubPageForm(subPageId)}>
                        <ShareIcon/> {' '}
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
                  <CombinedCollections {...this.props} />
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
