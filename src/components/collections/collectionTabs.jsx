import React, { useState } from 'react';
import PublishDocForm from '../publishDocs/publishDocsForm';
import CollectionRuns from './showRuns/collectionRuns';
import PublishDocsReview from '../publishDocs/publishDocsReview';

const CollectionTabs = ({ collectionId, onHide }) => {
  const [activeTab, setActiveTab] = useState('settings');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return <PublishDocForm collection_id={collectionId} show onHide={onHide} />;
      case 'feedback':
        return <PublishDocsReview selected_collection_id={collectionId} />;
      case 'runs':
        return <CollectionRuns collection_id={collectionId} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <ul className='nav nav-pills body-button'>
        <li className="nav-item cursor-pointer">
          <a className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</a>
        </li>
        <li className="nav-item cursor-pointer">
          <a className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</a>
        </li>
        <li className="nav-item cursor-pointer">
          <a className={`nav-link ${activeTab === 'runs' ? 'active' : ''}`} onClick={() => setActiveTab('runs')}>Runs</a>
        </li>
      </ul>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CollectionTabs;