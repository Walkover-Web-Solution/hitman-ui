import React, { Component } from 'react'
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
    domain.cookies.random = 'random'
    this.props.update_cookies(domain)
    this.setState({ updateCookie: 'random' })
  }

  renderCookiesList () {
    return (
      Object.keys(this.state.currentDomain.cookies || {}).map((name, index) => (
        <div key={index} onClick={() => this.setState({ updateCookie: name })}>
          {name}
          {name === this.state.updateCookie && this.renderCookieArea(this.state.currentDomain.cookies[name])}
          <div className='d-flex'>
            <span>cancel</span>
            <button className='btn btn-primary'>save</button>
          </div>
        </div>
      ))
    )
  }

  renderCookieArea (cookie) {
    console.log('cookie', cookie)
    return (
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
