const initialState = {};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_USER_DATA':
            return {
                ...state, // preserving other state properties
                users: action.data, // updating only the users property
            };
        default:
            return state; // return the current state if action type doesn't match
    }
};

export default userReducer;