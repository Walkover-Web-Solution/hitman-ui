import React, { Component } from 'react'
import moment from 'moment'
import './cookiesListItem.scss'
class CookiesListItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      addCookie: false,
      updateCookie: {
        key: '',
        value: ''
      },
      currentDomain: {}
    }
  }

  componentDidMount () {
    this.setState({ currentDomain: JSON.parse(JSON.stringify(this.props.domain)) })
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.domain !== prevProps.domain) {
      this.setState({ currentDomain: JSON.parse(JSON.stringify(this.props.domain)) })
    }
  }

  handleAddCookie () {
    const domain = { ...this.state.currentDomain }
    const newCookie = this.getNewCookie()
    domain.cookies[newCookie.key] = newCookie.value
    this.props.update_cookies(domain)
    this.setState({ updateCookie: newCookie })
  }

  handleCookieEdit (e) {
    const cookieValue = e.target.value
    this.setState({ updateCookie: { ...this.state.updateCookie, value: cookieValue } })
  }

  saveCookie () {
    const currentDomain = { ...this.state.currentDomain }
    const currentCookie = this.state.updateCookie
    let updateCookie = {}
    let cookieName = ''

    if (currentDomain.cookies[currentCookie.key] === currentCookie.value) {
      updateCookie = {}
    } else if (currentCookie.value.trim()) {
      cookieName = currentCookie.key
      const { cookieString, name, expiresValue } = this.prepareCookieString(currentCookie.value.trim())
      const time = moment(expiresValue)
      if (expiresValue && moment(time).isBefore(moment().format())) {
        const domain = currentDomain
        delete domain.cookies[cookieName]
        this.props.update_cookies(domain)
        return
      }
      if (cookieString !== currentCookie.value) {
        if (name && name !== cookieName) {
          delete currentDomain.cookies[cookieName]
          currentDomain.cookies[name] = cookieString
        } else {
          currentDomain.cookies[cookieName] = cookieString
        }
        this.props.update_cookies(currentDomain)
      }
    }
    this.setState({ updateCookie })
  }

  prepareCookieString (cookieValue) {
    let cookie = ''
    let name; let path = 'Path=/ ;'; let expires = ''; let secure = ''; let httponly = ''; let cookieString = ''
    const cookieArray = cookieValue.split(';')
    let expiresValue = null
    cookieArray.forEach((item, index) => {
      if (index === 0) {
        let [key, value] = item.split('=')?.filter((v) => v !== '')
        name = key?.trim()
        value = value?.trim()
        cookie = `${name}=${value || ''} ;`
      } else {
        let [key, value] = item.split('=')?.filter((v) => v !== '')
        value = value?.trim()
        if (key?.trim() === 'Path') {
          path = `Path=${value} ;`
        }
        if (key?.trim() === 'Expires') {
          expires = `Expires=${value} ;`
          expiresValue = value
        }
        if (key?.trim() === 'HttpOnly') {
          httponly = 'HttpOnly ;'
        }
        if (key?.trim() === 'Secure') {
          secure = 'Secure ;'
        }
      }
    })
    cookieString = cookie + path + expires + httponly + secure
    return { cookieString, name, expiresValue }
  }

  renderCookiesList () {
    return (
      Object.keys(this.state.currentDomain.cookies || {}).map((name, index) => (
        <div className='cookie-item' key={index}>
          <div onClick={() => this.setState({ updateCookie: { key: name, value: this.state.currentDomain.cookies[name] } })}>{name}</div>
          {name === this.state.updateCookie.key && this.renderCookieArea()}
        </div>
      ))
    )
  }

  getNewCookie () {
    let cookies = this.state.currentDomain.cookies
    cookies = Object.keys(cookies || {})
    for (let i = 1; cookies.length + 1; i++) {
      const cookieName = `Cookie${i}`
      if (!cookies.includes(cookieName)) {
        const time = moment().add(1, 'Y').format()
        const cookieValue = `${cookieName}=value; Path=/; Expires=${time}`
        return { key: cookieName, value: cookieValue }
      }
    }
  }

  renderCookieArea () {
    return (
      <>
        <textarea
          className='form-control custom-input'
          rows='2'
          onChange={(e) => this.handleCookieEdit(e)}
          id='update-cookie'
          value={this.state.updateCookie.value}
        />
        <div className='text-right mt-2'>
          <span className='mr-3' onClick={() => this.setState({ updateCookie: {} })}>cancel</span>
          <button className='btn btn-primary' onClick={() => this.saveCookie()}>save</button>
        </div>
      </>
    )
  }

  render () {
    return (
      <div>
        <div onClick={() => this.props.changeModalTab(1)}>{'< back'}</div>
        <div className='d-flex justify-content-between align-items-center'>
          <div>{this.state.currentDomain.domain}</div>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='mr-3'>{`${Object.entries(this.state.currentDomain.cookies || {}).length} cookies`}</div>
            <button className='btn btn-primary' onClick={() => this.handleAddCookie()}>Add Cookie</button>
          </div>
        </div>
        <div className='mt-3'>{this.renderCookiesList()}</div>
      </div>
    )
  }
}

export default CookiesListItem
