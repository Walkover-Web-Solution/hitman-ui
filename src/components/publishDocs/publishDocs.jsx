import React, { Component } from "react";
import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import MyPicker from './customColorPicker'
import SideBar from '../main/sidebar';
import "./publishDocs.scss"
import { connect } from "react-redux";
import { fetchCollections } from "../collections/redux/collectionsActions";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import {
    fetchEndpoints,
} from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import { fetchAllTeamsOfUser } from "../teams/redux/teamsActions";
import PublishDocsForm from './publishDocsForm'

const mapDispatchToProps = (dispatch) => {
    return {
        fetch_all_teams_of_user: () => dispatch(fetchAllTeamsOfUser()),
        fetch_collections: () => dispatch(fetchCollections()),
        fetch_all_versions: () => dispatch(fetchAllVersions()),
        fetch_groups: () => dispatch(fetchGroups()),
        fetch_endpoints: () => dispatch(fetchEndpoints()),
        fetch_pages: () => dispatch(fetchPages()),
    };
};

class  PublishDocs extends Component {
    state = {  }

     fetchAll() {
        this.props.fetch_all_teams_of_user();
        this.props.fetch_collections();
        this.props.fetch_all_versions();
        this.props.fetch_groups();
        this.props.fetch_endpoints();
        this.props.fetch_pages();
    }
    

    componentDidMount() {
        this.fetchAll()
    }

   

    render() { 
        return ( 
            <div className="publish-docs-container">
            <div className="publish-docs-wrapper">
                       <SideBar
                                {...this.props}
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
                                            <PublishDocsForm />
                                        </div>
                                        <div className="product">
                                      
                                        </div>
                                    </div>
            
                                    <div className="grid-column-two">
                                        <div>
                                            Pick your favorite color for website
                                       </div>
                                       <div>
                                       <MyPicker/>
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
                                        <button class="btn default">Reject</button>
            
                                    </div>
            
                                    <div className="grid-column-six">
                                        <div className="publish-button">  <Button variant="success">PUBLISH</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-three">
                                    <div className="grid-column-seven">
                                        sdads
                                    </div>
                                    <div className="grid-column-eight">
                                        <div ></div>
                                        <div>sdas</div>
            
                                    </div>
            
                                </div>
                            </div>
                        </div>
                    </div>
         );
    }
}
 



export default connect(null, mapDispatchToProps)(PublishDocs);

// function fetchAll(props) {
//     props.fetch_all_teams_of_user();
//     props.fetch_collections();
//     props.fetch_all_versions();
//     props.fetch_groups();
//     props.fetch_endpoints();
//     props.fetch_pages();
// }
// function PublishDocs(props) {
//     useEffect(() => {
//         fetchAll(props);
//     });
//     return (
//         <div className="publish-docs-container">
//             <div className="publish-docs-wrapper">
//                 <SideBar
//                     {...props}
//                 />
//                 <div class="content-panel">
//                     <div className="hosted-APIs">
//                         <div class="title">
//                             Hosted API's
//                         </div>
//                         <select className="selected-API" name="MSG91" >
//                             <option >option1</option>
//                             <option >option2</option>
//                         </select>
//                     </div>
//                     <div className="grid">
//                         <div className="grid-column-one">
//                             <div className="domain">
//                                 Domain:   <input type="text"/>
//                                 <br />
                               
//                                  Title: <input type="text"/>
//                             </div>
//                             <div className="product">
//                             <div style={{ marginRight: "15px" }}>
//                                 <ImageUploader
//                                 className = "upload-item"
//                                 withIcon={false}
//                                 withPreview={true}
//                                 label=""
//                                 // onChange={this.onDrop}
//                                 buttonText="select"
//                                 imgExtension={[".jpg", ".gif", ".png", ".gif", ".svg"]}
//                                 maxFileSize={1048576}
//                                 fileSizeError=" file size is too big"
//                                 />
//                              </div>
//                             </div>
//                         </div>

//                         <div className="grid-column-two">
//                             <div>
//                                 Pick your favorite color for website
//                            </div>
//                            <div>
//                            <MyPicker/>
//                            </div>

//                         </div>

//                         <div className="publish-button">  <Button variant="success">PUBLISH ALL</Button>
//                         </div>
//                     </div>

//                     <div className="grid-two">
//                         <div className="grid-column-three">
//                             <select className="selected-API" name="MSG91" >
//                                 <option >option1</option>
//                                 <option >option2</option>

//                             </select>
//                         </div>
//                         <div className="grid-column-four">
//                             <div className="contacts">Contacts</div>

//                             <div className="list-contacts">
//                                 List of contacts
//                             </div>
//                         </div>

//                         <div className="grid-column-five">
//                             <button class="btn default">Reject</button>

//                         </div>

//                         <div className="grid-column-six">
//                             <div className="publish-button">  <Button variant="success">PUBLISH</Button>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="grid-three">
//                         <div className="grid-column-seven">
//                             sdads
//                         </div>
//                         <div className="grid-column-eight">
//                             <div ></div>
//                             <div>sdas</div>

//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
