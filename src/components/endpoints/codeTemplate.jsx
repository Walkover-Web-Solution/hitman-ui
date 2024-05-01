import './endpoints.scss'
import React, { Component } from 'react'
import { Dropdown, Col } from 'react-bootstrap'
import 'ace-builds'
import AceEditor from 'react-ace'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-tomorrow_night'
import 'ace-builds/src-noconflict/theme-github'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { languages, primaryLanguages, secondaryLanguages } from './languages'
import { RiCloseLine } from "react-icons/ri";
import { RxCopy } from "react-icons/rx";

const HTTPSnippet = require('httpsnippet')

class CodeTemplate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      theme: ''
    }
    this.selectedLanguage = 'shell'
  }

  makeCodeSnippet() {
    const harObject = this.props.harObject
    let { method, url, httpVersion, cookies, headers, postData } = harObject
    const snippet = new HTTPSnippet({
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData
    })
    return snippet
  }

  makeCodeTemplate(selectedLanguage) {
    const harObject = this.props.harObject
    if (!harObject || !harObject.method) return
    this.selectedLanguage = selectedLanguage
    this.selectedLanguageName = languages[selectedLanguage].name
    let codeSnippet = ''
    try {
      const snippet = this.makeCodeSnippet()
      if (selectedLanguage === 'axiosNode') {
        codeSnippet = snippet.convert('node', 'axios');
      } else {
        codeSnippet = snippet.convert(selectedLanguage);
      }
      codeSnippet = decodeURI(codeSnippet)
    } catch (error) {
      console.error(error)
    }
    this.setState({ codeSnippet, copied: false })
  }

  componentDidMount() {
    if (this.props.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.harObject !== prevProps.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
  }

  handleCloseClick = () => {
    this.props.updateCurlSlider(false)
  }

  getClassForLanguages = (key) => {
    const commonClass = 'mr-2 d-flex d-md-flex flex-column justify-content-center align-items-center';
    let classToReturn = key === this.selectedLanguage ? 'active ' + commonClass : commonClass;
    return this.props.theme !== 'light' ? classToReturn + ' col-white' : classToReturn;
  }

  render() {
    return (
      <div className={(this.props.match.params.endpointId) ? "show-curl-endpoint pubCodeWrapper" : "pubCodeWrapper"}>
        <div className='inner-editor'>
          <Col id='code-window-sidebar' xs={12} className=''>
            <div className='code-heading mb-3 d-flex justify-content-center align-items-center'>
              <span className={this.props.theme === 'light' ? 'col-black' : 'col-white'}>Sample code</span>
              {this.props.showClosebtn && <div className='d-flex justify-content-end flex-grow-1'>
                <RiCloseLine color='black' className='cur-pointer' onClick={this.handleCloseClick} />
              </div>}
            </div>
            <div className='select-code-wrapper d-flex mb-3 img'>
              {primaryLanguages.map((key) => (
                <button
                  key={key}
                  className={`${(this.props.match.params.endpointId) ? "btn btn-outline-dark" : ""}  ${this.getClassForLanguages(key)}`}
                  onClick={() => {
                    this.makeCodeTemplate(key)
                  }}
                >
                  <img src={languages[key].imagePath} alt={languages[key].name} />
                  {languages[key].name}
                </button>
              ))}
              <button className='codeTemplateButtonMore  d-flex justify-content-center align-items-center p-0'>
                <Dropdown >
                  <Dropdown.Toggle className={secondaryLanguages.includes(this.selectedLanguage) ? 'active dropdownMore mr-0' : 'dropdownMore mr-0'}>
                    {primaryLanguages.includes(this.selectedLanguage) ? (
                      <span>More</span>
                    ) : (
                      <span>{languages[this.selectedLanguage].name}</span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {secondaryLanguages.map((key) => (
                      <Dropdown.Item
                        key={key}
                        className={key === this.selectedLanguage ? 'active mb-2 mt-2' : 'mb-2 mt-2'}
                        onClick={() => {
                          this.makeCodeTemplate(key)
                        }}
                      >
                        <img src={languages[key].imagePath} alt={languages[key].name} className='mr-2' />
                        {languages[key].name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </button>
            </div>
          </Col>
          <Col className='editor-body-wrapper' xs={12}>
            <div id='code-window-body' className='copy-button'>
              <CopyToClipboard
                text={this.state.codeSnippet ? this.state.codeSnippet : this.codeSnippet}
                onCopy={() =>
                  this.setState({ copied: true }, () => {
                    setTimeout(() => {
                      this.setState({ copied: false })
                    }, 2000)
                  })
                }
                className='copy-to-clipboard'
              >
                <button>{this.state.copied ? <span className='text-success'>Copied! </span> : <RxCopy className='cur-pointer' color={this.props.theme ===  'light' ? 'black' : "white"} />}</button>
              </CopyToClipboard>
            </div>{' '}
            <div className='ace-editor-wrapper'>
              <AceEditor
                mode={languages[this.selectedLanguage].mode}
                theme={this.props.theme === 'light' ? 'kuroir' : "tomorrow_night"}
                highlightActiveLine={false}
                focus={false}
                value={this.state.codeSnippet ? this.state.codeSnippet : this.codeSnippet}
                readOnly
                editorProps={{
                  $blockScrolling: false
                }}
                showGutter={false}
                onLoad={(editor) => {
                  editor.getSession().setUseWrapMode(true)
                  editor.setShowPrintMargin(false)
                }}
              />
            </div>
          </Col>
        </div>
      </div>
    )
  }
}

export default CodeTemplate
