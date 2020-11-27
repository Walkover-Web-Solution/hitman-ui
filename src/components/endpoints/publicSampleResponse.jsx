import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
const JSONPrettyMon = require('react-json-pretty/dist/monikai')

class PublicSampleResponse extends Component {
  state = {}

  render () {
    return (
      <div>
        <div>Sample Response</div>
        <div className='sample-response'>
          <Tabs defaultActiveKey='profile' id='uncontrolled-tab-example'>
            {this.props.sample_response_array.map((sampleResponse) =>
              <Tab key={sampleResponse} eventKey={sampleResponse.status} title={sampleResponse.status}>
                <div>
                  {sampleResponse.description}
                </div>
                <br />
                <div>
                  <JSONPretty
                    theme={JSONPrettyMon}
                    data={sampleResponse.data}
                  />
                </div>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    )
  }
}

export default PublicSampleResponse
