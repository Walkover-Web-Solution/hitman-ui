import sidebarActionTypes from './sidebarActionTypes'

import collectionsActionTypes from '../../../collections/redux/collectionsActionTypes'
import collectionVersionsActionTypes from '../../../collectionVersions/redux/collectionVersionsActionTypes'
import groupsActionTypes from '../../../groups/redux/groupsActionTypes'
import pagesActionTypes from '../../../pages/redux/pagesActionTypes'
import endpointsActionTypes from '../../../endpoints/redux/endpointsActionTypes'

import * as _ from 'lodash'
import publicEndpointsActionTypes from '../../../publicEndpoint/redux/publicEndpointsActionTypes'
import { compareAlphabetically } from '../../../common/utility'

class TreeNode {
  constructor ({ id, type, parentNode }) {
    this.id = id
    this.type = type
    this.isLoaded = false
    this.isTemp = true

    this.focused = false
    this.expanded = false
    this.isExpandable = !!((type === 'collections' || type === 'pages' || type === 'versions'))
   
    this.parentNode = parentNode
    this.child = []
    
  }
}

const initialState = {
  focused: false,
  firstChild: null,
  lastChild: null,
  navList: {},
  focusedNode: null
}

function sidebarReducer (state = initialState, action) {
  try {
    let newState = _.cloneDeep(state)
    let sortedCollectionIds = []
    switch (action.type) {
      /** Handle Public Entities */
      case publicEndpointsActionTypes.ON_PUBLIC_ENDPOINTS_FETCHED:
        newState = addChildNodes(newState, action.data)
        return newState

      /** Handle Collection Actions */
      case collectionsActionTypes.ON_COLLECTIONS_FETCHED:
        sortedCollectionIds = Object.keys(action.collections).sort((a, b) => compareAlphabetically(a, b, action.collections))
        sortedCollectionIds.forEach((collectionId, index) => {
          newState = addNewNodeReq(newState, action.collections[collectionId], 'collections')
        })
        return newState

      case collectionsActionTypes.ADD_COLLECTION_REQUEST:
        newState = addNewNodeReq(newState, { ...action.newCollection, id: action.newCollection.requestId }, 'collections')
        return newState

      case collectionsActionTypes.ON_COLLECTION_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'collections')
        return newState

      case collectionsActionTypes.ON_COLLECTION_ADDED_ERROR:
        newState = addNewNodeError(newState, action.newCollection.requestId, 'collections')
        return newState

      case collectionsActionTypes.DELETE_COLLECTION_REQUEST:
        newState = removeNodeReq(newState, action.collection.id, 'collections')
        return newState

      case collectionsActionTypes.ON_COLLECTION_DELETED:
        newState = removeNodeSuccess(newState, action.payload.collection.id, 'collections')
        newState = removeChildNodes(newState, action.payload)
        return newState

      case collectionsActionTypes.ON_COLLECTION_DELETED_ERROR:
        if (action.error.status === 404) newState = removeNodeSuccess(newState, action.payload.id, 'collections')
        else newState = removeNodeError(newState, action.collection.id, 'collections')
        return newState

      case collectionsActionTypes.ON_COLLECTION_DUPLICATED:
        newState = addNewNodeReq(newState, action.response.collection, 'collections')
        newState = addChildNodes(newState, action.response)
        return newState

      case collectionsActionTypes.ON_COLLECTION_DUPLICATED_ERROR:
        return state

      case collectionsActionTypes.IMPORT_COLLECTION_REQUEST:
        newState = addNewNodeReq(newState, action.collection, 'collections')
        return newState

      case collectionsActionTypes.ON_COLLECTION_IMPORTED:
        newState = addChildNodes(newState, action.response)
        return newState

      case collectionsActionTypes.ON_COLLECTION_IMPORTED_ERROR:
        newState = addNewNodeError(newState, action.collection.id, 'collections')
        return newState

      /** Handle Version Actions */
      case collectionVersionsActionTypes.ON_VERSIONS_FETCHED:
        Object.values(action.versions).forEach(version => {
          newState = addNewNodeReq(newState, version, 'versions')
        })
        return newState

      case collectionVersionsActionTypes.ADD_VERSION_REQUEST:
        newState = addNewNodeReq(newState, { ...action.newVersion, id: action.newVersion.requestId }, 'versions')
        return newState

      case collectionVersionsActionTypes.ON_VERSION_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'versions')
        return newState

      case collectionVersionsActionTypes.ON_VERSION_ADDED_ERROR:
        newState = addNewNodeError(newState, action.newVersion.requestId, 'versions')
        return newState

      case collectionVersionsActionTypes.DELETE_VERSION_REQUEST:
        newState = removeNodeReq(newState, action.versionId, 'versions')
        return newState

      case collectionVersionsActionTypes.ON_VERSION_DELETED:
        newState = removeNodeSuccess(newState, action.payload.version.id, 'versions')
        newState = removeChildNodes(newState, action.payload)
        return newState

      case collectionVersionsActionTypes.ON_VERSION_DELETED_ERROR:
        if (action.error.status === 404) newState = removeNodeSuccess(newState, action.version.id, 'versions')
        else newState = removeNodeError(newState, action.version.id, 'versions')
        return newState

      case collectionVersionsActionTypes.ON_VERSION_DUPLICATED:
      case collectionVersionsActionTypes.IMPORT_VERSION: // this action is called when importing a collection as wel. So adding a check for it here.
        if (!_.isEmpty(action.response.collection)) newState = addNewNodeReq(newState, action.response.collection, 'collections')
        newState = addNewNodeReq(newState, action.response.version, 'versions')
        newState = addChildNodes(newState, action.response)
        return newState

      /** Handle Group Actions */
      case groupsActionTypes.ON_GROUPS_FETCHED:
        Object.values(action.groups).forEach(group => {
          newState = addNewNodeReq(newState, group, 'groups')
        })
        return newState
      case groupsActionTypes.ADD_GROUP_REQUEST:
        newState = addNewNodeReq(newState, {
          ...action.newGroup,
          id: action.newGroup.requestId
        }, 'groups')
        return newState

      case groupsActionTypes.ON_GROUP_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'groups')
        return newState

      case groupsActionTypes.ON_GROUP_ADDED_ERROR:
        newState = addNewNodeError(newState, action.newGroup.requestId, 'groups')
        return newState

      case groupsActionTypes.DELETE_GROUP_REQUEST:
        newState = removeNodeReq(newState, action.group.id, 'groups')
        return newState

      case groupsActionTypes.ON_GROUP_DELETED:
        newState = removeNodeSuccess(newState, action.payload.group.id, 'groups')
        newState = removeChildNodes(newState, action.payload)
        return newState

      case groupsActionTypes.ON_GROUP_DELETED_ERROR:
        if (action.error.status === 404) newState = removeNodeSuccess(newState, action.group.id, 'groups')
        else newState = removeNodeError(newState, action.group.id, 'groups')
        return newState

      case groupsActionTypes.ON_GROUP_DUPLICATED:
        newState = addNewNodeReq(newState, action.response.group, 'groups')
        newState = addChildNodes(newState, { pages: action.response.pages, endpoints: action.response.endpoints })
        return newState

      /** Handle Page Actions */
      case pagesActionTypes.ON_PAGES_FETCHED:
        Object.values(action.pages).forEach(page => {
          newState = addNewNodeReq(newState, page, 'pages')
        })
        return newState

      case pagesActionTypes.ADD_PAGE_REQUEST:
        case pagesActionTypes.ADD_PARENT_PAGE_REQUEST:
        newState = addNewNodeReq(newState, { ...action.newPage, id: action.newPage.requestId }, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_ADDED:
      case pagesActionTypes.ON_PARENT_PAGE_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'pages')
        return newState


      case pagesActionTypes.ADD_GROUP_PAGE_REQUEST:
        newState = addNewNodeReq(newState, { ...action.newPage, id: action.newPage.requestId }, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_ADDED:
      case pagesActionTypes.ON_GROUP_PAGE_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_ADDED_ERROR:
      case pagesActionTypes.ON_GROUP_PAGE_ADDED_ERROR:
        newState = addNewNodeError(newState, action.newPage.requestId, 'pages')
        return newState

      case pagesActionTypes.DELETE_PAGE_REQUEST:
        newState = removeNodeReq(newState, action.page.id, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_DELETED:
        newState = removeNodeSuccess(newState, action.page.id, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_DELETED_ERROR:
        if (action.error.status === 404) newState = removeNodeSuccess(newState, action.page.id, 'pages')
        else newState = removeNodeError(newState, action.page.id, 'pages')
        return newState

      case pagesActionTypes.ON_PAGE_DUPLICATED:
        newState = addNewNodeReq(newState, action.response, 'pages')
        return newState

      /** Handle Endpoint Actions */
      case endpointsActionTypes.ON_ENDPOINTS_FETCHED:
        Object.values(action.endpoints).forEach(endpoint => {
          newState = addNewNodeReq(newState, endpoint, 'endpoints')
        })
        return newState

      case endpointsActionTypes.ADD_ENDPOINT_REQUEST:
        newState = addNewNodeReq(newState, { ...action.newEndpoint, id: action.newEndpoint.requestId }, 'endpoints')
        return newState

      case endpointsActionTypes.ON_ENDPOINT_ADDED:
        newState = addNewNodeSuccess(newState, action.response.requestId, action.response.id, 'endpoints')
        return newState

      case endpointsActionTypes.ON_ENDPOINT_ADDED_ERROR:
        newState = addNewNodeError(newState, action.requestId, 'endpoints')
        return newState

      case endpointsActionTypes.DELETE_ENDPOINT_REQUEST:
        newState = removeNodeReq(newState, action.endpoint.id, 'endpoints')
        return newState

      case endpointsActionTypes.ON_ENDPOINT_DELETED:
        newState = removeNodeSuccess(newState, action.endpoint.id, 'endpoints')
        return newState

      case endpointsActionTypes.ON_ENDPOINT_DELETED_ERROR:
        if (action.error.status === 404) newState = removeNodeSuccess(newState, action.endpoint.id, 'endpoints')
        else newState = removeNodeError(newState, action.endpoint.id, 'endpoints')
        return newState

      case endpointsActionTypes.ON_ENDPOINT_DUPLICATED:
        newState = addNewNodeReq(newState, action.response, 'endpoints')
        return newState

      /** Handle Navigation Actions */
      case sidebarActionTypes.FOCUS_SIDEBAR:
        newState.focused = true
        return newState

      case sidebarActionTypes.DEFOCUS_SIDEBAR:
        newState.focused = false
        return newState

      case sidebarActionTypes.FOCUS_ITEM:
        newState = focusNode(newState, action.payload)
        return newState

      case sidebarActionTypes.FOCUS_PREVIOUS_ITEM:
        newState = focusPrevItem(newState)
        return newState

      case sidebarActionTypes.FOCUS_NEXT_ITEM:
        newState = focusNextItem(newState)
        return newState

      case sidebarActionTypes.EXPAND_ITEM:
        newState = expandItem(action.payload ? action.payload : newState.focusedNode, newState)
        return newState

      case sidebarActionTypes.COLLAPSE_ITEM:
        newState = collapseItem(action.payload ? action.payload : newState.focusedNode, newState)
        return newState

      default: return state
    }
  } catch (err) {
    console.log(err)
    return state
  }
}

