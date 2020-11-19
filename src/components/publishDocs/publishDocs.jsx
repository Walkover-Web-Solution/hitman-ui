import React from 'react';
import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import SideBar from '../main/sidebar';
import "./publishDocs.scss"

function PublishDocs(props) {
    return (
        <div className="publish-docs-container">
            <div className="publish-docs-wrapper">
                <SideBar
                    {...props}
                />
                <div class="content-panel">
                    <div className="hosted-APIs">
                        <div class="title">
                            Hosted API's
                        </div>
                        <select className="selected-API" name="MSG91" >
                            <option >option1</option>
                            <option >option2</option>
                        </select>
                    </div>
                    <div className="grid">
                        <div className="grid-columns">sd</div>
                        <div className="grid-columns">sd</div>
                        <div className="publish-button">  <Button variant="success">PUBLISH ALL</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PublishDocs