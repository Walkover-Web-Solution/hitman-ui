import React, { Component } from 'react'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/webpack-resolver'
import AceEditor from 'react-ace'
import Snippets from './snippets'

const snippets = { ...Snippets }
export class Script extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedRawBodyType: 'TEXT',
      scriptEditorText: ''
    }
    this.scriptEditor = ''
  }

  componentDidMount () {
    if (this.props.scriptText) {
      this.setState({ scriptEditorText: this.props.scriptEditorText })
    }
  }

  handleChange (value) {
    this.setState({ scriptEditorText: value })
    this.props.handleScriptChange(value, this.props.type)
  }

  selectScript (selectedScriptType) {
    this.setState({ selectedScriptType })
  }

  insertSnippet (snippet) {
    const position = { ...this.scriptEditor.editor.getCursorPosition() }
    const newPosition = {
      row: position.row + 1,
      column: 0
    }
    this.scriptEditor.editor.session.insert(newPosition, snippet?.value + '\n')
  }

  renderScriptEditor () {
    return (
      <div>
        {' '}
        <AceEditor
          className='custom-raw-editor'
          mode={this.state.selectedRawBodyType.toLowerCase()}
          theme='github'
          value={
          this.state.scriptEditorText
        }
          onChange={this.handleChange.bind(this)}
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
          ref={e => { this.scriptEditor = e }}
        />
      </div>
    )
  }

  snippetsList () {
    return (
      <div className=''>
        {Object.values(snippets).map((snippet, index) => (
          <div key={index} onClick={() => this.insertSnippet(snippet)}>
            {snippet.key}
          </div>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div className=''>
        {this.renderScriptEditor()}
        {this.snippetsList()}
      </div>
    )
  }
}

export default Script
