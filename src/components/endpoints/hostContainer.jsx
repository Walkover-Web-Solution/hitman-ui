import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { isDashboardRoute } from '../common/utility';
import tabStatusTypes from '../tabs/tabStatusTypes';
import tabService from '../tabs/tabService';
import _, { cloneDeep } from 'lodash';
import { getParseCurlData } from '../common/apiUtility';
import URI from 'urijs';
import { toast } from 'react-toastify';
import { contentTypesEnums } from '../common/bodyTypeEnums';
import './endpoints.scss';

const hostContainerEnum = {
  hosts: {
    environmentHost: { key: 'environmentHost', label: 'Environment Host' }
  }
}

const HostContainer = (props) => {

  const [datalistHost, setDatalistHost] = useState(props?.endpointContent?.host?.BASE_URL);
  const [datalistUri, setDatalistUri] = useState('');
  const [environmentHost, setEnvironmentHost] = useState('');
  const [selectedHost, setSelectedHost] = useState('');
  const [showDatalist, setShowDatalist] = useState(false);
  const [showInputHost, setShowInputHost] = useState(true);

  const tabs = useSelector((state) => state.tabs)

  const wrapperRef = useRef(null);

  const handleClickOutside = (event) => {
    if ((showDatalist || showInputHost) && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      document.removeEventListener('mousedown', handleClickOutside);
      setShowDatalist(false);
      setShowInputHost(false);
    }
  };

  useEffect(() => {
    setHosts();
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [environmentHost]);

  useEffect(() => {
    setHosts();
  }, [props.environmentHost]);

  useEffect(() => {
    setDatalistUri(props.updatedUri);
  }, [props.updatedUri]);

  useEffect(() => {
    setDatalistHost(props?.endpointContent?.host?.BASE_URL);
  }, [props?.endpointContent?.host?.BASE_URL]);

  useEffect(() => {
    if (showDatalist !== undefined) {
      props.props_from_parent('HostAndUri')
      setParentHostAndUri()
    }
  }, [datalistHost, datalistUri, selectedHost, showDatalist])

  useEffect(() => {
    if (showDatalist) {
      document.addEventListener('mousedown', handleClickOutside)
    }
  }, [showDatalist])

  const setHostAndUri = () => {
    const endpointUri = props?.updatedUri || '';
    const topPriorityHost = customFindTopPriorityHost();
    const selectedHost = topPriorityHost;
    const host = props?.endpointContent?.host?.BASE_URL || environmentHost || datalistHost || '';
    setDatalistUri(endpointUri);
    setDatalistHost(host);
    setSelectedHost(selectedHost);
    setParentHostAndUri();
  };

  const setParentHostAndUri = () => {
    props.set_host_uri(datalistHost, datalistUri, selectedHost);
  };

  const customFindTopPriorityHost = () => {
    if (environmentHost) return 'environmentHost';
    return '';
  };

  const fetchPublicEndpointHost = () => {
    props.set_base_url(datalistHost);
    return null;
  };

  const getDataFromParsedData = (untitledEndpointData, parsedData) => {
    let e = {};
    e['url'] = parsedData.raw_url;
    parsedData = cloneDeep(parsedData);
    untitledEndpointData = cloneDeep(untitledEndpointData);
    untitledEndpointData.data.name = props.endpointContent?.data?.name || 'Untitled';
    untitledEndpointData.currentView = props.endpointContent?.currentView || 'testing';
    let data = splitUrlHelper(e);
    untitledEndpointData.data.method = parsedData?.method.toUpperCase();
    untitledEndpointData.data.uri = data?.datalistUri;
    untitledEndpointData.data.updatedUri = data?.datalistUri;
    untitledEndpointData.host = {
      BASE_URL: data?.datalistHost,
      selectedHost: ''
    };

    if (parsedData.auth_type === 'basic') {
      untitledEndpointData.authorizationData.authorizationTypeSelected = `${parsedData.auth_type}Auth`;
    } else {
      untitledEndpointData.authorizationData.authorizationTypeSelected = parsedData.auth_type;
    }
    untitledEndpointData.authorizationData.authorization = parsedData.auth;

    let path = new URI(parsedData.raw_url);
    let queryParams = path.query(true);
    path = path.pathname();
    const pathVariableKeys = path
      .split('/')
      .filter((part) => part.startsWith(':'))
      .map((key) => key.slice(1));
    for (let i = 0; i < pathVariableKeys.length; i++) {
      let eachData = {
        checked: 'true',
        value: '',
        description: '',
        key: pathVariableKeys[i]
      };
      untitledEndpointData.pathVariables.push(eachData);
    }

    if (parsedData?.data) {
      try {
        parsedData.data = JSON.parse(parsedData.data);
      } catch (e) {}
      const contentType = (parsedData.headers?.['Content-Type'] || parsedData.headers?.['content-type'])?.toLowerCase();
      if (contentType.includes('application/json')) {
        untitledEndpointData.data.body.type = contentTypesEnums[contentType];
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType];
        untitledEndpointData.data.body.raw.value = typeof (parsedData.data) === 'object' ? JSON.stringify(parsedData.data) : parsedData.data;
        untitledEndpointData.bodyDescription = {
          payload: {
            value: {},
            type: 'object',
            description: ''
          }
        };
        for (let key in parsedData.data) {
          untitledEndpointData.bodyDescription.payload.value[key] = {
            value: parsedData.data[key],
            type: 'string',
            description: ''
          };
        }
      } else if (contentType && contentTypesEnums[contentType]) {
        untitledEndpointData.data.body.type = contentTypesEnums[contentType];
        untitledEndpointData.data.body.raw.rawType = contentTypesEnums[contentType];
        untitledEndpointData.data.body.raw.value = typeof parsedData.data === 'object' ? JSON.stringify(parsedData.data) : parsedData.data;
      } else {
        if (!parsedData.headers) {
          parsedData.headers = {};
        }
        parsedData.headers['Content-Type'] = !parsedData.headers?.['Content-Type']
          ? parsedData.headers?.['content-type']
          : parsedData.headers?.['Content-Type'];
        let bodyType = (untitledEndpointData.data.body.type = !parsedData.headers?.['Content-Type']
          ? 'multipart/form-data'
          : parsedData.headers?.['Content-Type'] || 'application/x-www-form-urlencoded');

        let keyValuePairs = parsedData.data.split('&');
        let keys = [];
        let values = [];
        keyValuePairs.forEach((pair) => {
          let [key, value] = pair.split('=');
          keys.push(key);
          values.push(value);
        });
        for (let key in values) {
          let eachData = {
            checked: 'true',
            key: keys[key],
            value: values[key],
            description: '',
            type: 'text'
          };
          untitledEndpointData.data.body[bodyType].push(eachData);
        }
        untitledEndpointData.data.body[bodyType].push(...untitledEndpointData.data.body[bodyType].splice(0, 1));
      }
    }

    for (let key in parsedData?.headers) {
      let eachDataOriginal = {
        checked: 'true',
        value: parsedData.headers[key],
        description: '',
        key: key
      };
      untitledEndpointData.originalHeaders.push(eachDataOriginal);
    }
    untitledEndpointData.originalHeaders.push(...untitledEndpointData.originalHeaders.splice(0, 1));

    for (let key in queryParams) {
      let eachDataOriginal = {
        checked: 'true',
        value: queryParams[key],
        description: '',
        key: key
      };
      untitledEndpointData.originalParams.push(eachDataOriginal);
    }
    untitledEndpointData.originalParams.push(...untitledEndpointData.originalParams.splice(0, 1));

    props.setQueryUpdatedData(untitledEndpointData);
    tabService.markTabAsModified(tabs.activeTabId);
  };

  const handleInputHostChange = async (e) => {
    let inputValue = e.target.value;
    if (inputValue.trim().startsWith('curl')) {
      try {
        let modifiedCurlCommand = inputValue;
        if (modifiedCurlCommand.includes('--url')) {
          modifiedCurlCommand = modifiedCurlCommand.replace('--url', ' ');
        }
        let parsedData = await getParseCurlData(modifiedCurlCommand);
        parsedData = JSON.parse(parsedData.data);
        parsedData.url = parsedData.url.replace(/^http:\/\/\s/, '');
        parsedData.url = parsedData.url.replace(/^(http:\/\/https?:\/\/)/, '$2');
        parsedData.raw_url = parsedData.raw_url.replace(/^http:\/\/\s/, '');
        parsedData.raw_url = parsedData.raw_url.replace(/^(http:\/\/https?:\/\/)/, '$2');
        getDataFromParsedData(props.untitledEndpointData, parsedData);
        return;
      } catch (e) {
        toast.error('could not parse the curl');
      }
    }
    const data = splitUrlHelper(e);

    setDatalistHost(data.datalistHost);
    setDatalistUri(data.datalistUri);
    setSelectedHost(data.selectedHost);
    setShowDatalist(e.target.value === '')
  };



  const handleClickHostOptions = (host, type) => {
    setDatalistHost(host || props?.endpointContent?.host?.BASE_URL);
    setShowDatalist(false);
    setSelectedHost(type);
    setParentHostAndUri();
  };

  const checkExistingHosts = (value) => {
    const regex = /^((http[s]?|ftp):\/\/[\w.\-@:]*)/i;
    const variableRegex = /^{{[\w|-]+}}/i;
    if (value?.match(variableRegex)) {
      return value.match(variableRegex)[0];
    }
    if (environmentHost && value?.match(new RegExp('^' + environmentHost) + '/')) {
      return environmentHost;
    }
    if (value?.match(regex)) {
      return value.match(regex)[0];
    }
    return null;
  };

  const splitUrlHelper = (e) => {
    const value = e?.target?.value?.trim() || e?.url?.trim() || '';
    const hostName = checkExistingHosts(value);
    let uri = '';
    const data = {
      datalistHost: '',
      datalistUri: '',
      selectedHost: '',
      Flag: true
    };
    if (hostName) {
      const selectedHost = selectCurrentHost(hostName);
      data.datalistHost = hostName;
      data.selectedHost = selectedHost;
      uri = value.replace(hostName, '');
    } else {
      uri = value;
    }
    data.datalistUri = uri;
    return data;
  };

  const selectCurrentHost = (hostname) => {
    if (hostname === environmentHost) return 'environmentHost';
    return 'environmentHost';
  };

  const setHosts = () => {
    setEnvironmentHost(props.environmentHost);
  };

  const renderHostDatalist = () => {
    const endpointId = props.endpointId;
    return (
      <div className='url-container' key={`${endpointId}_hosts`} ref={wrapperRef}>
        <input
          id='host-container-input'
          className='form-control'
          value={(datalistHost ?? '') + (datalistUri ?? '') ?? ''}
          name={`${endpointId}_hosts`}
          placeholder='Enter URL or paste cURL'
          onChange={(e) => handleInputHostChange(e)}
          autoComplete='off'
          onFocus={() => {
            setShowDatalist(true)
            document.addEventListener('mousedown', handleClickOutside)
          }}
        />
        <div className={['host-data', showDatalist ? 'd-block' : 'd-none'].join(' ')}>
          {Object.values(hostContainerEnum.hosts).map(
            (host, index) =>
              environmentHost && (
                <div key={index} className='host-data-item' onClick={() => handleClickHostOptions(environmentHost, host.key)}>
                  <div>{environmentHost}</div>
                  <small className='text-muted font-italic'>{host.label}</small>
                </div>
              )
          )}
        </div>
      </div>
    );
  };

  const renderPublicHost = () => {
    return (
      <input
        disabled
        className='form-control'
        value={(props?.endpointContent?.host?.BASE_URL ?? '') + (props?.endpointContent?.data?.updatedUri ?? '') ?? ''}
      />
    );
  };

  if (isDashboardRoute(props) && selectedHost && props.tab.status === tabStatusTypes.DELETED) {
    setSelectedHost(null);
  }

  return isDashboardRoute(props) ? renderHostDatalist() : renderPublicHost();
};

export default HostContainer;