/**
 * Focuses a node at given nodeAddress and removes focus from current focused node if it exists.
 * @param {any} newState Deep copied state of sidebar store.
 * @param {string} nodeAddress Address of node in the map to focus.
 * @returns Modified State
 */
function focusNode (newState, nodeAddress) {
  if (!_.isEmpty(newState.navList[newState.focusedNode])) newState.navList[newState.focusedNode].focused = false

  if (!_.isEmpty(newState.navList[nodeAddress])) {
    newState.navList[nodeAddress].focused = true
    newState.focusedNode = nodeAddress
  } else {
    newState.focusedNode = null
  }

  return newState
}

/**
 * Adds Child Nodes of Parent Entity
 * @param {any} newState Deep copied state of sidebar store.
 * @param {any} payload Object containing map of child Entity objects with any of keys: collections, versions, groups, endpoints, pages,.
 * @returns Modified State
 */
function addChildNodes (newState, payload) {
  if (!_.isEmpty(payload.collections)) {
    _.values(payload.collections).forEach(collection => {
      newState = addNewNodeReq(newState, collection, 'collections')
    })
  }
  // if (!_.isEmpty(payload.rootPage)) {
  //   _.values(payload.rootPage).forEach(page => {
  //     newState = addNewNodeReq(newState, page, 'rootPage')
  //   })
  // }
  if (!_.isEmpty(payload.versions)) {
    _.values(payload.versions).forEach(version => {
      newState = addNewNodeReq(newState, version, 'versions')
    })
  }
  if (!_.isEmpty(payload.pages)) {
    _.values(payload.pages).forEach(page => {
      newState = addNewNodeReq(newState, page, 'pages')
    })
  }
  if (!_.isEmpty(payload.endpoints)) {
    _.values(payload.endpoints).forEach(endpoint => {
      newState = addNewNodeReq(newState, endpoint, 'endpoints')
    })
  }
  return newState
}

