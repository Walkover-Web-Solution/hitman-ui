import WebSocketClient from 'rtlayer-client'
import { store } from '../../store/store'
import { addChildInParent, onPageUpdated, onParentPageAdded, updateDragDrop } from '../../components/pages/redux/pagesActions'
import {
  deleteCollectionRequest,
  onCollectionAdded,
  onCollectionImported,
  onCollectionUpdated
} from '../../components/collections/redux/collectionsActions'
import bulkPublishActionTypes from '../../components/publishSidebar/redux/bulkPublishActionTypes'
import { SESSION_STORAGE_KEY, deleteAllPagesAndTabsAndReactQueryData, operationsAfterDeletion } from '../../components/common/utility'
import { formatResponseToSend } from '../../components/endpoints/redux/endpointsActions'
import pagesActionTypes from '../../components/pages/redux/pagesActionTypes'
import { onEndpointStateSuccess } from '../../components/publicEndpoint/redux/publicEndpointsActions'
import { onParentPageVersionAdded } from '../../components/collectionVersions/redux/collectionVersionsActions'
import { onSetDefaultVersion } from '../../components/publishDocs/redux/publishDocsActions'

var CLIENT, CHANNEL

export function initConn(channel) {
  CHANNEL = channel
  CLIENT = new WebSocketClient(process.env.REACT_APP_RTLAYER_OID, process.env.REACT_APP_RTLAYER_SID)
  if (CHANNEL) {
    CLIENT.on('open', subscribe)
    CLIENT.on('message', handleMessage)
  }
}

export function resetConn(channel) {
  CLIENT.unsubscribe(channel || CHANNEL)
}

const subscribe = () => {
  CLIENT.subscribe(CHANNEL)
}

const OperationTypes = {
  COLLECTION_CREATE: 'collection-create',
  COLLECTION_UPDATE: 'collection-update',
  COLLECTION_DELETE: 'collection-delete',
  COLLECTION_IMPORT: 'collection-import',
  PARENTPAGE_CREATE: 'parentpage-create',
  PAGE_CREATE: 'page-create',
  PAGE_UPDATE: 'page-update',
  PAGE_DELETE: 'page-delete',
  ENDPOINT_CREATE: 'endpoint-create',
  ENDPOINT_UPDATE: 'endpoint-update',
  ENDPOINT_DELETE: 'endpoint-delete',
  VERSION_CREATE: 'version-create',
  VERSION_DEFAULT: 'version-default',
  DRAG_AND_DROP: 'drag-and-drop',
  PUBLISH_PAGE_OR_ENDPOINT: 'publish_page_or_endpoint',
  UNPUBLISH_PAGE_OR_ENDPOINT: 'unpublish_page_or_endpoint'

}

const handleDeleteActions = (data) => {
  store.dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_UPDATION_PAGES, data: data.pages })
  store.dispatch({ type: bulkPublishActionTypes.ON_BULK_PUBLISH_TABS, data: data.tabs })
  operationsAfterDeletion(data)
}

const handleMessage = (message) => {
  message = JSON.parse(message)

  // api already updated the redux state don't update it again
  if (message?.uniqueTabId == sessionStorage.getItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID)) return

  switch (message.operation) {
    case OperationTypes.COLLECTION_CREATE:
      store.dispatch(onCollectionAdded(message.data))
      const inivisiblePageData = {
        page: {
          id: message.data.rootParentId,
          type: 0,
          child: [],
          collectionId: message.data.id
        }
      }
      store.dispatch(onParentPageAdded(inivisiblePageData))
      break

    case OperationTypes.COLLECTION_UPDATE:
      store.dispatch(onCollectionUpdated(message.data))
      break

    case OperationTypes.COLLECTION_DELETE:
      const rootParentPageId = message.data.rootParentId
      deleteAllPagesAndTabsAndReactQueryData(rootParentPageId).then((data) => {
        store.dispatch(deleteCollectionRequest(message.data))
        handleDeleteActions(data)
      })
      break

    case OperationTypes.COLLECTION_IMPORT:
      store.dispatch(onCollectionImported(message.data))
      break

    case OperationTypes.PARENTPAGE_CREATE:
      store.dispatch(onParentPageAdded(message.data))
      break

    case OperationTypes.PAGE_CREATE:
      store.dispatch(onParentPageAdded({ page: message.data }))
      break

    case OperationTypes.PAGE_UPDATE:
      store.dispatch(onPageUpdated(message.data))
      break

    case OperationTypes.PAGE_DELETE:
      deleteAllPagesAndTabsAndReactQueryData(message.data.id).then((data) => {
        handleDeleteActions(data)
      })
      break

    case OperationTypes.VERSION_CREATE:
      store.dispatch(onParentPageVersionAdded(message.data))
      break

    case OperationTypes.VERSION_DEFAULT:
      store.dispatch(onSetDefaultVersion(message.data))
      break

    case OperationTypes.ENDPOINT_CREATE:
      const responseToSend = formatResponseToSend(message)
      store.dispatch(addChildInParent(responseToSend))
      break

    case OperationTypes.ENDPOINT_UPDATE:
      store.dispatch(onPageUpdated(message.data))
      break

    case OperationTypes.ENDPOINT_DELETE:
      deleteAllPagesAndTabsAndReactQueryData(message.data.endpoint.id).then((data) => {
        handleDeleteActions(data)
      })
      break

      case OperationTypes.PUBLISH_PAGE_OR_ENDPOINT:
        store.dispatch(onEndpointStateSuccess({ state: message.data.state, id: message.data.id, isPublished: message.data.isPublished }))
        break

      case OperationTypes.UNPUBLISH_PAGE_OR_ENDPOINT:
        store.dispatch(onEndpointStateSuccess({ state: message.data.state, id: message.data.id, isPublished: message.data.isPublished }))
        break

    case OperationTypes.DRAG_AND_DROP:
      store.dispatch({
        type: pagesActionTypes.ON_DRAG_DROP,
        payload: message.data
      })
      break

    default:
    // code block
  }
}
