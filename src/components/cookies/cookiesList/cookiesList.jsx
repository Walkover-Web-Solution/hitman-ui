import React, { Component } from 'react'
// import CookiesListItem from '../cookiesListItem/cookiesListItem';
import './cookiesList.scss'
class CookiesList extends Component {
  state = {
    domains: [],
    currentDomain: {
      domain: ''
    }
  }

  handleChange (e) {
    this.setState({ currentDomain: { ...this.state.currentDomain, domain: e.target.value } })
  }

  handleSubmit (e) {
    e.preventDefault()
    //  let domains=this.state.domains;
    //  domains.push(this.state.currentDomain);
    this.props.addDomain(this.state.currentDomain)
    this.setState({ currentDomain: '' })
  }

  renderAddDomain () {
    return (
      <form className='form-group d-flex p-2' onSubmit={(e) => this.handleSubmit(e)}>
        <input className='form-control' placeholder='Add Domain' value={this.state.currentDomain.domain} onChange={(e) => this.handleChange(e)} />
        <button className='btn btn-primary' type='submit'>Add</button>
      </form>
    )
  }

  renderCookiesListItem (domain) {
    this.props.changeModalTab(2, domain)
  }

  renderDomainList () {
    return (
      this.props.domains.map((domain, index) => (
        <div key={index} className='d-flex justify-content-between' onClick={() => this.renderCookiesListItem(domain)}>
          <div className='mr-5'>{domain.domain}</div>
          <span>{`${Object.entries(this.props.domains[index].cookies).length} cookies`}</span>
        </div>
      ))
    )
  }

  render () {
    return (
      <div>
        {this.renderAddDomain()}
        {this.renderDomainList()}
      </div>
    )
  }
}

export default CookiesList
