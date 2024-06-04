// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from './img/empty-response.svg'
import React, { Component, createRef } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import { hexToRgb, isDashboardRoute, isSavedEndpoint } from '../common/utility'
import { getCurrentUser } from '../auth/authServiceV2'
import SampleResponseForm from './sampleResponseForm'
import { Overlay, Spinner, Tooltip } from 'react-bootstrap'
import TestResults from './testResults'
import addtosample from '../../assets/icons/addToSamplesign.svg'
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import { connect } from 'react-redux'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/webpack-resolver'
import AceEditor from 'react-ace'

const JSONPrettyMon = require('react-json-pretty/dist/monikai')


const mapStateToProps = (state) => {
  return {
    tabs: state?.tabs?.tabs,
  }
}


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
    selectedResponseTab: 'body',
    isOpen: false,
    output: null,
    isShow: false,
    Open: false,
    Show: false,
    selectedBodyTab: 'pretty',
    data: {}
  }

  constructor(props) {
    super(props)
    this.copyDivRef = createRef()
    this.myRef = React.createRef();
  }
  handleAceEditorChange = (value) => {
    const data = { ...this.state.data }
    data.body = value
    this.setState({ data })
  }

  responseTime() {
    const timeElapsed = this.props.timeElapsed
    this.setState({ timeElapsed })
  }

  rawDataResponse() {
    this.setState({
      rawResponse: true,
      previewResponse: false,
      prettyResponse: false,
      responseString: JSON.stringify(this.props.response.data)
    })
  }

  prettyDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.props.response)
    })
  }

  previewDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false
    })
  }

  addSampleResponse(response) {
    this.openAddForm(response, null, 'Add Sample Response')
  }

  openAddForm(obj, index, name) {
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

  closeForm() {
    const showSampleResponseForm = { add: false, delete: false, edit: false }
    this.setState({ showSampleResponseForm })
  }

  showAddForm() {
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

  componentDidMount() {
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.response !== this.props.response) {
      this.setState({ selectedResponseTab: 'body' })
    }
  }

  showCopyMessage() {
    this.setState({ showCopyMessage: true })
    setTimeout(
      function () {
        this.setState({ showCopyMessage: false })
      }.bind(this),
      2000
    )
  }

  displayBodyAndHeaderResponse() {
    const { data, errors } = this.state

    const TestResultsPreview = () => {
      const tests = this.props.tests
      if (!tests) return null
      const failedTests = tests.filter((test) => test.success === false)
      const passedTests = tests.filter((test) => test.success === true)
      let testMessage = ''
      let testMessageColor = 'inherit'
      if (failedTests.length) {
        testMessage = `(${failedTests.length}/${tests.length} Failed)`
        testMessageColor = 'red'
      } else if (passedTests.length) {
        testMessage = `(${passedTests.length}/${tests.length} Passed)`
        testMessageColor = 'green'
      }
      return <span style={{ color: testMessageColor }}>{testMessage}</span>
    }
    return (
      <>
        <div className='custom-tabs' ref={this.myRef}>
          <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'body' }) }}>
              <a
                className={this.state.selectedResponseTab === 'body' ? 'nav-link active' : 'nav-link'}
                style={this.state.selectedResponseTab === 'body' ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                id='pills-response-tab'
                data-toggle='pill'
                role='tab'
                aria-controls={isDashboardRoute(this.props) ? `response-${this.props.tab.id}` : 'response'}
                aria-selected='true'
              >
                Body
              </a>
            </li>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'header' }) }}>
              <a
                className={this.state.selectedResponseTab === 'header' ? 'nav-link active' : 'nav-link'}
                style={this.state.selectedResponseTab === 'header' ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                id='pills-header-tab'
                data-toggle='pill'
                aria-selected='false'
                href='#pills-header-tab'
                role='tab1'
              >
                Headers
              </a>
            </li>
            {isDashboardRoute(this.props) && (
              <>
                <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'testResults' }) }}>
                  <a
                    className={this.state.selectedResponseTab === 'testResults' ? 'nav-link active' : 'nav-link'}
                    id='pills-testResults-tab'
                    data-toggle='pill'
                    aria-selected='false'
                    href='#pills-testResults-tab'
                    role='tab2'
                  >
                    Test Results <TestResultsPreview />
                  </a>
                </li>
                <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'console' }) }}>
                  <a
                    className={this.state.selectedResponseTab === 'console' ? 'nav-link active' : 'nav-link'}
                    style={this.state.selectedResponseTab === 'console' ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                    id='pills-console-tab'
                    data-toggle='pill'
                    aria-selected='false'
                    href='#pills-console-tab'
                    role='tab1'
                  >
                    Console
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Content Area */}
          <div className='tab-content ml-0'>
            {this.state.selectedResponseTab === 'body' && (
              <div>
                <div className='d-flex justify-content-between'>
                <ul className='nav nav-pills body-button'>
                  <li className='nav-item' onClick={() => this.setState({ selectedBodyTab: 'pretty' })}>
                    <a className={this.state.selectedBodyTab === 'pretty' ? 'nav-link active px-2 py-1 fs-4' : 'nav-link px-2 py-1 fs-4'} href='#pretty'>Pretty</a>
                  </li>
                  <li className='nav-item' onClick={() => this.setState({ selectedBodyTab: 'raw' })}>
                    <a className={this.state.selectedBodyTab === 'raw' ? 'nav-link active px-2 py-1 fs-4 ml-2' : 'nav-link px-2 py-1 fs-4 ml-2'} href='#raw'>Raw</a>
                  </li>
                  <li className='nav-item' onClick={() => this.setState({ selectedBodyTab: 'preview' })}>
                    <a className={this.state.selectedBodyTab === 'preview' ? 'nav-link active px-2 py-1 fs-4 ml-2' : 'nav-link px-2 py-1 fs-4 ml-2'} href='#preview'>Preview</a>
                  </li>
                </ul>
                {getCurrentUser() && isSavedEndpoint(this.props) && isDashboardRoute(this.props) ? (
                      <div
                        // style={{ float: "right" }}
                        className='add-to-sample-response'
                      >
                        <div className='adddescLink' onClick={() => this.addSampleResponse(this.props.response)}>
                          <img src={addtosample} /> Add to Sample Response
                        </div>
                      </div>
                    ) : null}
                </div>
                <div className='tab-content'>
                  {this.state.selectedBodyTab === 'pretty' && <div>
                    <AceEditor
                      style={{ border: '1px solid rgb(206 213 218)' }}
                      className='custom-raw-editor'
                      mode='json'
                      theme='github'
                      value={JSON.stringify(this.props.response.data, null, 2)}
                      onChange={this.handleAceEditorChange}
                      setOptions={{
                        showLineNumbers: true
                      }}
                      editorProps={{
                        $blockScrolling: false
                      }}
                      onLoad={(editor) => {
                        editor.focus()
                        editor.getSession().setUseWrapMode(true)
                        editor.setShowPrintMargin(false)
                      }}
                    />
                  </div>}
                  {this.state.selectedBodyTab === 'raw' && <div> <>
                    {isDashboardRoute(this.props) && (
                      <div className='tab-content' id='myTabContent'>
                        <div className='tab-pane fade show active' id='home' role='tabpanel' aria-labelledby='home-tab'>
                          <JSONPretty theme={JSONPrettyMon} data={this.props.response.data} />
                        </div>
                        <div className='tab-pane fade' id='profile' role='tabpanel' aria-labelledby='profile-tab'>
                          {JSON.stringify(this.props.response.data)}
                        </div>
                        <div className='tab-pane fade' id='contact' role='tabpanel' aria-labelledby='contact-tab'>
                          Feature coming soon... Stay tuned
                        </div>
                      </div>
                    )}
                    {!isDashboardRoute(this.props) && (
                      <div className='tab-content'>
                        <JSONPretty theme={JSONPrettyMon} data={this.props.response.data} />
                      </div>
                    )}
                  </></div>}
                  {this.state.selectedBodyTab === 'preview' && <div>
                    <div dangerouslySetInnerHTML={{ __html: JSON.stringify(this.props.response.data) }} />
                  </div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  renderTableData() {
    const headerContent = this.props.response.headers
    const headerContentKeys = Object.keys(headerContent)
    return headerContentKeys.map((key, index) => {
      const value = headerContent[key]
      return (
        <tr key={key}>
          <th className='text-nowrap' scope='row'>
            {key}
          </th>
          <td className='text-break'>{value}</td>
        </tr>
      )
    })
  }
  renderResponseHeader() {
    const { originalHeaders } = this.props.endpointContent
    return (
      <div>
        {originalHeaders.map((header, index) => (
          <div key={index}>
            {Object.entries(header).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  displayHeader() {
    if (this.props.response.headers) {
      return (
        <div className='response-headers-container'>
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

  displayConsole() {
    const { isOpen } = this.state
    const { isShow } = this.state
    const { Show } = this.state
    const { Open } = this.state
    const Base_url = this.props?.endpointContent?.host?.BASE_URL ? this.props?.endpointContent?.host?.BASE_URL : null
    const uri = this.props?.endpointContent?.data?.updatedUri ? this.props?.endpointContent?.data?.updatedUri : null

    return (
      <div>
        <div className='dropdown-data'>
          {isOpen ? <IoMdArrowDropdown size={18} className='dropdown-icon' onClick={this.toggleDropdown} /> : <IoMdArrowDropright size={18} className='dropdown-icon' onClick={this.toggleDropdown} />}
          {this.props?.endpointContent?.data?.method}
          {'  '}
          {Base_url + uri}
          <div className={`dropdown-content pt-2 ${isOpen ? 'show' : ''}`}>
            <div className='dropdown-data'>
              {isShow ? <IoMdArrowDropdown size={18} onClick={this.toggleDropdownHeaders} /> : <IoMdArrowDropright size={18} onClick={this.toggleDropdownHeaders} />} Response Headers
              <div className={`dropdown-content ${isOpen ? 'show' : ''}`} >
                <span href='#' className={`dropdown-content-option ${isShow ? 'show' : ''}`}>{this.renderTableData()}</span>
              </div>
            </div>
            <div className='dropdown-data'>
              {Show ? <IoMdArrowDropdown size={18} onClick={this.toggleDropdownRequest} /> : <IoMdArrowDropright size={18} onClick={this.toggleDropdownRequest} />} Request Headers
              <div className={`dropdown-content ${isOpen ? 'show' : ''}`}>
                <span href='#' className={` dropdown-content-option ${Show ? 'show' : ''}`}>
                  {this.renderResponseHeader()}
                </span>
              </div>
            </div>
            <div className='dropdown-data'>
              {Open ? <IoMdArrowDropdown size={18} onClick={this.toggleDropdownBody} /> : <IoMdArrowDropright size={18} onClick={this.toggleDropdownBody} />} Body
              <div className={`dropdown-content ${isOpen ? 'show' : ''}`}>
                <span href='#' className={` dropdown-content-option ${Open ? 'show' : ''}`}>
                  {JSON.stringify(this.props.response.data)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='test-results-container px-2'>{this.renderConsole()}</div>
      </div>
    )
  }

  toggleDropdown = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  toggleDropdownBody = () => {
    this.setState({ Open: !this.state.Open })
  }
  toggleDropdownHeaders = () => {
    this.setState({ isShow: !this.state.isShow })
  }
  toggleDropdownRequest = () => {
    this.setState({ Show: !this.state.Show })
  }

  renderConsole() {
    const checkWhetherJsonOrNot = (data) =>{
      try{
        if(JSON.parse(data)) return true
        return false
      }
      catch(error){
        return false
      }
    }

    function RenderConsoleComponent(props) {
      return (props?.data.map((singleConsole, index) => {
        const isJson = checkWhetherJsonOrNot(singleConsole)
        if (isJson) {
          return <>
            <JSONPretty theme={JSONPrettyMon} data={JSON.parse(singleConsole)} />
            <br />
          </>
        }
        return <>
          <span key={index}>{singleConsole}</span>
          <br />
        </>
      }))
    }

    return (
      <div className='w-100'>
        <span>Pre-Script Execution</span>
        <div className='p-2'>{<RenderConsoleComponent data={this.props.tabs?.[this.props?.activeTabId]?.preScriptExecutedData || []} />}</div>
        <span>Post-Script Execution</span>
        <div className='p-2'>{<RenderConsoleComponent data={this.props.tabs?.[this.props?.activeTabId]?.postScriptExecutedData || []} />}</div>
      </div>
    )
  }

  renderBlank() {
    return (
      <div className='px-3 py-5 text-center'>
        <div>No logs yet.</div>
        <small>Send a request to view its detail in the console</small>
      </div>
    )
  }

  renderLoader() {
    return (
      <div className='text-center my-5'>
        <Spinner variant='dark' animation='border' />
        <div className='my-2'>Sending Request</div>
        <button className='btn btn-outline orange' onClick={this.props.handleCancel}>
          Cancel
        </button>
      </div>
    )
  }

  renderRequestError() {
    return (
      <div className='text-center my-5'>
        <div>Could not send request</div>
        <small className='text-danger'>{this.props.response.data}</small>
      </div>
    )
  }

  renderStatusMessage() {
    const { status, statusText } = this.props.response
    const color = status >= 400 || status >= 500 ? 'error' : status >= 200 && status < 300 ? 'success' : 'regular'
    return <div className={`response-status-value-${color}`}>{status + ' ' + statusText}</div>
  }

  render() {
    const { theme } = this.state
    return (
      <div className='endpoint-response-container overflow-auto mt-4' style={{ backgroundColor: hexToRgb(this.state?.theme, '0.04')}}>
        {this.props.loader ? (
          this.renderLoader()
        ) : this.props.flagResponse ? (
          this.props.response.status ? (
            <div>
              <div className='response-status justify-content-end'>
                <div className='statusWrapper'>
                  {this.props.response.status && (
                    <div id='status'>
                      <div className='response-status-item-name'>Status :</div>
                      {this.renderStatusMessage()}
                    </div>
                  )}
                  <div id='time'>
                    <div className='response-status-item-name'>Time:</div>
                    <div className='response-status-value' style={{ color: theme }}>
                      {this.props.timeElapsed} ms
                    </div>
                  </div>
                  <Overlay target={this.copyDivRef.current} show={this.state.showCopyMessage} placement='top'>
                    <Tooltip id='copy-message'>Copied</Tooltip>
                  </Overlay>
                  <div className='resPubclipboardWrapper' ref={this.copyDivRef} onClick={() => this.showCopyMessage()}>
                    <CopyToClipboard text={JSON.stringify(this.props.response.data)} onCopy={() => this.setState({ copied: true })}>
                      <button>
                        <svg width='13' height='13' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z'
                            stroke='#828282'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75'
                            stroke='#828282'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
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
                {this.state.selectedResponseTab === 'header' && this.props.response.headers && this.displayHeader()}
                {this.state.selectedResponseTab === 'testResults' && isDashboardRoute(this.props) && this.props.tests && (
                  <TestResults tests={this.props.tests} />
                )}
                {this.state.selectedResponseTab === 'console' && this.displayConsole()}
              </div>
            </div>
          ) : (
            this.renderRequestError()
          )
        ) : (
          <div>
            <div className='empty-response'>Response</div>
            <div className='empty-response-container'>
              {/* <img src={image} height="100px" width="100px" alt="" /> */}
              <EmptyResponseImg />
              <p className='mt-0'>Hit Send to trigger the API call</p>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(DisplayResponse)
