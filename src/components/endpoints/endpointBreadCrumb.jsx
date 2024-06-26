import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './endpointBreadCrumb.scss';
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg';
import { getOnlyUrlPathById, isElectron, trimString } from '../common/utility';
import { onPageUpdated, updateNameOfPages } from '../pages/redux/pagesActions';
import { MdHttp } from 'react-icons/md';
import { GrGraphQl } from 'react-icons/gr';
import { updateTab } from '../tabs/redux/tabsActions';

const protocols = [
  { type: 'HTTP', icon: <MdHttp color='green' size={16} /> },
  { type: 'GraphQL', icon: <GrGraphQl color='rgb(170, 51, 106)' size={14} /> }
];

const EndpointBreadCrumbV2 = (props) => {
  const nameInputRef = useRef();
  const dispatch = useDispatch();

  const [state, setState] = useState({
    nameEditable: false,
    endpointTitle: '',
    previousTitle: '',
    isPagePublished: false,
  });

  // alternate to mapStatestoprops
  const { collections, pages, tabState, activeTabId, history, match, location } = useSelector((state) => ({
    collections: state.collections,
    pages: state.pages,
    tabState: state.tabs.tabs,
    activeTabId: state.tabs.activeTabId,
    history: state.history,
    match: state.match,
    location: state.location,
  }));

  useEffect(() => {
    if (props?.isEndpoint) {
      const endpointId = match?.params.endpointId;
      if (pages?.[endpointId]) {
        setState({
          endpointTitle: pages[endpointId]?.name || '',
          isPagePublished: pages[endpointId]?.isPublished || false,
          previousTitle: pages[endpointId]?.name || ''
        });
      } else {
        setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        });
      }
    } else {
      const pageId = match?.params.pageId;
      if (pages?.[pageId]) {
        setState({
          endpointTitle: pages[pageId]?.name || '',
          isPagePublished: pages[pageId]?.isPublished || false,
          previousTitle: pages[pageId]?.name || ''
        });
      } else {
        setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        });
      }
    }

    if (isElectron()) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.on('ENDPOINT_SHORTCUTS_CHANNEL', handleShortcuts);
    }

    return () => {
      if (isElectron()) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.removeListener('ENDPOINT_SHORTCUTS_CHANNEL', handleShortcuts);
      }
    };
  }, [props?.isEndpoint, match?.params.endpointId, match?.params.pageId, pages]);

  useEffect(() => {
    if (props?.isEndpoint) {
      const endpointId = match?.params.endpointId;
      if (pages?.[endpointId]) {
        setState({
          endpointTitle: pages[endpointId]?.name || '',
          isPagePublished: pages[endpointId]?.isPublished || false,
          previousTitle: pages[endpointId]?.name || ''
        });
      } else {
        setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        });
      }
    } else {
      const pageId = match?.params.pageId;
      if (pages?.[pageId]) {
        setState({
          endpointTitle: pages[pageId]?.name || '',
          isPagePublished: pages[pageId]?.isPublished || false,
          previousTitle: pages[pageId]?.name || ''
        });
      } else {
        setState({
          endpointTitle: 'Untitled',
          isPagePublished: false,
          previousTitle: 'Untitled'
        });
      }
    }
  }, [props?.isEndpoint, match?.params.endpointId, match?.params.pageId, pages]);

  const handleShortcuts = (e, actionType) => {
    if (actionType === 'RENAME_ENDPOINT') {
      setState({ nameEditable: true }, () => {
        nameInputRef.current.focus();
      });
    }
  };

  const changeEndpointName = () => {
    const endpoint = props.endpoint;
    if (endpoint && !endpoint.id && this.props.data.name === '') {
      props.alterEndpointName('Untitled')
      setState((prevState) => ({ ...prevState, endpointTitle: 'Untitled', previousTitle: 'Untitled' }))
    }
  }

  const handleInputChange = (e) => {
    if (props?.isEndpoint) {
      const tempData = props?.endpointContent || {};
      tempData.data.name = e.currentTarget.value;
      props.setQueryUpdatedData(tempData);
      dispatch(updateNameOfPages({ id: props?.match?.params.endpointId, name: e.currentTarget.value }));
    }
  };

  const handleInputBlur = () => {
    setState((prevState) => ({ ...prevState, nameEditable: false }));
    if (props?.match?.params?.endpointId !== 'new' && trimString(props?.endpointContent?.data?.name)?.length === 0) {
      const tempData = props?.endpointContent || {};
      tempData.data.name = pages?.[props?.match?.params.endpointId]?.name;
      props.setQueryUpdatedData(tempData);
    } else if (props?.match?.params.endpointId === 'new' && !props?.endpointContent?.data?.name) {
      const tempData = props?.endpointContent || {};
      tempData.data.name = 'Untitled';
      props.setQueryUpdatedData(tempData);
    }
  };


  const handleProtocolTypeClick = (index) => {
    props.setQueryUpdatedData({ ...props?.endpointContent, protocolType: index + 1 });
    dispatch(updateTab(props?.match?.params.endpointId === 'new' && activeTabId, { isModified: true }));
  };

  const renderLeftAngle = (title) => {
    return title && <span className='ml-1 mr-1'>/</span>;
  };

  const switchProtocolTypeDropdown = () => {
    return (
      <div className='dropdown'>
        <button
          className='protocol-selected-type mr-2'
          id='dropdownMenuButton'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          {protocols[(props?.endpointContent?.protocolType - 1)]?.icon}
        </button>
        <div className='dropdown-menu protocol-dropdown' aria-labelledby='dropdownMenuButton'>
          {protocols.map((protocolDetails, index) => (
            <button className='dropdown-item' key={index} onClick={() => handleProtocolTypeClick(index)}>
              {protocolDetails.icon}
              <span className='protocol-type-text'>{protocolDetails.type}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const setEndpointData = () => {
    const endpointId = match?.params.endpointId;
    const collectionId = pages[endpointId]?.collectionId;
    const collectionName = collectionId ? collections[collectionId]?.name : null;
    return { endpointId, collectionId, collectionName };
  };

  const setPageData = () => {
    const pageId = match?.params.pageId;
    const collectionId = pages[pageId]?.collectionId;
    const collectionName = collectionId ? collections[collectionId]?.name : null;
    return { pageId, collectionId, collectionName };
  };

  const { endpointId, collectionId, collectionName } = props?.isEndpoint ? setEndpointData() : setPageData();


  return (
    <div className='endpoint-header'>
      <div className='panel-endpoint-name-container'>
        <div className='page-title-name d-flex align-items-center'>
          {props?.match?.params.endpointId === 'new' && switchProtocolTypeDropdown()}
          {(props?.match?.params.endpointId !== 'new' && props?.endpointContent?.protocolType === 1 && protocols?.[0]?.icon) &&
            <button className='protocol-selected-type cursor-text mr-2'>{protocols?.[0]?.icon}</button>}
          {(props?.match?.params.endpointId !== 'new' && props?.endpointContent?.protocolType === 2 && protocols?.[1]?.icon) &&
            <button className='protocol-selected-type cursor-text mr-2'>{protocols?.[1]?.icon}</button>}
          <input
            name='enpoint-title'
            ref={nameInputRef}
            style={{ textTransform: 'capitalize' }}
            className={['page-title mb-0', !state.nameEditable ? 'd-block' : ''].join(' ')}
            onChange={handleInputChange}
            value={props?.isEndpoint
              ? props?.pages?.[props?.match?.params.endpointId]?.name ||
              props?.history?.[props?.match?.params?.historyId]?.endpoint?.name ||
              props?.endpointContent?.data?.name
              : props?.pages?.[props?.match?.params?.pageId]?.name}
            onBlur={handleInputBlur}
          />
        </div>
        {location?.pathname?.split('/')[5] !== 'new' && (
          <div className='d-flex bread-crumb-wrapper align-items-center text-nowrap'>
            {collectionName && <span className='collection-name-path'>{`${collectionName}/`}</span>}
            <span>
              {getOnlyUrlPathById(
                match?.params?.pageId || props?.match?.params.endpointId,
                pages,
                'internal'
              )}
            </span>
            {props.endpoints?.[props.currentEndpointId]?.isPublished && (
              <div className='api-label POST request-type-bgcolor ml-2'> Live </div>
            )}
            {pages?.[match?.params?.pageId]?.isPublished && (
              <div className='api-label POST request-type-bgcolor ml-2'> Live </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EndpointBreadCrumbV2;
