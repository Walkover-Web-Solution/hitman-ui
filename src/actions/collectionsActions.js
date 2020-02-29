import { GET_COLLECTIONS } from "../constants/action-types";
import collectionsService from "../services/collectionsService";

export function addCollection() {
  console.log("called action");
  return function(dispatch) {
    return collectionsService
      .getCollections()
      .then(response => response.data)
      .then(collections => {
        dispatch({ type: GET_COLLECTIONS, collections });
      });
  };
}

export function addCollectionAction(payload) {
  return { type: GET_COLLECTIONS, payload };
}
