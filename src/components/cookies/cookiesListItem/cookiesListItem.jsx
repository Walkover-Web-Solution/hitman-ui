import React, { Component } from 'react'
class CookiesListItem extends Component {
  state = {
    addCookie: false,
    updateCookie: null
  }

  renderCookiesList () {
    return (
      Object.keys(this.props.domain.cookies).map((name, index) => (
        <div key={index} onClick={() => this.setState({ updateCookie: index })}>
          {name}
          {index === this.state.updateCookie && this.renderCookieArea(this.props.domain.cookies[name])}
          <div className='d-flex'>
            <span>cancle</span>
            <button className='btn btn-primary'>save</button>
          </div>
        </div>
      ))
    )
  }

  renderAddCookieArea () {
    return (
      <textarea
        className='form-control custom-input'
        rows='2'
        //  onChange={this.handleChange}
        id='add-cookie'
      />
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
          <div>{this.props.domain.domain}</div>
          <div>
            <span>{`${Object.entries(this.props.domain.cookies).length} cookies`}</span>
            <button className='btn btn-primary' onClick={() => this.setState({ addCookie: true })}>Add Cookie</button>
          </div>
        </div>
        {this.state.addCookie &&
          <div>
            {this.renderAddCookieArea()}
          </div>}
        {this.renderCookiesList()}
      </div>
    )
  }
}

export default CookiesListItem
