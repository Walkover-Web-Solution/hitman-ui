import React, { useState } from 'react';
import { BubbleMenu } from '@tiptap/react';
import { FaBold, FaItalic, FaStrikethrough, FaUnderline, FaHighlighter, FaLink, FaAlignLeft, FaAlignRight, FaAlignJustify, FaAlignCenter, FaTable, FaUndo, FaRedo, FaListUl, FaListOl, FaRulerHorizontal, FaCode, FaHeading } from 'react-icons/fa';
import { GoTasklist } from 'react-icons/go';
import '../styles.scss'
import './tiptap.scss'
import { Dropdown, Modal } from 'react-bootstrap';
import { BiFontColor, BiFontFamily } from 'react-icons/bi';
import { SketchPicker } from 'react-color';
import { BsThreeDots } from 'react-icons/bs';
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuHeading6, LuTextQuote } from 'react-icons/lu';

export default function BubbleMenuComponent({ editor }) {
    const [alignment, setAlignment] = useState('left');
    const [color, setColor] = useState("");
    const [showTable, setShowTable] = useState(false)
    const [showLink, setShowLink] = useState(false)
    const [showImage, setShowImage] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [ImageUrl, setImageUrl] = useState('')
    const [row, setRow] = useState('3')
    const [column, setColumn] = useState('3')
    const [activeHeading, setActiveHeading] = useState(0);
    const activeFontFamily = () => {
        const fontFamilies = ['Inter', 'Comic Sans', 'serif', 'monospace', 'cursive', 'var(--title-font-family)'];
        const activeFont = fontFamilies.find(font => editor.isActive('textStyle', { fontFamily: font }));
        return activeFont;
    };

    const getRandomColor = () => {
        const colors = [
            '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
            '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    const toggleHeading = (level) => {
        if (editor) {
            editor.chain().focus().toggleHeading({ level }).run();
            setActiveHeading(level);
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

    return (
        <>
            <BubbleMenu className="bubble-menu px-2 border-0 d-flex align-items-center" tippyOptions={{ duration: 100 }} editor={editor}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
                    <FaBold />
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
                    <FaItalic />
                </button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
                    <FaStrikethrough />
                </button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>
                    <FaUnderline />
                </button>
                <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'is-active' : ''}>
                    <FaHighlighter />
                </button>
                <Dropdown>
                    <Dropdown.Toggle className='text-direction' variant="light" id="alignment-dropdown">
                        {alignment === 'left' && <FaAlignLeft />}
                        {alignment === 'center' && <FaAlignCenter />}
                        {alignment === 'right' && <FaAlignRight />}
                        {alignment === 'justify' && <FaAlignJustify />}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => { setAlignment('left'); editor.chain().focus().setTextAlign('left').run(); }}>
                            <FaAlignLeft /> Left
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => { setAlignment('center'); editor.chain().focus().setTextAlign('center').run(); }}>
                            <FaAlignCenter /> Center
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => { setAlignment('right'); editor.chain().focus().setTextAlign('right').run(); }} >
                            <FaAlignRight /> Right
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => { setAlignment('justify'); editor.chain().focus().setTextAlign('justify').run(); }}>
                            <FaAlignJustify /> Justify
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown className='create-table'>
                    <Dropdown.Toggle className='btn-light text-direction'>
                        {activeFontFamily()} <BiFontFamily />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('Inter').run()}
                            className={editor.isActive('textStyle', { fontFamily: 'Inter' }) ? 'is-active' : ''}
                            data-test-id="inter">
                            Inter
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('Comic Sans').run()}
                            className={
                                editor.isActive('textStyle', { fontFamily: 'Comic Sans' })
                                    ? 'is-active'
                                    : ''
                            }
                            data-test-id="comic-sans">
                            Comic Sans
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('serif').run()}
                            className={editor.isActive('textStyle', { fontFamily: 'serif' }) ? 'is-active' : ''}
                            data-test-id="serif">
                            Serif
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('monospace').run()}
                            className={editor.isActive('textStyle', { fontFamily: 'monospace' }) ? 'is-active' : ''}
                            data-test-id="monospace">
                            Monospace
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('cursive').run()}
                            className={editor.isActive('textStyle', { fontFamily: 'cursive' }) ? 'is-active' : ''}
                            data-test-id="cursive">
                            Cursive
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('var(--title-font-family)').run()}
                            className={editor.isActive('textStyle', { fontFamily: 'var(--title-font-family)' }) ? 'is-active' : ''}
                            data-test-id="css-variable">
                            CSS variable
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setFontFamily('"Comic Sans"').run()}
                            className={editor.isActive('textStyle', { fontFamily: '"Comic Sans"' }) ? 'is-active' : ''}
                            data-test-id="comic-sans-quoted">
                            Comic Sans quoted
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown className='create-table'>
                    <Dropdown.Toggle className='btn-light text-direction'>
                        <BiFontColor />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <SketchPicker color={getRandomColor()} onChangeComplete={handleTextColor} />
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown className='create-table'>
                    <Dropdown.Toggle className='btn-light text-direction'>
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
                <Dropdown>
                    <Dropdown.Toggle className='text-direction' variant="light" id="heading-dropdown">
                        <HeadingIcon level={activeHeading} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <Dropdown.Item key={level}>
                                <button
                                    onClick={() => toggleHeading(level)}
                                    className={editor.isActive('heading', { level }) ? 'is-active' : ''}
                                >
                                    <HeadingIcon level={level} /> Heading{level}
                                </button>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown>
                    <Dropdown.Toggle className='text-direction' variant="light" id="additional-options-dropdown">
                        <BsThreeDots />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => editor.chain().focus().undo().run()}>
                            <FaUndo /> Undo
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().redo().run()}>
                            <FaRedo /> Redo
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
                            <FaListUl /> Bullet List
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>
                            <FaListOl /> Numbered List
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'is-active' : ''}>
                            <GoTasklist /> Task list
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                            <FaRulerHorizontal /> Horizontal Rule
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}>
                            <FaCode /> Code Block
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>
                            <LuTextQuote /> Quote
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </BubbleMenu>
            {showModal()}
        </>
    );
}