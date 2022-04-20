import React, { useState } from 'react'
import { Dropdown, Modal } from 'react-bootstrap'
import { SketchPicker } from 'react-color'
import { BiCodeBlock, BiFontColor } from 'react-icons/bi'
import {
  FaBold,
  FaImage,
  FaTable,
  FaItalic,
  FaListOl,
  FaListUl,
  FaRedo,
  FaStrikethrough,
  FaUnderline,
  FaUndo,
  FaLink,
  FaRulerHorizontal,
  FaCode,
  FaHighlighter
} from 'react-icons/fa'

export default function MenuBar ({ editor }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [ImageUrl, setImageUrl] = useState('')
  const [row, setRow] = useState('3')
  const [column, setColumn] = useState('3')
  const [showLink, setShowLink] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showImage, setShowImage] = useState(false)

  if (!editor) {
    return null
  }

  function AddImage () {
    return (
      <Modal show={showImage} onHide={() => setShowImage(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Image URL</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group'>
            <label>URL</label>
            <input type='text' className='form-control' value={ImageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary outline mr-2' onClick={() => setShowImage(false)}> Close</button>
          <button className='btn btn-primary' onClick={() => { if (linkUrl) { editor.chain().focus().extendMarkRange('link').setImage({ src: linkUrl }).run() }setShowImage(false) }}>Save</button>
        </Modal.Footer>
      </Modal>
    )
  }

  function AddLink () {
    return (
      <Modal show={showLink} onHide={() => setShowLink(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group'>
            <label>URL</label>
            <input className='form-control' type='text' value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary outline mr-2' onClick={() => setShowLink(false)}>
            Close
          </button>
          <button
            className='btn btn-primary'
            onClick={() => {
              if (linkUrl === null) {
                setShowLink(false)
                return
              }
              if (linkUrl === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                setShowLink(false)
                return
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
              setShowLink(false)
            }}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleTextColor (color) {
    console.log(color)
    editor.chain().focus().setColor(color.hex).run()
  }

  function AddTable () {
    return (
      <Modal show={showTable} onHide={() => setShowTable(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Number of rows and columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary outline mr-2' onClick={() => setShowTable(false)}>
            Close
          </button>
          <button
            className='btn btn-primary'
            onClick={() => {
              editor.chain().focus().insertTable({ rows: row, cols: column, withHeaderRow: true }).run()
              setShowTable(false)
            }}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <div className='menuBar custom-editor'>
      {AddImage()}
      {AddLink()}
      {AddTable()}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <FaStrikethrough />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        <FaCode />
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
      <Dropdown style={{ display: 'inline' }}>
        <Dropdown.Toggle style={{ display: 'inline' }}>
          Paragraph
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item><button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}> H1</button>
          </Dropdown.Item>
          <Dropdown.Item><button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
          </Dropdown.Item>
          <Dropdown.Item><button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>H3</button>
          </Dropdown.Item>
          <Dropdown.Item> <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}> H4</button>
          </Dropdown.Item>
          <Dropdown.Item><button onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}>H5 </button>
          </Dropdown.Item>
          <Dropdown.Item><button onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}>H6</button>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <FaListOl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        <BiCodeBlock />
      </button>
      <Dropdown>
        <Dropdown.Toggle><BiFontColor /></Dropdown.Toggle>
        <Dropdown.Menu><SketchPicker
          onChangeComplete={handleTextColor}
                       />
        </Dropdown.Menu>
      </Dropdown>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <FaRulerHorizontal />
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>
        <FaUndo />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        <FaRedo />
      </button>

      <button onClick={() => setShowLink(true)}>
        <FaLink />
      </button>
      <Dropdown style={{ display: 'inline' }}>
        <Dropdown.Toggle style={{ display: 'inline' }}>
          <FaTable />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setShowTable(true)}>Create Table</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>Add Row Before</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>Add Row After</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>Delete Row</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>Delete Column</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>Add Column Before</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>Add Column After</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge Cell</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>Split Cell</Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>Delete Table</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <button onClick={() => setShowImage(true)}>
        <FaImage />
      </button>
    </div>
  )
}
