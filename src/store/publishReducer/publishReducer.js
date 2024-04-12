import publishReducerActionTypes from './publishReducerActionTypes'

const initialState = {
  public: {}
}

const publishReducer = (state = initialState, action) => {
  switch (action.type) {

    case publishReducerActionTypes.ADD_PUBLIC_ENVIRONMENTS:
      return {...state.public,...action?.data};

      case publishReducerActionTypes.UPDATE_PUBLIC_ENVIRONMENTS:
        const { environmentId, variableName, currentValue } = action.payload;
        const newState = JSON.parse(JSON.stringify(state));
      
        if (newState?.environments?.[environmentId] && newState?.environments?.[environmentId]?.variables?.[variableName]) {
          newState.environments[environmentId].variables[variableName].currentValue = currentValue;
        }
        return newState;

    default:
      return state
  }
}

export default publishReducer
