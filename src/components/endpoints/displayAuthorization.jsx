import React, { useState } from 'react'
import Auth2Configurations from './authConfiguration/auth2Configurations';
import { useParams } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { cloneDeep } from 'lodash';
import { authorizationTypes, addAuthorizationDataTypes } from '../common/authorizationEnums';
import './endpoints.scss'

const options = {
  refetchOnWindowFocus: false,
  cacheTime: 5000000,
  enabled: true,
  staleTime: Infinity,
  retry: 3
}

export default function Authorization(props) {

  const { activeTabId, tokenDetails } = useSelector((state) => {
    return {
      activeTabId: state.tabs.activeTabId,
      tokenDetails: state.tokenData.tokenDetails || {}
    }
  })

  const params = useParams();

  const queryClient = useQueryClient()

  const endpointId = params.endpointId !== 'new' ? params.endpointId : activeTabId;
  const queryKey = ['endpoint', endpointId];

  const { data: endpointStoredData } = useQuery(queryKey, options);

  const [selectedAuthorizationType, setSelectedAuthorizationType] = useState(authorizationTypes[endpointStoredData?.authorizationData?.authorizationTypeSelected] || authorizationTypes.noAuth)
  const [addAuthorizationDataToForAuth2, setAddAuthorizationDataToForAuth2] = useState(addAuthorizationDataTypes[endpointStoredData?.authorizationData?.authorization?.oauth2?.addAuthorizationRequestTo] || addAuthorizationDataTypes.select)
  const [basicAuthData, setBasicAuthData] = useState({ username: endpointStoredData?.authorizationData?.authorization?.basicAuth?.username || '', password: endpointStoredData?.authorizationData?.authorization?.basicAuth?.password || '' })
  const [showPassword, setShowPassword] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState(endpointStoredData?.authorizationData?.authorization?.oauth2?.selectedTokenId || null);
  const [selectedTokenValue, setSelectedTokenValue] = useState(tokenDetails?.[selectedTokenId]?.accessToken || '');

  function handleChange(e) {
    setBasicAuthData((prev) => { return { ...prev, [e.target.name]: e.target.value } })
    if (e.target.name === 'username') {
      props.set_authoriztaion_type('basicAuth', { username: e.target.value, password: basicAuthData.password })
      generateEncodedValue(e.target.value, basicAuthData.password)
    } else if (e.target.name === 'password') {
      props.set_authoriztaion_type('basicAuth', { username: basicAuthData.password, password: e.target.value })
      generateEncodedValue(basicAuthData.username, e.target.value)
    }
  }

  function generateEncodedValue(username, password) {
    const value = { username, password }
    props.set_authoriztaion_type('basicAuth', value)
    const encodedValue = btoa(`${username}:${password}`)
    props.set_authorization_headers(encodedValue, 'Authorization.basicAuth')
  }

  const handleSelectAuthorizationType = (key) => {
    const endpointStoredData = params.endpointId !== 'new' ? queryClient.getQueryData(queryKey) : JSON.parse(localStorage.getItem(activeTabId)) || {};
    const dataToSave = cloneDeep(endpointStoredData);
    if (dataToSave?.authorizationData) {
      dataToSave.authorizationData.authorizationTypeSelected = key;
    }
    else {
      dataToSave.authorizationData = { authorization: {}, authorizationTypeSelected: key }
    }
    queryClient.setQueryData(queryKey, dataToSave, options);
    if (params.endpointId === 'new') localStorage.setItem(activeTabId, JSON.stringify(dataToSave));
    setSelectedAuthorizationType(authorizationTypes[key]);
  }

  const handleAddAuthorizationTo = (key) => {
    const endpointStoredData = params.endpointId !== 'new' ? queryClient.getQueryData(queryKey) : JSON.parse(localStorage.getItem(activeTabId)) || {};
    let dataToSave = cloneDeep(endpointStoredData);
    if (dataToSave?.authorizationData?.authorization?.oauth2) {
      dataToSave.authorizationData.authorization.oauth2 = { ...dataToSave?.authorizationData?.authorization?.oauth2, addAuthorizationRequestTo: key }
    }
    else {
      dataToSave.authorizationData.authorization = { oauth2: {} }
      dataToSave.authorizationData.authorization.oauth2 = { ...dataToSave?.authorizationData?.authorization?.oauth2, addAuthorizationRequestTo: key }
    }
    if (params.endpointId === 'new') localStorage.setItem(activeTabId, JSON.stringify(dataToSave));
    if (addAuthorizationDataTypes[key] === addAuthorizationDataTypes.requestHeaders) {
      props.set_authorization_headers(selectedTokenValue, 'Authorization.oauth_2')
    }
    else if (addAuthorizationDataTypes[key] === addAuthorizationDataTypes.requestUrl) {
      props.set_authoriztaion_params(selectedTokenValue, 'access_token')
    }
    setAddAuthorizationDataToForAuth2(addAuthorizationDataTypes[key]);
  }

  function handleShowPassword() {
    setShowPassword(!showPassword)
  }

  const addAccessTokenInsideHeadersAndParams = (value, tokenIdToSave) => {
    if (addAuthorizationDataToForAuth2 === addAuthorizationDataTypes.requestHeaders) {
      props.set_authorization_headers(value, 'Authorization.oauth_2', null, tokenIdToSave)
    }
    else if (addAuthorizationDataToForAuth2 === addAuthorizationDataTypes.requestUrl) {
      props.set_authoriztaion_params(value, 'access_token', null, tokenIdToSave)
    }
  }

  return (
    <div className='authorization-panel'>
      <div className='authorization-selector-wrapper'>
        <div className='auth-selector-container'>
          <label>Type</label>
          <div className='dropdown'>
            <button
              className='btn dropdown-toggle outline-border'
              id='dropdownMenuButton'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              {selectedAuthorizationType}
            </button>
            <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
              {Object.keys(authorizationTypes).map((key, index) => (
                <button className='dropdown-item' onClick={() => handleSelectAuthorizationType(key)} key={index}>
                  {authorizationTypes[key]}
                </button>
              ))}
            </div>
          </div>
          <br />
          {selectedAuthorizationType === authorizationTypes.oauth2 && (
            <div>
              <label>Add authorization data to</label>
              <div className='dropdown'>
                <button className='btn dropdown-toggle outline-border' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                  {addAuthorizationDataToForAuth2}
                </button>
                <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                  {Object.keys(addAuthorizationDataTypes).map((key, index) => {
                    return (
                      <button key={index} onClick={() => handleAddAuthorizationTo(key)} className='dropdown-item'>
                        {addAuthorizationDataTypes[key]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedAuthorizationType === authorizationTypes.noAuth && (
        <div className='authorization-editor-wrapper'>
          <p> This request does not use any authorization.</p>
        </div>
      )}

      {selectedAuthorizationType === authorizationTypes.basicAuth && (
        <div className='authorization-editor-wrapper' id='authorization-form'>
          <form className='form-group'>
            <label className='mb-1'>Username</label>
            <input
              className='form-control'
              name='username'
              value={basicAuthData.username}
              onChange={handleChange}
            />
            <label htmlFor='password'>Password</label>
            <div className='d-flex flex-row align-items-center'>
              <input
                className='form-control'
                id='password'
                type={showPassword ? (showPassword === true ? null : 'password') : 'password'}
                name='password'
                value={basicAuthData.password}
                onChange={handleChange}
              />
              <label className='mb-3 ml-3'>
                <input className='mr-1' type='checkbox' onClick={handleShowPassword} />
                Show Password
              </label>
            </div>
          </form>
        </div>
      )}
      {selectedAuthorizationType === authorizationTypes.oauth2 &&
        <Auth2Configurations
          {...props}
          addAccessTokenInsideHeadersAndParams={addAccessTokenInsideHeadersAndParams}
          addAuthorizationDataToForAuth2={addAuthorizationDataToForAuth2}
          handleSaveEndpoint={props?.handleSaveEndpoint}
          setSelectedTokenId={setSelectedTokenId}
          setSelectedTokenValue={setSelectedTokenValue}
          selectedTokenValue={selectedTokenValue}
          selectedTokenId={selectedTokenId}
        />
      }
    </div>
  )
}
