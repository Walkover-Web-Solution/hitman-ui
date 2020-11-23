import './endpoints.scss'
import React, { Component } from 'react'
import { ListGroup, Container, Row, Col } from 'react-bootstrap'
import 'ace-builds'
import AceEditor from 'react-ace'
import 'ace-builds/webpack-resolver'
import { CopyToClipboard } from 'react-copy-to-clipboard'
const HTTPSnippet = require('httpsnippet')

class CodeTemplate extends Component {
  constructor (props) {
    super(props)
    this.state = {}

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
    const snippet = this.makeCodeSnippet()
    const codeSnippet = snippet.convert(selectedLanguage)
    this.setState({ codeSnippet, copied: false })
  }

  componentDidMount () {
    if (this.props.harObject) { this.makeCodeTemplate(this.selectedLanguage) }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.harObject !== prevProps.harObject) { this.makeCodeTemplate(this.selectedLanguage) }
  }

  render () {
    return (
      <div>
        <Container className='d-flex flex-column my-5 mx-1'>
          <Row>
            <Col id='code-window-sidebar' sm={3}>
              <ListGroup>
                {Object.keys(this.languages).map((key) =>
                  (
                    <ListGroup.Item
                      className={this.languages[key].name === this.selectedLanguageName ? 'active' : ''}
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
            <Col sm={9}>
              <div id='code-window-body'>
                <div className='code-heading'>
                  Generated code for {this.selectedLanguageName}
                </div>
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
                    {
                      this.state.copied
                        ? (
                          <i className='fas fa-check' />
                          )
                        : (
                          <i className='fas fa-clone' />
                          )
                    }
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
          </Row>
        </Container>
      </div>
    )
  }
}

export default CodeTemplate
