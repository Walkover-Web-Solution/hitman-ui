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
            try {
                Object.keys(collections).forEach((key) => {
                    updatedCollections[key] = { ...(state.sideBarCollections[key] || {}), ...collections[key] };
                });
                Object.keys(pages).forEach((key) => {
                    updatedPages[key] = { ...(state.sideBarPages[key] || {}), ...pages[key] };
                });
            }
            catch (error) {
                return { ...state, sideBarCollections: {}, sideBarPages: {} };
            }
            return { ...state, sideBarCollections: updatedCollections, sideBarPages: updatedPages };

        case sidebarV2ActionTypes.ADD_COLLECTIONS_AND_PAGE_LOADING:
            return { ...state, isLoading: action.payload.value };

        case sidebarV2ActionTypes.UPDATE_CLIENT_DATA_ISEXPANDED:
            const target = action.payload.target === 'sideBarPages' ? 'sideBarPages' : 'sideBarCollections';
            return {
                ...state,
                [target]: {
                    ...state[target],
                    [action.payload.id]: {
                        ...state[target][action.payload.id],
                        clientData: { isExpanded: action.payload.value }
                    }
                }
            };

        case sidebarV2ActionTypes.UPDATE_COLLECTION_IN_SIDEBAR:
            const { target1, id, updatedProperties } = action.payload;
            const updatedCollection = {
                ...state[target1][id],
                ...updatedProperties
            };
            return {
                ...state,
                [target1]: {
                    ...state[target1],
                    [id]: updatedCollection
                }
            };

        default:
            return state;
    }
}

export default sidebarV2Reducer;