/**
 * Removes Child Nodes of Parent Entity
 * @param {any} newState Deep copied state of sidebar store.
 * @param {any} payload Object containing child Ids with any of keys: collectionIds, versionIds, groupIds, endpointIds, pageIds,.
 * @returns Modified State
 */
function removeChildNodes (newState, payload) {
  if (!_.isEmpty(payload.collectionIds)) {
    payload.collectionIds.forEach(collectionId => {
      newState = removeNodeSuccess(newState, collectionId, 'collections')
    })
  }
  // if (!_.isEmpty(payload.rootParentId)) {
  //   payload.rootParentIds.forEach(rootParentId => {
  //     newState = removeNodeSuccess(newState, rootParentId, 'rootPage')
  //   })
  // }
  if (!_.isEmpty(payload.versionIds)) {
    payload.versionIds.forEach(versionId => {
      newState = removeNodeSuccess(newState, versionId, 'versions')
    })
  }
  if (!_.isEmpty(payload.endpointIds)) {
    payload.endpointIds.forEach(endpointId => {
      newState = removeNodeSuccess(newState, endpointId, 'endpoints')
    })
  }
  if (!_.isEmpty(payload.pageIds)) {
    payload.pageIds.forEach(pageId => {
      newState = removeNodeSuccess(newState, pageId, 'pages')
    })
  }
  return newState
}

