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

export default function MenuBar({ editor }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [ImageUrl, setImageUrl] = useState('')
  const [row, setRow] = useState('3')
  const [column, setColumn] = useState('3')
  const [showLink, setShowLink] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const handleHeaderChange = (level) => {
    editor.chain().focus().toggleHeading({ level }).run()
    setSelectedLevel(level)
  }

  if (!editor) {
    return null
  }
  function onHide() {
    if (showImage) setShowImage(false)
    else if (showLink) setShowLink(false)
    else setShowTable(false)
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

  function handleTextColor(color) {
    editor.chain().focus().setColor(color.hex).run()
  }

  return (
    <div className='menuBar custom-editor'>
      {showModal()}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active-class' : ''}>
        <FaBold />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active-class' : ''}>
        <FaItalic />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active-class' : ''}>
        <FaStrikethrough />
      </button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'active-class' : ''}>
        <FaCode />
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'active-class' : ''}
      >
        <FaUnderline />
      </button>

      <button
        type='button'
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive('highlight') ? 'active-class' : ''}
      >
        <FaHighlighter />
      </button>
      <Dropdown style={{ display: 'inline' }}>
      <Dropdown.Toggle style={{ display: 'inline' }}>{selectedLevel ? `H${selectedLevel}` : 'Paragraph'}</Dropdown.Toggle>
      <Dropdown.Menu>
        {[1, 2, 3, 4, 5, 6].map(level => (
          <Dropdown.Item key={level} onClick={() => handleHeaderChange(level)}>
            <button             
              className={editor.isActive('heading', { level }) ? 'active-class' : ''}
            >
              H{level}
            </button>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
   </Dropdown>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active-class' : ''}>
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'active-class' : ''}
      >
        <FaListOl />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active-class' : ''}>
        <BiCodeBlock />
      </button>
      <Dropdown>
        <Dropdown.Toggle>
          <BiFontColor />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <SketchPicker onChangeComplete={handleTextColor} />
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
          <Dropdown.Item onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
            Add Row Before
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
            Add Row After
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
            Delete Row
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
            Delete Column
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>
            Add Column Before
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
            Add Column After
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()}>
            Merge Cell
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()}>
            Split Cell
          </Dropdown.Item>
          <Dropdown.Item onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
            Delete Table
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <button onClick={() => setShowImage(true)}>
        <FaImage />
      </button>
    </div>
  )
}
