import React, { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
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
import FloatingMenuComponent from './floatingMenu'
import '../styles.scss'
import './tiptap.scss'
import {
  FaListUl,
  FaListOl,
  FaRulerHorizontal,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaHeading,
  FaCode,
} from 'react-icons/fa'
import {LuFileSymlink, LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuHeading6, LuTextQuote } from "react-icons/lu";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useSelector } from 'react-redux'
import { GoTasklist } from "react-icons/go";
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import BubbleMenuComponent from './bubbleMenu'
import { Node } from '@tiptap/core';
import { Navigate, useNavigate } from 'react-router'
import { getOrgId } from '../common/utility'

export default function Tiptap({ provider, ydoc, isInlineEditor, disabled, initial, onChange, isEndpoint=false, pathData, pathName }) {

  const { currentUser, pages, collections } = useSelector((state) => ({
    currentUser: state.users.currentUser,
    pages: state.pages,
    collections: state.collections,
  }));

  const navigate = useNavigate();

  const Breadcrumb = Node.create({
    name: 'breadcrumb',
    group: 'block',
    atom: true,

    addAttributes() {
      return {
        path: {
          default: [],  
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'div[data-breadcrumb]',
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      const { path } = HTMLAttributes;

      if (!Array.isArray(path)) {
        return ['div', { 'data-breadcrumb': '', class: 'breadcrumb-container' }];
      }

      const breadcrumbElements = [];
      path.forEach((segment, index) => {
        let segmentName;
        if(segment === 'undefined'){
          segmentName = 'untitled'; 
        }
        else{
            if (index === 0) {
              segmentName = collections[segment]?.name || segment; 
            } else {
              segmentName = pages[segment]?.name || segment;
            } 
        }
        breadcrumbElements.push([
          'button',
          {  
            class: 'breadcrumb-segment',
            id: index === 0 ? `collection/${segment}` : `pages/${segment}`,
          }, 
          segmentName
        ]);
        if (index < path.length - 1) {
          breadcrumbElements.push(['span', { class: 'breadcrumb-separator' }, ' / ']);
        }
      });
      return ['div', { 'data-breadcrumb': '', class: 'breadcrumb-container' }, ...breadcrumbElements];
    },

    addCommands() {
      return {
        setBreadcrumb: (path) => ({ commands }) => {
          const breadcrumbSegments = path.split('/');
          return commands.insertContent({
            type: this.name,
            attrs: { path: breadcrumbSegments },
          });
        },
      };
    },
  });

  function handleBreadcrumbClick(event) {
    const orgID = getOrgId();
    const breadcrumbSegmentId = event.target.getAttribute('id');
    const Id = breadcrumbSegmentId.split('/');
    if(Id[1] === 'undefined'){
      navigate(`/orgs/${orgID}/dashboard/page/new`);
    }
    else{
      if (Id[0] === 'collection') {
        navigate(`/orgs/${orgID}/dashboard/collection/${Id[1]}/settings`);
      } else {
        navigate(`/orgs/${orgID}/dashboard/page/${Id[1]}`);
      }
    }
  }
  const getRandomColor = () => {
    const colors = [
      '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
      '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [alignment, setAlignment] = useState('left');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [activeSlashMenuIndex, setActiveSlashMenuIndex] = useState(0);
  const [loading,setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false)

  const NonEditableLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      contenteditable: {
        default: 'false',
        parseHTML: () => 'false',
        renderHTML: () => {
          return {
            contenteditable: 'false',
          }
        },
      },
    }
  },
})
  const slashMenuRefs = useRef([]);
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'textEditor',
      },
      handleClick(view, pos, event) {
        const target = event.target;
        if (target.classList.contains('breadcrumb-segment')) {
          handleBreadcrumbClick(event);  
          return true;
        }
        return false;
      },
      handleKeyDown(view, event) {
        if (event.key === '/') {
          const selection = window.getSelection();
          const container = document.querySelector('.textEditorContainer');
          const containerRect = container.getBoundingClientRect();
          const containerOffsetLeft = containerRect.left;
          const editorPaddingTop = parseFloat(window.getComputedStyle(container).paddingTop) || 0;

          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (rect.top === 0 && rect.left === 0) {
              const caretRect = view.coordsAtPos(view.state.selection.$from.pos);
              setSlashMenuPosition({
                top: caretRect.top + window.scrollY - containerRect.top - editorPaddingTop + 30,
                left: containerRect.left - containerOffsetLeft + window.scrollX,
              });
            }
            else {
              setSlashMenuPosition({
                top: rect.bottom + window.scrollY - editorPaddingTop - containerRect.top,
                left: rect.left - containerOffsetLeft + window.scrollX,
              });
            }

            setShowSlashMenu(true);
          }
        }
        if (event.key === 'Escape') {
          setShowSlashMenu(false);
        }
        return false;
      },
      handleDOMEvents: {
        input(view) {
          const { from } = view.state.selection;
          const textBefore = view.state.doc.textBetween(from - 1, from, ' ');

          if (textBefore !== '/') {
            setShowSlashMenu(false);
          }
        },
      },
    },
    extensions: [
      StarterKit,
      Breadcrumb,
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
        placeholder: `Write something, type '/' for commands...`,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'my-custom-class'
        }
      }),
      ...(isEndpoint
        ? []
        : provider && ydoc
        ? [
            CollaborationCursor.configure({
              provider,
              user: {
                name: currentUser?.name || 'Anonymous',
                color: getRandomColor(),
              },
            }),
            Collaboration.configure({
              document: ydoc,
            }),
          ]
        : []),
      TableRow,
      TableCell,
      TableHeader,
      NonEditableLink.configure({
        linkOnPaste: true,
        openOnClick: true,
        autolink: false,
      }),
    ],
    ...(isEndpoint ? { content: initial } : {}),
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


  useEffect(() => {
    if (showSlashMenu) {
      const handleOutsideClick = (event) => {
        if (!event.target.closest('.slash-menu')) {
          setShowSlashMenu(false);
        }
      };
      const handleArrowNavigation = (e) => {
        // const totalMenuItems = slashMenuRefs.current.length;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (activeSlashMenuIndex + 1) % 13;
          setActiveSlashMenuIndex(nextIndex);
          slashMenuRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (activeSlashMenuIndex - 1 + 13) % 13;
          setActiveSlashMenuIndex(prevIndex);
          slashMenuRefs.current[prevIndex]?.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const blockTypes = [
            'heading-1', 'heading-2', 'heading-3', 'task-list',
            'bulletList', 'numberedList', 'left', 'right',
            'center', 'justify', 'codeBlock', 'blockquote', 'rule'
          ];
          insertBlock(blockTypes[activeSlashMenuIndex]);
        }
      };

      window.addEventListener('keydown', handleArrowNavigation);
      window.addEventListener('click', handleOutsideClick);

      return () => {
        window.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('keydown', handleArrowNavigation);
      };
    }
  }, [showSlashMenu, activeSlashMenuIndex]);

  const insertBlock = (type) => {
    if (!editor) return;
    const { from } = editor.state.selection;

    const textBeforeSlash = editor.state.doc.textBetween(from - 1, from, " ");

    if (textBeforeSlash === "/") {
      editor.commands.deleteRange({ from: from - 1, to: from });
    }

    switch (type) {
      case 'heading-1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading-2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading-3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'task-list':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'numberedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'rule':
        editor.chain().focus().setHorizontalRule().run();
        break;
      case 'left':
      case 'right':
      case 'center':
      case 'justify':
        editor.chain().focus().setTextAlign(type).run();
        break;
      default:
        break;
    }

    setShowSlashMenu(false);
  };
  return (
    <div className={`textEditorContainer ${!isInlineEditor ? 'editor border border-0' : ''}`}>

      {editor && <BubbleMenuComponent editor={editor} pathData={pathData} loading={loading} setLoading={setLoading} showImage={showImage} setShowImage={setShowImage} />}

      {editor && <FloatingMenuComponent editor={editor} pathName={pathName} showImage={showImage} setShowImage={setShowImage} />}

      {showSlashMenu && (
        <div className="slash-menu position-absolute align-items-center d-flex bg-white py-2" style={{
          top: `${slashMenuPosition.top}px`,
          left: `${slashMenuPosition.left}px`,
        }}>
          <ul className='overflow-auto p-0 m-0 w-100'>
            <li className='align-items-center d-flex cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[0] = el} onClick={() => insertBlock('heading-1')} >
              <LuHeading1 className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Heading 1</span>
                <span className="menu-description mt-1 font-12">Big section heading</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[1] = el} onClick={() => insertBlock('heading-2')}>
              <LuHeading2 className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Heading 2</span>
                <span className="menu-description mt-1 font-12">Medium section heading</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[2] = el} onClick={() => insertBlock('heading-3')} >
              <LuHeading3 className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Heading 3</span>
                <span className="menu-description mt-1 font-12">Small section heading</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[3] = el} onClick={() => insertBlock('task-list')} >
              <GoTasklist className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Task List</span>
                <span className="menu-description mt-1 font-12">Track tasks with a to-do list</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[4] = el} onClick={() => insertBlock('bulletList')} >
              <FaListUl className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Bullet List</span>
                <span className="menu-description mt-1 font-12">Create a simple bulleted list</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[5] = el} onClick={() => insertBlock('numberedList')} >
              <FaListOl className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Numbered List</span>
                <span className="menu-description mt-1 font-12">Create a list with numbering</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[6] = el} onClick={() => { setAlignment('left'), insertBlock('left') }} >
              <FaAlignLeft className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Left</span>
                <span className="menu-description mt-1 font-12">Align your content to the left</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[7] = el} onClick={() => { setAlignment('right'), insertBlock('right') }} >
              <FaAlignRight className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Right</span>
                <span className="menu-description mt-1 font-12">Align your content to the right</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[8] = el} onClick={() => { setAlignment('center'), insertBlock('center') }} >
              <FaAlignCenter className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Center</span>
                <span className="menu-description mt-1 font-12">Align your content to the center</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[9] = el} onClick={() => { setAlignment('justify'), insertBlock('justify') }} >
              <FaAlignJustify className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Justify</span>
                <span className="menu-description mt-1 font-12">Justify your content.</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[10] = el} onClick={() => insertBlock('codeBlock')} >
              <FaCode className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Code Block</span>
                <span className="menu-description mt-1 font-12">Write a block of code</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[11] = el} onClick={() => insertBlock('blockquote')} >
              <LuTextQuote className='mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Quote</span>
                <span className="menu-description mt-1 font-12">Highlight a quote</span>
              </div>
            </li>
            <li className='align-items-center d-flex  cursor-pointer px-2 py-2' tabIndex="0" ref={el => slashMenuRefs.current[12] = el} onClick={() => insertBlock('rule')} >
              <FaRulerHorizontal className=' mr-4 ml-2' size={30} />
              <div>
                <span className="d-flex font-14 fw-500">Horizontal Rule</span>
                <span className="menu-description mt-1 font-12">Visually divide blocks</span>
              </div>
            </li>
          </ul>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}