/**
 * Adds a New Node To NavList Map and creates its Link with parent & sibling nodes.
 * @param {any} newState Deep copied state of sidebar store.
 * @param {any} newEntity can be any of page, endpoint, group, version, collection object.
 * @param {string} type can be any of 'collections','versions','groups','pages','endpoints'.
 * @returns Modified state
 */
function addNewNodeReq (newState, newEntity, type) {
  console.log(newEntity)
  if (!newEntity.id) {
    // Handle the case where the entity ID is undefined
    return newState;
  }
  const newNodeAddress = `${type}_${newEntity.id}`
  let parentNode = null; 
  if (_.isEmpty(newState.navList[newNodeAddress])) {
    newState = addTempNode(newState, newEntity.id, type)
  }

  if (!newState.navList[newNodeAddress].isTemp) {
    return newState
  }

  switch (type) {                 
    case 'collections':
      // if (newEntity.rootParentId) {
        // if (!newState.navList[newNodeAddress].child) {
        //   newState.navList[newNodeAddress].child = [];
        // }
        newState.navList[newNodeAddress].child.push(`pages_${newEntity.rootParentId}`);
      // }
      break

      case 'pages':
        parentNode = `collections_${newEntity.id}`
        if (_.isEmpty(newState.navList[parentNode])) newState = addTempNode(newState, newEntity.id, 'collections')
  
        newState.navList[newNodeAddress].parentNode = parentNode
        newState.navList[parentNode].child.push(newNodeAddress)
        break

    // case 'pages':

    //   parentNode = `rootPage_${newEntity.pageId}`
    //   if (_.isEmpty(newState.navList[parentNode])) newState = addTempNode(newState, newEntity.pageId, 'rootPage')

    //   newState.navList[newNodeAddress].parentNode = parentNode

    //   if (newState.navList[parentNode].lastChild) {
    //     prevSibling = newState.navList[parentNode].lastChild
    //     newState.navList[newNodeAddress].prevSibling = prevSibling
    //     newState.navList[prevSibling].nextSibling = newNodeAddress
    //   } else {
    //     newState.navList[parentNode].firstChild = newNodeAddress
    //   }
    //   newState.navList[parentNode].lastChild = newNodeAddress
    //   break

    case 'versions':
      parentNode =  `pages_${newEntity.id}`
      if (_.isEmpty(newState.navList[parentNode])) newState = addTempNode(newState, newEntity.id, 'pages')

      newState.navList[newNodeAddress].parentNode = parentNode
      newState.navList[parentNode].child.push(newNodeAddress)
      break

    // case 'endpoints':
    //   parentNode = newEntity.rootParentId ? `pages_${newEntity.rootParentId}` : `versions_${newEntity.versionId}`
    //   if (_.isEmpty(newState.navList[parentNode])) { newState = addTempNode(newState, newEntity.rootParentId ? newEntity.rootParentId : newEntity.versionId, newEntity.rootParentId ? 'pages' : 'versions') }
    //   newState.navList[newNodeAddress].parentNode = parentNode

    //   if (newState.navList[parentNode].lastChild) {
    //     prevSibling = newState.navList[parentNode].lastChild
    //     newState.navList[newNodeAddress].prevSibling = prevSibling
    //     newState.navList[prevSibling].nextSibling = newNodeAddress
    //   } else {
    //     newState.navList[parentNode].firstChild = newNodeAddress
    //   }
    //   newState.navList[parentNode].lastChild = newNodeAddress
    //   break

    default: break
  }
  newState.navList[newNodeAddress].isTemp = false
  return newState
}

