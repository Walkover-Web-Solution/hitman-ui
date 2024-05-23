export const ADD_USER_DATA = 'ADD_USER_DATA';
export const ADD_NEW_USER = 'ADD_NEW_USER';

const initialState = [];

const userReducer = (state = initialState, action) => {
    // if (action.type == ADD_NEW_USER) debugger
    switch (action.type) {
        case ADD_USER_DATA:
            return action.data
        case ADD_NEW_USER:
            return [ ...state, action.data];
        default:
            return state; // Return the current state if action type doesn't match
    }
};

export default userReducer;
