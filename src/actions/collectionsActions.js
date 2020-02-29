import collectionsService from "../services/collectionsService";

export function fetchCollections() {
  console.log("called fetchCollections action");
  return function(dispatch) {
    return collectionsService
      .getCollections()
      .then(response => response.data)
      .then(collections => {
        dispatch(fetchCollectionsAction(collections));
      });
  };
}

export function fetchCollectionsAction(collections) {
  return { type: "FETCH_COLLECTIONS", collections };
}

export function addCollection(newCollection) {
  console.log("called addCollection action");
  return function(dispatch) {
    return collectionsService
      .saveCollection(newCollection)
      .then(response => response.data)
      .then(newCollection => {
        dispatch(addCollectionAction(newCollection));
      });
  };
}

export function addCollectionAction(newCollection) {
  return { type: "ADD_COLLECTION", newCollection };
}
