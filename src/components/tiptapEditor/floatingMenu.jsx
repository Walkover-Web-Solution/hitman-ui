import React from 'react';
import { FloatingMenu } from '@tiptap/react';
import { Dropdown } from 'react-bootstrap';
import { BiPlus } from 'react-icons/bi';
import { LuHeading1, LuHeading2, LuHeading3, LuTextQuote } from 'react-icons/lu';
import { FaListUl, FaListOl } from 'react-icons/fa';
import { GoTasklist } from 'react-icons/go';
import '../styles.scss'
import './tiptap.scss'

export default function FloatingMenuComponent({ editor }) {
    return (
        <FloatingMenu className="floating-menu" tippyOptions={{ duration: 100 }} editor={editor}>
            <Dropdown>
                <Dropdown.Toggle variant="light" id="dropdown-basic" className="biplus-icon p-1 rounded-circle">
                    <BiPlus size={18} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <LuHeading1 /> Heading 1
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <LuHeading2 /> Heading 2
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <LuHeading3 /> Heading 3
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <FaListUl /> Bullet List
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <FaListOl /> Numbered List
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleTaskList().run()}>
                        <GoTasklist /> Task List
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>
                        <LuTextQuote /> Quote
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </FloatingMenu>
    );
}