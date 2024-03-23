import tokenDataActionTypes from './tokenDataActionTypes'

const initialState = {
    tokenDetails: {},
    loading: false,
}

const tokenDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case tokenDataActionTypes.ADD_TOKEN:
            state.tokenDetails = { ...state.tokenDetails, [action.payload.id]: action.payload }
            return { ...state }

        case tokenDataActionTypes.DELETE_TOKEN:
            delete state.tokenDetails[action.payload.tokenId];
            return { ...state }

        case tokenDataActionTypes.REPLACE_TOKEN:
            return { ...state }

        default:
            return state
    }
}

export default tokenDataReducer