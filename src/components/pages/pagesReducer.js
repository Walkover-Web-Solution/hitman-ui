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

        default:
            return state;
    }
}

export default pagesReducer;