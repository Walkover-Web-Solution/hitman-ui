import sidebarV2ActionTypes from "./sidebarV2ActionTypes";

const initialState = {
    sideBarCollections: {},
    sideBarPages: {},
    isLoading: false,
};

function sidebarV2Reducer(state = initialState, action) {
    const { collections, pages } = action.payload || { collections: {}, pages: {} };

    switch (action.type) {
        case sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_ON_SIDEBAR:
            const updatedCollections = { ...state.sideBarCollections };
            const updatedPages = { ...state.sideBarPages };

            Object.keys(collections).forEach((key) => {
                updatedCollections[key] = { ...(state.sideBarCollections[key] || {}), ...collections[key] };
            });

            Object.keys(pages).forEach((key) => {
                updatedPages[key] = { ...(state.sideBarPages[key] || {}), ...pages[key] };
            });

            return { ...state, sideBarCollections: updatedCollections, sideBarPages: updatedPages };

        case sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING:
            return { ...state, isLoading: action.payload.value };

        default:
            return state;
    }
}

export default sidebarV2Reducer;