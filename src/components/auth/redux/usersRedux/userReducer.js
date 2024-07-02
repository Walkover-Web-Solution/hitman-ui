export const ADD_USER_DATA = 'ADD_USER_DATA';
export const ADD_NEW_USER = 'ADD_NEW_USER';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

const initialState = {
  usersList: [],
  currentUser: {}
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_DATA:
            return { ...state, usersList: action.data };
        case ADD_NEW_USER:
                return { ...state, usersList: [...state.usersList, ...action.data] };
        case SET_CURRENT_USER:
            return { ...state, currentUser: action.data };
        default:
            return state;
    }
};

export default userReducer;
