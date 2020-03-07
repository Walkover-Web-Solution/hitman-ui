import pagesService from "./pageService";
import pagesActionTypes from "./pagesActionTypes";
import store from "../../store/store";

export const fetchPages = () => {
  return dispatch => {
    pagesService
      .getAllPages()
      .then(response => {
        const pages = response.data;
        dispatch(fetchPagesSuccess(pages));
      })
      .catch(error => {
        dispatch(fetchPagesFailure(error.message));
      });
  };
};

export const fetchPagesSuccess = pages => {
  return {
    type: pagesActionTypes.FETCH_PAGES_SUCCESS,
    pages
  };
};

export const fetchPagesFailure = error => {
  return {
    type: pagesActionTypes.FETCH_PAGES_FAILURE,
    error
  };
};
export const updatePage = (history, editedPage) => {
  let newPage = { ...editedPage };
  delete newPage.id;
  delete newPage.versionId;
  delete newPage.groupId;
  return dispatch => {
    const originalPage = store.getState().pages[editedPage.id];
    dispatch(updatePageRequest(editedPage));
    pagesService
      .updatePage(editedPage.id, newPage)
      .then(response => {
        dispatch(updatePageSuccess(response.data));
        history.push(`/dashboard/collections/pages/${response.data.id}`);
      })
      .catch(error => {
        dispatch(updatePageFailure(error.response.data, originalPage));
      });
  };
};

export const updatePageRequest = editedPage => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedPage
  };
};

export const updatePageSuccess = response => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_SUCCESS,
    response
  };
};

export const updatePageFailure = (error, originalPage) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_FAILURE,
    error,
    originalPage
  };
};

export const addPage = (history, versionId, newPage) => {
  return dispatch => {
    dispatch(addPageRequest(versionId, newPage));
    delete newPage.groupId;
    delete newPage.versionId;
    pagesService
      .saveVersionPage(versionId, newPage)
      .then(response => {
        dispatch(addPageSuccess(response.data));
        history.push(`/dashboard/collections/pages/${response.data.id}/edit`);
      })
      .catch(error => {
        dispatch(addPageFailure(error.response.data, newPage));
      });
  };
};

export const addPageRequest = (versionId, newPage) => {
  return {
    type: pagesActionTypes.ADD_PAGE_REQUEST,
    versionId,
    newPage
  };
};

export const addPageSuccess = response => {
  return {
    type: pagesActionTypes.ADD_PAGE_SUCCESS,
    response
  };
};

export const addPageFailure = (error, newPage) => {
  return {
    type: pagesActionTypes.ADD_PAGE_FAILURE,
    newPage,
    error
  };
};
//

export const addGroupPage = (history, versionId, groupId, newPage) => {
  return dispatch => {
    dispatch(addGroupPageRequest(versionId, groupId, newPage));
    delete newPage.groupId;
    delete newPage.versionId;
    pagesService
      .saveGroupPage(groupId, newPage)
      .then(response => {
        dispatch(addGroupPageSuccess(response.data));
        history.push(`/dashboard/collections/pages/${response.data.id}/edit`);
      })
      .catch(error => {
        dispatch(addGroupPageFailure(error.response.data, newPage));
      });
  };
};

export const addGroupPageRequest = (versionId, groupId, newPage) => {
  return {
    type: pagesActionTypes.ADD_GROUP_PAGE_REQUEST,
    versionId,
    groupId,
    newPage
  };
};

export const addGroupPageSuccess = response => {
  return {
    type: pagesActionTypes.ADD_GROUP_PAGE_SUCCESS,
    response
  };
};

export const addGroupPageFailure = (error, newPage) => {
  return {
    type: pagesActionTypes.ADD_GROUP_PAGE_FAILURE,
    newPage,
    error
  };
};
//
export const deletePage = page => {
  return dispatch => {
    dispatch(deletePageRequest(page));
    pagesService
      .deletePage(page.id)
      .then(() => {
        dispatch(deletePageSuccess());
      })
      .catch(error => {
        dispatch(deletePageFailure(error.response, page));
      });
  };
};

export const deletePageRequest = page => {
  return {
    type: pagesActionTypes.DELETE_PAGE_REQUEST,
    page
  };
};

export const deletePageSuccess = () => {
  return {
    type: pagesActionTypes.DELETE_PAGE_SUCCESS
  };
};

export const deletePageFailure = (error, page) => {
  return {
    type: pagesActionTypes.DELETE_PAGE_FAILURE,
    error,
    page
  };
};

export const duplicatePage = page => {
  return dispatch => {
    pagesService
      .duplicatePage(page.id)
      .then(response => {
        dispatch(duplicatePageSuccess(response.data));
      })
      .catch(error => {
        dispatch(duplicatePageFailure(error.response, page));
      });
  };
};

export const duplicatePageSuccess = response => {
  return {
    type: pagesActionTypes.DUPLICATE_PAGE_SUCCESS,
    response
  };
};

export const duplicatePageFailure = (error, page) => {
  return {
    type: pagesActionTypes.DUPLICATE_PAGE_FAILURE,
    error,
    page
  };
};

export const updateState = pages => {
  return dispatch => {
    try {
      dispatch(updateStateSuccess(pages));
    } catch (error) {
      dispatch(updateStateFailure(error));
    }
  };
};

export const updateStateSuccess = pages => {
  return {
    type: pagesActionTypes.UPDATE_STATE_SUCCESS,
    pages
  };
};

export const updateStateFailure = error => {
  return {
    type: pagesActionTypes.UPDATE_STATE_FAILURE,
    error
  };
};

export default {
  updateState
};
