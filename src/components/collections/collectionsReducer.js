const initialState = {
  collections: []
};

function collectionsReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_COLLECTIONS":
      return Object.assign({}, state, {
        collections: action.collections
      });

    case "ADD_COLLECTIONS":
      return Object.assign(
        {},
        {
          collections: {
            ...state.collections,
            [action.newCollection.id]: action.newCollection
          }
        }
      );

    case "EDIT_COLLECTIONS":
      return Object.assign(
        {},
        {
          collections: {
            ...state.collections,
            [action.editedCollection.id]: action.editedCollection
          }
        }
      );
    default:
      return state;
  }
}

export default collectionsReducer;
