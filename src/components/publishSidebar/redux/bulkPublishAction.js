import { toast } from 'react-toastify'
import bulkPublishActionTypes from './bulkPublishActionTypes'
import { bulkPublishSelectedData } from '../../../api/collection/collectionApi'

export const bulkPublish = (rootParentId, pageIds) => {
  return (dispatch) => {
    bulkPublishSelectedData({ rootParentId, pageIds })
      .then((response) => {
        dispatch({ type: bulkPublishActionTypes.UPDATE_PAGES_STATE_ON_BULK_PUBLISH, data: response.data.pageIds })
        toast.success('Published Successfully')
      })
      .catch((error) => {
        console.error(error)
        toast.error('Could not Update')
      })
  }
}
