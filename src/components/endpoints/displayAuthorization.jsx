import React, { Component } from 'react'
import './endpoints.scss'
import TokenGenerator from './newTokenGenerator'
import AccessTokenManager from './displayTokenManager'

class Authorization extends Component {
  constructor (props) {
    super(props)
    this.state = {
      basicAuth: {
        username: '',
        password: ''
      },
      oauth_2: {
        authorizationAddedTo: 'Request Headers',
        accessToken: ''
      },
      authorizationType: 'noAuth'
    }

    this.authorizationTypes = {
      noAuth: 'No Auth',
      basicAuth: 'Basic Auth',
      oauth_2: 'OAuth 2.0'
    }
  }

  componentDidMount () {
    this.authResponses = []
  }

  componentDidUpdate () {
    this.fetchAuthorizationResponse()
  }

  fetchAuthorizationResponse () {
    if (
      this.authResponses.length === 0 &&
      Object.keys(this.props.versions).length !== 0 &&
      Object.keys(this.props.groups).length !== 0 &&
      this.props.groupId !== undefined &&
      this.props.groupId !== null
    ) {
      this.authResponses = this.props.versions[
        this.props.groups[this.props.groupId].versionId
      ]?.authorizationResponse
      if (this.authResponses === null) {
        this.authResponses = []
      }
    }
  }

  setAuthorizationType (type) {
    let value = {}
    switch (type) {
      case 'basicAuth':
        value = {
          username: '',
          password: ''
        }
        this.setState({ authorizationType: 'basicAuth' })
        this.props.set_authoriztaion_params(
          '',
          'access_token',
          'authorizationFlag'
        )
        this.props.set_authorization_headers('', 'Authorization.basicAuth')
        this.props.set_authoriztaion_type(type, value)
        break
      case 'noAuth':
        this.setState({ authorizationType: 'noAuth' })
        this.props.set_authoriztaion_params(
          '',
          'access_token',
          'authorizationFlag'
        )
        this.props.set_authorization_headers('noAuth', 'Authorization.noAuth')
        this.props.set_authoriztaion_type('', '')
        break
      case 'oauth_2':
        this.props.set_authoriztaion_type(type, value)
        value = this.state.oauth_2
        this.setState({ authorizationType: 'oauth_2' })
        if (this.state.oauth_2.accessToken !== '') {
          if (this.state.oauth_2.authorizationAddedTo === 'Request Headers') {
            this.props.set_authorization_headers(
              this.state.oauth_2.accessToken,
              'Authorization.oauth_2'
            )
          } else {
            this.props.set_authoriztaion_params(
              this.state.oauth_2.accessToken,
              'access_token'
            )
          }
        }
        break
      default:
        break
    }
  }

  handleChange (e) {
    const basicAuth = { ...this.state.basicAuth }
    if (e.currentTarget.name === 'username') {
      basicAuth.username = e.currentTarget.value
      this.generateEncodedValue(
        e.currentTarget.value,
        this.state.basicAuth.password
      )
    } else if (e.currentTarget.name === 'password') {
      basicAuth.password = e.currentTarget.value
      this.generateEncodedValue(
        this.state.basicAuth.username,
        e.currentTarget.value
      )
    }
    this.setState({ basicAuth })
  }

  generateEncodedValue (username, password) {
    const value = {
      username,
      password
    }
    this.props.set_authoriztaion_type('basicAuth', value)
    const encodedValue = Buffer.from(username + ':' + password).toString('base64')
    // const encodedValue = new Buffer(username + ':' + password).toString(
    //   'base64'
    // )
    this.props.set_authorization_headers(
      encodedValue,
      'Authorization.basicAuth'
    )
  }

  setAuthorizationAddedTo (key) {
    const oauth2 = { ...this.state.oauth_2 }
    oauth2.authorizationAddedTo = key
    this.setState({ oauth_2: oauth2 })
    if (this.state.oauth_2.accessToken !== '') {
      if (key === 'Request Headers') {
        this.props.set_authorization_headers(
          this.state.oauth_2.accessToken,
          'Authorization.oauth_2'
        )
        this.props.set_authoriztaion_params(
          '',
          'access_token',
          'authorizationFlag'
        )
        this.props.set_authoriztaion_type('oauth_2', oauth2)
      } else {
        this.props.set_authorization_headers(
          '',
          'Authorization',
          'authorizationFlag'
        )
        this.props.set_authoriztaion_params(
          this.state.oauth_2.accessToken,
          'access_token'
        )
        this.props.set_authoriztaion_type('oauth_2', oauth2)
      }
    }
  }

