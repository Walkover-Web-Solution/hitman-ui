import collectionsService from "../collections/collectionsService";

export function fetchCollections() {
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

export function updateCollection(editedCollection) {
  return function(dispatch) {
    return collectionsService
      .updateCollection(editedCollection.id, {
        name: editedCollection.name,
        website: editedCollection.website,
        description: editedCollection.description,
        keyword: editedCollection.keyword
      })
      .then(response => response.data)
      .then(editedCollection => {
        dispatch(updateCollectionAction(editedCollection));
      });
  };
}

export function updateCollectionAction(editedCollection) {
  return { type: "EDIT_COLLECTION", editedCollection };
}
