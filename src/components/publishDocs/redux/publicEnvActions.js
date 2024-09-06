import { CREATE_NEW_PUBLIC_ENVIRONMENT, DELETE_SELECTED_INDEX, DELETE_ENTIRE_PUBLIC_ENV } from './publicEnvActionTypes';

export const createNewPublicEnvironment = (collectionId, data) => {
  return {
    type: CREATE_NEW_PUBLIC_ENVIRONMENT ,
    payload: { collectionId, data }
  };
};

export const deletePublicEnv = (Id, index) => {
  return {
      type: DELETE_SELECTED_INDEX,
      payload: { Id, index },
  };
};

export const deleteEntirePublicEnv = (collectionId) => ({
  type: DELETE_ENTIRE_PUBLIC_ENV,
  payload: {
    collectionId,
  },
});

