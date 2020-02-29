const initialState = {
  collections: {}
};

function rootReducer(state = initialState, action) {
  console.log("called reducer");
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
  return state;
}

export default rootReducer;
