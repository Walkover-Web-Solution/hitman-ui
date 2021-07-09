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

export class Script extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedRawBodyType: 'TEXT',
      scriptEditorText: ''
    }
    this.ace = ''
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

  insertText () {
    const text = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    const position = { ...this.ace.editor.getCursorPosition() }
    this.ace.editor.session.insert(position, '\n' + text)
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
          ref={c => { this.ace = c }}
        />
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.renderScriptEditor()}
        <div onClick={() => this.insertText('hello')}>Hello</div>
      </div>
    )
  }
}

export default Script
