import React, { useEffect , useState  } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menubar'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table, { createColGroup } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { Color } from '@tiptap/extension-color'

export default function Tiptap({ initial, onChange, disabled, isInlineEditor, minHeight }) {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: minHeight ? 'textEditor minHeight' : 'textEditor',
        id: "headingTop"
      }
    },
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Image,
      TextStyle,
      Color,
      Text,
      Placeholder.configure({
        placeholder: 'Write your text here …'
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-custom-class'
        }
      }),
      TableCell,
      TableRow,
      TableHeader,
      Link.configure({
        linkOnPaste: true,
        openOnClick: true,
        autolink: false
      })
    ],
    content: initial,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editable: !disabled
  })
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const div = document.getElementById('headingTop');
    console.log(div,"div from tiptap")
    if (div) {
      const h2Elements = div.querySelectorAll('h2');
      console.log(h2Elements,"hw")
      h2Elements.forEach((h2, index) => {
        h2.id = `heading${index + 1}`;
      });
      const data = Array.from(h2Elements).map(h2 => h2.innerHTML);
      setHeadings(data);
    }

    return () => {
      if (editor && editor.destroy) {
        editor.destroy();
      }
    };
  }, [editor, setHeadings]);

  return (
    <div className={`textEditorContainer d-flex justify-content-center${!isInlineEditor ? 'editor' : ''}`}>
      {isInlineEditor && editor && (
        <BubbleMenu className='bubble-menu' tippyOptions={{ duration: 100 }} editor={editor}>
          <MenuBar editor={editor} key={editor} />
        </BubbleMenu>
      )}
      {isInlineEditor && editor && (
        <FloatingMenu className='floating-menu' tippyOptions={{ duration: 100 }} editor={editor}>
          <MenuBar editor={editor} key={editor} />
        </FloatingMenu>
      )}
      {!isInlineEditor && <MenuBar editor={editor} key={editor} />}
      <EditorContent editor={editor}  className='public-page-editor' />
        <div className='editor-headings border border-2 p-2 rounded-lg'>
          {headings.map((heading, index) => (
            <a className='heading-page-view d-block overflow-hidden w-100' target='_top' key={index} href={`#heading${index + 1}`}>{heading}</a>
          ))}
        </div>
    </div>
  )
}
