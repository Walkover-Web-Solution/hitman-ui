import React, { Component } from 'react';
import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
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
import extractCollectionInfoService from "./extractCollectionInfoService"
import DisplayEndpoint from "../endpoints/displayEndpoint";

var URI = require("urijs");

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

const mapStateToProps = (state) => {
    return {
        teams: state.teams,
        collections: state.collections,
        versions: state.versions,
        pages: state.pages,
        teamUsers: state.teamUsers,
        groups: state.groups,
        endpoints: state.endpoints,
        pages: state.pages
    };
};



class PublishDocs extends Component {
    state = {
        selectedCollectionId: null,
        selectedVersionId: null
    }

    componentDidMount() {
        this.setState({
            selectedCollectionId: URI.parseQuery(this.props.location.search).collectionId
        })
        this.fetchAll(this.props);
        this.extractCollectionInfo()

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.extractCollectionInfo()
        }
    }

    fetchAll() {
        if (Object.keys(this.props.collections).length === 0) {
            this.props.fetch_all_teams_of_user();
            this.props.fetch_collections();
            this.props.fetch_all_versions();
            this.props.fetch_groups();
            this.props.fetch_endpoints();
            this.props.fetch_pages();
        }
    }

    extractCollectionInfo() {
        let selectedCollectionId = this.state.collectionId ? this.state.collectionId : URI.parseQuery(this.props.location.search).collectionId
        this.versions = extractCollectionInfoService.extractVersionsFromCollectionId(selectedCollectionId, this.props)
        this.groups = extractCollectionInfoService.extractGroupsFromVersions(this.versions, this.props)
        this.pages = extractCollectionInfoService.extractPagesFromVersions(this.versions, this.props)
        this.endpoints = extractCollectionInfoService.extractEndpointsFromGroups(this.groups, this.props)
        this.setState({
            selectedVersionId: Object.keys(this.versions)[0]
        })
    }

    setSelectedCollection(e) {
        this.props.history.push({
            pathname: `/admin/publish`,
            search: `?collectionId=${e.currentTarget.value}`,
        })
    }

    openEndpoint(groupId, endpointId) {
        this.setState({
            selectedGroupId: groupId,
            selectedEndpointId: endpointId
        })
    }

    render() {
        return (
            <div className="publish-docs-container" >
                <div className="publish-docs-wrapper">
                    <SideBar
                        {...this.props}
                    />
                    <div class="content-panel">
                        <div className="hosted-APIs">
                            <div class="title">
                                Hosted API's
                        </div>

                            <select name="selectedCollection"
                                onChange={this.setSelectedCollection.bind(this)}
                            >
                                {this.props.collections ? Object.keys(this.props.collections).map((id) =>
                                    <option value={id}>{this.props.collections[id]?.name}</option>
                                ) : null}
                            </select>
                        </div>
                        <div className="grid">
                            <div className="grid-column-one">
                                <div className="domain">
                                    Domain: docs.msg91.com
                                <br />
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
                            <div className="versions-section">
                                <select className="selected-API" name="MSG91" >
                                    {this.versions ? Object.keys(this.versions).map((id) =>
                                        <option value={id}>{this.props.versions[id]?.number}</option>
                                    ) : null}

                                </select>
                                <div className="groups">
                                    {this.pages ? Object.keys(this.pages).map((pageId) =>
                                        this.pages[pageId].versionId?.toString() === this.state.selectedVersionId?.toString() ? this.pages[pageId].groupId === null ? (
                                            <div >{this.pages[pageId]?.name
                                            }
                                            </div>)
                                            : null
                                            : null
                                    ) : null}
                                </div>
                                <div className="version-groups">
                                    {this.groups ? Object.keys(this.groups).map((groupId) =>
                                        this.groups[groupId].versionId?.toString() === this.state.selectedVersionId?.toString() ? (
                                            <div className="groups">{this.groups[groupId]?.name
                                            }
                                                {this.pages ? Object.keys(this.pages).map((pageId) =>
                                                    this.pages[pageId].groupId?.toString() === groupId?.toString() ? (
                                                        <div className="groups">{this.pages[pageId]?.name
                                                        }
                                                        </div>)
                                                        : null
                                                ) : null}
                                                {this.endpoints ? Object.keys(this.endpoints).map((endpointId) =>
                                                    this.endpoints[endpointId].groupId?.toString() === groupId?.toString() ? (<div onClick={() => this.openEndpoint(groupId, endpointId)} className="groups">{this.endpoints[endpointId]?.name
                                                    }</div>) : null
                                                ) : null}


                                            </div>)
                                            : null
                                    ) : null}
                                </div>
                            </div>
                            <div className="version-details">
                                {this.state.selectedEndpointId ? (
                                    <div>
                                        <div className="contacts">{this.props.groups[this.state.selectedGroupId].name}</div>
                                        <div className="list-contacts">
                                            {this.props.endpoints[this.state.selectedEndpointId].name}
                                        </div>
                                        <DisplayEndpoint endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} />
                                    </div>

                                ) : null}

                            </div>

                            {/* <div className="grid-column-five">
                            <button class="btn default">Reject</button>

                        </div>

                        <div className="grid-column-six">
                            <div className="publish-button">  <Button variant="success">PUBLISH</Button>
                            </div>
                        </div> */}
                        </div>
                        {/* <div className="grid-three">
                        <div className="grid-column-seven">
                            sdads
                        </div>
                        <div className="grid-column-eight">
                            <div ></div>
                            <div>sdas</div>

                        </div>

                    </div> */}
                    </div>
                </div>
            </div >
        )
    }
    // let versions = {}
    // useEffect(() => {
    //     fetchAll(this.props);
    //     setcollectionId(URI.parseQuery(props.location.search).collectionId)
    //     versions = extractCollectionInfo(collectionId, props)
    //     console.log(versions)
    // });

    //     return(
    //     <div className = "publish-docs-container" >
    //             <div className="publish-docs-wrapper">
    //                 <SideBar
    //                     {...props}
    //                 />
    //                 <div class="content-panel">
    //                     <div className="hosted-APIs">
    //                         <div class="title">
    //                             Hosted API's
    //                         </div>
    //                         <select className="selected-API" name="s" >
    //                             {props.collections ? Object.keys(props.collections).map((id) =>
    //                                 <option value={id}>{props.collections[id]?.name}</option>
    //                             ) : null}
    //                         </select>
    //                     </div>
    //                     <div className="grid">
    //                         <div className="grid-column-one">
    //                             <div className="domain">
    //                                 Domain: docs.msg91.com
    //                                 <br />
    //                                  Slug: api/sendsms/bulk
    //                             </div>
    //                             <div className="product">
    //                                 MSG91
    //                             </div>
    //                         </div>

    //                         <div className="grid-column-two">
    //                             <div>
    //                                 Pick your favorite color for website
    //                            </div>

    //                         </div>

    //                         <div className="publish-button">  <Button variant="success">PUBLISH ALL</Button>
    //                         </div>
    //                     </div>

    //                     <div className="grid-two">
    //                         <div className="versions-section">
    //                             <select className="selected-API" name="MSG91" >
    //                                 <option >option1</option>
    //                                 <option >option2</option>
    //                             </select>
    //                             <div className="version-groups"></div>
    //                         </div>
    //                         <div className="version-details">
    //                             <div className="contacts">Contacts</div>
    //                             <div className="list-contacts">
    //                                 List of contacts
    //                             </div>
    //                         </div>

    //                         {/* <div className="grid-column-five">
    //                             <button class="btn default">Reject</button>

    //                         </div>

    //                         <div className="grid-column-six">
    //                             <div className="publish-button">  <Button variant="success">PUBLISH</Button>
    //                             </div>
    //                         </div> */}
    //                     </div>
    //                     {/* <div className="grid-three">
    //                         <div className="grid-column-seven">
    //                             sdads
    //                         </div>
    //                         <div className="grid-column-eight">
    //                             <div ></div>
    //                             <div>sdas</div>

    //                         </div>

    //                     </div> */}
    //                 </div>
    //             </div>
    //     </div>
    // )
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocs);

