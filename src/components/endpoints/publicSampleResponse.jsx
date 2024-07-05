import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import JSONPretty from 'react-json-pretty';
import { Style } from 'react-style-tag';
import { hexToRgb } from '../common/utility';
import { willHighlight, getHighlightsData } from './highlightChangesHelper';
import { background } from '../backgroundColor.js';
import './endpoints.scss';

const PublicSampleResponse = (props) => {
  const [theme, setTheme] = useState({
    publicCollectionTheme: props.publicCollectionTheme,
    backgroundStyle: {},
  });

  useEffect(() => {
    updateBackgroundStyle();
  }, [props.publicCollectionTheme]);

  const updateBackgroundStyle = () => {
    const { publicCollectionTheme } = theme;
    const dynamicColor = hexToRgb(publicCollectionTheme, 0.02);
    const staticColor = background['background_boxes'];

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    setTheme((prevState) => ({
      ...prevState,
      backgroundStyle,
    }));
  };

  const showJSONPretty = (data) => {
    return <JSONPretty data={data} />;
  };

  const showSampleResponseBody = (data) => {
    if (typeof data === 'object') {
      return showJSONPretty(data);
    } else {
      try {
        data = JSON.parse(data);
        return showJSONPretty(data);
      } catch (err) {
        return <pre>{data}</pre>;
      }
    }
  };

  return (
    <>
      <Style>
        {`
          .sample-response nav.nav.nav-tabs a.active {
                background: ${props.publicCollectionTheme};
                color:#fff;
              } 
          `}
      </Style>
      <div className='pubSampleResponse'>
        <h3 className='heading-2 pt-1 mt-4'>
          <span>Sample Response {willHighlight(props, 'sampleResponse') ? <i className='fas fa-circle' /> : null}</span>
        </h3>
        <div className='sample-response mb-1' style={theme.backgroundStyle}>
          <Tabs id='uncontrolled-tab-example'>
            {props.sample_response_array.map((sampleResponse, key) => (
              <Tab
                key={key}
                eventKey={sampleResponse.title}
                title={
                  getHighlightsData(props, 'sampleResponse', sampleResponse.title) ? (
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
                <div>{showSampleResponseBody(sampleResponse.data)}</div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PublicSampleResponse;
