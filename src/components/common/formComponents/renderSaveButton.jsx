import React from "react";

const RenderSaveButton = ({saveCollection, defaultViewTypes}) => {

    return (<button className='btn btn-primary btn-sm fs-4' onClick={() => saveCollection(defaultViewTypes.TESTING, 'edit')}>
    Save
  </button>)
}

export default RenderSaveButton