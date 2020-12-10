import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
const JSONPrettyMon = require('react-json-pretty/dist/monikai')

class PublicSampleResponse extends Component {
  state = {};

  render () {
    return (
      <div className='pubSampleResponse'>
        <div>
          <h3 className='heading-2'>Sample Response</h3>
        </div>
        <div className='sample-response'>
          <Tabs id='uncontrolled-tab-example'>
            {this.props.sample_response_array.map((sampleResponse) => (
              <Tab
                key={sampleResponse}
                eventKey={sampleResponse.title}
                title={sampleResponse.title}
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
    )
  }
}

export default PublicSampleResponse
