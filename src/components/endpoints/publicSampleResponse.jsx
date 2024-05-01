import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import { willHighlight, getHighlightsData } from './highlightChangesHelper'
import './endpoints.scss'
import { Style } from 'react-style-tag'
import { hexToRgb } from '../common/utility'

class PublicSampleResponse extends Component {
  state = {
    theme: this.props.publicCollectionTheme
  }

  showJSONPretty(data) {
    return <JSONPretty data={data} />
  }

  showSampleResponseBody(data) {
    if (typeof data === 'object') {
      return this.showJSONPretty(data)
    } else {
      try {
        data = JSON.parse(data)
        return this.showJSONPretty(data)
      } catch (err) {
        return <pre>{data}</pre>
      }
    }
  }

  render() {
    return (
      <>
        <Style>
          {`
          .sample-response nav.nav.nav-tabs a.active {
                background: ${this.state.theme};
                color:#fff;
              } 
          `}
        </Style>
        <div className='pubSampleResponse'>
          <h3 className='heading-2'>
            <span>Sample Response {willHighlight(this.props, 'sampleResponse') ? <i className='fas fa-circle' /> : null}</span>
          </h3>
          <div className='sample-response mb-3' style={{ backgroundColor: hexToRgb(this.state?.theme, '0.05')}}>
            <Tabs id='uncontrolled-tab-example'>
              {this.props.sample_response_array.map((sampleResponse, key) => (
                <Tab
                key={key}
                  eventKey={sampleResponse.title}
                  title={
                    getHighlightsData(this.props, 'sampleResponse', sampleResponse.title) ? (
                      <span>
                        {sampleResponse.title}
                        <i className='fas fa-circle' />
                      </span>
                    ) : (
                      sampleResponse.title
                    )
                  }
                >
                  <div>{sampleResponse.status}</div>
                  <div>{sampleResponse.description}</div>
                  <div>{this.showSampleResponseBody(sampleResponse.data)}</div>
                </Tab>
              ))}
            </Tabs>
          </div>
        </div>
      </>
    )
  }
}

export default PublicSampleResponse