  getNewAccessTokenModal () {
    this.setState({ getNewAccessToken: true })
  }

  closeGetNewAccessTokenModal () {
    this.setState({ getNewAccessToken: false })
  }

  openManageTokenModel () {
    this.setState({ openManageTokenModel: true })
  }

  async closeManageTokenModel () {
    const versionId = this.props.groups[this.props.groupId].versionId
    this.props.set_authorization_responses(versionId, this.authResponses)
    if (this.props.location.pathname.split('/')[3] !== 'new') {
      const data = {
        type: 'oauth_2',
        value: this.state.oauth_2
      }
      this.props.set_authorization_type(
        this.props.location.pathname.split('/')[3],
        data
      )
    }
    this.setState({ openManageTokenModel: false })
  }

  selectAccessToken (index) {
    const oauth2 = this.state.oauth_2
    oauth2.accessToken = this.authResponses[index].access_token
    this.setState({ oauth_2: oauth2 })
    this.setHeadersandParams(
      this.authResponses[index].access_token,
      this.state.oauth_2.authorizationAddedTo
    )
  }

  setHeadersandParams (accessToken, authorizationAddedTo) {
    if (accessToken === '') {
      this.props.set_authoriztaion_params(
        '',
        'access_token',
        'authorizationFlag'
      )
      this.props.set_authorization_headers('noAuth', 'Authorization')
    } else {
      if (authorizationAddedTo === 'Request Headers') {
        this.props.set_authorization_headers(
          accessToken,
          'Authorization.oauth_2'
        )
        this.props.set_authoriztaion_params(
          '',
          'access_token',
          'authorizationFlag'
        )
      } else {
        this.props.set_authoriztaion_params(accessToken, 'access_token')
        this.props.set_authorization_headers('noAuth', 'Authorization')
      }
    }
  }

  setAccessToken (accessToken) {
    const oauth2 = { ...this.state.oauth_2 }
    oauth2.accessToken = accessToken
    this.setState({ oauth_2: oauth2 })
    this.setHeadersandParams(accessToken, oauth2.authorizationAddedTo)
  }

  setAuthResponses (authResponses) {
    this.authResponses = authResponses
    if (authResponses.length === 0) {
      const oauth2 = this.state.oauth_2
      oauth2.accessToken = ''
      this.setState({ oauth_2: oauth2 })
      this.closeManageTokenModel()
    }
  }

  updateAccessToken (e) {
    const accessToken = e.currentTarget.value
    const oauth2 = this.state.oauth_2
    oauth2.accessToken = accessToken
    this.setState({ oauth_2: oauth2 })
    this.setHeadersandParams(accessToken)
  }

  showPassword () {
    if (this.state.showPassword && this.state.showPassword === true) {
      this.setState({ showPassword: false })
    } else {
      this.setState({ showPassword: true })
    }
  }

