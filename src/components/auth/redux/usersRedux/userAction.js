import { ADD_USER_DATA, ADD_NEW_USER, SET_CURRENT_USER } from "./userReducer";

export const addUserData = (userData) => ({
    type: ADD_USER_DATA,
    data: userData,
});

export const addNewUserData = (newUserData) => ({
    type: ADD_NEW_USER,
    data: newUserData
});
export const setCurrentUser = (currentUser) => ({
    type: SET_CURRENT_USER,
    data: currentUser
});