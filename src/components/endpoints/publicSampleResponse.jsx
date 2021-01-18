import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import { willHighlight, getHighlightsData } from './highlightChangesHelper'
import './endpoints.scss'
import { Style } from 'react-style-tag'

const JSONPrettyMon = require('react-json-pretty/dist/monikai')

class PublicSampleResponse extends Component {
  state = {
    theme: this.props.publicCollectionTheme
  };

  render () {
    return (
      <>
        <Style>{`
      .sample-response nav.nav.nav-tabs a.active {
        background: ${this.state.theme};
        color:#fff;
      } 
    `}
        </Style>
        <div className='pubSampleResponse'>
          <div>
            <h3 className='heading-2'><span>Sample Response {willHighlight(this.props, 'sampleResponse') ? <i className='fas fa-circle' /> : null}</span></h3>
          </div>
          <div className='sample-response'>
            <Tabs id='uncontrolled-tab-example'>
              {this.props.sample_response_array.map((sampleResponse) => (
                <Tab
                  key={sampleResponse}
                  eventKey={sampleResponse.title}
                  title={getHighlightsData(this.props, 'sampleResponse', sampleResponse.title) ? <span>{sampleResponse.title}<i className='fas fa-circle' /></span> : sampleResponse.title}
                >
                  <div>{sampleResponse.status}</div>
                  <div>{sampleResponse.description}</div>
                  <div>
                    <JSONPretty
                      theme={JSONPrettyMon}
                      data={sampleResponse.data}
                    />
                  </div>
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
