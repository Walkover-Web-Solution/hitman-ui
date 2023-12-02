import React from "react";
import { Dropdown, Modal, Button } from "react-bootstrap";
import Avatar from "react-avatar";
import { FixedSizeList as List } from "react-window";
import lightArrow from "../../assets/icons/new-arrow.svg";
import User from "../../assets/icons/user.svg";
import SwitchRight from "../../assets/icons/switchRight.svg";
// import RightArrow from '../../assets/icons/right-arrow.svg'
import Power from "../../assets/icons/power.svg";
import File from "../../assets/icons/file.svg";
import { products } from "../common/constants";
import HostedApiIcon from "../../assets/icons/hostedApiIcon.svg";
import { getCurrentUser } from "../auth/authServiceV2";
import GenericModal from "./GenericModal";
import { switchOrg } from "../../services/orgApiService";
import "./userProfile.scss";
import { toast } from "react-toastify";
import { createOrg } from "../../services/orgApiService";
// import fetch from 'node-fetch'
export class UserProfileV2 extends React.Component {
  state = {
    name: "",
    email: "",
    orgFilter: "",
    moreFlag: false,
    showModal: false,
    loading: false,
    orgName: "",
  };

  componentDidMount() {
    if (getCurrentUser()) {
      this.setProfile();
    }
  }

  setProfile() {
    const currentUser = getCurrentUser()
    // const name = getProfileName(currentUser)
    this.setState({ name: currentUser.name });
    this.setState({ email: currentUser.email });
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  };

  renderAvatarWithOrg(onClick, ref1) {
    // const { getNotificationCount } = this.getNotificationCount()
    return (
      <div
        className="menu-trigger-box d-flex align-items-center justify-content-between w-100"
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
      >
        <div className="d-flex align-items-center position-relative">
          <Avatar
            className="mr-2"
            color="#343a40"
            name={this.getCurrentOrg()?.name}
            size={30}
            round="4px"
          />
          {this.renderOrgName()}
          {/* {getNotificationCount && getNotificationCount() > 0 &&
            <span className='user-notification-badge'>{getNotificationCount()}</span>} */}
        </div>
        <img
          ref={ref1}
          src={lightArrow}
          alt="settings-gear"
          className="transition cursor-pointer"
        />
      </div>
    );
  }

  renderOrgName() {
    const { name } = this.getUserDetails();
    return (
      <div>
        <div className="org-name">{this.getCurrentOrg()?.name || null}</div>
        <span className="profile-details-label-light">{name}</span>
        {/* {
                this.getNotificationCount() > 0 &&
                  <div className='user-notification-badge'>{this.getNotificationCount()}</div>
            } */}
      </div>
    );
  }

  getCurrentOrg() {
    const organizations =
      JSON.parse(window.localStorage.getItem("organisationList")) || [];
    // const filteredOrgsArray = this.getAllOrgs(organizations)
    return organizations[0];
  }

  renderUserDetails() {
    const { name, email } = this.getUserDetails();
    return (
      <div
        className="profile-details plr-3 d-flex align-items-center"
        onClick={() => {}}
      >
        <div className="user-icon mr-2">
          <img src={User} />
        </div>
        <div className="profile-details-user-name">
          <span className="org-name">{name}</span>
          <span className="profile-details-label-light">{email}</span>
        </div>
      </div>
    );
  }

  getUserDetails() {
    const email = this.state.email || "";
    const name = this.state.name;
    return { email, name };
  }

  renderMenuButton() {
    return ""; // this.renderProfileOption()   //Hosted API doc is not needed anymore
  }

  renderProfileOption() {
    return (
      // isAdmin() &&
      <div
        className="profile-listing"
        onClick={() => {
          this.navigateToPublishDocs();
        }}
      >
        <img src={HostedApiIcon} alt="" />
        <span className="label">Hosted API</span>
        {this.getNotificationCount() > 0 && (
          <div className="user-notification-badge">
            {this.getNotificationCount()}
          </div>
        )}
      </div>
    );
  }

  navigateToPublishDocs() {
    const collection = this.getFirstPublicCollection();
    this.openPublishDocs(collection);
  }

  getFirstPublicCollection() {
    const allCollections = this.getPublicCollections();
    let firstCollection = {};
    const collectionId = allCollections[0];
    const collection = this.props.collections[collectionId];
    firstCollection = collection;
    return firstCollection;
  }

  getPublicCollections() {
    if (this.dataFetched()) {
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(
        (eId) =>
          this.props.endpoints[eId].state === "Pending" ||
          (this.props.endpoints[eId].state === "Draft" &&
            this.props.endpoints[eId].isPublished)
      );
      const pendingPageIds = Object.keys(this.props.pages).filter(
        (pId) =>
          this.props.pages[pId].state === "Pending" ||
          (this.props.pages[pId].state === "Draft" &&
            this.props.pages[pId].isPublished)
      );
      const endpointCollections =
        this.findPendingEndpointsCollections(pendingEndpointIds);
      const pageCollections = this.findPendingPagesCollections(pendingPageIds);
      const allCollections = [
        ...new Set([...endpointCollections, ...pageCollections]),
      ];
      return allCollections;
    }
  }

