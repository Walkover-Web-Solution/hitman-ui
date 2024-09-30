import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import Blockquote from '@tiptap/extension-blockquote'
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
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import FontFamily from '@tiptap/extension-font-family'
import Dropcursor from '@tiptap/extension-dropcursor'
import Typography from '@tiptap/extension-typography'
import { BsThreeDots } from "react-icons/bs";
import '../styles.scss'
import './tiptap.scss'
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
  FaHighlighter,
  FaLink,
  FaUndo,
  FaRedo,
  FaListUl,
  FaListOl,
  FaRulerHorizontal,
  FaImage,
  FaTable,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaHeading,
  FaCode,
} from 'react-icons/fa'
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuHeading6, LuTextQuote } from "react-icons/lu";
import { BiFontColor, BiPlus, BiFontFamily } from 'react-icons/bi'
import { Dropdown, Modal } from 'react-bootstrap'
import { SketchPicker } from 'react-color'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useSelector } from 'react-redux'
import { GoTasklist } from "react-icons/go";
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MdArrowDropDown } from "react-icons/md";

export default function Tiptap({ provider, ydoc, isInlineEditor, disabled, initial, onChange, isEndpoint = false }) {

  const { currentUser } = useSelector((state) => ({
    currentUser: state.users.currentUser
  }));

  const getRandomColor = () => {
    const colors = [
      '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
      '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const [linkUrl, setLinkUrl] = useState('')
  const [ImageUrl, setImageUrl] = useState('')
  const [row, setRow] = useState('3')
  const [column, setColumn] = useState('3')
  const [showLink, setShowLink] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [alignment, setAlignment] = useState('left');
  const [color, setColor] = useState("");
  const [activeHeading, setActiveHeading] = useState(0);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'textEditor'
      }
    },
    extensions: [
      StarterKit,
      Blockquote,
      Underline,
      Highlight,
      Image,
      CodeBlock,
      Dropcursor,
      HorizontalRule,
      TextStyle,
      TaskList,
      Typography,
      TaskItem.configure({
        nested: true,
        itemTypeName: 'taskItem',
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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
      ...(!isEndpoint ? [
        CollaborationCursor.configure({
          provider,
          user: {
            name: currentUser?.name || 'Anonymous',
            color: getRandomColor(),
          },
        }),
        Collaboration.configure({
          document: ydoc,
        })
      ] : []),
      TableRow,
      TableHeader,
      Link.configure({
        linkOnPaste: true,
        openOnClick: true,
        autolink: false
      })
    ],
    ...(isEndpoint ? [{ content: initial }] : []),
    onUpdate: ({ editor }) => {
      if (isEndpoint) {
        const html = editor.getHTML();
        if (typeof onChange === 'function') {
          onChange(html);
          localStorage.setItem('editorContent', html);
        }
      }
    },
    editable: !disabled
  })

  useEffect(() => {
    if (editor && initial !== editor.getHTML()) {
      editor.commands.setContent(initial, false);
    }
  }, [initial, editor, isEndpoint]);

  const toggleHeading = (level) => {
    if (editor) {
      editor.chain().focus().toggleHeading({ level }).run();
      setActiveHeading(level);
    }
  };

  const HeadingIcon = ({ level }) => {
    switch (level) {
      case 1:
        return <LuHeading1 />;
      case 2:
        return <LuHeading2 />;
      case 3:
        return <LuHeading3 />;
      case 4:
        return <LuHeading4 />;
      case 5:
        return <LuHeading5 />;
      case 6:
        return <LuHeading6 />;
      default:
        return <FaHeading />;
    }
  };
  function onHide() {
    if (showImage) setShowImage(false)
    else if (showLink) setShowLink(false)
    else setShowTable(false)
  }
  function handleTextColor(color) {
    setColor(color.hex);
    editor.chain().focus().setColor(color.hex).run();
  }
  function showModal() {
    return (
      <Modal show={showImage || showLink || showTable} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            {showImage && 'Set Image URL'}
            {showLink && 'Set Link'}
            {showTable && 'Add Number of rows and columns'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(showImage || showLink) && (
            <div className='form-group'>
              <label>URL</label>
              <input
                type='text'
                className='form-control'
                value={showImage ? ImageUrl : linkUrl}
                onChange={(e) => (showImage ? setImageUrl(e.target.value) : setLinkUrl(e.target.value))}
              />
            </div>
          )}
          {showTable && (
            <div className='row'>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label>Rows</label>
                  <input className='form-control' type='integer' value={row} onChange={(e) => setRow(e.target.value)} />
                </div>
              </div>
              <div className='col-md-6'>
                <div className='form-group'>
                  <label>Columns</label>
                  <input className='form-control' type='integer' value={column} onChange={(e) => setColumn(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary outline mr-2' onClick={onHide}>
            {' '}
            Close
          </button>
          <button
            className='btn btn-primary'
            onClick={() => {
              if (showTable) {
                editor.chain().focus().insertTable({ rows: row, cols: column, withHeaderRow: true }).run()
                setShowTable(false)
              }
              if (showLink && linkUrl) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
                setShowLink(false)
              }
              if (showImage && ImageUrl) {
                editor.chain().focus().setImage({ src: ImageUrl }).run()
                setShowImage(false)
              }
            }}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    )
  }

  const activeFontFamily = () => {
    const fontFamilies = ['Inter', 'Comic Sans', 'serif', 'monospace', 'cursive', 'var(--title-font-family)'];
    const activeFont = fontFamilies.find(font => editor.isActive('textStyle', { fontFamily: font }));
    return activeFont;
  };

  return (
    <div className={`textEditorContainer ${!isInlineEditor ? 'editor border-0' : ''}`}>

      {editor && (

        <BubbleMenu className='bubble-menu px-2 border-0 flex items-center' tippyOptions={{ duration: 100 }} editor={editor} >
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
            <FaBold />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
            <FaItalic />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
            <FaStrikethrough />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is_active' : ''}
          >
            <FaUnderline />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'is_active' : ''}
          >
            <FaHighlighter />
          </button>
          <button onClick={() => setShowLink(true)}>
            <FaLink />
          </button>
          <button
            type='button'
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? 'is-active' : ''}
          >
            <GoTasklist />
          </button>
          <Menu as="div" className="relative inline-block text-left">
            <div>
            <MenuButton className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {alignment === 'left' && <FaAlignLeft />}
                {alignment === 'center' && <FaAlignCenter />}
                {alignment === 'right' && <FaAlignRight />}
                {alignment === 'justify' && <FaAlignJustify />}
                <MdArrowDropDown size={18} />
              </MenuButton>
            </div>

            <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => { setAlignment('left'); editor.chain().focus().setTextAlign('left').run(); }}
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      <FaAlignLeft /> Left
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => { setAlignment('center'); editor.chain().focus().setTextAlign('center').run(); }}
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      <FaAlignCenter /> Center
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => { setAlignment('right'); editor.chain().focus().setTextAlign('right').run(); }}
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      <FaAlignRight /> Right
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => { setAlignment('justify'); editor.chain().focus().setTextAlign('justify').run(); }}
                      className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    >
                      <FaAlignJustify /> Justify
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <Menu as="div" className="relative inline-block text-left create-table">
            <div>
              <MenuButton className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {activeFontFamily()} <BiFontFamily />
                <MdArrowDropDown size={18} />
              </MenuButton>
            </div>

            <MenuItems className="absolute right-0 mt-26 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('Inter').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'Inter' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="inter"
                    >
                      Inter
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('Comic Sans').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'Comic Sans' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="comic-sans"
                    >
                      Comic Sans
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('serif').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'serif' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="serif"
                    >
                      Serif
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('monospace').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'monospace' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="monospace"
                    >
                      Monospace
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('cursive').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'cursive' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="cursive"
                    >
                      Cursive
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('var(--title-font-family)').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: 'var(--title-font-family)' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="css-variable"
                    >
                      CSS variable
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setFontFamily('"Comic Sans"').run()}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} ${editor.isActive('textStyle', { fontFamily: '"Comic Sans"' }) ? 'is-active' : ''} block px-4 py-2 text-sm`}
                      data-test-id="comic-sans-quoted"
                    >
                      Comic Sans quoted
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <BiFontColor />
              <MdArrowDropDown size={18} />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-26 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="p-2">
                <SketchPicker color={color} onChangeComplete={handleTextColor} />
              </div>
            </MenuItems>
          </Menu>
          <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <FaTable />
              <MdArrowDropDown size={18} />
            </MenuButton>

            <MenuItems className="absolute mt-26 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
              <div className="px-1 py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => setShowTable(true)}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Create Table
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().addRowBefore().run()}
                      disabled={!editor.can().addRowBefore()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Add Row Before
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      disabled={!editor.can().addRowAfter()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Add Row After
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      disabled={!editor.can().deleteRow()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Delete Row
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      disabled={!editor.can().deleteColumn()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Delete Column
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().addColumnBefore().run()}
                      disabled={!editor.can().addColumnBefore()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Add Column Before
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      disabled={!editor.can().addColumnAfter()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Add Column After
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().mergeCells().run()}
                      disabled={!editor.can().mergeCells()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Merge Cell
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().splitCell().run()}
                      disabled={!editor.can().splitCell()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Split Cell
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      disabled={!editor.can().deleteTable()}
                      className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                    >
                      Delete Table
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <HeadingIcon level={activeHeading} />
              <MdArrowDropDown size={18} />
            </MenuButton>

            <MenuItems className="absolute z-10 mt-26 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <MenuItem key={level}>
                    {({ active }) => (
                      <button
                        onClick={() => toggleHeading(level)}
                        className={`${editor.isActive('heading', { level }) ? 'is-active bg-gray-100' : ''
                          } block px-4 py-2 text-sm w-full text-left`}
                      >
                        <HeadingIcon level={level} /> Heading {level}
                      </button>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>
          <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <BsThreeDots />
              <MdArrowDropDown size={18} />
            </MenuButton>

            <MenuItems className="absolute right-0 mt-26 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1 ">
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().undo().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700`}
                    >
                      <FaUndo className="mr-2" /> Undo
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().redo().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700`}
                    >
                      <FaRedo className="mr-2" /> Redo
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700 ${editor.isActive('bulletList') ? 'font-bold' : ''}`}
                    >
                      <FaListUl className="mr-2" /> Bullet List
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700 ${editor.isActive('orderedList') ? 'font-bold' : ''}`}
                    >
                      <FaListOl className="mr-2" /> Numbered List
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().toggleTaskList().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700 ${editor.isActive('taskList') ? 'font-bold' : ''}`}
                    >
                      <GoTasklist className="mr-2" /> Task List
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().setHorizontalRule().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700`}
                    >
                      <FaRulerHorizontal className="mr-2" /> Horizontal Rule
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700 ${editor.isActive('codeBlock') ? 'font-bold' : ''}`}
                    >
                      <FaCode className="mr-2" /> Code Block
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      className={`${active ? 'bg-gray-100' : ''
                        } group flex items-center w-full px-2 py-2 text-sm text-gray-700 ${editor.isActive('blockquote') ? 'font-bold' : ''}`}
                    >
                      <LuTextQuote className="mr-2" /> Quote
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>

        </BubbleMenu>
      )}

      {editor && (
        <FloatingMenu className='floating-menu' tippyOptions={{ duration: 100 }} editor={editor}>
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="text-gray-900 bg-gray-300 focus:outline-none hover:bg-gray-400 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm p-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 rounded-full">
                <BiPlus size={18} />
              </MenuButton>

            <MenuItems className="absolute right-0 mt-26 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                      <LuHeading1 /> Heading 1
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                      <LuHeading2 /> Heading 2
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                      <LuHeading3 /> Heading 3
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('bulletList') ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                      <FaListUl /> Bullet List
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('orderedList') ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                      <FaListOl /> Numbered List
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('taskList') ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleTaskList().run()}
                    >
                      <GoTasklist /> Task list
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm ${editor.isActive('blockquote') ? 'is-active' : ''
                        }`}
                      onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                      <LuTextQuote /> Quote
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      onClick={() => setShowImage(true)}
                    >
                      <FaImage /> Images
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>

        </FloatingMenu>
      )}
      {showModal()}
      <EditorContent editor={editor} />
    </div>
  )
}