import React, { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

export default function TinyEditor (props) {
  const editorRef = useRef(null)
  const handleOnChange = (value) => {
    props.onChange(value)
  }
  return (
    <>
      <Editor
        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
        onEditorChange={handleOnChange.bind(this)}
        onInit={(evt, editor) => { editorRef.current = editor }}
        value={props.data}
        inline={props.isInlineEditor}
        disabled={props.disabled}
        init={{
          plugins: 'link image codesample table lists',
          selector: 'textarea',
          branding: false,
          inline_boundaries: false,
          menu: false,
          height: props.minHeight || 250,
          menubar: false,
          table_appearence_option: true,
          table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
          toolbar: 'formatselect | bold italic underline forecolor backcolor | fontsizeselect | blockquote | numlist bullist | indent outdent | codesample | table | image | link',
          content_style: 'body { font-family:Roboto; font-size:12px }'
        }}
      />
    </>
  )
}
