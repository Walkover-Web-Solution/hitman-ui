import './endpoints.scss'
import React, { Component } from 'react'
import { ListGroup, Col } from 'react-bootstrap'
import 'ace-builds'
import AceEditor from 'react-ace'
import 'ace-builds/webpack-resolver'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { toast } from 'react-toastify'
const HTTPSnippet = require('httpsnippet')

class CodeTemplate extends Component {
  constructor (props) {
    super(props)
    this.state = {
      theme: ''
    }

    this.languages = {
      node: { name: 'Node' },
      shell: { name: 'Shell' },
      c: { name: 'C' },
      csharp: { name: 'Csharp' },
      javascript: { name: 'JavaScript' },
      php: { name: 'PHP' },
      r: { name: 'R' },
      ruby: { name: 'Ruby' },
      swift: { name: 'Swift' },
      java: { name: 'JAVA' },
      clojure: { name: 'Clojure' },
      go: { name: 'go' },
      htpp: { name: 'http' },
      objc: { name: 'objc' },
      ocaml: { name: 'ocaml' },
      python: { name: 'Python' }
    }

    this.selectedLanguage = 'node'
  }

  makeCodeSnippet () {
    const harObject = this.props.harObject
    const {
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData,
      queryString
    } = harObject
    const snippet = new HTTPSnippet({
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData,
      queryString
    })
    return snippet
  }

  makeCodeTemplate (selectedLanguage) {
    this.selectedLanguage = selectedLanguage
    this.selectedLanguageName = this.languages[selectedLanguage].name
    let codeSnippet = ''
    try {
      const snippet = this.makeCodeSnippet()
      codeSnippet = snippet.convert(selectedLanguage)
    } catch (error) {
      toast.error(error.name + ': ' + error.message)
    }
    this.setState({ codeSnippet, copied: false })
  }

  componentDidMount () {
    if (this.props.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.harObject !== prevProps.harObject) {
      this.makeCodeTemplate(this.selectedLanguage)
    }
  }

  render () {
    const { theme } = this.state

    return (
      <div className='pubCodeWrapper'>
        <div className='code-heading' style={{ color: theme }}>
          Sample code for  {this.selectedLanguageName}
        </div>
        <Col id='code-window-sidebar' xs={12}>
          <ListGroup>
            {Object.keys(this.languages).map((key) => (
              <ListGroup.Item
                key={key}
                className={
                  this.languages[key].name === this.selectedLanguageName
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  this.makeCodeTemplate(key)
                }}
              >
                {this.languages[key].name}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <v1 />
        </Col>
        <Col className='editor-body-wrapper' xs={12}>
          <div id='code-window-body'>
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
                  : (
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 6.75H8.25C7.42157 6.75 6.75 7.42157 6.75 8.25V15C6.75 15.8284 7.42157 16.5 8.25 16.5H15C15.8284 16.5 16.5 15.8284 16.5 15V8.25C16.5 7.42157 15.8284 6.75 15 6.75Z' stroke='#ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 11.25H3C2.60218 11.25 2.22064 11.092 1.93934 10.8107C1.65804 10.5294 1.5 10.1478 1.5 9.75V3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H9.75C10.1478 1.5 10.5294 1.65804 10.8107 1.93934C11.092 2.22064 11.25 2.60218 11.25 3V3.75' stroke='#ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg>
                    )}
              </button>
            </CopyToClipboard>
          </div>{' '}
          <div className='ace-editor-wrapper'>
            {' '}
            <AceEditor
              mode={this.selectedLanguage.toLowerCase()}
              theme='github'
              value={
                this.state.codeSnippet
                  ? this.state.codeSnippet
                  : this.codeSnippet
              }
              setOptions={{
                showLineNumbers: true
              }}
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
    )
  }
}

export default CodeTemplate
