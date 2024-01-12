// import axios from 'axios'
import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import './browserLogin.scss'
let token
class BrowserLogin extends Component {
  state = {}
  render() {
    return (
      <div className='main-browser-login'>
        <Switch>
          <Route
            exact
            path='/browser-login-success'
            render={(props) => {
              this.handleLoginSuccess(props)
              return this.renderSuccessPage()
            }}
          />
          <Route
            exact
            path='/browser-login'
            render={(props) => {
              this.handleRedirectToSso()
              return <div>You are being redirected to Socket SSO</div>
            }}
          />
        </Switch>
      </div>
    )
  }

  renderSuccessPage() {
    return token ? (
      <div>
        You are Signed In, redirecting to your Hitman App <br />
        <span className='text-underline' onClick={() => this.redirectToHitmanApp()}>
          If you weren't redirected click here
        </span>
      </div>
    ) : (
      <Redirect to='/' />
    )
  }

  handleRedirectToSso() {
    const url = new URL(process.env.REACT_APP_SOCKET_SSO_URL)
    url.searchParams.set('redirect_uri', `${process.env.REACT_APP_UI_URL}/browser-login-success`)
    url.searchParams.set('src', 'hitman')
    url.searchParams.set('token_key', 'sokt-auth-token')
    url.searchParams.set('data-app-logo-url', 'https://hitman.app/wp-content/uploads/2020/12/123.png')
    url.searchParams.set('signup_uri', `${process.env.REACT_APP_UI_URL}/browser-login-success?signup=true`)
    if (window.popupWindow) window.popupWindow(url, 'ViaSocket SSO', window.options)
  }

  handleLoginSuccess(props) {
    const searchParams = new URLSearchParams(props.location.search)
    if (searchParams.get('sokt-auth-token')) token = searchParams.get('sokt-auth-token')
    this.redirectToHitmanApp()
  }

  redirectToHitmanApp() {
    if (token) {
      window.open(`hitman-app://hitman?sokt-auth-token=${token}`, '_self')
    }
  }
}

export default BrowserLogin
