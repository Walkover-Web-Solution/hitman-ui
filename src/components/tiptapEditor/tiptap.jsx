"use client"
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
  FaCode,
} from 'react-icons/fa'
import { LuHeading1, LuHeading2, LuHeading3, LuTextQuote } from "react-icons/lu";
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { useSelector } from 'react-redux'
import { GoTasklist } from "react-icons/go";
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import BubbleMenuComponent from './bubbleMenu'
import { Node } from '@tiptap/core';
import { BsSearch } from "react-icons/bs";


export default function Tiptap({ provider, ydoc, isInlineEditor, disabled, initial, onChange, isEndpoint = false, pathData, pathName }) {

  const { currentUser } = useSelector((state) => ({
    currentUser: state.users.currentUser,
  }));


  const Breadcrumb = Node.create({
    name: 'breadcrumb',
    group: 'block',
    atom: true,

    addAttributes() {
      return {
        path: {
          default: [],
        },
        pathName: {
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
      const { path, pathName } = HTMLAttributes;
      if (!Array.isArray(path) || !Array.isArray(pathName)) {
        return ['div', { 'data-breadcrumb': '', class: 'breadcrumb-container' }];
      }
      const breadcrumbElements = [];
      path.forEach((segment, index) => {
        let segmentName;
        if (segment === 'undefined') {
          segmentName = 'untitled';
        } else {
          segmentName = pathName[index] || segment;
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
        setBreadcrumb: (pathData, pathName) => ({ commands }) => {
          const breadcrumbSegments = Array.isArray(pathData) ? pathData : pathData.split('/');
          const breadcrumbNames = Array.isArray(pathName) ? pathName : pathName.split('/');
          return commands.insertContent({
            type: this.name,
            attrs: {
              path: breadcrumbSegments,
              pathName: breadcrumbNames,
            },
          });
        },
      };
    },
  });

  const Video = Node.create({
    name: 'video',
    group: 'block',
    atom: true,

    addAttributes() {
      return {
        src: {
          default: null,
        },
        isEmbed: {
          default: false,
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'iframe',
        },
        {
          tag: 'video',
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      const { src, isEmbed } = HTMLAttributes;

      if (isEmbed) {
        return [
          'iframe',
          {
            src,
            width: '560',
            height: '315',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: 'true',
          },
        ];
      }

      return [
        'video',
        {
          controls: true,
          width: '560',
          height: '315',
          ...HTMLAttributes,
        },
      ];
    },

    addCommands() {
      return {
        setVideo: (url) => ({ commands }) => {
          let isEmbed = false;
          const youtubeMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/);
          const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);

          if (youtubeMatch) {
            isEmbed = true;
            url = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
          } else if (vimeoMatch) {
            isEmbed = true;
            url = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          } else {
            const videoExtensions = ['.mp4', '.webm', '.ogg'];
            const isVideoFile = videoExtensions.some(ext => url.endsWith(ext));

            if (!isVideoFile) {
              alert("Unsupported video format. Please provide a valid video URL.");
              return false;
            }
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: url,
              isEmbed,
            },
          });
        },
      };
    },
  });

  const getRandomColor = () => {
    const colors = [
      '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
      '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [activeSlashMenuIndex, setActiveSlashMenuIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

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

  const blockTypes = [
    { type: 'heading-1', icon: <LuHeading1 size={30} />, label: 'Heading 1', description: 'Big section heading' },
    { type: 'heading-2', icon: <LuHeading2 size={30} />, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'heading-3', icon: <LuHeading3 size={30} />, label: 'Heading 3', description: 'Small section heading' },
    { type: 'task-list', icon: <GoTasklist size={30} />, label: 'Task List', description: 'Track tasks with a to-do list' },
    { type: 'bulletList', icon: <FaListUl size={30} />, label: 'Bullet List', description: 'Create a simple bulleted list' },
    { type: 'numberedList', icon: <FaListOl size={30} />, label: 'Numbered List', description: 'Create a list with numbering' },
    { type: 'left', icon: <FaAlignLeft size={30} />, label: 'Left', description: 'Align your content to the left' },
    { type: 'right', icon: <FaAlignRight size={30} />, label: 'Right', description: 'Align your content to the right' },
    { type: 'center', icon: <FaAlignCenter size={30} />, label: 'Center', description: 'Align your content to the center' },
    { type: 'justify', icon: <FaAlignJustify size={30} />, label: 'Justify', description: 'Align your content to justify' },
    { type: 'codeBlock', icon: <FaCode size={30} />, label: 'Code Block', description: 'Insert a code block' },
    { type: 'blockquote', icon: <LuTextQuote size={30} />, label: 'Blockquote', description: 'Insert a quote block' },
    { type: 'rule', icon: <FaRulerHorizontal size={30} />, label: 'Horizontal Rule', description: 'Insert a horizontal rule' },
  ];

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
      Video,
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

  const filteredBlockTypes = blockTypes.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {editor && <BubbleMenuComponent editor={editor} pathData={pathData} loading={loading} setLoading={setLoading} showImage={showImage} setShowImage={setShowImage} showVideo={showVideo} setShowVideo={setShowVideo} showFiles={showFiles} setShowFiles={setShowFiles} />}

      {editor && <FloatingMenuComponent editor={editor} pathData={pathData} pathName={pathName} showImage={showImage} setShowImage={setShowImage} showVideo={showVideo} setShowVideo={setShowVideo} showFiles={showFiles} setShowFiles={setShowFiles} />}

      {showSlashMenu && (
        <div className="slash-menu position-absolute align-items-center d-flex bg-white py-2" style={{
          top: `${slashMenuPosition.top}px`,
          left: `${slashMenuPosition.left}px`,
        }}>
          <div className="slash-menu-container">
            <div className="search-bar d-flex align-items-center p-16  m-2">
            <span className='search-icon mr-2 ml-2 align-items-center justify-content-between'><BsSearch size={16} /></span>
              <input
                type="text"
                placeholder= "Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ul className='overflow-auto p-0 m-0 w-100'>
              {filteredBlockTypes.map((block, index) => (
                <li
                  key={block.type}
                  className={`align-items-center d-flex cursor-pointer px-2 py-2 w-100 ${index === activeSlashMenuIndex ? 'active' : ''}`}
                  tabIndex="0"
                  ref={el => slashMenuRefs.current[index] = el}
                  onClick={() => insertBlock(block.type)}
                >
                  <div className='mr-4 ml-2'>{block.icon}</div>
                  <div>
                    <span className="d-flex font-14 fw-500">{block.label}</span>
                    <span className="menu-description mt-1 font-12">{block.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}