// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from './img/empty-response.svg'
import React, { Component } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'
import { getCurrentUser } from '../auth/authService'
import SampleResponseForm from './sampleResponseForm'

const JSONPrettyMon = require('react-json-pretty/dist/monikai')

class DisplayResponse extends Component {
  state = {
    rawResponse: false,
    prettyResponse: true,
    previewResponse: false,
    responseString: '',
    timeElapsed: '',
    show: false,
    showSampleResponseForm: { add: false, delete: false, edit: false }
  };

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

  render () {
    return (
      <div className='endpoint-response-container'>
        {
          this.props.response.status
            ? (
              <div>
                <div className='response-status'>
                  <div className='respHeading'>
                    <h2 className='orange-heading'> RESPONSE</h2>
                  </div>
                  <div className='statusWrapper'>
                    <div id='status'>
                      <div className='response-status-item-name'>Status :</div>
                      <div className='response-status-value'>
                        {this.props.response.status +
                          ' ' +
                          this.props.response.statusText}
                      </div>
                    </div>
                    <div id='time'>
                      <div className='response-status-item-name'>Time:</div>
                      <div className='response-status-value'>
                        {this.props.timeElapsed}ms
                      </div>
                    </div>
                    <div className='resPubclipboardWrapper'>
                      <CopyToClipboard
                        text={JSON.stringify(this.props.response.data)}
                        onCopy={() => this.setState({ copied: true })}
                        style={{ float: 'right', borderRadius: '12px' }}
                      >
                        <button>
                          <i className='fas fa-clone' />
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>
                </div>
                {this.showAddForm()}
                <div className='response-viewer'>
                  <div className='response-tabs'>
                    {isDashboardRoute(this.props) && (
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
                      </ul>)}
                    {
                      getCurrentUser() && isSavedEndpoint(this.props) && isDashboardRoute(this.props)
                        ? (
                          <div
                            // style={{ float: "right" }}
                            className='add-to-sample-response'
                          >
                            <div
                              className='sample-response-txt'
                              onClick={() =>
                                this.addSampleResponse(this.props.response)}
                            >
                              Add to Sample Response
                            </div>
                          </div>
                          )
                        : null
                    }

                  </div>

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
                </div>
              </div>
              )
            : (
              <div>
                <div className='empty-response'>Response</div>
                <div className='empty-response-container'>
                  {/* <img src={image} height="100px" width="100px" alt="" /> */}
                  <EmptyResponseImg />
                  <p>Hit Try to get a response</p>
                </div>
              </div>
              )
        }
      </div>
    )
  }
}

export default DisplayResponse
