import React from 'react';
import { Button } from 'react-bootstrap';
import SideBar from '../main/sidebar';

function PublishDocs(props) {
    console.log("props", props)
    return (
        <div>
            <SideBar
                {...props}
            />

        </div>
    )
}

export default PublishDocs