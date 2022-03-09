import React, { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

export default function TinyEditor (props) {
  const editorRef = useRef(null)
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent())
    }
  }
  return (
    <>
      <Editor
        onInit={(evt, editor) => { editorRef.current = editor }}
        initialValue='<p>{This is the initial content of the editor.}</p>'
        init={{
          height: 250,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
           'bold italic backcolor | alignleft aligncenter ' +
           'alignright alignjustify | bullist numlist outdent indent | ' +
           'removeformat | help',
          content_style: 'body { font-family:Roboto; font-size:12px }',
          skin: 'oxide-dark'
        }}
      />
      <button className='btn btn-primary mt-3 mb-3' onClick={log}>Log editor content</button>
    </>
  )
}
