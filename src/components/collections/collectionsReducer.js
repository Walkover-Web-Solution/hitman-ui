const initialState = {
  loading: false,
  collections: {},
  error: ""
};

function collectionsReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_COLLECTIONS_REQUEST":
      return {
        ...state,
        loading: true
      };
    case "FETCH_COLLECTIONS_SUCCESS":
      return {
        loading: false,
        collections: action.payload,
        error: ""
      };
    case "FETCH_COLLECTIONS_FAILURE":
      return {
        loading: false,
        collections: {},
        error: action.payload
      };

    case "ADD_COLLECTION_REQUEST":
      return {
        ...state,
        loading: true
      };
    case "ADD_COLLECTION_SUCCESS":
      return {
        loading: false,
        collections: {
          ...state.collections,
          [action.payload.id]: action.payload
        },
        error: ""
      };

    case "ADD_COLLECTION_FAILURE":
      return {
        loading: false,
        collections: { ...state.collections },
        error: action.payload
      };

    case "UPDATE_COLLECTION_REQUEST":
      return {
        ...state,
        loading: true
      };
    case "UPDATE_COLLECTION_SUCCESS":
      return {
        loading: false,
        collections: {
          ...state.collections,
          [action.payload.id]: action.payload
        },
        error: ""
      };
    case "UPDATE_COLLECTION_FAILURE":
      return {
        loading: false,
        collections: { ...state.collections },
        error: action.payload
      };

    default:
      return state;
  }
}

export default collectionsReducer;
