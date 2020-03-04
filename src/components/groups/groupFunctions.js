import {addGroup ,
    updateGroup
  } from "../groups/groupsActions";
  import { connect } from "react-redux";

const mapDispatchToProps = dispatch => {
    return {
      addGroup:(versionId,group) => dispatch(addGroup(versionId,group)),
      updateGroup:(group) => dispatch(updateGroup(group)),
    };
  };

