const initialState = {
  collections: []
};

function collectionsReducer(state = initialState, action) {
  if (action.type === "FETCH_COLLECTIONS") {
    return Object.assign({}, state, {
      collections: action.collections
    });
  }
  if (action.type === "ADD_COLLECTION") {
    return Object.assign(
      {},
      {
        collections: {
          ...state.collections,
          [action.newCollection.id]: action.newCollection
        }
      }
    );
  }
  if (action.type === "EDIT_COLLECTION") {
    return Object.assign(
      {},
      {
        collections: {
          ...state.collections,
          [action.editedCollection.id]: action.editedCollection
        }
      }
    );
  }
  return state;
}

export default collectionsReducer;
