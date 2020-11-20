import React, { useState, useEffect } from 'react';
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


function fetchAll(props) {
    props.fetch_all_teams_of_user();
    props.fetch_collections();
    props.fetch_all_versions();
    props.fetch_groups();
    props.fetch_endpoints();
    props.fetch_pages();
}

function PublishDocs(props) {
    useEffect(() => {
        fetchAll(props);
    });
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
    )
}

export default connect(null, mapDispatchToProps)(PublishDocs);

