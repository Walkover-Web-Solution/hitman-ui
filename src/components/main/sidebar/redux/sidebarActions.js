import store from '../../../../store/store'
import { removePublicCollection, deleteCollection, duplicateCollection } from '../../../collections/redux/collectionsActions'
import { deleteVersion, duplicateVersion } from '../../../collectionVersions/redux/collectionVersionsActions'
import { deleteEndpoint, duplicateEndpoint } from '../../../endpoints/redux/endpointsActions'
import { deleteGroup, duplicateGroup } from '../../../groups/redux/groupsActions'
import { deletePage, duplicatePage } from '../../../pages/redux/pagesActions'
import sidebarActionTypes from './sidebarActionTypes'
import * as _ from 'lodash'

const toggleItem = (type, id) => {
  const itemNode = store.getState().sidebar.navList[`${type}_${id}`]
  if (!_.isEmpty(itemNode)) {
    const { expanded, isExpandable, focused } = store.getState().sidebar.navList[`${type}_${id}`]

    if (!focused) store.dispatch({ type: sidebarActionTypes.FOCUS_ITEM, payload: `${type}_${id}` })

    if (isExpandable) {
      if (!expanded) { store.dispatch({ type: sidebarActionTypes.EXPAND_ITEM }) } else { store.dispatch({ type: sidebarActionTypes.COLLAPSE_ITEM }) }
    }
  }
}

const expandItem = (type, id) => {
  const itemNode = store.getState().sidebar.navList[`${type}_${id}`]
  if (!_.isEmpty(itemNode)) {
    const { expanded, isExpandable } = itemNode
    if (isExpandable && !expanded) store.dispatch({ type: sidebarActionTypes.EXPAND_ITEM, payload: `${type}_${id}` })
  }
}

const collapseItem = (type, id) => {
  const itemNode = store.getState().sidebar.navList[`${type}_${id}`]
  if (!_.isEmpty(itemNode)) {
    const { expanded, isExpandable } = itemNode
    if (isExpandable && expanded) store.dispatch({ type: sidebarActionTypes.COLLAPSE_ITEM, payload: `${type}_${id}` })
  }
}

const duplicateEntity = (nodeAddress) => {
  const { collections, versions, groups, pages, endpoints, sidebar } = store.getState()
  const { id, type } = sidebar.navList[nodeAddress]
  switch (type) {
    case 'collections':
      if (!collections[id].importedFromMarketPlace) {
        store.dispatch(duplicateCollection(collections[id]))
      }
      break
    case 'versions': store.dispatch(duplicateVersion(versions[id])); break
    case 'groups': store.dispatch(duplicateGroup(groups[id])); break
    case 'pages': store.dispatch(duplicatePage(pages[id])); break
    case 'endpoints': store.dispatch(duplicateEndpoint(endpoints[id])); break
    default: break
  }
}

const deleteEntity = (nodeAddress, props) => {
  const { collections, versions, groups, pages, endpoints, sidebar } = store.getState()
  const { id, type } = sidebar.navList[nodeAddress]
  switch (type) {
    case 'collections': collections[id].importedFromMarketPlace ? store.dispatch(removePublicCollection(collections[id], props)) : store.dispatch(deleteCollection(collections[id], props)); break
    case 'versions': store.dispatch(deleteVersion(versions[id], props)); break
    case 'groups': store.dispatch(deleteGroup(groups[id], props)); break
    case 'pages': store.dispatch(deletePage(pages[id], props)); break
    case 'endpoints': store.dispatch(deleteEndpoint(endpoints[id], props)); break
    default: break
  }
}

const focusSidebar = () => {
  const { sidebar } = store.getState()
  !sidebar.focused && store.dispatch({
    type: sidebarActionTypes.FOCUS_SIDEBAR
  })
}

const defocusSidebar = () => {
  const { sidebar } = store.getState()
  sidebar.focused && store.dispatch({
    type: sidebarActionTypes.DEFOCUS_SIDEBAR
  })
}

const sidebarActions = {
  toggleItem,
  expandItem,
  collapseItem,
  duplicateEntity,
  deleteEntity,
  focusSidebar,
  defocusSidebar
}

export default sidebarActions
