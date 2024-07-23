import React from 'react';
import PublishDocForm from '../publishDocs/publishDocsForm';
import CollectionRuns from './showRuns/collectionRuns';
import PublishDocsReview from '../publishDocs/publishDocsReview';
import { useNavigate } from 'react-router-dom'
import { getOrgId } from '../common/utility'
import { useDispatch, useSelector } from 'react-redux'
import { setPageType } from '../tabs/redux/tabsActions'

const CollectionTabs = ({ collectionId, onHide }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeTabId, pageType } = useSelector((state) => {
    const activeTabId = state.tabs.activeTabId
    return {
      activeTabId,
      pageType: state.tabs.tabs[activeTabId].state.pageType
    }
  })

  const renderTabContent = () => {
    switch (pageType) {
      case 'SETTINGS':
        return <PublishDocForm selected_collection_id={collectionId} show onHide={onHide} />
      case 'FEEDBACK':
        return <PublishDocsReview selected_collection_id={collectionId} />
      case 'RUNS':
        return <CollectionRuns collection_id={collectionId} />
      default:
        return null
    }
  }

  const handleTabChange = (newPageType) => {
    dispatch(setPageType(activeTabId, newPageType))
  }

  return (
    <div>
      <ul className='nav nav-pills body-button'>
        <li className='nav-item cursor-pointer'>
          <a
            className={`nav-link ${pageType === 'SETTINGS' ? 'active' : ''}`}
            onClick={() => {
              navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/settings`)
              handleTabChange('SETTINGS')
            }}
          >
            Settings
          </a>
        </li>
        <li className='nav-item cursor-pointer'>
          <a
            className={`nav-link ${pageType === 'FEEDBACK' ? 'active' : ''}`}
            onClick={() => {
              navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/feedback`)
              handleTabChange('FEEDBACK')
            }}
          >
            Feedback
          </a>
        </li>
        <li className='nav-item cursor-pointer'>
          <a
            className={`nav-link ${pageType === 'RUNS' ? 'active' : ''}`}
            onClick={() => {
              navigate(`/orgs/${getOrgId()}/dashboard/collection/${collectionId}/runs`)
              handleTabChange('RUNS')
            }}
          >
            Runs
          </a>
        </li>
      </ul>
      <div className='tab-content'>{renderTabContent()}</div>
    </div>
  )
}

export default CollectionTabs
