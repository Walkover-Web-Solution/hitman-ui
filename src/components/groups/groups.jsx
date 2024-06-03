import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  isDashboardRoute,
  getUrlPathById,
  isTechdocOwnDomain,
  SESSION_STORAGE_KEY,
  isOnPublishedPage
} from '../common/utility'
import ShareGroupForm from '../groups/shareGroupForm'
import './groups.scss'
import groupsService from './groupsService'
import CombinedCollections from '../combinedCollections/combinedCollections.jsx'
import { addIsExpandedAction, updataForIsPublished } from '../../store/clientData/clientDataActions.js'
import DefaultViewModal from '../collections/defaultViewModal/defaultViewModal.jsx'
import { deletePage } from '../pages/redux/pagesActions.js'
import SubPageForm from './subPageForm.jsx'
import { ReactComponent as EditSign } from '../../assets/icons/editsign.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { MdExpandMore } from "react-icons/md"
import  IconButtons  from '../common/iconButton'
import { FiPlus } from "react-icons/fi"
import { BsThreeDots } from "react-icons/bs"
import { IoDocumentTextOutline } from "react-icons/io5"
import {  hexToRgb} from '../common/utility'
import {background} from '../backgroundColor.js'

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
    clientData: state.clientData,
    modals: state.modals
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
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
      checkboxChecked: false,
      optionalParams: false,
      isHovered: false,
      isHover: false,
      backgroundColor: ''
    }
    this.eventkey = {}
  }
  handleHover = (isHovered) => {
    this.setState({ isHovered });
  };
  handleHovers = (isHover) => {
    this.setState({ isHover });
  };

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({
        theme: this.props.collections[this.props.collection_id].theme
      })
    }
    fetch('/colors.json')
    .then(response => response.json())
    .then(data => {
      this.setState({ backgroundColor: data.backgroundColor });
    })
  }

  openShareSubPageForm(groupId) {
    this.setState({
      showSubPageForm: {share: true, addPage: false},
      groupFormName: 'Share Subpage',
      selectedGroup: { ...this.props.pages[groupId] }
    })
  }

  closeSubPageForm() {
    this.setState({ showSubPageForm : {edit: false, addPage: false} })
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
    this.setState({
      showSubPageForm :{edit: true},
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
    let isUserOnPublishedPage = isOnPublishedPage()
    let isuserONTechdocOwnDomain = isTechdocOwnDomain()
    const expanded = this.props.clientData?.[this.props.rootParentId]?.isExpanded ?? isUserOnPublishedPage
    const isSelected = (isUserOnPublishedPage && isuserONTechdocOwnDomain && sessionStorage.getItem('currentPublishIdToShow') === subPageId) ? 'selected' : (isDashboardRoute && this.props.match.params.pageId === subPageId ? 'selected' : '')
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || this.state.idToRenderState;
    let collectionId = this.props?.pages?.[idToRender]?.collectionId ?? null
    var collectionTheme = this.props.collections[collectionId]?.theme
    const dynamicColor = hexToRgb(collectionTheme, 0.15);
    const staticColor = background['background_hover'] ;

    const backgroundStyle = {
      backgroundImage: this.state.isHovered || isSelected
        ? `linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})`
        : ''
    };
    const dynamicColors = hexToRgb(collectionTheme, 0.30);
    const staticColors = background['background_hover'];

    const backgroundStyles = {
      backgroundImage: this.state.isHover
        ? `linear-gradient(to right, ${dynamicColors}, ${dynamicColors}),
        linear-gradient(to right, ${staticColors}, ${staticColors})`
        : ''
    };
    return (
      <>
        <div className='sidebar-accordion accordion pl-3' id='child-accordion'>
          <button tabIndex={-1} className={`${expanded ? 'expanded' : ''}`}>
          <div className={`active-selected d-flex justify-content-between align-items-center ${isSelected ? ' selected' : ''}`} style={backgroundStyle} onMouseEnter={() => this.handleHover(true)} onMouseLeave={() => this.handleHover(false)}>
            <div
              draggable={!isUserOnPublishedPage}
              onDragOver={this.props.handleOnDragOver}
              onDragStart={() => this.props.onDragStart(subPageId)}
              onDrop={(e) => this.props.onDrop(e, subPageId)}
              onDragEnter={(e) => this.props.onDragEnter(e, subPageId)}
              onDragEnd={(e) => this.props.onDragEnd(e)}
              style={this.props.draggingOverId === subPageId ? { border: '3px solid red' } : null}
              className={`d-flex justify-content-center cl-name name-sub-page ml-1`}
              onClick={(e) => {
                this.handleRedirect(subPageId)
                  if(!expanded){
                  this.handleToggle(e,subPageId)
                  }
              }}
            >
             <span className='versionChovron' onClick={(e) => this.handleToggle(e, subPageId)}>
              <MdExpandMore size={13} className='collection-icons-arrow d-none' style={backgroundStyles} onMouseEnter={() => this.handleHovers(true)}  onMouseLeave={() => this.handleHovers(false)}/>
                  <IoDocumentTextOutline size={13} className='collection-icons d-inline mb-1 ml-1 '/>
              </span>
              <div className='sidebar-accordion-item d-inline sub-page-header text-truncate'>{this.props.pages[subPageId]?.name}</div>
            </div>
            
            {
              // [info] options not to show on publihsed page
              isDashboardRoute(this.props, true) && !this.props.collections[this.props.collection_id]?.importedFromMarketPlace ? (
                <div className='sidebar-item-action d-flex align-items-center'>
                  <div onClick={() => this.openAddSubPageModal(subPageId)} className='d-flex align-items-center'>
                    <IconButtons><FiPlus /></IconButtons>
                  </div>
                  <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                  <IconButtons><BsThreeDots /></IconButtons>
                  </div>
                  <div className='dropdown-menu dropdown-menu-right'>
                    <div className='dropdown-item d-flex' onClick={() => this.openEditSubPageForm(this.props.pages[subPageId])}>
                      <EditSign /> Rename
                    </div>
                    <div
                      className='dropdown-item text-danger d-flex'
                      onClick={() => {
                        this.openDeleteSubPageModal(subPageId)
                      }}
                    >
                      <DeleteIcon /> Delete
                    </div>
                  </div>
                </div>
              ) : null
            }
            </div>
          </button>
          {expanded ? (
            <div className='linkWrapper versionPages'>
              <Card.Body>
                <CombinedCollections {...this.props} />
              </Card.Body>
            </div>
          ) : null}
        </div>
      </>
    )
  }
  handleRedirect(id){
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

  handleToggle(e,id) {
    e.stopPropagation();
    const isExpanded = this.props?.clientData?.[id]?.isExpanded ?? isOnPublishedPage()
    this.props.update_isExpand_for_subPages({
      value: !isExpanded,
      id: id
    })
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
