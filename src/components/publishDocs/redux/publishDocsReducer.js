import { statesEnum } from '../../common/utility'
import publishDocsActionTypes from './publishDocsActionTypes'
import _ from 'lodash'
const initialState = {}
// import statesEnum from 
function publishDocsReducer(state = initialState, action) {
  let feedbacks = {}
  switch (action.type) {
    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED:
      feedbacks = { ..._.groupBy(action.feedbacks, 'collectionId') }
      return feedbacks

    case publishDocsActionTypes.ON_FEEDBACKS_FETCHED_ERROR:
      return state

    case publishDocsActionTypes.ON_DEFAULT_VERSION:
      console.log(action, "action inside on default versionn");
      // console.log(pages[action.versionData.newVersionId], "rashii");
      const pages = action?.pages
      console.log(pages, "pagees");
      pages[action?.versionData?.newVersionId].state = 1
      //1=  default 0 =  not default
      pages[action.versionData?.oldVersionId].state = 0
      return pages

    default:
      return state
  }
}

export default publishDocsReducer
