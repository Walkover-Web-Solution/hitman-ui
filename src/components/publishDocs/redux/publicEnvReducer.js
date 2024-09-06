
import { CREATE_NEW_PUBLIC_ENVIRONMENT, DELETE_SELECTED_INDEX, DELETE_ENTIRE_PUBLIC_ENV } from './publicEnvActionTypes';

const initialState = {  publicEnv: {}};
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

      // case DELETE_ENTIRE_PUBLIC_ENV:
      //   const { collectionId: deleteCollectionId } = action.payload;
  
      //   const { [deleteCollectionId]: removed, ...remainingPublicEnv } = state.publicEnv;
  
      //   return {
      //     ...state,
      //     publicEnv: remainingPublicEnv, 
      //   };

    case DELETE_SELECTED_INDEX:
      const { Id, index } = action.payload;
      const updatedEnv = { ...state.publicEnv[Id] };

      if (!state[collectionId]) {
        console.error(`Collection ID ${collectionId} not found in state.`);
        return state; 
    }

    return {
        ...state,
        [collectionId]: {
            ...state[collectionId],
            variables: state[collectionId].variables.filter((_, i) => i !== index), // Remove the environment at the specified index
        },
    };
    default:
      return state;
  }
};


export default createNewPublicEnvReducer; 
