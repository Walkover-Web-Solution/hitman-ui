import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import endpointApiService from './endpointApiService'
import indexedDbService from '../indexedDb/indexedDbService'
import './endpoints.scss'
const URI = require('urijs')

class TokenGenerator extends Component {
  state = {
    data: {
      tokenName: 'Token Name',
      grantType: 'authorizationCode',
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
    }
  };

  componentDidMount () {
    this.fetchAuthorizationData()
  }

  fetchAuthorizationData () {
    if (this.props.groupId) {
      const versionId = this.props.groups[this.props.groupId].versionId
      const data = this.props.versions[versionId].authorizationData
      if (data !== null && Object.keys(data).length !== 0) {
        this.setState({ data })
      }
    }
  }

  grantTypes = {
    authorizationCode: 'Authorization Code',
    implicit: 'Implicit',
    passwordCredentials: 'Password Credentials',
    clientCredentials: 'Client Credentials'
  };

  inputFields = {
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
  };

  setGrantType (key) {
    const data = this.state.data
    data.grantType = key
    this.setState({ data })
  }

  handleChange (e) {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.setState({ data })
  }

  async makeRequest () {
    const grantType = this.state.data.grantType
    let requestApi = ''
    const paramsObject = this.makeParams(grantType)
    const params = URI.buildQuery(paramsObject)
    if (grantType === 'implicit' || grantType === 'authorizationCode') {
      // if (grantType === "implicit")
      requestApi = this.state.data.authUrl + '?' + params
      //  + "&response_type=token";
      // else
      //   requestApi =
      //     this.state.data.authUrl + "?" + params + "&response_type=code";
    }

    if (
      grantType === 'passwordCredentials' ||
      grantType === 'clientCredentials'
    ) {
      delete paramsObject.grantType
      requestApi = this.state.data.accessTokenUrl
      if (grantType === 'passwordCredentials') {
        paramsObject.grant_type = 'password'
      } else if (grantType === 'clientCredentials') {
        paramsObject.grant_type = 'client_credentials'
      }
    }

    if (this.props.groupId) {
      await this.props.set_authorization_data(
        this.props.groups[this.props.groupId].versionId,
        this.state.data
      )
    }

    if (this.props.groupId) {
      // if (this.props.location.pathname.split("/")[3] !== "new") {
      const data = {
        type: 'oauth_2',
        value: this.props.oauth_2
      }
      await this.props.set_authorization_type(
        this.props.location.pathname.split('/')[3],
        data
      )
    }

    await indexedDbService.getDataBase()
    await indexedDbService.updateData(
      'authData',
      this.state.data,
      'currentAuthData'
    )

    await endpointApiService.authorize(
      requestApi,
      paramsObject,
      grantType,
      this.props,
      this.state.data
    )

    this.props.onHide()
  }

  makeParams (grantType) {
    const params = {}
    const data = { ...this.state.data }
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
            // ||
            // grantType === "authorizationCode"
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

  setClientAuthorization (e) {
    const data = this.state.data
    data.clientAuthentication = e.currentTarget.value
    this.setState({ data })
  }

  renderInput (key) {
    const grantType = this.state.data.grantType
    switch (key) {
      case 'grantType':
        return (
          <>
            <label className='basic-auth-label'>{this.inputFields[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {this.grantTypes[grantType]}
              </button>
              <div
                className='dropdown-menu new-token-generator-dropdown-menu'
                aria-labelledby='dropdownMenuButton'
              >
                {Object.keys(this.grantTypes).map((key) => (
                  <button
                    key={key}
                    onClick={() => this.setGrantType(key)}
                    className='dropdown-item'
                  >
                    {this.grantTypes[key]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      case 'clientAuthentication':
        return (
          <>
            <label className='basic-auth-label'>{this.inputFields[key]}</label>
            <div className='dropdown basic-auth-input'>
              <button
                className='btn dropdown-toggle new-token-generator-dropdown'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {this.state.data.clientAuthentication}
              </button>
              <div
                className='dropdown-menu new-token-generator-dropdown-menu'
                aria-labelledby='dropdownMenuButton'
              >
                <button
                  value='Send as Basic Auth header'
                  onClick={this.setClientAuthorization.bind(this)}
                  className='dropdown-item'
                >
                  Send as Basic Auth header
                </button>
                <button
                  value='Send client credentials in body'
                  onClick={this.setClientAuthorization.bind(this)}
                  className='dropdown-item'
                >
                  Send client credentials in body
                </button>
              </div>
            </div>
          </>
        )
      case 'callbackUrl':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return this.fetchDefaultInputField(key)
        }
        break
      case 'authUrl':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return this.fetchDefaultInputField(key)
        }
        break
      case 'state':
        if (grantType === 'authorizationCode' || grantType === 'implicit') {
          return this.fetchDefaultInputField(key)
        }
        break
      case 'username':
        if (grantType === 'passwordCredentials') {
          return this.fetchDefaultInputField(key)
        }
        break
      case 'password':
        if (grantType === 'passwordCredentials') {
          return this.fetchDefaultInputField(key)
        }
        break
      case 'accessTokenUrl':
        if (grantType === 'implicit') {
          return
        }
        return this.fetchDefaultInputField(key)
      case 'clientSecret':
        if (grantType === 'implicit') {
          return
        }
        return this.fetchDefaultInputField(key)
      default:
        return this.fetchDefaultInputField(key)
    }
  }

  showPassword () {
    if (this.state.showPassword && this.state.showPassword === true) {
      this.setState({ showPassword: false })
    } else {
      this.setState({ showPassword: true })
    }
  }

  fetchDefaultInputField (key) {
    return (
      <>
        <label className='basic-auth-label'>{this.inputFields[key]}</label>
        <input
          id='input'
          type={
            key === 'password'
              ? this.state.showPassword
                  ? this.state.showPassword === true
                      ? null
                      : 'password'
                  : 'password'
              : null
          }
          className='token-generator-input-field'
          name={key}
          value={this.state.data[key]}
          onChange={this.handleChange.bind(this)}
        />
        {key === 'password' && (
          <label className='mb-0 ml-3'>
            <input
              className='mr-1'
              type='checkbox'
              onClick={() => this.showPassword()}
            />
            Show Password
          </label>
        )}
      </>
    )
  }

  render () {
    return (
      <div>
        <Modal
          {...this.props}
          id='modal-new-token-generator'
          // id="modal-code-window"
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <Modal.Header
            className='custom-collection-modal-container'
            closeButton
          >
            <Modal.Title id='contained-modal-title-vcenter'>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className='new-token-generator-modal-body'>
            {Object.keys(this.inputFields).map((key) => (
              <div key={key} className='input-field-wrapper'>
                {this.renderInput(key)}
              </div>
            ))}
            <div className='text-right'>
              <button className='btn btn-secondary btn-lg' onClick={this.props.onHide}>
                Cancel
              </button>
              <button
                className='btn btn-primary btn-lg ml-2'
                type='button'
                onClick={() => this.makeRequest()}
              >
                Request Token
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default TokenGenerator
