import React, { Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import JSONPretty from 'react-json-pretty'
import { willHighlight, getHighlightsData } from './highlightChangesHelper'
import './endpoints.scss'
import { Style } from 'react-style-tag'
import { hexToRgb } from '../common/utility'

class PublicSampleResponse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: {
        publicCollectionTheme: this.props.publicCollectionTheme,
        backgroundStyle: {}
      },
    };
  }
  componentDidMount() {
    this.updateBackgroundStyle();
  }
  updateBackgroundStyle() {
    const { publicCollectionTheme } = this.state.theme;
    const dynamicColor = hexToRgb(publicCollectionTheme, 0.02);
    const staticColor = '#fafafa';

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    this.setState(prevState => ({
      theme: {
        ...prevState.theme,
        backgroundStyle,
      },
    }));
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
                background: ${this.props.publicCollectionTheme};
                color:#fff;
              } 
          `}
        </Style>
        <div className='pubSampleResponse'>
          <h3 className='heading-2 pt-1 mt-4'>
            <span>Sample Response {willHighlight(this.props, 'sampleResponse') ? <i className='fas fa-circle' /> : null}</span>
          </h3>
          <div className='sample-response mb-1' style={this.state.theme.backgroundStyle}>
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
