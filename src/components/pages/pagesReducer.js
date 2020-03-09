import pagesActionTypes from "./pagesActionTypes";
import { toast } from "react-toastify";

const initialState = {
    pages: {}
};

function pagesReducer(state = initialState, action) {
    let pages = {};
    let editPage = {};

    switch (action.type) {
        case pagesActionTypes.FETCH_PAGES_SUCCESS:
            return {...action.pages };

        case pagesActionTypes.FETCH_PAGES_FAILURE:
            toast.error(action.error);
            return state;

        case pagesActionTypes.ADD_PAGE_REQUEST:
            action.newPage.groupId = null;
            action.newPage.versionId = action.versionId;
            return {
                ...state,
                [action.newPage.requestId]: action.newPage
            };
        case pagesActionTypes.ADD_PAGE_SUCCESS:
            pages = {...state };
            delete pages[action.response.requestId];
            delete action.response.requestId;
            pages[action.response.id] = action.response;
            return pages;

        case pagesActionTypes.ADD_PAGE_FAILURE:
            toast.error(action.error);
            pages = {...state };
            delete pages[action.newPage.requestId];
            return pages;

        case pagesActionTypes.ADD_GROUP_PAGE_REQUEST:
            action.newPage.groupId = null;
            action.newPage.versionId = action.versionId;
            return {
                ...state,
                [action.newPage.requestId]: action.newPage
            };
        case pagesActionTypes.ADD_GROUP_PAGE_SUCCESS:
            pages = {...state };
            delete pages[action.response.requestId];
            delete action.response.requestId;
            pages[action.response.id] = action.response;
            return pages;

        case pagesActionTypes.ADD_GROUP_PAGE_FAILURE:
            toast.error(action.error);
            pages = {...state };
            delete pages[action.newPage.requestId];
            return pages;

        case pagesActionTypes.UPDATE_PAGE_REQUEST:
            return {
                ...state,
                [action.editedPage.id]: action.editedPage
            };
        case pagesActionTypes.UPDATE_PAGE_SUCCESS:
            return state;

        case pagesActionTypes.UPDATE_PAGE_FAILURE:
            toast.error(action.error);
            return {
                ...state,
                [action.originalPage.id]: action.originalPage
            };

        case pagesActionTypes.DELETE_PAGE_REQUEST:
            pages = {...state };
            delete pages[action.page.id];
            return pages;

        case pagesActionTypes.DELETE_PAGE_SUCCESS:
            return state;

        case pagesActionTypes.DELETE_PAGE_FAILURE:
            toast.error(action.error.data);
            if (action.error.status === 404) return state;
            return {
                ...state,
                [action.page.id]: action.page
            };

        default:
            return state;
    }
}

export default pagesReducer;