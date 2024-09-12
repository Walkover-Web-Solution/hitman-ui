import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { RxCross2 } from "react-icons/rx";
import IconButton from '../common/iconButton';
import { BsCommand } from 'react-icons/bs';
import { PiControlBold } from "react-icons/pi";

const ShortcutModal = ({ hideModal }) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const shortcuts = [
        { name: 'Save', key: isMac ?  [<BsCommand key="cmd"/>, 'S'] : ['Ctrl', 'S'] }, 
        { name: 'Open Tab', key: isMac ? [<PiControlBold key="ctrl"/>, 'N'] : ['Alt', 'N'] },
        { name: 'Publish', key: isMac ? [<BsCommand  key="cmd"/>, 'B']  : ['Ctrl', 'B'] },
        { name: 'Close Tab', key: isMac ? [<PiControlBold key="ctrl"/>, 'W'] : ['Alt', 'W'] },
        { name: 'Unpublish', key: isMac ? [<BsCommand key="cmd"/>, 'U']  : ['Ctrl', 'U'] },
        { name: 'Switch Tab', key: isMac ? [<PiControlBold key="ctrl"/>, 'T'] : ['Alt', 'T'] },
        { name: 'Show Shortcuts', key: isMac ? [<BsCommand key="cmd"/>, '/']  :['Ctrl', '/'] },

    ];

    return (
        <div className="modal-container" >
            <div className="modal-header">
                <h2>Keyboard Shortcuts</h2>
                <Button onClick={hideModal} className="close-btn">
                    <IconButton>
                        <RxCross2 />
                    </IconButton>
                </Button>
            </div>
            <Modal.Body className="modal-body">
                <ul >
                    {shortcuts.map((shortcut, index) => (
                        <li key={index}>
                            <span >{shortcut.name}</span>
                            <span className="shortcut-key">
                                {shortcut.key.map((keyPart, idx) => (
                                    <span key={idx} className="key-box ">{keyPart}</span>
                                ))}
                            </span>
                        </li>
                    ))}
                </ul>
            </Modal.Body>
        </div>
    );
};

export default ShortcutModal;