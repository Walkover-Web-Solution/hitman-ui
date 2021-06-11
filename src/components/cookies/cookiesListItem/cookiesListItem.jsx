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
    // console.log(newCookie.key)
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
    let cookieArray = []
    let cookieName = ''

    if (currentDomain.cookies[currentCookie.key] === currentCookie.value) {
      updateCookie = {}
    } else if (currentCookie.value.trim()) {
      cookieArray = currentCookie.value.split(';')
      cookieName = cookieArray[0].split('=')[0]

      if (cookieArray[0] && cookieArray[1] && cookieArray[1].split('=')[0].trim() === 'Path') {
        const modifiedData = this.randomCheck(currentCookie.value.trim())
        if (modifiedData.data) {
          if (!modifiedData.checkFlag) {
            delete currentDomain.cookies[currentCookie.key]
          }
          currentDomain.cookies[cookieName] = modifiedData.data
        } else if (cookieArray[1].split('=')[0].trim() === 'Path') {
          delete currentDomain.cookies[currentCookie.key]
          currentDomain.cookies[cookieName] = currentCookie.value
        }
      }
      this.props.update_cookies(currentDomain)
    }
    this.setState({ updateCookie })
  }

  randomCheck (value) {
    let checkFlag = false
    let data = null
    const valueArray = value.split(';')
    if (valueArray[0] && valueArray[1].split('=')[0].trim() === 'Path') {
      if (valueArray[0].split('=')[0] && !valueArray[0].split('=')[1]) {
        if (valueArray[0].split('=')[1] !== '' && valueArray[0].split('=')?.length > 1) {
          checkFlag = true
          console.log('hello true', valueArray[0].split('='))
        }
        valueArray[0] = valueArray[0].replace(/=/gi, '') + '='
      }
      if (valueArray[1].split('=')[0] && !valueArray[1].split('=')[1]) {
        valueArray[1] = 'Path=/ ;'
      }
      data = valueArray.join('; ')
    } else {
      checkFlag = false
      data = null
    }
    return { checkFlag, data }
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
        const time = moment().format('ddd, Do MMM h:mm')
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
          //  error={errors[name]}
          //  name={name}
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
