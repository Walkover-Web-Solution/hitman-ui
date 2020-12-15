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
    showSampleResponseForm: { add: false, delete: false, edit: false },
    theme: ''
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

  componentDidMount () {
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  render () {
    const { theme } = this.state
    return (
      <div className='endpoint-response-container'>
        {
          this.props.response.status
            ? (
              <div>
                <div className='response-status'>
                  <div className='respHeading'>
                    <h2 className='orange-heading' style={{ color: theme }}> RESPONSE</h2>
                  </div>
                  <div className='statusWrapper'>
                    <div id='status'>
                      <div className='response-status-item-name'>Status :</div>
                      <div className='response-status-value' style={{ color: theme }}>
                        {this.props.response.status +
                          ' ' +
                          this.props.response.statusText}
                      </div>
                    </div>
                    <div id='time'>
                      <div className='response-status-item-name'>Time:</div>
                      <div className='response-status-value' style={{ color: theme }}>
                        {this.props.timeElapsed} ms
                      </div>
                    </div>
                    <div className='resPubclipboardWrapper'>
                      <CopyToClipboard
                        text={JSON.stringify(this.props.response.data)}
                        onCopy={() => this.setState({ copied: true })}
                      >
                        <button>
                          <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M14.2933 7.36629L8.16664 13.493C7.41607 14.2435 6.39809 14.6652 5.33664 14.6652C4.27518 14.6652 3.2572 14.2435 2.50664 13.493C1.75607 12.7424 1.33441 11.7244 1.33441 10.663C1.33441 9.6015 1.75607 8.58352 2.50664 7.83295L8.6333 1.70629C9.13368 1.20591 9.81233 0.924805 10.52 0.924805C11.2276 0.924805 11.9063 1.20591 12.4066 1.70629C12.907 2.20666 13.1881 2.88532 13.1881 3.59295C13.1881 4.30059 12.907 4.97925 12.4066 5.47962L6.2733 11.6063C6.02311 11.8565 5.68379 11.997 5.32997 11.997C4.97615 11.997 4.63682 11.8565 4.38664 11.6063C4.13645 11.3561 3.99589 11.0168 3.99589 10.663C3.99589 10.3091 4.13645 9.96981 4.38664 9.71962L10.0466 4.06629' stroke='#828282' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
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
                    <div className='tab-content' style={{ borderColor: theme }}>
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
