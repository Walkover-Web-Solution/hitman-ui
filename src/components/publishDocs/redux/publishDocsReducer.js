import { toast } from 'react-toastify'
import { store } from '../../../store/store'
import pagesActionTypes from '../../pages/redux/pagesActionTypes'
import publishDocsActionTypes from './publishDocsActionTypes'
import _ from 'lodash'
const initialState = {}

function publishDocsReducer(state = initialState, action) {
  let feedbacks = {}
  switch (action.type) {
    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED:
      feedbacks = { ..._.groupBy(action.feedbacks, 'collectionId') }
      return feedbacks

    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED_ERROR:
      return state

    case publishDocsActionTypes.ON_DEFAULT_VERSION:
      toast.success("Updated Successfully")
      const newData = action.versionData.newVersionId
      const pages = action.pages.pages
      pages[newData].state = 1
      pages[action.versionData.oldVersionId].state = 0
      return pages
    default:
      return state
  }
}

export default publishDocsReducer
