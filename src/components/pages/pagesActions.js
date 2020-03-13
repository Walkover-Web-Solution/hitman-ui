import pagesService from "./pageService";
import pagesActionTypes from "./pagesActionTypes";
import store from "../../store/store";

export const fetchPages = () => {
  return dispatch => {
    pagesService
      .getAllPages()
      .then(response => {
        const pages = response.data;
        dispatch(onPagesFetched(pages));
      })
      .catch(error => {
        dispatch(onPagesFetchedError(error.message));
      });
  };
};

export const onPagesFetched = pages => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED,
    pages
  };
};

export const onPagesFetchedError = error => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED_ERROR,
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
        dispatch(onPageUpdated(response.data));
        history.push(`/dashboard/pages/${response.data.id}`);
      })
      .catch(error => {
        dispatch(
          onPageUpdatedError(
            error.response ? error.response.data : error,
            originalPage
          )
        );
      });
  };
};

export const updatePageRequest = editedPage => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedPage
  };
};

export const onPageUpdated = response => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED,
    response
  };
};

export const onPageUpdatedError = (error, originalPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED_ERROR,
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
        dispatch(onPageAdded(response.data));
        history.push(`/dashboard/pages/${response.data.id}/edit`);
      })
      .catch(error => {
        dispatch(
          onPageAddedError(
            error.response ? error.response.data : error,
            newPage
          )
        );
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

export const onPageAdded = response => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED,
    response
  };
};

export const onPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED_ERROR,
    newPage,
    error
  };
};

export const addGroupPage = (history, versionId, groupId, newPage) => {
  return dispatch => {
    dispatch(addGroupPageRequest(versionId, groupId, newPage));
    delete newPage.groupId;
    delete newPage.versionId;
    pagesService
      .saveGroupPage(groupId, newPage)
      .then(response => {
        dispatch(onGroupPageAdded(response.data));
        history.push(`/dashboard/pages/${response.data.id}/edit`);
      })
      .catch(error => {
        dispatch(
          onGroupPageAddedError(
            error.response ? error.response.data : error,
            newPage
          )
        );
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

export const onGroupPageAdded = response => {
  return {
    type: pagesActionTypes.ON_GROUP_PAGE_ADDED,
    response
  };
};

export const onGroupPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_GROUP_PAGE_ADDED_ERROR,
    newPage,
    error
  };
};

export const deletePage = page => {
  return dispatch => {
    dispatch(deletePageRequest(page));
    pagesService
      .deletePage(page.id)
      .then(() => {
        dispatch(onPageDeleted());
      })
      .catch(error => {
        dispatch(onPageDeletedError(error.response, page));
      });
  };
};

export const deletePageRequest = page => {
  return {
    type: pagesActionTypes.DELETE_PAGE_REQUEST,
    page
  };
};

export const onPageDeleted = () => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED
  };
};

export const onPageDeletedError = (error, page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED_ERROR,
    error,
    page
  };
};

export const duplicatePage = page => {
  return dispatch => {
    pagesService
      .duplicatePage(page.id)
      .then(response => {
        dispatch(onPageDuplicated(response.data));
      })
      .catch(error => {
        dispatch(onPageDuplicatedError(error.response, page));
      });
  };
};

export const onPageDuplicated = response => {
  return {
    type: pagesActionTypes.ON_PAGE_DUPLICATED,
    response
  };
};

export const onPageDuplicatedError = (error, page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DUPLICATED_ERROR,
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