  render () {
    if (this.props.authorizationType) {
      const authType = this.props.authorizationType.type
      if (authType !== this.state.authorizationType) {
        this.setState({
          authorizationType: authType
        })
        if (authType === 'basicAuth') {
          this.setState({ basicAuth: this.props.authorizationType.value })
        }
        if (authType === 'oauth_2') {
          this.setState({ oauth_2: this.props.authorizationType.value })
        }
        this.setHeadersandParams(
          this.props.authorizationType.value.accessToken,
          this.props.authorizationType.value.authorizationAddedTo
        )
      }
    }

    return (
      <div className='authorization-panel'>
        {this.state.getNewAccessToken === true && (
          <TokenGenerator
            {...this.props}
            oauth_2={this.state.oauth_2}
            groupId={this.props.groupId}
            show
            onHide={() => this.closeGetNewAccessTokenModal()}
            set_access_token={this.setAccessToken.bind(this)}
            title='GET NEW ACCESS TOKEN'
          />
        )}
        {this.state.openManageTokenModel === true && (
          <AccessTokenManager
            {...this.props}
            authResponses={this.authResponses}
            show
            onHide={() => this.closeManageTokenModel()}
            title='MANAGE ACCESS TOKENS'
            set_access_token={this.setAccessToken.bind(this)}
            set_auth_responses={this.setAuthResponses.bind(this)}
            accessToken={this.state.oauth_2.accessToken}
          />
        )}
        <div className='authorization-selector-wrapper'>
          <div className='auth-selector-container'>
            <label>Type</label>
            <div className='dropdown'>
              <button
                className='btn dropdown-toggle'
                id='dropdownMenuButton'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'
              >
                {this.state.authorizationType === 'noAuth'
                  ? this.authorizationTypes.noAuth
                  : this.authorizationTypes[this.state.authorizationType]}
              </button>
              <div
                className='dropdown-menu'
                aria-labelledby='dropdownMenuButton'
              >
                {Object.keys(this.authorizationTypes).map((key) => (
                  <button
                    className='dropdown-item'
                    onClick={() => this.setAuthorizationType(key)}
                    key={key}
                  >
                    {this.authorizationTypes[key]}
                  </button>
                ))}
              </div>
            </div>
            <br />
            {this.state.authorizationType === 'oauth_2' && (
              <div>
                <label>Add authorization data to</label>
                <div className='dropdown'>
                  <button
                    className='btn dropdown-toggle'
                    id='dropdownMenuButton'
                    data-toggle='dropdown'
                    aria-haspopup='true'
                    aria-expanded='false'
                  >
                    {this.state.oauth_2.authorizationAddedTo}
                  </button>
                  <div
                    className='dropdown-menu'
                    aria-labelledby='dropdownMenuButton'
                  >
                    <button
                      className='dropdown-item'
                      onClick={() =>
                        this.setAuthorizationAddedTo('Request Headers')}
                    >
                      Request Headers
                    </button>
                    <button
                      className='dropdown-item'
                      onClick={() =>
                        this.setAuthorizationAddedTo('Request URL')}
                    >
                      Request URL
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {this.state.authorizationType === 'noAuth' && (
          <div className='authorization-editor-wrapper'>
            <p>    This request does not use any authorization.</p>
          </div>
        )}

        {this.state.authorizationType === 'basicAuth' && (
          <div className='authorization-editor-wrapper'>
            <form>
              <div className='input-field-wrapper form-group'>
                <label>Username</label>
                <input
                  className='form-control'
                  name='username'
                  value={this.state.basicAuth.username}
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div className='input-field-wrapper form-group'>
                <label>Password</label>
                <input
                  className='form-control'
                  type={
                    this.state.showPassword
                      ? this.state.showPassword === true
                          ? null
                          : 'password'
                      : 'password'
                  }
                  name='password'
                  value={this.state.basicAuth.password}
                  onChange={this.handleChange.bind(this)}
                />
                <label className='mb-0 ml-3'>
                  <input
                    className='mr-1'
                    type='checkbox'
                    onClick={() => this.showPassword()}
                  />
                  Show Password
                </label>
              </div>
              {/* <div className="input-field-wrapper">
                <label>
                  <button
                    type="checkbox"
                    value={
                      this.state.showPassword
                        ? this.state.showPassword === true
                          ? true
                          : false
                        : false
                    }
                    onClick={() => this.showPassword()}
                  ></button>
                  Show Password
                </label>
              </div> */}
            </form>
          </div>
        )}
        {this.state.authorizationType === 'oauth_2' && (
          <div className='authorization-editor-wrapper'>
            <form>
              <div className='input-field-wrapper form-group'>
                <label className='basic-auth-label'>Access Token</label>
                <div className='basic-auth-input'>
                  <input
                    value={this.state.oauth_2.accessToken}
                    onChange={this.updateAccessToken.bind(this)}
                    name='accessToken'
                    className='form-control'
                  />
                  <div className='dropdown available-token-dropdown'>
                    <button
                      className='btn dropdown-toggle'
                      id='dropdownMenuButton'
                      data-toggle='dropdown'
                      aria-haspopup='true'
                      aria-expanded='false'
                    >
                      Availabale Tokens
                    </button>
                    <div
                      className='dropdown-menu available-token-dropdown-menu'
                      aria-labelledby='dropdownMenuButton'
                    >
                      {this.authResponses.map((response, index) => (
                        <button
                          key={index}
                          type='button'
                          className='dropdown-item'
                          onClick={() => this.selectAccessToken(index)}
                        >
                          {response.tokenName}
                        </button>
                      ))}
                      <button
                        type='button'
                        className='dropdown-item'
                        onClick={() =>
                          this.authResponses.length !== 0
                            ? this.openManageTokenModel()
                            : null}
                      >
                        {this.authResponses.length !== 0
                          ? 'Manage Tokens'
                          : 'No Tokens Available'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='input-field-wrapper'>
                <div className='basic-auth-label' />
                <div className='basic-auth-input'>
                  <button
                    className='btn btn-outline orange'
                    type='button'
                    onClick={() => this.getNewAccessTokenModal()}
                  >
                    Get New Access Token
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }
}

export default Authorization
