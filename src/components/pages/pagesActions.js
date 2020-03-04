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
export const updatePage = editedPage => {
  return dispatch => {
    const originalPage = store.getState().pages[editedPage.id];
    dispatch(updatePageRequest(editedPage));
    const id = editedPage.id;
    // delete editedPage.id;
    // delete editedPage.collectionId;
    pagesService
      .updatePage(id, editedPage)
      .then(response => {
        dispatch(updatePageSuccess(response.data));
      })
      .catch(error => {
        dispatch(updatePageFailure(error.response.data, originalPage));
      });
  };
};

export const updatePageRequest = editedVersion => {
  return {
    type: pagesActionTypes.UPDATE_PAGE_REQUEST,
    editedVersion
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

// export const addVersion = (newPage, collectionId) => {
//     return dispatch => {
//         dispatch(addVersionRequest(newPage));
//         pagesService
//             .saveCollectionVersion(collectionId, newPage)
//             .then(response => {
//                 dispatch(addVersionSuccess(response.data));
//             })
//             .catch(error => {
//                 dispatch(addVersionFailure(error.response.data, newPage));
//             });
//     };
// };

// export const addVersionRequest = newVersion => {
//     return {
//         type: pagesActionTypes.ADD_PAGE_REQUEST,
//         newVersion
//     };
// };

// export const addVersionSuccess = response => {
//     return {
//         type: pagesActionTypes.ADD_PAGE_SUCCESS,
//         response
//     };
// };

// export const addVersionFailure = (error, newVersion) => {
//     return {
//         type: pagesActionTypes.ADD_PAGE_FAILURE,
//         newVersion,
//         error
//     };
// };

// export const deleteVersion = version => {
//     return dispatch => {
//         dispatch(deleteVersionRequest(version));
//         pagesService
//             .deleteCollectionVersion(version.id)
//             .then(() => {
//                 dispatch(deleteVersionSuccess());
//             })
//             .catch(error => {
//                 dispatch(deleteVersionFailure(error.response, version));
//             });
//     };
// };

// export const deleteVersionRequest = version => {
//     return {
//         type: pagesActionTypes.DELETE_PAGE_REQUEST,
//         version
//     };
// };

// export const deleteVersionSuccess = () => {
//     return {
//         type: pagesActionTypes.DELETE_PAGE_SUCCESS
//     };
// };

// export const deleteVersionFailure = (error, version) => {
//     return {
//         type: pagesActionTypes.DELETE_PAGE_FAILURE,
//         error,
//         version
//     };
// };
