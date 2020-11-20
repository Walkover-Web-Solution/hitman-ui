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
                        <div className="grid-column-one">
                             <div className="domain">
                                Domain: docs.msg91.com
                                <br/>
                                 Slug: api/sendsms/bulk
                            </div>
                            <div className="product">
                                MSG91
                            </div>
                        </div>

                        <div className="grid-column-two">
                           <div>
                             Pick your favorite color for website
                           </div>

                        </div>

                        <div className="publish-button">  <Button variant="success">PUBLISH ALL</Button>
                        </div>
                    </div>

                    <div className="grid-two">
                        <div className="grid-column-three">
                            <select className="selected-API" name="MSG91" >
                            <option >option1</option>
                            <option >option2</option>
                            
                        </select>
                        </div>
                        <div className="grid-column-four">
                            <div className="contacts">Contacts</div>
                           
                            <div className="list-contacts">
                                List of contacts
                            </div>
                        </div>
                         
                        <div className="grid-column-five">
                            
                        </div>

                       <div className="grid-column-six">
                            <div className="publish-button">  <Button variant="success">PUBLISH</Button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default PublishDocs