/**
 * Adds a temporary Node to List: A node with parent and sibling links as null. Useful in creating a temporary parent node before creating child nodes.
 * @param {any} newState Deep copied state of sidebar store.
 * @param {string} id Entity Id
 * @param {string} type Type of Entity, can be any of 'collections','versions','groups','pages','endpoints'.
 * @returns Modified state
 */
function addTempNode (newState, id, type) {
  const nodeAddress = `${type}_${id}`
  newState.navList[nodeAddress] = new TreeNode({ id: id, type, parentNode: null })
  return newState
}

/**
 * Used in optimistic approach to replace the key of previously made node with the new id received from API if everything succeeds.
 * @param {*} newState Deep copied state of sidebar store.
 * @param {string} requestId Entity Id used to create the node in first place
 * @param {string} id New entity Id received from the API
 * @param {*} type Type of Entity, can be any of 'collections','versions','groups','pages','endpoints'.
 * @returns Modified state
 */
// function addNewNodeSuccess (newState, requestId, id, type) {
//   const reqNodeAddress = `${type}_${requestId}`
//   const nodeAddress = `${type}_${id}`
 
//   const { prevSibling: prevSiblingAdress, nextSibling: nextSiblingAddress, parentNode: parentNodeAddress } = newState.navList[reqNodeAddress]
//   const parentNode = parentNodeAddress ? newState.navList[parentNodeAddress] : newState
//   const prevSiblingNode = prevSiblingAdress ? newState.navList[prevSiblingAdress] : null
//   const nextSiblingNode = nextSiblingAddress ? newState.navList[nextSiblingAddress] : null

