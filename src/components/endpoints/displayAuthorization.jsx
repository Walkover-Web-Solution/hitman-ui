import React, { Component, useEffect, useState } from 'react'
import TokenGenerator from './newTokenGenerator'
import AccessTokenManager from './displayTokenManager';
import './endpoints.scss'
import Auth2Configurations from './authConfiguration/auth2Configurations';

const authorizationTypes = {
  noAuth: 'No Auth',
  basicAuth: 'Basic Auth',
  oauth_2: 'OAuth 2.0',
}

const addAuthorizationDataTypes = {
  select: 'Select',
  requestHeaders: 'Request Headers',
  requestUrl: 'Request URL',
}

export default function Authorization() {

  const [selectedAuthorizationType, setSelectedAuthorizationType] = useState(authorizationTypes.noAuth)
  const [addAuthorizationDataToForAuth2, setAddAuthorizationDataToForAuth2] = useState(addAuthorizationDataTypes.select)

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
  }, [])

  function receiveMessage(event) {
    if (event.data) console.log(event.data)
  }

  function handleChange(e) {
    // const basicAuth = { ...basicAuth }
    // if (e.currentTarget.name === 'username') {
    //   basicAuth.username = e.currentTarget.value
    //   this.generateEncodedValue(e.currentTarget.value, basicAuth.password)
    // } else if (e.currentTarget.name === 'password') {
    //   basicAuth.password = e.currentTarget.value
    //   this.generateEncodedValue(basicAuth.username, e.currentTarget.value)
    // }
    // this.setState({ basicAuth })
  }

  function generateEncodedValue(username, password) {
    const value = {
      username,
      password
    }
    // set_authoriztaion_type('basicAuth', value)
    // const encodedValue = Buffer.from(username + ':' + password).toString('base64')
    // // const encodedValue = new Buffer(username + ':' + password).toString(
    // //   'base64'
    // // )
    // set_authorization_headers(encodedValue, 'Authorization.basicAuth')
  }

  function getNewAccessTokenModal() {

  }

  function closeGetNewAccessTokenModal() {
  }

  function openManageTokenModel() {
  }

  async function closeManageTokenModel() {

  }

  function selectAccessToken(index) {

  }

  function updateAccessToken(e) {

  }

  function showPassword() {

  }


  return (
    <div className='authorization-panel'>
      {/* {getNewAccessToken === true && (
        
      )} */}
      {/* {openManageTokenModel === true && (
        <AccessTokenManager
          {...this.props}
          authResponses={this.authResponses}
          show
          onHide={() => this.closeManageTokenModel()}
          title='MANAGE ACCESS TOKENS'
          set_access_token={this.setAccessToken.bind(this)}
          set_auth_responses={this.setAuthResponses.bind(this)}
          accessToken={oauth_2.accessToken}
        />
      )} */}
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
                <button className='dropdown-item' onClick={() => setSelectedAuthorizationType(authorizationTypes[key])} key={index}>
                  {authorizationTypes[key]}
                </button>
              ))}
            </div>
          </div>
          <br />
          {selectedAuthorizationType === authorizationTypes.oauth_2 && (
            <div>
              <label>Add authorization data to</label>
              <div className='dropdown'>
                <button
                  className='btn dropdown-toggle outline-border'
                  id='dropdownMenuButton'
                  data-toggle='dropdown'
                  aria-haspopup='true'
                  aria-expanded='false'
                >
                  {addAuthorizationDataToForAuth2}
                </button>
                <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                  <button onClick={() => setAddAuthorizationDataToForAuth2(addAuthorizationDataTypes.requestHeaders)} className='dropdown-item' >
                    {addAuthorizationDataTypes.requestHeaders}
                  </button>
                  <button onClick={() => setAddAuthorizationDataToForAuth2(addAuthorizationDataTypes.requestUrl)} className='dropdown-item' >
                    {addAuthorizationDataTypes.requestUrl}
                  </button>
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
              // value={basicAuth.username}
              onChange={handleChange}
            />
            <label htmlFor='password'>Password</label>
            <div className='d-flex flex-row align-items-center'>
              <input
                className='form-control'
                id='password'
                type={showPassword ? (showPassword === true ? null : 'password') : 'password'}
                name='password'
                // value={basicAuth.password}
                onChange={handleChange}
              />
              <label className='mb-3 ml-3'>
                <input className='mr-1' type='checkbox' onClick={() => showPassword()} />
                Show Password
              </label>
            </div>
          </form>
        </div>
      )}
      {selectedAuthorizationType === authorizationTypes.oauth_2 && <Auth2Configurations />}
    </div>
  )
}
