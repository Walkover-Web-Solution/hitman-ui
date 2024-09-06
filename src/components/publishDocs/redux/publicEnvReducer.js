
import { CREATE_NEW_PUBLIC_ENVIRONMENT, DELETE_SELECTED_INDEX, DELETE_ENTIRE_PUBLIC_ENV } from './publicEnvActionTypes';

const initialState = { publicEnv: {} };
const createNewPublicEnvReducer = (state = initialState, action) => {

  switch (action.type) {
    case CREATE_NEW_PUBLIC_ENVIRONMENT:
      const { collectionId, data } = action.payload;
      return {
        ...state,
        [collectionId]: {
          ...(state[collectionId] || {}),
          ...data
        }
      };

    case DELETE_ENTIRE_PUBLIC_ENV: {
      const { collectionId } = action.payload;

      if (state[collectionId]) {
        const newState = { ...state };
        delete newState[collectionId];
        return newState;
      }
      return state;
    }


    case DELETE_SELECTED_INDEX: {
      const { collectionId, variable } = action.payload;

      if (state[collectionId] && state[collectionId][variable]) {
        const updatedCollection = { ...state[collectionId] };
        delete updatedCollection[variable];

        return {
          ...state,
          [collectionId]: updatedCollection
        };
      }
    }
    default:
      return state;
  }
};


export default createNewPublicEnvReducer; 