//   if (parentNode.firstChild === reqNodeAddress) {
//     parentNode.firstChild = nodeAddress
//   }

//   if (parentNode.lastChild === reqNodeAddress) {
//     parentNode.lastChild = nodeAddress
//   }

//   if (prevSiblingNode && prevSiblingNode.nextSibling === reqNodeAddress) {
//   prevSiblingNode.nextSibling = nodeAddress
//   }

//   if (nextSiblingNode && nextSiblingNode.prevSibling === reqNodeAddress) {
//   nextSiblingNode.prevSibling = nodeAddress
//   }

//   newState.navList[nodeAddress] = newState.navList[reqNodeAddress]
//   newState.navList[nodeAddress].id = id

//   delete newState.navList[reqNodeAddress]
//   return newState
// }
function addNewNodeSuccess (newState, requestId, id, type) {
  const reqNodeAddress = `${type}_${requestId}`
  const nodeAddress = `${type}_${id}`
 
  const parentNode = newState.navList[reqNodeAddress].parentNode
  if (parentNode) {
    const parent = newState.navList[parentNode]
    if (!parent.child) {
      parent.child = []
    }
    const index = parent.child.indexOf(reqNodeAddress)
    if (index !== -1) {
      parent.child.splice(index, 1, nodeAddress)
    } else {
      parent.child.push(nodeAddress)
    }
  }

  newState.navList[nodeAddress] = { ...newState.navList[reqNodeAddress], id }
  delete newState.navList[reqNodeAddress]
  return newState
}
/**
 *
 * @param {any} newState Deep copied state of sidebar store.
 * @param {string} requestId Id to be be removed if error occured
 * @param {string} type Type of Entity, can be any of 'collections','versions','groups','pages','endpoints'.
 * @returns Modified state
 */
function addNewNodeError (newState, requestId, type) {
  const reqNodeAddress = `${type}_${requestId}`
  newState = removeNodeReq(newState, requestId, type)
  delete newState.navList[reqNodeAddress]
  return newState
}

/**
 * Unlink Node (or) Remove Links to Parent and Sibling Nodes.
 * @param {any} newState
 * @param {string} requestId uniques id of entity
 * @param {string} type can be any of ['collections','versions','groups','pages','endpoints']
 * @returns Modified state
 */
function removeNodeReq (newState, requestId, type) {
  const nodeAddress = `${type}_${requestId}`
  const nodeToRemove = newState.navList[nodeAddress]
  const parentNode = nodeToRemove.parentNode ? newState.navList[nodeToRemove.parentNode] : newState
  if (parentNode) {
    if (parentNode.firstChild === parentNode.lastChild) {
      parentNode.firstChild = null
      parentNode.lastChild = null
      newState = focusNode(newState, nodeToRemove.parentNode ? nodeToRemove.parentNode : null)
    } else if (nodeAddress === parentNode.firstChild) {
      parentNode.firstChild = nodeToRemove.nextSibling
      newState.navList[nodeToRemove.nextSibling].prevSibling = nodeToRemove.prevSibling
      newState = focusNode(newState, nodeToRemove.nextSibling)
    } else if (nodeAddress === parentNode.lastChild) {
      parentNode.lastChild = nodeToRemove.prevSibling
      newState.navList[nodeToRemove.prevSibling].nextSibling = nodeToRemove.nextSibling
      newState = focusNode(newState, nodeToRemove.prevSibling)
    } else {
      newState.navList[nodeToRemove.prevSibling].nextSibling = nodeToRemove.nextSibling
      newState.navList[nodeToRemove.nextSibling].prevSibling = nodeToRemove.prevSibling
      newState = focusNode(newState, nodeToRemove.nextSibling)
    }
  }
  return newState
}

/**
 * Deletes Unlinked Node from NavList
 * @param {any} newState
 * @param {string} id uniques id of entity
 * @param {string} type can be any of ['collections','versions','groups','pages','endpoints']
 * @returns Modified state
 */
