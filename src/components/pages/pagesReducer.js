import pagesActionTypes from "./pagesActionTypes";
import { toast } from "react-toastify";

const initialState = {
    pages: {}
};

function pagesReducer(state = initialState, action) {
    let pages = {};

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

        default:
            return state;
    }
}

export default pagesReducer;