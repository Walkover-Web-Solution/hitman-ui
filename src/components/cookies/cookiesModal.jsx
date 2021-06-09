import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import CookiesList from './cookiesList/cookiesList'
import CookiesListItem from './cookiesListItem/cookiesListItem'
import { connect } from 'react-redux'
import { fetchAllCookies, addCookieDomain } from './redux/cookiesActions'

const mapStateToProps = (state) => {
  return {
    cookies: state.cookies
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    add_cookies_domain: (domain) =>
      dispatch(addCookieDomain(domain))
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
  }

  addDomain (domain) {
    const domains = this.state.domains
    domain.cookies = {}
    domains.push(domain)
    this.setState({ domains })
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
        <Modal.Footer />
      </Modal>
    )
  }

  changeModalTab (id, domain = null) {
    this.setState({ tab: id, selectedDomain: domain })
  }

  renderCookiesList () {
    return (
      <CookiesList addDomain={this.addDomain.bind(this)} domains={this.state.domains} changeModalTab={this.changeModalTab.bind(this)} />
    )
  }

  renderCookiesListItem () {
    return (
      <CookiesListItem changeModalTab={this.changeModalTab.bind(this)} domain={this.state.selectedDomain} />
    )
  }

  render () {
    return (
      <div>
        {/* {this.renderCookiesModal()} */}
        {'hello'}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CookiesModal)