function removeNodeSuccess (newState, id, type) {
  const nodeAddress = `${type}_${id}`
  delete newState.navList[nodeAddress]
  return newState
}

/**
 * Restores Parent and Sibling Links of Unlinked Node from NavList Map.
 * @param {any} newState
 * @param {string} id uniques id of entity
 * @param {string} type can be any of ['collections','versions','groups','pages','endpoints']
 * @returns Modified state
 */
function removeNodeError (newState, id, type) {
  const nodeAddress = `${type}_${id}`
  const nodeRemoved = newState.navList[nodeAddress]
  const parentNode = nodeRemoved.parentNode ? newState.navList[nodeRemoved.parentNode] : newState

  if (nodeRemoved.prevSibling === nodeRemoved.nextSibling) {
    // it was the only child of its parent
    parentNode.firstChild = nodeAddress
    parentNode.lastChild = nodeAddress
  } else if (nodeRemoved.prevSibling === null) {
    // it was the first child
    newState.navList[parentNode.firstChild].prevSibling = nodeAddress
    parentNode.firstChild = nodeAddress
  } else if (nodeRemoved.nextSibling === null) {
    // it was the last child
    newState.navList[parentNode.lastChild].nextSibling = nodeAddress
    parentNode.lastChild = nodeAddress
  } else {
    // it was middle child
    newState.navList[nodeRemoved.prevSibling].nextSibling = nodeAddress
    newState.navList[nodeRemoved.nextSibling].prevSibling = nodeAddress
  }
  return newState
}

/**
 * Focuses previous Node in the NavList.
 * @param {any} newState Deep copied state of sidebar.
 * @returns Modified state
 */
// function focusPrevItem (newState) {
//   if (!newState.focusedNode) {
//     if (newState.lastChild) {
//       newState.focusedNode = newState.lastChild
//       newState.navList[newState.lastChild].focused = true
//     }
//   } else {
//     const { parentNode, prevSibling } = newState.navList[newState.focusedNode]
//     newState.navList[newState.focusedNode].focused = false
//     const prevSiblingNode = newState.navList[prevSibling]
//     if (prevSiblingNode) {
//       if (prevSiblingNode.isExpandable && prevSiblingNode.expanded) {
//         const siblingsLastChild = findPrevSiblingsLastChild(newState)
//         if (siblingsLastChild) {
//           newState.navList[siblingsLastChild].focused = true
//           newState.focusedNode = siblingsLastChild
//         } else {
//           newState.navList[prevSibling].focused = true
//           newState.focusedNode = prevSibling
//         }
//       } else {
//         newState.navList[prevSibling].focused = true
//         newState.focusedNode = prevSibling
//       }
//     } else {
//       if (parentNode) {
//         newState.navList[parentNode].focused = true
//         newState.focusedNode = parentNode
//       } else {
//         newState.navList[newState.focusedNode].focused = true
//       }
//     }
//   }
//   return newState
// }
function focusPrevItem (newState) {
  if (!newState.focusedNode) {
    if (newState.child && newState.child.length > 0) {
      newState.focusedNode = newState.child[newState.child.length - 1]
      newState.navList[newState.child[newState.child.length - 1]].focused = true
    }
  } else {
    const { parentNode, prevSibling } = newState.navList[newState.focusedNode]
    newState.navList[newState.focusedNode].focused = false
    if (prevSibling) {
      newState.navList[prevSibling].focused = true
      newState.focusedNode = prevSibling
    } else if (parentNode) {
      newState.navList[parentNode].focused = true
      newState.focusedNode = parentNode
    } else {
      newState.navList[newState.focusedNode].focused = true
    }
  }
  return newState
}

function findPrevSiblingsLastChild (newState) {
  let temp = newState.navList[newState.navList[newState.focusedNode].prevSibling]
  while (temp.isExpandable && temp.expanded) {
    if (temp.lastChild) {
      temp = newState.navList[temp.lastChild]
    } else {
      break
    }
  }
  if (temp) {
    return `${temp.type}_${temp.id}`
  }
  return null
}

