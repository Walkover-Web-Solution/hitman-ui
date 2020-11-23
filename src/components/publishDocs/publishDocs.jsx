import React, { Component } from 'react';
import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import MyPicker from './customColorPicker'
import SideBar from '../main/sidebar';
import "./publishDocs.scss"
import { connect } from "react-redux";
import { fetchCollections } from "../collections/redux/collectionsActions";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import { fetchEndpoints } from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import extractCollectionInfoService from "./extractCollectionInfoService"
import DisplayEndpoint from "../endpoints/displayEndpoint";
import {
    approveEndpoint,
    rejectEndpoint
} from "../publicEndpoint/redux/publicEndpointsActions";
import {
    approvePage,
    rejectPage,
} from "../publicEndpoint/redux/publicEndpointsActions";
import PublishDocsForm from './publishDocsForm'
import DisplayPage from '../pages/displayPage';
var URI = require("urijs");


const mapDispatchToProps = (dispatch) => {
    return {
        fetch_collections: () => dispatch(fetchCollections()),
        fetch_all_versions: () => dispatch(fetchAllVersions()),
        fetch_groups: () => dispatch(fetchGroups()),
        fetch_endpoints: () => dispatch(fetchEndpoints()),
        fetch_pages: () => dispatch(fetchPages()),
        approve_endpoint: (endpoint) => dispatch(approveEndpoint(endpoint)),
        reject_endpoint: (endpoint) => dispatch(rejectEndpoint(endpoint)),
        approve_page: (page) => dispatch(approvePage(page)),
        reject_page: (page) => dispatch(rejectPage(page)),
    };
};

const mapStateToProps = (state) => {
    return {
        collections: state.collections,
        versions: state.versions,
        pages: state.pages,
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
            let selectedGroupId = this.getInitialGroup(Object.keys(this.versions)[0]);
            let selectedEndpointId = this.getInitialEndpoint(selectedGroupId);
            this.setState({
                selectedCollectionId: URI.parseQuery(this.props.location.search).collectionId,
                selectedVersionId: Object.keys(this.versions)[0],
                selectedGroupId,
                selectedEndpointId
            })
        }
    }
    getInitialGroup(versionId) {
        for (let i = 0; i < Object.keys(this.groups).length; i++) {
            if (this.groups[Object.keys(this.groups)[i]].versionId === versionId) {
                return Object.keys(this.groups)[i]
            }
        }
        return ""
    }

    getInitialEndpoint(groupId) {

        for (let i = 0; i < Object.keys(this.endpoints).length; i++) {
            if (this.endpoints[Object.keys(this.endpoints)[i]].groupId === groupId && (this.endpoints[Object.keys(this.endpoints)[i]].state === "Approved" || this.endpoints[Object.keys(this.endpoints)[i]].state === "Pending")) {
                return Object.keys(this.endpoints)[i]
            }
        }
        return ""
    }

    fetchAll() {
        if (Object.keys(this.props.collections).length === 0) {
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
            selectedEndpointId: endpointId,
            selectedPageId: false,
        })
    }

    setSelectedVersion(e) {
        this.setState({
            selectedVersionId: e.currentTarget.value,
        })
    }

    checkEndpointStateandGroup(endpointId, groupId) {
        if (this.endpoints[endpointId].groupId?.toString() === groupId?.toString()) {
            if (this.endpoints[endpointId].state === "Approved" || this.endpoints[endpointId].state === "Pending") return true
            else return false
        }
        else return false

    }

    async handleApproveEndpointRequest(endpointId) {
        this.props.approve_endpoint(this.props.endpoints[endpointId]);
    }

    async handleRejectEndpointRequest(endpointId) {
        this.props.reject_endpoint(this.props.endpoints[endpointId]);
    }

    openPage(groupId, pageId) {
        this.setState({
            selectedGroupId: groupId,
            selectedEndpointId: false,
            selectedPageId: pageId,
        })
    }

    async handleApprovePageRequest(pageId) {
        this.props.approve_page(this.props.pages[pageId]);
    }

    async handleRejectPageRequest(pageId) {
        this.props.reject_page(this.props.pages[pageId]);
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
                                value={this.state.selectedCollectionId}
                            >
                                {this.props.collections ? Object.keys(this.props.collections).map((id) =>
                                    this.props.collections[id].isPublic === true ?
                                        (<option value={id}>{this.props.collections[id]?.name}</option>) : null
                                ) : null}
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
                                    <MyPicker />
                                </div>
                            </div>

                            <div className="publish-button">  <Button variant="success">PUBLISH ALL</Button>
                            </div>
                        </div>

                        <div className="grid-two">
                            <div className="versions-section">
                                <select className="selected-version" onChange={this.setSelectedVersion.bind(this)}
                                >
                                    {this.versions ? Object.keys(this.versions).map((id) =>
                                        <option value={id}>{this.props.versions[id]?.number}</option>
                                    ) : null}

                                </select>
                                <div className="groups">
                                    {this.pages ? Object.keys(this.pages).map((pageId) =>
                                        this.pages[pageId].versionId?.toString() === this.state.selectedVersionId?.toString() ? this.pages[pageId].groupId === null ? (
                                            <div onClick={() => this.openPage("", pageId)}>{this.pages[pageId]?.name
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
                                                        <div onClick={() => this.openPage(groupId, pageId)} className="groups">{this.pages[pageId]?.name
                                                        }
                                                        </div>)
                                                        : null
                                                ) : null}
                                                {this.endpoints ? Object.keys(this.endpoints).map((endpointId) =>
                                                    this.checkEndpointStateandGroup(endpointId, groupId) ? (<div onClick={() => this.openEndpoint(groupId, endpointId)} className="groups">{this.endpoints[endpointId]?.name
                                                    }  {this.endpoints[endpointId]?.state === "Pending" ? <span style={{ "float": "right", "background": "#95a6b9", "padding": "5px", "borderRadius": "2px" }}> New</span> : null} </div>) : null
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
                                            {/* {this.props.endpoints[this.state.selectedEndpointId].state === "Pending" ? <span>new</span> : null} */}
                                        </div>
                                        <div className="publish-reject">
                                            <button class="btn default" onClick={() => this.handleRejectEndpointRequest(this.state.selectedEndpointId)}>Reject</button>
                                            <div className="publish-button">  <Button variant="success" onClick={() => this.handleApproveEndpointRequest(this.state.selectedEndpointId)}>PUBLISH</Button>
                                            </div>
                                        </div>
                                        <DisplayEndpoint endpointId={this.state.selectedEndpointId} groupId={this.state.selectedGroupId} {...this.props} />
                                    </div>

                                ) : null}
                                {this.state.selectedPageId ? (
                                    <div>
                                        <div className="contacts">{this.props.groups[this.state.selectedGroupId]?.name}</div>
                                        <div className="list-contacts">
                                            {this.props.pages[this.state.selectedPageId].name}
                                        </div>
                                        <div className="publish-reject">
                                            <button class="btn default" onClick={() => this.handleRejectPageRequest(this.state.selectedPageId)}>Reject</button>
                                            <div className="publish-button">  <Button variant="success" onClick={() => this.handleApprovePageRequest(this.state.selectedPageId)}>PUBLISH</Button>
                                            </div>
                                        </div>
                                        {/* <DisplayPage pageId={this.state.selectedPageId} groupId={this.state.selectedGroupId} {...this.props} /> */}
                                    </div>

                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocs);

