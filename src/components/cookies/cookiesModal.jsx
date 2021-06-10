import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import CookiesList from './cookiesList/cookiesList'
import CookiesListItem from './cookiesListItem/cookiesListItem'
import { connect } from 'react-redux'
import { fetchAllCookies, addCookieDomain, updateCookies } from './redux/cookiesActions'
import shortid from 'shortid'

const mapStateToProps = (state) => {
  return {
    cookies: state.cookies
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    add_cookies_domain: (domain) => dispatch(addCookieDomain(domain)),
    update_cookies: (domain) => dispatch(updateCookies(domain))
  }
}

export class CookiesModal extends Component {
  state={
    tab: 1,
    selectedDomain: null,
    domains: {}
  }

  componentDidMount () {
    this.props.fetch_all_cookies()
    if (this.props.cookies) {
      this.setState({ domains: this.props.cookies })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.cookies !== prevProps.cookies) {
      this.setState({ domains: this.props.cookies })
    }
  }

  addDomain (domain) {
    domain.requestId = shortid.generate()
    this.props.add_cookies_domain(domain)
  }

  addCookies (domain) {
    const domains = this.state.domains
    domains.push(domain)
    this.setState({ domains })
  }

  renderCookiesModal () {
    return (
      <Modal
        {...this.props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            Manage Cookies
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.tab === 1 ? this.renderCookiesList() : this.renderCookiesListItem()}
        </Modal.Body>
      </Modal>
    )
  }

  changeModalTab (id, domain = null) {
    this.setState({ tab: id, selectedDomain: this.state.domains[domain.id] })
  }

  renderCookiesList () {
    return (
      <CookiesList {...this.props} addDomain={this.addDomain.bind(this)} domains={this.state.domains} changeModalTab={this.changeModalTab.bind(this)} />
    )
  }

  renderCookiesListItem () {
    return (
      <CookiesListItem {...this.props} changeModalTab={this.changeModalTab.bind(this)} domain={this.state.selectedDomain} />
    )
  }

  render () {
    return (
      <div>
        {this.renderCookiesModal()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CookiesModal)
