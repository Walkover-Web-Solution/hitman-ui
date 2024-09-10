import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { RxCross2 } from "react-icons/rx";

const ShortcutModal = ({ hideModal }) => {


    const modalStyle = {
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '14px',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '10px',
        borderBottom: '1px solid #e5e5e5',
        width: '100%',
    };

    const listStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '4px',
        listStyleType: 'none',
        padding: '0',
        margin: '0',
    };

    const listItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '13px', 
    };

    const keyStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.1215686275)', 
        padding: '2px 6px',
        borderRadius: '4px',
        display: 'inline-block',
        fontSize: '12px', 
    };
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const shortcuts = [
        { name: 'Show Shortcuts', key: isMac ? 'Cmd + /' : 'Ctrl + /' },
        { name: 'Open Tab', key: isMac ? 'Ctrl + N' : 'Alt + N' },
        { name: 'Switch Tab', key: isMac ? 'Ctrl + T' : 'Alt + T' },
        { name: 'Close Tab', key: isMac ? 'Ctrl + W' : 'Alt + W' },
        { name: 'Publish', key: isMac ? 'Cmd + B' : 'Ctrl + B' },
        { name: 'Unpublish', key: isMac ? 'Cmd + U' : 'Ctrl + U' },
        { name: 'Save', key: isMac ? 'Cmd + S' : 'Ctrl + S' },
    ];

    

    return (
        <div style={modalStyle}>
            <div style={headerStyle}>
                <h4>Keyboard Shortcuts</h4>
                <Button onClick={hideModal} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '20px', color: 'black' }}><RxCross2 /></Button>
            </div>
            <Modal.Body>
                <ul style={listStyle}>
                    {shortcuts.map((shortcut, index) => (
                        <li key={index} style={listItemStyle}>
                            <span>{shortcut.name}</span>
                            <span style={keyStyle}>{shortcut.key}</span>
                        </li>
                    ))}
                </ul>
            </Modal.Body>
        </div>
    );
};

export default ShortcutModal;

