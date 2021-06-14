import React, { Component } from 'react'
// import CookiesListItem from '../cookiesListItem/cookiesListItem';
import './cookiesList.scss'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
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

  deleteDomain (domain) {
    const deleteModalData = {
      title: 'Delete Domain',
      message: 'Are you sure, Do you want to delete this domain?',
      domain
    }

    this.props.toggleDelete(true, deleteModalData)
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
      Object.values(this.props.domains).map((domain, index) => (
        <div key={index} className='d-flex justify-content-between align-items-center '>
          <div className='cookie-list-parent-item d-flex justify-content-between w-100' onClick={() => this.renderCookiesListItem(domain)}>
            <div className='mr-5'>{domain.domain}</div>
            <div className='d-flex justify-content-between align-items-center'>
              <div>{`${Object.keys(domain.cookies || {}).length} cookies`}</div>
            </div>
          </div>
          <div className='ml-2' onClick={() => this.deleteDomain(domain)}> <DeleteIcon /> </div>
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
