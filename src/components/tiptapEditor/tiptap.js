import React, { useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menubar'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { Color } from '@tiptap/extension-color'

export default function Tiptap ({ initial, onChange, disabled, isInlineEditor, minHeight }) {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: minHeight ? 'textEditor minHeight' : 'textEditor'
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
      })],
    content: initial,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editable: !disabled
  })

  useEffect(() => {
    // Cleanup function
    return () => {
      if (editor && editor.destroy) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className={`textEditorContainer ${!isInlineEditor ? 'editor' : ''}`}>
      {isInlineEditor && editor &&
        <BubbleMenu className='bubble-menu' tippyOptions={{ duration: 100 }} editor={editor}>
          <MenuBar editor={editor} key={editor} />
        </BubbleMenu>}
      {isInlineEditor && editor &&
        <FloatingMenu className='floating-menu' tippyOptions={{ duration: 100 }} editor={editor}>
          <MenuBar editor={editor} key={editor} />
        </FloatingMenu>}
      {!isInlineEditor && <MenuBar editor={editor} key={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
