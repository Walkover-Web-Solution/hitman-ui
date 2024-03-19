import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import endpointApiService from './endpointApiService'
import './endpoints.scss'

const URI = require('urijs')

const grantTypes = {
  authorizationCode: 'Authorization Code',
  implicit: 'Implicit',
  passwordCredentials: 'Password Credentials',
  clientCredentials: 'Client Credentials'
}

const inputFields = {
  tokenName: 'Token Name',
  grantType: 'Grant Type',
  callbackUrl: 'Callback URL',
  authUrl: 'Auth URL',
  accessTokenUrl: 'Access Token URL',
  username: 'Username',
  password: 'Password',
  clientId: 'Client ID',
  clientSecret: 'Client Secret',
  scope: 'Scope',
  state: 'State',
  clientAuthentication: 'Client Authentication'
}

function TokenGenerator(props) {

  const [data, setData] = useState({
    tokenName: 'Token Name',
    selectedGrantType: grantTypes.authorizationCode,
    callbackUrl: '',
    authUrl: '',
    username: '',
    password: '',
    accessTokenUrl: '',
    client_id: '',
    clientSecret: '',
    scope: '',
    state: '',
    clientAuthentication: 'Send as Basic Auth header'
  })

  async function makeRequest() {
    const grantType = data.grantType
    let requestApi = ''
    const paramsObject = makeParams(grantType)
    const params = URI.buildQuery(paramsObject)
    if (grantType === 'implicit' || grantType === 'authorizationCode') {
      requestApi = data.authUrl + '?' + params
    }

    if (grantType === 'passwordCredentials' || grantType === 'clientCredentials') {
      delete paramsObject.grantType
      requestApi = data.accessTokenUrl
      if (grantType === 'passwordCredentials') {
        paramsObject.grant_type = 'password'
      } else if (grantType === 'clientCredentials') {
        paramsObject.grant_type = 'client_credentials'
      }
    }
    await endpointApiService.authorize(requestApi, paramsObject, grantType, props, data)
  }

  function makeParams(grantType) {
    const params = {}
    const data = { ...data }
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      switch (keys[i]) {
        case 'username':
          if (grantType === 'passwordCredentials') {
            params.username = data[keys[i]]
          }
          break
        case 'password':
          if (grantType === 'passwordCredentials') {
            params.password = data[keys[i]]
          }
          break
        case 'callbackUrl':
          if (grantType === 'implicit' || grantType === 'authorizationCode') {
            params.redirect_uri = data[keys[i]]
          }
          break
        case 'clientId':
          params.client_id = data[keys[i]]
          break
        case 'clientSecret':
          if (
            grantType === 'passwordCredentials' ||
            grantType === 'clientCredentials'
          ) {
            params.client_secret = data[keys[i]]
          }
          break
        case 'scope':
          params[keys[i]] = data[keys[i]]
          break
        case 'state':
          if (grantType === 'implicit' || grantType === 'authorizationCode') {
            params[keys[i]] = data[keys[i]]
          }
          break
        default:
          continue
      }
    }
    return params
  }

  function setClientAuthorization(e) {
    setData((prev) => { return { ...prev, clientAuthentication: e.currentTarget.value } })
  }

  function handleGrantTypeClick(key) {
    setData((prev) => { return { ...prev, selectedGrantType: grantTypes[key] } })
  }

  function handleInputFieldChange(e, key) {
    setData((prev) => { return { ...prev, [key]: e.target.value } })
  }

  function renderInput(key) {
    const grantType = data.grantType
    switch (key) {
      case 'grantType':
        return (
          <>
            <label className='basic-auth-label'>{inputFields[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {data.selectedGrantType}
              </button>
              <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                {Object.keys(grantTypes).map((key) => (
                  <button key={key} className='dropdown-item' onClick={() => handleGrantTypeClick(key)}>
                    {grantTypes[key]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      case 'clientAuthentication':
        return (
          <>
            <label className='basic-auth-label'>{inputFields[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {data.clientAuthentication}
              </button>
              <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                <button value='Send as Basic Auth header' className='dropdown-item' onClick={setClientAuthorization}>
                  Send as Basic Auth header
                </button>
                <button value='Send client credentials in body' className='dropdown-item' onClick={setClientAuthorization}>
                  Send client credentials in body
                </button>
              </div>
            </div>
          </>
        )
      case 'callbackUrl':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return fetchDefaultInputField(key)
        }
        break
      case 'authUrl':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return fetchDefaultInputField(key)
        }
        break
      case 'state':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return fetchDefaultInputField(key)
        }
        break
      case 'username':
        if (grantType === 'passwordCredentials') {
          return fetchDefaultInputField(key)
        }
        break
      case 'password':
        if (grantType === 'passwordCredentials') {
          return fetchDefaultInputField(key)
        }
        break
      case 'accessTokenUrl':
        if (grantType === 'implicit') {
          return
        }
        return fetchDefaultInputField(key)
      case 'clientSecret':
        if (grantType === 'implicit') {
          return
        }
        return fetchDefaultInputField(key)
      default:
        return fetchDefaultInputField(key)
    }
  }

  function showPassword() {
    if (showPassword && showPassword === true) {
    } else {
    }
  }

  function fetchDefaultInputField(key) {
    return (
      <>
        <label className='basic-auth-label'>{inputFields[key]}</label>
        <input
          id='input'
          type={key === 'password' ? (showPassword ? (showPassword === true ? null : 'password') : 'password') : null}
          className='token-generator-input-field'
          name={key}
          value={data[key]}
          onChange={(e) => handleInputFieldChange(e, key)}
        />
        {key === 'password' && (
          <label className='mb-0 ml-3'>
            <input className='mr-1' type='checkbox' />
            Show Password
          </label>
        )}
      </>
    )
  }

  return (
    <Modal id='modal-new-token-generator' size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered show={props?.show}>

      <Modal.Header className='custom-collection-modal-container'>
        <Modal.Title id='contained-modal-title-vcenter'>{props?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className='new-token-generator-modal-body'>

        {Object.keys(inputFields).map((key) => (
          <div key={key} className='input-field-wrapper'>{renderInput(key)}</div>
        ))}

        <div className='text-right'>
          <button className='btn btn-secondary outline btn-lg' onClick={props?.onHide}>Cancel</button>
          <button className='btn btn-primary btn-lg ml-2' type='button' onClick={() => makeRequest()}>Request Token</button>
        </div>

      </Modal.Body>
    </Modal>
  )
}

export default TokenGenerator