  dataFetched() {
    return (
      this.props.collections &&
      this.props.versions &&
      this.props.groups &&
      this.props.endpoints &&
      this.props.pages
    );
  }

  findPendingEndpointsCollections(pendingEndpointIds) {
    const groupsArray = [];
    for (let i = 0; i < pendingEndpointIds.length; i++) {
      const endpointId = pendingEndpointIds[i];
      if (this.props.endpoints[endpointId]) {
        const groupId = this.props.endpoints[endpointId].groupId;
        groupsArray.push(groupId);
      }
    }

    const versionsArray = [];
    for (let i = 0; i < groupsArray.length; i++) {
      const groupId = groupsArray[i];
      if (this.props.groups[groupId]) {
        const versionId = this.props.groups[groupId].versionId;
        versionsArray.push(versionId);
      }
    }

    const collectionsArray = [];
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i];
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId;
        collectionsArray.push(collectionId);
      }
    }

    return collectionsArray;
  }

  findPendingPagesCollections(pendingPageIds) {
    const versionsArray = [];
    for (let i = 0; i < pendingPageIds.length; i++) {
      const pageId = pendingPageIds[i];
      if (this.props.pages[pageId]) {
        const versionId = this.props.pages[pageId].versionId;
        versionsArray.push(versionId);
      }
    }
    const collectionsArray = [];
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i];
      if (this.props.versions[versionId]) {
        const collectionId = this.props.versions[versionId].collectionId;
        collectionsArray.push(collectionId);
      }
    }
    return collectionsArray;
  }

  openPublishDocs(collection) {
    if (collection?.id) {
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`,
      });
    } else {
      const collection =
        this.props.collections[Object.keys(this.props.collections)[0]];
      this.props.history.push({
        pathname: `/orgs/${this.props.match.params.orgId}/admin/publish`,
        search: `?collectionId=${collection.id}`,
      });
    }
  }

  getNotificationCount() {
    const collections = this.getPublicCollections();
    return collections?.length || 0;
  }

  openAccountAndSettings() {
    const { productName, history, organizationId, location } = this.props;
    if (productName !== products.EBL) {
      this.openOptions("/manage/users");
    } else {
      history.push({
        pathname: `/orgs/${organizationId}/manage`,
        search: location.search,
      });
    }
  }

  renderBilling() {
    return (
      <div
        className="profile-listing"
        onClick={() => {
          this.openOptions("/billing/subscription");
        }}
      >
        <img src={File} />
        <span className="label">Billing</span>
      </div>
    );
  }

  openOptions(path) {
    const { match, handleOpenLink } = this.props;
    const viasocketUrl = process.env.REACT_APP_VIASOCKET_URL;
    const currProductUrl =
      process.env.REACT_APP_UI_BASE_URL || process.env.REACT_APP_UI_URL;
    const { orgId } = match.params;
    if (orgId) {
      let url = `${viasocketUrl}/orgs/${orgId}${path}?product=hitman`;
      if (path === "/products") {
        url += "";
      } else {
        url += `&redirect_uri=${currProductUrl}`;
      }
      if (!handleOpenLink) {
        window.open(url, "_blank");
      } else {
        handleOpenLink(url);
      }
    } else {
      console.log("Organization ID not found");
    }
  }

  renderLogout() {
    return (
      <div
        className="profile-listing"
        onClick={() => {
          this.props.history.push({
            pathname: "/logout",
          });
        }}
      >
        <img src={Power} />
        <span className="label">Logout</span>
      </div>
    );
  }

  renderOrgList() {
    const organizations =
      JSON.parse(window.localStorage.getItem("organisationList")) || [];
    // // const productName = 'hitman'
    // const orgsLength = Object.keys(organizations || {})?.length
    // // const filteredOrgsArray = this.getAllOrgs(organizations)
    // const orgItem = ({ index, style }) => {
    //   const item = organizations[index]
    //   return (
    //     <Dropdown.Item style={style}>
    //       <div
    //         key={item?.id}
    //         className='org-listing d-flex justify-content-between'
    //         onClick={() => {
    //           const currentId = item?.id
    //           this.switchOrg(currentId)
    //         }}
    //       >
    //         <span className='org-listing-name'>{item?.name}</span>
    //         <img src={RightArrow} />
    //       </div>
    //     </Dropdown.Item>
    //   )
    // }

    return (
      <>
        <div className="OrgsBlock">
          <div className="btn-group dropdown org-listing">
            <img src={SwitchRight} alt="Switch" />
            <span
              type="button"
              id="dropdown-custom-components"
              className="dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Switch Orgs
            </span>
            <div className="dropdown-menu">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  className="dropdown-item"
                  onClick={() => switchOrg(org.id)}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>
          {/* </div> */}
          {/* <Dropdown className='nested-org-dropdown' drop='right'>
              <Dropdown.Toggle className='text-uppercase text-sm-bold plr-3'>
                SWITCH ORGS
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <div className='orgs-listing-container'>
                  {this.state.moreFlag &&
                    <div className='p-2 search-profile'>
                      <input
                        className='form-control'
                        onChange={(e) => this.setOrgFilter(e.target.value, organizations?.length || 0)}
                        value={this.state.orgFilter}
                        placeholder='Search'
                      />
                    </div>}
                  {organizations.length === 0
                    ? <div className='pb-2 text-center w-100'><small className='body-6'>No Organizations Found</small></div>
                    : (
                      <List height={organizations.length < 5 ? 36 * organizations.length : 180} itemCount={this.getItemCount(organizations.length)} itemSize={35}>
                        {orgItem}
                      </List>
                    )}
                </div>
                {orgsLength > 5 &&
                  <div className='ShowMore text-center' onClick={() => this.setShowFlag()}>
                    {!this.state.moreFlag ? 'Show more' : 'Show less'}
                  </div>}
              </Dropdown.Menu>
            </Dropdown> */}
        </div>
      </>
    );
  }
  renderOrgListDropdown() {
    const organizations =
      JSON.parse(window.localStorage.getItem("organisationList")) || [];
    const selectedOrg = organizations[0];
    return (
      <div className="org-listing-container ">
        <div className="org-listing-column d-flex flex-column">
          {organizations.map((org, key) => (
            <button
              className={`btn btn-primary mb-2 p-2 ${
                org === selectedOrg ? "active" : ""
              } `}
              key={key}
              // onClick={() => switchOrg(org.id)}
              onClick={() => {
                if (org.id === selectedOrg.id) {
                  toast.error("This Organization is Already selected");
                } else {
                  switchOrg(org.id);
                }
              }}
            >
              {org.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  getAllOrgs(organizations) {
    const orgsArray = Object.values({ ...organizations } || {});
    const { orgFilter } = this.state;
    const filteredOrgsArray = orgsArray
      .filter((org) => org.name.toLowerCase().includes(orgFilter.toLowerCase()))
      .sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        else return 0;
      });

    return filteredOrgsArray;
  }

  setOrgFilter(orgFilter) {
    this.setState({ orgFilter });
  }

  getItemCount(orgCount) {
    const showFlag = this.state.moreFlag;
    if (orgCount > 5 && !showFlag) {
      return 5;
    } else {
      return orgCount;
    }
  }

  setShowFlag() {
    let orgFilter = this.state.orgFilter;
    const moreFlag = !this.state.moreFlag;
    if (!moreFlag) {
      orgFilter = "";
    }
    this.setState({ orgFilter, moreFlag });
  }
  setName = (orgName) => {
    this.setState({ orgName });
  };


  validateName = (orgName) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    if (orgName && regex.test(this.orgName)) {
      return true;
    } else {
      return false;
    }
  };

  handleAddOrg = async () => {
    try{
    if (!this.validateName(this.state.orgName)) {
      toast.error("Only alphanumeric and underscores are allowed");
      return;
    }
    await createOrg(this.state.orgName);
    }catch(e){
      toast.error("Something went wrong");
    }
  }

  render() {
    return (
      <div className="profile-menu">
        <Dropdown className="menu-dropdown transition d-flex align-items-center">
          <Dropdown.Toggle
            as={React.forwardRef(({ children, onClick }, ref1) =>
              this.renderAvatarWithOrg(onClick, ref1)
            )}
            id="dropdown-custom-components"
          />
          <Dropdown.Menu>
            {this.renderUserDetails()}
            <div className="profile-listing-container">
              {/* <Dropdown.Item>{this.renderMenuButton()}</Dropdown.Item> */}
              {/* <Dropdown.Item>{this.renderBilling()} </Dropdown.Item> */}
              <Dropdown.Item>{this.renderLogout()}</Dropdown.Item>
              <Dropdown.Divider />
              {/* <Dropdown.Item> {this.renderOrgList()}</Dropdown.Item> */}
              <div className="profile-menu">
                <span className="p-2" onClick={this.toggleModal} type="button">
                  <img src={SwitchRight} />
                  Switch Orgs
                </span>
                <GenericModal
                  orgName={this.state.orgName}
                  validateName={this.validateName}
                  handleKeyPress={this.handleKeyPress}
                  inputRef={this.inputRef}
                  setName={this.setName}
                  handleCloseModal={this.toggleModal}
                  showModal={this.state.showModal}
                  title="Switch Organizations"
                  modalBody={this.renderOrgListDropdown()}
                  keyboard={false}
                  showInput={true}
                  handleAddOrg = {this.handleAddOrg}
                />
              </div>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
