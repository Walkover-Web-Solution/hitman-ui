import indexedDbService from '../../indexedDb/indexedDbService'
import historyActionTypes from './historyActionTypes'

export const fetchHistoryFromIdb = () => {
  return async (dispatch) => {
    indexedDbService.getAllData('history').then((response) => {
      dispatch(onHistoryDataFetched(response))
    })
      .catch(error => {
        console.error(error)
        // dispatch(onHistoryDataFetchError(
        //   error.response ? error.response.data : error
        // ))
      })
  }
}

export const addHistory = (historyData) => {
  return (dispatch) => {
    dispatch(onHistoryAdded(historyData))
    indexedDbService.addData('history', historyData, historyData.id).then(response => {
    })
      .catch(error => {
        console.error(error)
        // dispatch(onHistoryAddedError(
        //   error.response ? error.response.data : error
        // ))
      })
  }
}

export const onHistoryDataFetched = (data) => {
  return {
    type: historyActionTypes.FETCH_HISTORY_FROM_IDB,
    data
  }
}

export const onHistoryAdded = (data) => {
  return {
    type: historyActionTypes.ADD_HISTORY,
    data
  }
}
