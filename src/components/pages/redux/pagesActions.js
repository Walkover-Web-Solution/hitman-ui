import { toast } from "react-toastify";
import store from "../../../store/store";
import pageApiService from "../pageApiService";
import pagesActionTypes from "./pagesActionTypes";

export const fetchPages = () => {
  return (dispatch) => {
    pageApiService
      .getAllPages()
      .then((response) => {
        const pages = response.data;
        dispatch(onPagesFetched(pages));
      })
      .catch((error) => {
        dispatch(onPagesFetchedError(error.message));
      });
  };
};

export const onPagesFetched = (pages) => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED,
    pages,
  };
};

export const onPagesFetchedError = (error) => {
  return {
    type: pagesActionTypes.ON_PAGES_FETCHED_ERROR,
    error,
  };
};
export const updatePage = (history, editedPage) => {
  let newPage = { ...editedPage };
  delete newPage.id;
  delete newPage.versionId;
  delete newPage.groupId;
  return (dispatch) => {
    const originalPage = store.getState().pages[editedPage.id];
    dispatch(updatePageRequest(editedPage));
    pageApiService
      .updatePage(editedPage.id, newPage)
      .then((response) => {
        dispatch(onPageUpdated(response.data));
        history.push(`/dashboard/page/${response.data.id}`);
      })
      .catch((error) => {
        dispatch(
          onPageUpdatedError(
            error.response ? error.response.data : error,
            originalPage
          )
        );
      });
  };
};

export const updatePageRequest = (editedPage) => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedPage,
  };
};

export const onPageUpdated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED,
    response,
  };
};

export const onPageUpdatedError = (error, originalPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_UPDATED_ERROR,
    error,
    originalPage,
  };
};

export const addPage = (history, versionId, newPage) => {
  return (dispatch) => {
    dispatch(addPageRequest(versionId, newPage));
    delete newPage.groupId;
    delete newPage.versionId;
    pageApiService
      .saveVersionPage(versionId, newPage)
      .then((response) => {
        dispatch(onPageAdded(response.data));
        history.push(`/dashboard/page/${response.data.id}/edit`);
      })
      .catch((error) => {
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
    newPage,
  };
};

export const onPageAdded = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED,
    response,
  };
};

export const onPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_PAGE_ADDED_ERROR,
    newPage,
    error,
  };
};

export const addGroupPage = (history, versionId, groupId, newPage) => {
  return (dispatch) => {
    dispatch(addGroupPageRequest(versionId, groupId, newPage));
    delete newPage.groupId;
    delete newPage.versionId;
    pageApiService
      .saveGroupPage(groupId, newPage)
      .then((response) => {
        dispatch(onGroupPageAdded(response.data));
        history.push(`/dashboard/page/${response.data.id}/edit`);
      })
      .catch((error) => {
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
    newPage,
  };
};

export const onGroupPageAdded = (response) => {
  return {
    type: pagesActionTypes.ON_GROUP_PAGE_ADDED,
    response,
  };
};

export const onGroupPageAddedError = (error, newPage) => {
  return {
    type: pagesActionTypes.ON_GROUP_PAGE_ADDED_ERROR,
    newPage,
    error,
  };
};

export const deletePage = (page) => {
  return (dispatch) => {
    dispatch(deletePageRequest(page));
    pageApiService
      .deletePage(page.id)
      .then(() => {
        dispatch(onPageDeleted());
      })
      .catch((error) => {
        dispatch(onPageDeletedError(error.response, page));
      });
  };
};

export const deletePageRequest = (page) => {
  return {
    type: pagesActionTypes.DELETE_PAGE_REQUEST,
    page,
  };
};

export const onPageDeleted = () => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED,
  };
};

export const onPageDeletedError = (error, page) => {
  return {
    type: pagesActionTypes.ON_PAGE_DELETED_ERROR,
    error,
    page,
  };
};

export const duplicatePage = (page) => {
  return (dispatch) => {
    pageApiService
      .duplicatePage(page.id)
      .then((response) => {
        dispatch(onPageDuplicated(response.data));
      })
      .catch((error) => {
        toast.error(error);
      });
  };
};

export const onPageDuplicated = (response) => {
  return {
    type: pagesActionTypes.ON_PAGE_DUPLICATED,
    response,
  };
};

export const updatePageOrder = (pagesOrder) => {
  return (dispatch) => {
    const originalPages = JSON.parse(JSON.stringify(store.getState().pages));
    dispatch(updatePageOrderRequest({ ...store.getState().pages }, pagesOrder));
    pageApiService
      .updatePageOrder(pagesOrder)
      .then(() => {})
      .catch((error) => {
        dispatch(
          onPageOrderUpdatedError(
            error.response ? error.response.data : error,
            originalPages
          )
        );
      });
  };
};

export const updatePageOrderRequest = (pages, pagesOrder) => {
  for (let i = 0; i < pagesOrder.length; i++) {
    pages[pagesOrder[i]].position = i;
  }
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED,
    pages,
  };
};

export const onPageOrderUpdatedError = (error, pages) => {
  return {
    type: pagesActionTypes.ON_PAGES_ORDER_UPDATED_ERROR,
    pages,
    error,
  };
};
