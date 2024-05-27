import React, { Component } from "react"
import "./cookiesList.scss"
import { ReactComponent as DeleteIcon } from "../../../assets/icons/delete-icon.svg"
class CookiesList extends Component {
  state = {
    domains: [],
    currentDomain: {
      domain: "",
    },
  }

  handleChange(e) {
    if (e.target.value.trim() !== "") this.props.clearValidityMessage()
    this.setState({ currentDomain: { ...this.state.currentDomain, domain: e.target.value } })
  }

  handleSubmit(e) {
    e.preventDefault()
    //  let domains=this.state.domains;
    //  domains.push(this.state.currentDomain);
    this.props.addDomain(this.state.currentDomain)
    this.setState({ currentDomain: { domain: "" } })
  }

  deleteDomain(domain) {
    const deleteModalData = {
      title: "Delete Domain",
      message: "Are you sure, Do you want to delete this domain?",
      domain,
    }

    this.props.toggleDelete(true, deleteModalData)
  }

  renderAddDomain() {
    return (
      <div className='form-group'>
        <form className='d-flex p-2' onSubmit={(e) => this.handleSubmit(e)}>
          <input className='form-control' placeholder='Add Domain' value={this.state.currentDomain.domain} onChange={(e) => this.handleChange(e)} />
          <button className='btn btn-primary btn-sm fs-4 ml-3' type='submit' disabled={this.state.currentDomain.domain === ""}>
            Add
          </button>
        </form>
        {this.props.validityMessage && <small className='muted-text'>*Please enter valid Domain</small>}
      </div>
    )
  }

  renderCookiesListItem(domain) {
    this.props.changeModalTab(2, domain)
  }

  renderDomainList() {
    return Object.keys(this.props.domains).length > 0 ? (
      Object.values(this.props.domains).map((domain, index) => (
        <div key={index} className='d-flex justify-content-between align-items-center'>
          <div className='cookie-list-parent-item d-flex justify-content-between cursor-pointer w-100' onClick={() => this.renderCookiesListItem(domain)}>
            <div className='mr-5'>{domain.domain}</div>
            <div className='d-flex justify-content-between align-items-center'>
              <div>{`${Object.keys(domain.cookies || {}).length} cookies`}</div>
            </div>
          </div>
          <div className='cursor-pointer ml-2 icon-center' onClick={() => this.deleteDomain(domain)}>
            {" "}
            <DeleteIcon />{" "}
          </div>
        </div>
      ))
    ) : (
      <h4 className='text-center'>No Domain available!</h4>
    )
  }

  render() {
    return (
      <div>
        {this.renderAddDomain()}
        {this.renderDomainList()}
      </div>
    )
  }
}

export default CookiesList
