import { ADD_USER_DATA, ADD_NEW_USER } from "./userReducer";

export const addUserData = (userData) => ({
    type: ADD_USER_DATA,
    data: userData,
});

export const addNewUserData = (newUserData) => ({
    type: ADD_NEW_USER,
    data: newUserData
});