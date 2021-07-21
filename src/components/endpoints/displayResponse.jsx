// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from './img/empty-response.svg'
import React, { Component, createRef } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'
import { getCurrentUser } from '../auth/authService'
import SampleResponseForm from './sampleResponseForm'
import { Overlay, Tooltip } from 'react-bootstrap'
import TestResults from './testResults'

const JSONPrettyMon = require('react-json-pretty/dist/monikai')

class DisplayResponse extends Component {
  state = {
    rawResponse: false,
    prettyResponse: true,
    previewResponse: false,
    responseString: '',
    timeElapsed: '',
    show: false,
    showSampleResponseForm: { add: false, delete: false, edit: false },
    theme: '',
    showCopyMessage: false,
    selectedResponseTab: 'body'
  };

  constructor () {
    super()
    this.copyDivRef = createRef()
  }

  responseTime () {
    const timeElapsed = this.props.timeElapsed
    this.setState({ timeElapsed })
  }

  rawDataResponse () {
    this.setState({
      rawResponse: true,
      previewResponse: false,
      prettyResponse: false,
      responseString: JSON.stringify(this.props.response.data)
    })
  }

  prettyDataResponse () {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.props.response)
    })
  }

  previewDataResponse () {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false
    })
  }

  addSampleResponse (response) {
    this.openAddForm(response, null, 'Add Sample Response')
  }

  openAddForm (obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.add = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  closeForm () {
    const showSampleResponseForm = { add: false, delete: false, edit: false }
    this.setState({ showSampleResponseForm })
  }

  showAddForm () {
    return (
      this.state.showSampleResponseForm.add && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  componentDidMount () {
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  showCopyMessage () {
    this.setState({ showCopyMessage: true })
    setTimeout(function () {
      this.setState({ showCopyMessage: false })
    }.bind(this), 2000)
  }

  displayBodyAndHeaderResponse () {
    return (
      <>
        <div className='col-12' ref={this.myRef}>
          <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'body' }) }}>
              <a
                className={this.state.selectedResponseTab === 'body' ? 'nav-link active' : 'nav-link'}
                id='pills-response-tab'
                data-toggle='pill'
                role='tab'
                aria-controls={
                  isDashboardRoute(this.props)
                    ? `response-${this.props.tab.id}`
                    : 'response'
                }
                aria-selected='true'
              >
                Body
              </a>
            </li>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'header' }) }}>
              <a
                className={this.state.selectedResponseTab === 'header' ? 'nav-link active' : 'nav-link'}
                id='pills-header-tab'
                data-toggle='pill'
                aria-selected='false'
                href='#pills-header-tab'
                role='tab1'
              >
                Headers
              </a>
            </li>
            {isDashboardRoute(this.props) &&
              <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'testResults' }) }}>
                <a
                  className={this.state.selectedResponseTab === 'testResults' ? 'nav-link active' : 'nav-link'}
                  id='pills-testResults-tab'
                  data-toggle='pill'
                  aria-selected='false'
                  href='#pills-testResults-tab'
                  role='tab2'
                >
                  Test Results
                </a>
              </li>}
          </ul>
        </div>
      </>
    )
  }

  renderTableData () {
    const headerContent = this.props.response.headers
    const headerContentKeys = Object.keys(headerContent)
    return headerContentKeys.map((key, index) => {
      const value = headerContent[key]
      return (
        <tr key={key}>
          <th scope='row'>{key}</th>
          <td>{value}</td>
        </tr>
      )
    })
  }

  displayHeader () {
    if (this.props.response.headers) {
      return (
        <div className='endpoint-response-container overflow-auto '>
          <table className='table table-sm fs-6'>
            <thead>
              <tr>
                <th scope='col'>Key</th>
                <th scope='col'>Value</th>
              </tr>
            </thead>
            <tbody>{this.renderTableData()}</tbody>
          </table>
        </div>
      )
    }
  }

  render () {
    const { theme } = this.state
    return (
      <div className='endpoint-response-container overflow-auto'>
        {
          this.props.flagResponse
            ? (
              <div>
                <div className='response-status'>
                  <div className='respHeading'>
                    {!isSavedEndpoint(this.props) ? <h2 className='orange-heading'> RESPONSE</h2> : null}
                  </div>
                  <div className='statusWrapper'>
                    {this.props.response.status &&
                      <div id='status'>
                        <div className='response-status-item-name'>Status :</div>
                        <div className='response-status-value' style={{ color: theme }}>
                          {this.props.response.status +
                          ' ' +
                          this.props.response.statusText}
                        </div>
                      </div>}
                    <div id='time'>
                      <div className='response-status-item-name'>Time:</div>
                      <div className='response-status-value' style={{ color: theme }}>
                        {this.props.timeElapsed} ms
                      </div>
                    </div>
                    <Overlay target={this.copyDivRef.current} show={this.state.showCopyMessage} placement='top'>
                      <Tooltip id='copy-message'>
                        Copied
                      </Tooltip>
                    </Overlay>
                    <div className='resPubclipboardWrapper' ref={this.copyDivRef} onClick={() => this.showCopyMessage()}>
                      <CopyToClipboard
                        text={JSON.stringify(this.props.response.data)}
                        onCopy={() => this.setState({ copied: true })}
                      >
                        <button>
                          <svg width='13' height='13' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg>
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
                {this.showAddForm()}
                <div className='response-viewer'>
                  <div className='response-tabs'>
                    {/* {isDashboardRoute(this.props) && (
                      <ul className='nav nav-tabs' id='myTab' role='tablist'>
                        <li className='nav-item'>
                          <a
                            className='nav-link active'
                            id='home-tab'
                            data-toggle='tab'
                            href='#home'
                            role='tab'
                            aria-controls='home'
                            aria-selected='true'
                          >
                            Pretty
                          </a>
                        </li>
                        <li className='nav-item'>
                          <a
                            className='nav-link'
                            id='profile-tab'
                            data-toggle='tab'
                            href='#profile'
                            role='tab'
                            aria-controls='profile'
                            aria-selected='false'
                          >
                            Raw
                          </a>
                        </li>
                        <li className='nav-item'>
                          <a
                            className='nav-link'
                            id='contact-tab'
                            data-toggle='tab'
                            href='#contact'
                            role='tab'
                            aria-controls='contact'
                            aria-selected='false'
                          >
                            Preview
                          </a>
                        </li>
                      </ul>)} */}
                  </div>
                  {this.props.response.status && this.displayBodyAndHeaderResponse()}
                  {this.state.selectedResponseTab === 'body' &&
                    <>
                      {
                    getCurrentUser() && isSavedEndpoint(this.props) && isDashboardRoute(this.props)
                      ? (
                        <div
                          // style={{ float: "right" }}
                          className='add-to-sample-response'
                        >
                          <div
                            className='adddescLink'
                            onClick={() =>
                              this.addSampleResponse(this.props.response)}
                          >
                            <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg> Add to Sample Response
                          </div>
                        </div>
                        )
                      : null
                  }
                      {isDashboardRoute(this.props) && (
                        <div className='tab-content' id='myTabContent'>
                          <div
                            className='tab-pane fade show active'
                            id='home'
                            role='tabpanel'
                            aria-labelledby='home-tab'
                          >
                            <JSONPretty
                              theme={JSONPrettyMon}
                              data={this.props.response.data}
                            />
                          </div>
                          <div
                            className='tab-pane fade'
                            id='profile'
                            role='tabpanel'
                            aria-labelledby='profile-tab'
                          >
                            {JSON.stringify(this.props.response.data)}
                          </div>
                          <div
                            className='tab-pane fade'
                            id='contact'
                            role='tabpanel'
                            aria-labelledby='contact-tab'
                          >
                            Feature coming soon... Stay tuned
                          </div>
                        </div>)}
                      {!isDashboardRoute(this.props) && (
                        <div className='tab-content'>
                          <JSONPretty
                            theme={JSONPrettyMon}
                            data={this.props.response.data}
                          />
                        </div>
                      )}
                    </>}
                  {this.state.selectedResponseTab === 'header' && (this.props.response.headers && this.displayHeader())}
                  {this.state.selectedResponseTab === 'testResults' && isDashboardRoute(this.props) && this.props.response.status && <TestResults tests={this.props.tests} />}
                </div>
              </div>
              )
            : (
              <div>
                <div className='empty-response'>Response</div>
                <div className='empty-response-container'>
                  {/* <img src={image} height="100px" width="100px" alt="" /> */}
                  <EmptyResponseImg />
                  <p>Hit Send to trigger the API call</p>
                </div>
              </div>
              )
        }
      </div>
    )
  }
}

export default DisplayResponse
