import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import endpointApiService from './endpointApiService'
import { useParams } from 'react-router'
import { useQueryClient } from 'react-query'
import './endpoints.scss'

const URI = require('urijs')

const grantTypes = {
  authorizationCode: 'Authorization Code',
  authorizationCodeWithPkce: 'Authorization Code (With PKCE)',
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
  codeMethod: 'Code Challenge Method',
  codeVerifier: 'Code Verifier',
  username: 'Username',
  password: 'Password',
  clientId: 'Client ID',
  clientSecret: 'Client Secret',
  scope: 'Scope',
  state: 'State',
  clientAuthentication: 'Client Authentication',
}

const codeMethodTypes = {
  sh256: 'sh-256',
  plain: 'Plain',
}

function TokenGenerator(props) {

  const params = useParams();

  const queryClient = useQueryClient()

  const queryKey = ['endpoint', params.endpointId];

  const endpointStoredData = queryClient.getQueryData(queryKey);

  const [data, setData] = useState({
    tokenName: endpointStoredData.oauth2.tokenName || 'Token Name',
    selectedGrantType: endpointStoredData.oauth2.selectedGrantType || grantTypes.authorizationCode,
    callbackUrl: endpointStoredData.oauth2.callbackUrl || '',
    authUrl: endpointStoredData.oauth2.authUrl || '',
    username: endpointStoredData.oauth2.username || '',
    password: endpointStoredData.oauth2.password || '',
    accessTokenUrl: endpointStoredData.oauth2.accessTokenUrl || '',
    clientId: endpointStoredData.oauth2.clientId || '',
    clientSecret: endpointStoredData.oauth2.clientSecret || '',
    scope: endpointStoredData.oauth2.scope || '',
    state: endpointStoredData.oauth2.state || '',
    clientAuthentication: endpointStoredData.oauth2.clientAuthentication || 'Send as Basic Auth header',
    codeMethod: endpointStoredData.oauth2.codeMethod || codeMethodTypes.sh256,
    codeVerifier: endpointStoredData.oauth2.codeVerifier || '',
  })

  async function makeRequest() {
    const grantType = data.grantType
    let requestApi = ''
    const paramsObject = makeParams(grantType)
    const params = URI.buildQuery(paramsObject)
    if (grantType === grantTypes.implicit || grantType === grantTypes.authorizationCode) {
      requestApi = data.authUrl + '?' + params
    }

    if (grantType === grantTypes.passwordCredentials || grantType === grantTypes.clientCredentials) {
      delete paramsObject.grantType
      requestApi = data.accessTokenUrl
      if (grantType === grantTypes.passwordCredentials) {
        paramsObject.grant_type = 'password'
      } else if (grantType === grantTypes.clientCredentials) {
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
          if (grantType === grantTypes.passwordCredentials) {
            params.username = data[keys[i]]
          }
          break
        case 'password':
          if (grantType === grantTypes.passwordCredentials) {
            params.password = data[keys[i]]
          }
          break
        case 'callbackUrl':
          if (grantType === grantTypes.implicit || grantType === grantTypes.authorizationCode) {
            params.redirect_uri = data[keys[i]]
          }
          break
        case 'clientId':
          params.client_id = data[keys[i]]
          break
        case 'clientSecret':
          if (
            grantType === grantTypes.passwordCredentials ||
            grantType === grantTypes.clientCredentials
          ) {
            params.client_secret = data[keys[i]]
          }
          break
        case 'scope':
          params[keys[i]] = data[keys[i]]
          break
        case 'state':
          if (grantType === grantTypes.implicit || grantType === grantTypes.authorizationCode) {
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
    setData((prev) => { return { ...prev, clientAuthentication: e.target.value } })
  }

  function handleGrantTypeClick(key) {
    setData((prev) => { return { ...prev, selectedGrantType: grantTypes[key] } })
  }

  function handleInputFieldChange(e, key) {
    setData((prev) => { return { ...prev, [key]: e.target.value } })
  }

  function handleInputFieldChange(e, key) {
    setData((prev) => { return { ...prev, [key]: e.target.value } })
  }

  function handleSaveConfiguration() {
    const endpointDataToSend = endpointStoredData;
    endpointDataToSend.oauth2 = data
    queryClient.setQueryData(queryKey, endpointDataToSend)
    props.handleSaveEndpoint(params.endpointId, endpointDataToSend)
  }

  function renderInput(key) {
    const grantType = data.selectedGrantType
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
        if (grantType === grantTypes.authorizationCode || grantType === grantTypes.implicit || grantType === grantTypes.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'authUrl':
        if (grantType === grantTypes.authorizationCode || grantType === grantTypes.implicit || grantType === grantTypes.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'codeMethod':
        if (grantType === grantTypes.authorizationCodeWithPkce) {
          return codeMethodInputField(key)
        }
        return null;
      case 'codeVerifier':
        if (grantType === grantTypes.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        return null;
      case 'state':
        if (grantType === grantTypes.authorizationCode || grantType === grantTypes.implicit || grantType === grantTypes.authorizationCodeWithPkce) {
          return fetchDefaultInputField(key)
        }
        break
      case 'username':
        if (grantType === grantTypes.passwordCredentials) {
          return fetchDefaultInputField(key)
        }
        break
      case 'password':
        if (grantType === grantTypes.passwordCredentials) {
          return fetchDefaultInputField(key)
        }
        break
      case 'accessTokenUrl':
        if (grantType === grantTypes.implicit) {
          return
        }
        return fetchDefaultInputField(key)
      case 'clientSecret':
        if (grantType === grantTypes.implicit) {
          return
        }
        return fetchDefaultInputField(key)
      default:
        return fetchDefaultInputField(key)
    }
  }

  function fetchDefaultInputField(key) {
    return (
      <>
        <label className='basic-auth-label'>{inputFields[key]}</label>
        <input
          id='input'
          className='token-generator-input-field'
          name={key}
          value={data[key]}
          onChange={(e) => handleInputFieldChange(e, key)}
        />
      </>
    )
  }

  function codeMethodInputField(key) {
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
            {data.codeMethod}
          </button>
          <div className='dropdown-menu new-token-generator-dropdown-menu' aria-labelledby='dropdownMenuButton'>
            {Object.keys(codeMethodTypes).map((key) => (
              <button key={key} className='dropdown-item' onClick={() => handleCodeMethodClick(codeMethodTypes[key])}>
                {codeMethodTypes[key]}
              </button>
            ))}
          </div>
        </div>
      </>
    )
  }

  const handleCodeMethodClick = (value) => {
    setData((prev) => { return { ...prev, codeMethod: value } })
  }

  return (
    <Modal onHide={props?.onHide} id='modal-new-token-generator' size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered show={props?.show}>

      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{props?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className='new-token-generator-modal-body'>

        {Object.keys(inputFields).map((key) => (
          <div key={key} className='input-field-wrapper'>{renderInput(key)}</div>
        ))}

        <div className='text-right'>
          <button className='btn btn-secondary outline btn-lg ml-2' onClick={handleSaveConfiguration}>Save</button>
          <button className='btn btn-primary btn-lg ml-2' type='button' onClick={() => makeRequest()}>Request Token</button>
        </div>

      </Modal.Body>
    </Modal>
  )
}

export default TokenGenerator
