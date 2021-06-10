import React, { Component } from 'react'
import moment from 'moment'
class CookiesListItem extends Component {
  constructor (props) {
    super(props)

    this.state = {
      addCookie: false,
      updateCookie: null,
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
    this.setState({ updateCookie: newCookie.key })
  }

  renderCookiesList () {
    return (
      Object.keys(this.state.currentDomain.cookies || {}).map((name, index) => (
        <div key={index} onClick={() => this.setState({ updateCookie: name })}>
          {name}
          {name === this.state.updateCookie && this.renderCookieArea(this.state.currentDomain.cookies[name])}
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

  renderCookieArea (cookie) {
    console.log('cookie', cookie)
    return (
      <>
        <textarea
          className='form-control custom-input'
          rows='2'
        //  onChange={this.handleChange}
          id='update-cookie'
        //  error={errors[name]}
        //  name={name}
          value={cookie}
        //  placeholder={placeholder}
        />
        <div className='d-flex'>
          <span>cancel</span>
          <button className='btn btn-primary'>save</button>
        </div>
      </>
    )
  }

  render () {
    return (
      <div>
        <div onClick={() => this.props.changeModalTab(1)}>{'< back'}</div>
        <div className='d-flex justify-content-between'>
          <div>{this.state.currentDomain.domain}</div>
          <div>
            <span>{`${Object.entries(this.state.currentDomain.cookies || {}).length} cookies`}</span>
            <button className='btn btn-primary' onClick={() => this.handleAddCookie()}>Add Cookie</button>
          </div>
        </div>
        {this.renderCookiesList()}
      </div>
    )
  }
}

export default CookiesListItem
