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
          Sample code for {this.selectedLanguageName}
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
              onCopy={() => this.setState({ copied: true })}
              className='copy-to-clipboard'
            >
              <button>
                {this.state.copied
                  ? (
                    <i className='fas fa-check' />
                    )
                  : (
                    <i className='fas fa-clone' />
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
