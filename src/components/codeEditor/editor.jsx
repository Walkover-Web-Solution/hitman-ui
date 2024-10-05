import React, { useEffect, useState } from 'react'
import AceEditor from 'react-ace'
import './editor.scss'

// Import a mode (syntax highlighting for HTML)
import 'ace-builds/src-noconflict/mode-html'
// Import a theme (for editor styling)
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'
import { defaultheader, defaultfooter } from './defaultblock';



const Editor = ({ header, setHeader, footer, setFooter }) => {
  const [code, setCode] = useState(defaultheader);
  const [code2, setCode2] = useState(defaultfooter);

  const handleChange = (newCode) => {
    setCode(newCode); 
    setHeader(newCode);
  }

  const handleChange2 = (newCode) => {
  setCode2(newCode); 
   setFooter(newCode);
    
  }

  return (
    <div className='wrapper'>
      <div className='editor'>
        <div className='box'>
          <h3 className='textblock'>Customize Your Header</h3>
          <AceEditor
            mode='html'
            theme='github'
            name='html_editor'
            onChange={handleChange}
            value={code}
            fontSize={16}
            width='100%'
            height='200px'
            editorProps={{ $blockScrolling: true }}
          />
        </div>

        <div className='preview-block'>
          <h4 className='textblock'>Preview </h4>
          <div className='preview-content' dangerouslySetInnerHTML={{ __html: code }} />
        </div>

        <div className='box'>
          <h3 className='textblock'>Customize Your Footer</h3>
          <AceEditor
            mode='html'
            theme='github'
            name='html_editor'
            onChange={handleChange2}
            value={code2}
            fontSize={16}
            width='100%'
            height='200px'
            editorProps={{ $blockScrolling: true }}
          />
        </div>

        <div className='preview-block'>
          <h4 className='textblock'>Preview</h4>
          <div className='preview-content' dangerouslySetInnerHTML={{ __html: code2 }} />
        </div>
      </div>
    </div>
  )
}

export default Editor
