// import axios from 'axios'
import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
class BrowserLogin extends Component {
  state = { }
  render () {
    return (
      <Switch>
        <Route exact path='/browser-login/success' render={(props) => this.handleLoginSuccess(props)} />
        <Route
          exact path='/browser-login' render={(props) => {
            this.handleRedirectToSso()
            return <div>You are being redirected to Socket SSO</div>
          }}
        />
      </Switch>

    )
  }

  handleRedirectToSso () {
    const options = {
      height: 700, // sets the height in pixels of the window.
      width: 800, // sets the width in pixels of the window.
      toolbar: 0, // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
      scrollbars: 0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
      status: 0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
      resizable: 0, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
      left: 0, // left position when the window appears.
      top: 0, // top position when the window appears.
      center: 0, // should we center the window? {1 (YES) or 0 (NO)}. overrides top and left
      createnew: 0, // should we create a new window for each occurance {1 (YES) or 0 (NO)}.
      location: 0, // determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
      menubar: 0 // determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
    }
    const url = new URL(process.env.REACT_APP_SOCKET_SSO_URL)
    url.searchParams.set('redirect_uri', `${process.env.REACT_APP_UI_URL}/browser-login/success`)
    url.searchParams.set('src', 'hitman')
    url.searchParams.set('token_key', 'sokt-auth-token')
    url.searchParams.set('data-app-logo-url', 'https://hitman.app/wp-content/uploads/2020/12/123.png')
    url.searchParams.set('signup_uri', 'http://localhost:51423/electron-signin?signup=true')
    window.open(url, 'title', options)
  }

  handleLoginSuccess (props) {
    const searchParams = new URLSearchParams(props.location.search)
    window.open(`hitman-app://hitman?sokt-auth-token=${searchParams.get('sokt-auth-token')}`)
    return <div>You are signed in, go to Hitman app and start using.</div>
  }
}

export default BrowserLogin
