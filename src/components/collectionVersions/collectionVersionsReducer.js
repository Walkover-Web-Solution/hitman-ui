const initialState = {
    loading: false,
    versions: {},
    error: ""
};

function versionsReducer(state = initialState, action) {
    switch (action.type) {
        case "FETCH_VERSIONS_REQUEST":
            return {
                ...state,
                loading: true
            };
        case "FETCH_VERSIONS_SUCCESS":
            return {
                loading: false,
                versions: action.payload,
                error: ""
            };
        case "FETCH_VERSIONS_FAILURE":
            return {
                loading: false,
                versions: {},
                error: action.payload
            };

        default:
            return state;
    }
}

export default versionsReducer;