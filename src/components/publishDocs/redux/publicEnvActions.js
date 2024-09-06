import { CREATE_NEW_PUBLIC_ENVIRONMENT, DELETE_SELECTED_INDEX, DELETE_ENTIRE_PUBLIC_ENV } from './publicEnvActionTypes';

export const createNewPublicEnvironment = (collectionId, data) => {
  return {
    type: CREATE_NEW_PUBLIC_ENVIRONMENT,
    payload: { collectionId, data }
  };
};

export const deletePublicEnv = (Id, variable) => {
  return {
    type: DELETE_SELECTED_INDEX,
    payload: { collectionId: Id, variable },
  };
};

export const deleteEntirePublicEnv = async (collectionId) => {
  return {
    type: DELETE_ENTIRE_PUBLIC_ENV,
    payload: {
      collectionId
    },
  }
}

