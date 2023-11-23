import './endpoints.scss'
import React, { Component } from 'react'
import { Dropdown, Col } from 'react-bootstrap'
import 'ace-builds'
import AceEditor from 'react-ace'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-tomorrow_night'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ReactComponent as CopyIcon } from '../../assets/icons/copyIcon.svg'
import { languages, primaryLanguages, secondaryLanguages } from './languages'
import CloseIcon from '../../assets/icons/x.svg'
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
    let {
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData
    } = harObject
    url = encodeURI(url)
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
    this.selectedLanguage = selectedLanguage
    this.selectedLanguageName = languages[selectedLanguage].name
    let codeSnippet = ''
    try {
      const snippet = this.makeCodeSnippet()
      codeSnippet = snippet.convert(selectedLanguage)
    } catch (error) {
      console.log(error)
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

  // toggleCodeEditor() {
  //   this.props.editorToggle()
  // }

  render() {
    const {theme } = this.state
    return (
      <div className={'pubCodeWrapper'}>
        <div className='inner-editor'>
          <Col id='code-window-sidebar' xs={12} className=''>
            <div className='code-heading mb-3 d-flex justify-content-center'>
              <span>Sample code</span>
            </div>
            <div className='select-code-wrapper d-flex mb-3 img'>
              {primaryLanguages.map(key => (
                <button
                  key={key}
                  className={key === this.selectedLanguage ? 'active' : ''}
                  onClick={() => {
                    this.makeCodeTemplate(key)
                  }}
                >
                  <img src={languages[key].imagePath} alt={languages[key].name} />
                  {languages[key].name}
                </button>
              ))}
              <Dropdown>
                <Dropdown.Toggle variant='default' className={secondaryLanguages.includes(this.selectedLanguage) ? 'active' : ''}>
                  {primaryLanguages.includes(this.selectedLanguage) ? <span>More</span> : <span>{languages[this.selectedLanguage].name}</span>}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {secondaryLanguages.map((key) => (
                    <Dropdown.Item
                      key={key}
                      className={key === this.selectedLanguage ? 'active' : ''}
                      onClick={() => {
                        this.makeCodeTemplate(key)
                      }}
                    >
                      <img src={languages[key].imagePath} alt={languages[key].name} />
                      {languages[key].name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>

              </Dropdown>
            </div>
          </Col>
          <Col className='editor-body-wrapper' xs={12}>
            <div id='code-window-body' className='copy-button'>
              <CopyToClipboard
                text={
                  this.state.codeSnippet
                    ? this.state.codeSnippet
                    : this.codeSnippet
                }
                onCopy={() => this.setState({ copied: true }, () => {
                  setTimeout(() => {
                    this.setState({ copied: false })
                  }, 2000)
                })}
                className='copy-to-clipboard'
              >
                <button>
                  {this.state.copied
                    ? (
                      <span className='text-success'>Copied! </span>
                    )
                    : <CopyIcon />}
                </button>
              </CopyToClipboard>
            </div>{' '}
            <div className='ace-editor-wrapper'>
              <AceEditor
                mode={languages[this.selectedLanguage].mode}
                theme='tomorrow_night'
                highlightActiveLine={false}
                focus={false}
                value={
                  this.state.codeSnippet
                    ? this.state.codeSnippet
                    : this.codeSnippet
                }
                readOnly
                editorProps={{
                  $blockScrolling: false
                }}
                onLoad={(editor) => {
                  editor.focus()
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
