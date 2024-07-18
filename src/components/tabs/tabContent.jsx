import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { Tab } from 'react-bootstrap';
import DisplayEndpoint from '../endpoints/displayEndpoint';
import DisplayPage from '../pages/displayPage';
import EditPage from '../pages/editPage';
import { getCurrentUser } from '../auth/authServiceV2';
import PublishDocsForm from './../publishDocs/publishDocsForm';
import { updateCollection } from '../collections/redux/collectionsActions';
import PublishDocsReview from './../publishDocs/publishDocsReview';
import { updateContent } from '../pages/redux/pagesActions';

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient();
    const deleteFromReactQueryByKey = (id) => {
      queryClient.removeQueries(['pageContent', id]);
    };
    return <WrappedComponent {...props} deleteFromReactQueryByKey={deleteFromReactQueryByKey} />;
  };
};

const TabContent = ({ handle_save_endpoint, handle_save_page, save_endpoint_flag, save_page_flag, selected_tab_id }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const location = useLocation();

  const { isTabsLoaded, tabData, history, pages, collections } = useSelector((state) => ({
    isTabsLoaded: state?.tabs?.loaded,
    tabsOrder: state?.tabs?.tabsOrder,
    activeTabId: state.tabs.activeTabId,
    tabData: state?.tabs?.tabs,
    history: state?.history,
    pages: state?.pages,
    collections: state?.collections,
  }));

  const deleteFromReactQueryByKey = (id) => {
    queryClient.removeQueries(['pageContent', id]);
  };

  const unPublishCollection = (collectionId) => {
    const selectedCollection = collections[collectionId];
    if (selectedCollection?.isPublic === true) {
      const editedCollection = { ...selectedCollection };
      editedCollection.isPublic = false;
      dispatch(updateCollection(editedCollection));
    }
  };

  const renderContent = (tabId) => {
    const tab = tabData?.[tabId];
    if (save_page_flag && tabId === selected_tab_id) {
      handle_save_page(false)
      updateContent({
        pageData: { id: tabId, contents: tab.draft, state: pages?.[tabId]?.state, name: pages?.[tabId]?.name },
        id: tabId,
      });
      deleteFromReactQueryByKey(tabId);
    }
    switch (tab?.type) {
      case 'history':
        return (
          <DisplayEndpoint
            handle_save_endpoint={handle_save_endpoint}
            save_endpoint_flag={save_endpoint_flag}
            selected_tab_id={selected_tab_id}
            environment={{}}
            tab={tab}
            historySnapshotFlag
            historySnapshot={history[tab.id]}
          />
        );
      case 'endpoint':
        return <DisplayEndpoint
          handle_save_endpoint={handle_save_endpoint}
          save_endpoint_flag={save_endpoint_flag}
          selected_tab_id={selected_tab_id}
          environment={{}} tab={tab} />;
      case 'page':
        if (window.location.pathname.includes('/edit')) return <EditPage
          handle_save_page={handle_save_page}
          save_page_flag={save_page_flag}
          tab={tab}
        />;

        else return <DisplayPage
          handle_save_endpoint={handle_save_endpoint}
          save_endpoint_flag={save_endpoint_flag}
          selected_tab_id={selected_tab_id}
          tab={tab} />;
      case 'collection':
        const loc = location.pathname.split('/')[6];
        if (loc === 'settings') {
          return (
            <PublishDocsForm
              isCollectionPublished={() => collections[tabId]?.isPublic || false}
              unPublishCollection={() => unPublishCollection(tabId)}
              selected_collection_id={tabId}
              onTab
            />
          );
        } else {
          return <PublishDocsReview />;
        }
      default:
        break;
    }
  };

  const renderEndpoint = () => {
    return <DisplayEndpoint
      handle_save_endpoint={handle_save_endpoint}
      save_endpoint_flag={save_endpoint_flag}
      selected_tab_id={selected_tab_id}
      environment={{}} tab='' />;
  };

  return (
    <Tab.Content>
      {getCurrentUser() && isTabsLoaded
        ? Object.keys(tabData).map((tabId) => (
          <Tab.Pane eventKey={tabId} key={tabId}>
            {renderContent(tabId)}
          </Tab.Pane>
        ))
        : renderEndpoint()}
    </Tab.Content>
  );
};

export default withQuery(TabContent);
