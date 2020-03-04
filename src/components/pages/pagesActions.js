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

export const addPage = (versionId, newPage) => {
    return dispatch => {
        dispatch(addPageRequest(versionId, newPage));
        delete newPage.groupId;
        delete newPage.versionId;
        pagesService
            .saveVersionPage(versionId, newPage)
            .then(response => {
                dispatch(addPageSuccess(response.data));
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