/**
 * Focuses next Node in the NavList.
 * @param {any} newState Deep copied state of sidebar.
 * @returns modified state
 */
// function focusNextItem (newState) {
//   if (!newState.focusedNode) {
//     if (newState.firstChild) {
//       newState.focusedNode = newState.firstChild
//       newState.navList[newState.firstChild].focused = true
//     }
//   } else {
//     const { firstChild, expanded, isExpandable, nextSibling } = newState.navList[newState.focusedNode]
//     newState.navList[newState.focusedNode].focused = false
//     if (isExpandable && expanded) {
//       if (firstChild) {
//         newState.navList[firstChild].focused = true
//         newState.focusedNode = firstChild
//       } else {
//         if (nextSibling) {
//           newState.navList[nextSibling].focused = true
//           newState.focusedNode = nextSibling
//         } else {
//           const parentsNextSibling = findParentWithNextSibling(newState)
//           if (parentsNextSibling) {
//             newState.navList[parentsNextSibling].focused = true
//             newState.focusedNode = parentsNextSibling
//           } else {
//             newState.navList[newState.focusedNode].focused = true
//           }
//         }
//       }
//     } else {
//       if (nextSibling) {
//         newState.navList[nextSibling].focused = true
//         newState.focusedNode = nextSibling
//       } else {
//         const parentsNextSibling = findParentWithNextSibling(newState)
//         if (parentsNextSibling) {
//           newState.navList[parentsNextSibling].focused = true
//           newState.focusedNode = parentsNextSibling
//         } else {
//           newState.navList[newState.focusedNode].focused = true
//         }
//       }
//     }
//   }
//   return newState
// }
function focusNextItem (newState) {
  if (!newState.focusedNode) {
    if (newState.child && newState.child.length > 0) {
      newState.focusedNode = newState.child[0]
      newState.navList[newState.child[0]].focused = true
    }
  } else {
    const { firstChild, isExpandable, expanded, parentNode } = newState.navList[newState.focusedNode]
    newState.navList[newState.focusedNode].focused = false
    if (isExpandable && expanded && firstChild) {
      newState.navList[firstChild].focused = true
      newState.focusedNode = firstChild
    } else if (parentNode) {
      newState.navList[parentNode].focused = true
      newState.focusedNode = parentNode
    } else {
      newState.navList[newState.focusedNode].focused = true
    }
  }
  return newState
}
function findParentWithNextSibling (newState) {
  let temp = newState.navList[newState.focusedNode]
  while (temp.nextSibling === null) {
    if (!temp.parentNode) break
    temp = newState.navList[temp.parentNode]
  }
  return temp.nextSibling
}

/**
 * Collapses the given node.
 * @param {string} nodeAddress Address of node in the NavList map.
 * @param {any} newState Deep copied state of sidebar
 * @returns
 */
function collapseItem (nodeAddress, newState) {
  newState.navList[nodeAddress].expanded = false
  return newState
}

/**
 * Expands the given node.
 * @param {string} nodeAddress Address of node in the NavList map.
 * @param {any} newState Deep copied state of sidebar
 * @returns
 */
function expandItem (nodeAddress, newState) {
  const { isExpandable } = newState.navList[nodeAddress]

  if (isExpandable) {
    newState.navList[nodeAddress].expanded = true
  }

  newState = onlyChildExpand(nodeAddress, newState)
  return newState
}

function onlyChildExpand (nodeAddress, newState) {
  const currentNode = newState.navList[newState.focusedNode];
  if (!currentNode) {
    return newState;
  }
  let { firstChild, lastChild } = currentNode;
  while (firstChild === lastChild && firstChild != null && newState.navList[firstChild]) {
    newState.navList[firstChild].expanded = true;
    firstChild = newState.navList[firstChild].firstChild;
    lastChild = newState.navList[lastChild].lastChild;
  }

  return newState;
}

export default sidebarReducer
