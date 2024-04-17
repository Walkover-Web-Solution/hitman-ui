import React, { Component } from 'react'
import 'ace-builds'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/webpack-resolver'
import AceEditor from 'react-ace'
import { Snippets, preReqSnippets, postReqSnippets } from './snippets'

export class Script extends Component {
  constructor(props) {
    super(props)
console.log(props)
    this.state = {
      selectedRawBodyType: 'javascript',
      scriptEditorText: props.scriptText || '',
      preScriptText: '',
      postScriptText:''
     
    }
    this.scriptEditor = ''
    this.scriptFetched = false
    this.scriptEditorRef = React.createRef()
  }

  componentDidMount() {
    if (this.props.scriptText) {
      this.setState({ scriptEditorText: this.props.scriptText })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.scriptText && !this.scriptFetched && this.props.scriptText !== prevProps.scriptText) {
      this.setState({ scriptEditorText: this.props.scriptText || '' })
      this.scriptFetched = true
    }
  }

  handleChange(value) {
    this.setState({ scriptEditorText: value })
    this.props.handleScriptChange(value, this.props.type)
  }

  selectScript(selectedScriptType) {
    this.setState({ selectedScriptType })
  }

  insertSnippet(snippet) {
    const { scriptEditorText } = this.state;
    const editor = this.scriptEditorRef.current.editor;
    const cursorPosition = editor.getCursorPosition();
    const currentRow = cursorPosition.row;
    const nextLinePosition = {
      row: currentRow + 1,
      column: 0
    };

    const snippetText = `${snippet?.value}\n`;
    const updatedScriptText =
    scriptEditorText.substring(0,  editor.session.getDocument().positionToIndex(nextLinePosition)) +
    snippetText +
    scriptEditorText.substring( editor.session.getDocument().positionToIndex(nextLinePosition));

  this.setState({ scriptEditorText: updatedScriptText });
  const endOfInsertedSnippetPosition = {
    row: nextLinePosition.row + snippetText.split('\n').length - 2, // Adjust for the newline character
    column: snippetText.split('\n')[snippetText.split('\n').length - 2].length // Column position of the end of the last line of the snippet
  };
    // const position = { ...this.scriptEditor.editor.getCursorPosition() }
    // const newPosition = {
    //   row: position.row + 1,
    //   column: 0
    // }
    // this.scriptEditor.editor.session.insert(newPosition, snippet?.value + '\n')
    // this.scriptEditor.editor.scrollToLine(newPosition.row)
    editor.gotoLine(endOfInsertedSnippetPosition.row + 1, endOfInsertedSnippetPosition.column);
    editor.scrollToLine(endOfInsertedSnippetPosition.row);
    editor.focus();
  };


  renderScriptEditor() {
    return (
      <div className='col-8'>
        {' '}
        <AceEditor
          className='custom-raw-editor'
          mode='javascript'
          theme='github'
          value={this.state.scriptEditorText}
          onChange={this.handleChange.bind(this)}
          setOptions={{
            showLineNumbers: true
          }}
          editorProps={{
            $blockScrolling: false
          }}
          ref={this.scriptEditorRef}
          onLoad={(editor) => {
            editor.focus()
            editor.getSession().setUseWrapMode(true)
            editor.setShowPrintMargin(false)
          }}
        />
      </div>
    )
  }

  snippetsList() {
    let snippets
    let text
    switch (this.props.type) {
      case 'Pre-Script':
        snippets = preReqSnippets
        text = "Pre-Script are written in Javascript, and are run before the response is recieved."
        break
      case 'Post-Script':
        snippets = postReqSnippets
        text = "Post-Script are written in Javascript, and are run after the response is recieved."
        break
      default:
        snippets = []
        break
    }
    return (
      <div className='snippets col-4'>
        <h4>Snippets</h4>
        <p>{text}</p>
        {snippets.map((snippet, index) => (
          <div key={index} onClick={() => this.insertSnippet(Snippets[snippet])}>
            {Snippets[snippet].key}
          </div>
        ))}
      </div>
    )
  }

  render() {
    return (
      <div className='row'>
        {this.renderScriptEditor()}
        {this.snippetsList()}
      </div>
    )
  }
 
}                                                                                                                                                                             


export default Script