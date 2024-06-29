import { ReactComponent as EmptyResponseImg } from './img/empty-response.svg'
import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import { hexToRgb, isDashboardRoute, isSavedEndpoint } from '../common/utility'
import { getCurrentUser } from '../auth/authServiceV2'
import SampleResponseForm from './sampleResponseForm'
import { Overlay, Spinner, Tooltip } from 'react-bootstrap'
import TestResults from './testResults'
import addtosample from '../../assets/icons/addToSamplesign.svg'
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
import classNames from 'classnames';
const JSONPrettyMon = require('react-json-pretty/dist/monikai');

const mapStateToProps = (state) => {
  return {
    tabs: state?.tabs?.tabs,
  };
};

const DisplayResponse = (props) => {
  const [state, setState] = useState({
    responseString: '',
    timeElapsed: '',
    show: false,
    showSampleResponseForm: { add: false, delete: false, edit: false },
    theme: '',
    showCopyMessage: false,
    selectedResponseTab: 'body',
    isOpen: false,
    isShow: false,
    Open: false,
    Show: false,
    showPreScript: true,
    selectedBodyTab: 'pretty',
  });

  const copyDivRef = useRef();

  const addSampleResponse = (response) => {
    openAddForm(response, null, 'Add Sample Response');
  };

  const openAddForm = (obj, index, name) => {
    const showSampleResponseForm = { ...state.showSampleResponseForm };
    showSampleResponseForm.add = true;
    setState(prevState => ({
      ...prevState,
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    }));
  };

  const closeForm = () => {
    const showSampleResponseForm = { add: false, delete: false, edit: false };
    setState(prevState => ({ ...prevState, showSampleResponseForm }));
  };

  const showAddForm = () => {
    return (
      state.showSampleResponseForm.add && (
        <SampleResponseForm
          {...props}
          show
          onHide={closeForm}
          title={state.sampleResponseFormName}
          selectedSampleResponse={state.selectedSampleResponse}
          index={state.index}
        />
      )
    );
  };

  useEffect(() => {
    if (!state.theme) {
      setState(prevState => ({ ...prevState, theme: props.publicCollectionTheme }));
    }
  }, [props.publicCollectionTheme, state.theme]);

  useEffect(() => {
    setState(prevState => ({ ...prevState, selectedResponseTab: 'body' }));
  }, [props.response]);

  const showCopyMessage = () => {
    setState(prevState => ({ ...prevState, showCopyMessage: true }));
    setTimeout(() => {
      setState(prevState => ({ ...prevState, showCopyMessage: false }));
    }, 2000);
  };

  const displayBodyAndHeaderResponse = () => {
    const TestResultsPreview = () => {
      const tests = props.tests;
      if (!tests) return null;
      const failedTests = tests.filter((test) => test.success === false);
      const passedTests = tests.filter((test) => test.success === true);
      let testMessage = '';
      let testMessageColor = 'inherit';
      if (failedTests.length) {
        testMessage = `(${failedTests.length} / ${tests.length} Failed)`;
        testMessageColor = 'red';
      } else if (passedTests.length) {
        testMessage = `(${passedTests.length} / ${tests.length} Passed)`;
        testMessageColor = 'green';
      }
      return <span style={{ color: testMessageColor }}>{testMessage}</span>;
    };

    return (
      <>
        <div className='custom-tabs' ref={copyDivRef}>
          <ul className='nav nav-tabs respTabsListing' id='myTab' role='tablist'>
            <li
              className='nav-item'
              onClick={() => {
                setState(prevState => ({ ...prevState, selectedResponseTab: 'body' }));
              }}
            >
              <a
                className={state.selectedResponseTab === 'body' ? 'nav-link active' : 'nav-link'}
                style={state.selectedResponseTab === 'body' ? { backgroundColor: props.publicCollectionTheme } : {}}
                id='pills-response-tab'
                data-toggle='pill'
                role='tab'
                aria-controls={isDashboardRoute(props) ? `response - ${props.tab.id} ` : 'response'}
                aria-selected='true'
              >
                Body
              </a>
            </li>
            <li
              className='nav-item'
              onClick={() => {
                setState(prevState => ({ ...prevState, selectedResponseTab: 'header' }));
              }}
            >
              <a
                className={state.selectedResponseTab === 'header' ? 'nav-link active' : 'nav-link'}
                style={state.selectedResponseTab === 'header' ? { backgroundColor: props.publicCollectionTheme } : {}}
                id='pills-header-tab'
                data-toggle='pill'
                aria-selected='false'
                href='#pills-header-tab'
                role='tab1'
              >
                Headers
              </a>
            </li>
            {isDashboardRoute(props) && (
              <>
                <li
                  className='nav-item'
                  onClick={() => {
                    setState(prevState => ({ ...prevState, selectedResponseTab: 'testResults' }));
                  }}
                >
                  <a
                    className={state.selectedResponseTab === 'testResults' ? 'nav-link active' : 'nav-link'}
                    id='pills-testResults-tab'
                    data-toggle='pill'
                    aria-selected='false'
                    href='#pills-testResults-tab'
                    role='tab2'
                  >
                    Test Results <TestResultsPreview />
                  </a>
                </li>
                <li
                  className='nav-item'
                  onClick={() => {
                    setState(prevState => ({ ...prevState, selectedResponseTab: 'console' }));
                  }}
                >
                  <a
                    className={state.selectedResponseTab === 'console' ? 'nav-link active' : 'nav-link'}
                    style={state.selectedResponseTab === 'console' ? { backgroundColor: props.publicCollectionTheme } : {}}
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
        </div>
      </>
    );
  };

  const renderTableData = () => {
    const headerContent = props.response.headers;
    const headerContentKeys = Object.keys(headerContent);
    return headerContentKeys.map((key, index) => {
      const value = headerContent[key];
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

  const displayHeader = () => {
    if (props.response.headers) {
      return (
        <div className='response-headers-container'>
          <table className='table table-sm fs-6'>
            <thead>
              <tr>
                <th scope='col'>Key</th>
                <th scope='col'>Value</th>
              </tr>
            </thead>
            <tbody>{renderTableData()}</tbody>
          </table>
        </div>
      );
    }
  };

  const displayConsole = () => {
    return <div className='test-results-container px-2'>{renderConsole()}</div>
  };

  const handlePreScriptClick = () => {
    setState((prev) => { return { ...prev, showPreScript: true } });
  };

  const handlePostScriptClick = () => {
    setState((prev) => { return { ...prev, showPreScript: false } });
  };

  const renderConsole = () => {
    const { tabs, activeTabId } = props;
    const checkWhetherJsonOrNot = (data) => {
      try {
        if (JSON.parse(data)) return true
        return false
      }
      catch (error) {
        return false
      }
    }
    function RenderConsoleComponent(props) {
      let consoleString = ''
      props.data.forEach((singleConsole, index) => {
        const isJson = checkWhetherJsonOrNot(singleConsole)
        if (isJson) consoleString = consoleString + (index === 0 ? '' : '\n\n') + JSON.stringify(JSON.parse(singleConsole), null, 2)
        else consoleString = consoleString + (index === 0 ? '' : '\n\n') + singleConsole
      })
      return (
        <div className='p-2'>
          <AceEditor
            style={{ border: '1px solid rgb(206 213 218)' }}
            className='custom-raw-editor'
            mode='json'
            theme='github'
            value={consoleString}
            showGutter={false}
            readOnly={true}
            setOptions={{
              showLineNumbers: true
            }}
            editorProps={{
              $blockScrolling: false
            }}
            onLoad={(editor) => {
              editor.getSession().setUseWrapMode(true)
              editor.setShowPrintMargin(false)
            }}
          />
        </div>
      )
    }

    return (
      <div className='w-100'>
        <div className='console-button'>
          <button
            className={classNames('btn', 'btn-sm', 'fs-4', 'mr-2', { active: state.showPreScript })}
            onClick={handlePreScriptClick}
          >
            Pre-Script
          </button>
          <button
            className={classNames('btn', 'btn-sm', 'fs-4', { active: !state.showPreScript })}
            onClick={handlePostScriptClick}
          >
            Post-Script
          </button>
        </div>
        <RenderConsoleComponent data={state.showPreScript ? tabs?.[activeTabId]?.preScriptExecutedData || [] : tabs?.[activeTabId]?.postScriptExecutedData || []} />
      </div>
    );
  };

  const renderLoader = () => {
    return (
      <div className='text-center my-5'>
        <Spinner variant='dark' animation='border' />
        <div className='my-2'>Sending Request</div>
        <button className='btn btn-outline orange' onClick={props.handleCancel}>
          Cancel
        </button>
      </div>
    );
  };

  const renderRequestError = () => {
    return (
      <div className='text-center my-5'>
        <div>Could not send request</div>
        <small className='text-danger'>{props.response.data}</small>
      </div>
    );
  };

  const renderStatusMessage = () => {
    const { status, statusText } = props.response;
    const color = status >= 400 || status >= 500 ? 'error' : status >= 200 && status < 300 ? 'success' : 'regular';
    return <div className={`response-status-value-${color}`}>{status + ' ' + statusText}</div>;
  };

  return (
    <div className='endpoint-response-container overflow-auto mt-4' style={{ backgroundColor: hexToRgb(state?.theme, '0.04') }}>
      {props.loader ? renderLoader() :
        props.flagResponse ? (
          props.response.status ? (
            <div>
              <div className='response-status justify-content-end'>
                <div className='statusWrapper'>
                  {props.response.status && (
                    <div id='status'>
                      <div className='response-status-item-name'>Status :</div>
                      {renderStatusMessage()}
                    </div>
                  )}
                  <div id='time'>
                    <div className='response-status-item-name'>Time:</div>
                    <div className='response-status-value' style={{ color: state.theme }}>
                      {props.timeElapsed} ms
                    </div>
                  </div>
                  <Overlay target={copyDivRef.current} show={state.showCopyMessage} placement='top'>
                    <Tooltip id='copy-message'>Copied</Tooltip>
                  </Overlay>
                  <div className='resPubclipboardWrapper' ref={copyDivRef} onClick={showCopyMessage}>
                    <CopyToClipboard text={JSON.stringify(props.response.data)} onCopy={() => setState(prevState => ({ ...prevState, copied: true }))}>
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
              {showAddForm()}
              <div className='response-viewer'>
                {props.response.status && displayBodyAndHeaderResponse()}
                {state.selectedResponseTab === 'body' && (
                  <div>
                    <div className='d-flex justify-content-between mt-2 mb-1'>
                      <ul className='nav nav-pills body-button'>
                        <li className='nav-item cursor-pointer' onClick={() => setState((prev) => { return { ...prev, selectedBodyTab: 'pretty' } })}>
                          <a className={state.selectedBodyTab === 'pretty' ? 'nav-link active px-2 py-1 fs-4' : 'nav-link px-2 py-1 fs-4'}>Pretty</a>
                        </li>
                        <li className='nav-item cursor-pointer' onClick={() => setState((prev) => { return { ...prev, selectedBodyTab: 'raw' } })}>
                          <a className={state.selectedBodyTab === 'raw' ? 'nav-link active px-2 py-1 fs-4 ml-2' : 'nav-link px-2 py-1 fs-4 ml-2'}>Raw</a>
                        </li>
                        <li className='nav-item cursor-pointer' onClick={() => setState((prev) => { return { ...prev, selectedBodyTab: 'preview' } })}>
                          <a className={state.selectedBodyTab === 'preview' ? 'nav-link active px-2 py-1 fs-4 ml-2' : 'nav-link px-2 py-1 fs-4 ml-2'}>Preview</a>
                        </li>
                      </ul>
                      {getCurrentUser() && isSavedEndpoint(props) && isDashboardRoute(props) ? (
                        <div className='add-to-sample-response'>
                          <div className='adddescLink' onClick={() => addSampleResponse(props.response)}>
                            <img src={addtosample} /> Add to Sample Response
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className='tab-content'>
                      {state.selectedBodyTab === 'pretty' && <div>
                        <AceEditor
                          style={{ border: '1px solid rgb(206 213 218)' }}
                          className='custom-raw-editor'
                          mode='json'
                          theme='github'
                          value={JSON.stringify(props.response.data, null, 2)}
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
                      {state.selectedBodyTab === 'raw' && <div> <>
                        {isDashboardRoute(props) && (
                          <div className='tab-content bg-white border rounded' id='myTabContent'>
                            <div className='tab-pane fade show active' id='home' role='tabpanel' aria-labelledby='home-tab'>
                              <JSONPretty className='raw-response' theme={JSONPrettyMon} data={props.response.data} />
                            </div>
                            <div className='tab-pane fade' id='profile' role='tabpanel' aria-labelledby='profile-tab'>
                              {JSON.stringify(props.response.data)}
                            </div>
                            <div className='tab-pane fade' id='contact' role='tabpanel' aria-labelledby='contact-tab'>
                              Feature coming soon... Stay tuned
                            </div>
                          </div>
                        )}
                        {!isDashboardRoute(props) && (
                          <div className='tab-content'>
                            <JSONPretty theme={JSONPrettyMon} data={props.response.data} />
                          </div>
                        )}
                      </></div>}
                      {state.selectedBodyTab === 'preview' && <div>
                        <div className='border p-2 rounded bg-white' dangerouslySetInnerHTML={{ __html: JSON.stringify(props.response.data) }} />
                      </div>}
                    </div>
                  </div>
                )}
                {state.selectedResponseTab === 'header' && props.response.headers && displayHeader()}
                {state.selectedResponseTab === 'testResults' && isDashboardRoute(props) && props.tests && (
                  <TestResults tests={props.tests} />
                )}
                {state.selectedResponseTab === 'console' && displayConsole()}
              </div>
            </div>
          ) : (
            renderRequestError()
          )
        ) : (
          <div>
            <div className='empty-response'>Response</div>
            <div className='empty-response-container'>
              <EmptyResponseImg />
              <p p className='mt-0'>Hit Send to trigger the API call</p>
            </div>
          </div>
        )}
    </div>
  );
}
export default connect(mapStateToProps, null)(DisplayResponse)