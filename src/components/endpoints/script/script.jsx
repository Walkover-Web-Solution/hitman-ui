import React, { Component } from 'react'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/webpack-resolver'
import AceEditor from 'react-ace'
import { Snippets, preReqSnippets, postReqSnippets } from './snippets'

export class Script extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedRawBodyType: 'javascript',
      scriptEditorText: ''
    }
    this.scriptEditor = ''
    this.scriptFetched = false
  }

  componentDidMount () {
    if (this.props.scriptText) {
      this.setState({ scriptEditorText: this.props.scriptText })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.scriptText && !this.scriptFetched) {
      this.setState({ scriptEditorText: this.props.scriptText })
      this.scriptFetched = true
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
    this.scriptEditor.editor.scrollToLine(newPosition.row)
  }

  renderScriptEditor () {
    return (
      <div className='col-8'>
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
    let snippets
    switch (this.props.type) {
      case 'Pre-Script': snippets = preReqSnippets; break
      case 'Post-Script': snippets = postReqSnippets; break
      default: snippets = []; break
    }
    return (
      <div className='snippets col-4'>
        <h4>Snippets</h4>
        {snippets.map((snippet, index) => (
          <div key={index} onClick={() => this.insertSnippet(Snippets[snippet])}>
            {Snippets[snippet].key}
          </div>
        ))}
      </div>
    )
  }

  render () {
    return (
      <div className='row'>
        {this.renderScriptEditor()}
        {this.snippetsList()}
      </div>
    )
  }
}

export default Script
