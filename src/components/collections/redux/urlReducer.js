export const ON_URL_SETTING = 'ON_URL_SETTING';
export const ON_UPDATING_URL = 'ON_UPDATING_URL';

const initialState =[]
const urlMappingReducer = (state = initialState, action) => {
    switch (action.type) {
      case ON_URL_SETTING:
        return {
          ...state,
          latestUrl: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default urlMappingReducer;