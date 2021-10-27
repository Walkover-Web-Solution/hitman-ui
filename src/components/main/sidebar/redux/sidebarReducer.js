// import sidebarActions from "./sidebarActions"
import sidebarActionTypes from './sidebarActionTypes'

import collectionsActionTypes from '../../../collections/redux/collectionsActionTypes'
import collectionVersionsActionTypes from '../../../collectionVersions/redux/collectionVersionsActionTypes'
import groupsActionTypes from '../../../groups/redux/groupsActionTypes'
import pagesActionTypes from '../../../pages/redux/pagesActionTypes'
import endpointsActionTypes from '../../../endpoints/redux/endpointsActionTypes'

import * as _ from 'lodash'
// import store from '../../../../store/store'

const initialState = {
  collections: {},
  versions: {},
  groups: {},
  navList: {},
  focusedNode: null
}

function sidebarReducer (state = initialState, action) {
  try {
    let newState = _.cloneDeep(state)
    switch (action.type) {
      case collectionsActionTypes.ON_COLLECTIONS_FETCHED:
        Object.values(action.collections).forEach((collection, index) => {
          if (index === 0) newState.focusedNode = `collections_${collection.id}`
          const prevSibling = index === 0 ? null : `collections_${Object.values(action.collections)[index - 1].id}`
          const nextSibling = index === Object.values(action.collections).length - 1 ? null : `collections_${Object.values(action.collections)[index + 1].id}`
          if (_.isEmpty(newState.collections[collection.id])) {
            newState.collections[collection.id] = { id: collection.id, children: [] }
          }
          newState.navList[`collections_${collection.id}`] = new TreeNode({
            id: collection.id,
            type: 'collections',
            parentNode: null,
            prevSibling,
            nextSibling
          })
        })
        return newState

      case collectionVersionsActionTypes.ON_VERSIONS_FETCHED:
        Object.values(action.versions).forEach(version => {
          if (_.isEmpty(newState.collections[version.collectionId])) {
            newState.collections[version.collectionId] = { id: version.collectionId, children: [] }
          }
          if (_.isEmpty(newState.versions[version.id])) {
            newState.versions[version.id] = { pages: [], groups: [] }
          }
          newState.collections[version.collectionId].children = [...newState.collections[version.collectionId].children, version.id]
        })
        return newState

      case groupsActionTypes.ON_GROUPS_FETCHED:
        Object.values(action.groups).forEach(group => {
          if (_.isEmpty(newState.versions[group.versionId])) {
            newState.versions[group.versionId] = { id: group.versionId, pages: [], groups: [] }
          }
          if (_.isEmpty(newState.groups[group.id])) {
            newState.groups[group.id] = { id: group.id, pages: [], endpoints: [] }
          }

          newState.versions[group.versionId].groups = [...newState.versions[group.versionId].groups, group.id]
        })
        return newState

      case pagesActionTypes.ON_PAGES_FETCHED:
        Object.values(action.pages).forEach(page => {
          if (page.versionId) {
            if (_.isEmpty(newState.versions[page.versionId])) {
              newState.versions[page.versionId] = { id: page.versionId, pages: [], groups: [] }
            }
            newState.versions[page.versionId].pages = [...newState.versions[page.versionId].pages, page.id]
          } else {
            if (_.isEmpty(newState.groups[page.groupId])) {
              newState.groups[page.groupId] = { id: page.groupId, pages: [], endpoints: [] }
            }
            newState.groups[page.groupId].pages = [...newState.groups[page.groupId].pages, page.id]
          }
        })
        return newState

      case endpointsActionTypes.ON_ENDPOINTS_FETCHED:
        Object.values(action.endpoints).forEach(endpoint => {
          if (_.isEmpty(newState.groups[endpoint.groupId])) {
            newState.groups[endpoint.groupId] = { id: endpoint.groupId, pages: [], endpoints: [] }
          }
          newState.groups[endpoint.groupId].endpoints = [...newState.groups[endpoint.groupId].endpoints, endpoint.id]
        })
        return newState

      case endpointsActionTypes.ON_ENDPOINT_ADDED:
        console.log(action)
        return state

      case sidebarActionTypes.FOCUS_ITEM:
        if (newState.focusedNode) newState.navList[newState.focusedNode].focused = false
        newState.navList[action.payload].focused = true
        newState.focusedNode = action.payload
        return newState

      case sidebarActionTypes.FOCUS_PREVIOUS_ITEM:
        newState = focusPrevItem(newState)
        return newState

      case sidebarActionTypes.FOCUS_NEXT_ITEM:
        newState = focusNextItem(newState)
        return newState

      case sidebarActionTypes.EXPAND_ITEM:
        newState = expandItem(newState.focusedNode, newState)
        return newState

      case sidebarActionTypes.COLLAPSE_ITEM:
        newState = collapseItem(newState)
        return newState

      default: return state
    }
  } catch (err) {
    console.log('MY_TEST_ERROR', err)
    return state
  }
}

function focusPrevItem (newState) {
  const { parentNode, prevSibling } = newState.navList[newState.focusedNode]
  newState.navList[newState.focusedNode].focused = false
  const prevSiblingNode = newState.navList[prevSibling]
  if (prevSiblingNode) {
    if (prevSiblingNode.isEpandable && prevSiblingNode.expanded) {
      const siblingsLastChild = findPrevSiblingsLastChild(newState)
      if (siblingsLastChild) {
        newState.navList[siblingsLastChild].focused = true
        newState.focusedNode = siblingsLastChild
      } else {
        newState.navList[prevSibling].focused = true
        newState.focusedNode = prevSibling
      }
    } else {
      newState.navList[prevSibling].focused = true
      newState.focusedNode = prevSibling
    }
  } else {
    if (parentNode) {
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
  while (temp.isEpandable && temp.expanded) {
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

function focusNextItem (newState) {
  const { firstChild, expanded, isEpandable, nextSibling } = newState.navList[newState.focusedNode]
  newState.navList[newState.focusedNode].focused = false
  if (isEpandable && expanded) {
    if (firstChild) {
      console.log({ firstChild })
      newState.navList[firstChild].focused = true
      newState.focusedNode = firstChild
    } else {
      if (nextSibling) {
        newState.navList[nextSibling].focused = true
        newState.focusedNode = nextSibling
      } else {
        const parentsNextSibling = findParentWithNextSibling(newState)
        if (parentsNextSibling) {
          newState.navList[parentsNextSibling].focused = true
          newState.focusedNode = parentsNextSibling
        } else {
          newState.navList[newState.focusedNode].focused = true
        }
      }
    }
  } else {
    if (nextSibling) {
      newState.navList[nextSibling].focused = true
      newState.focusedNode = nextSibling
    } else {
      const parentsNextSibling = findParentWithNextSibling(newState)
      if (parentsNextSibling) {
        newState.navList[parentsNextSibling].focused = true
        newState.focusedNode = parentsNextSibling
      } else {
        newState.navList[newState.focusedNode].focused = true
      }
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

function collapseItem (newState) {
  newState.navList[newState.focusedNode].expanded = false
  return newState
}

function expandItem (nodeAddress, newState) {
  const { type, id } = newState.navList[nodeAddress]
  const currentNode = newState[type][id]
  newState.navList[nodeAddress].expanded = true
  switch (type) {
    case 'collections':
      if (currentNode.children.length) {
        newState.navList[nodeAddress].firstChild = `versions_${currentNode.children[0]}`
        newState.navList[nodeAddress].lastChild = `versions_${currentNode.children[currentNode.children.length - 1]}`
        currentNode.children.forEach((version, index) => {
          const prevSibling = index === 0 ? null : `versions_${currentNode.children[index - 1]}`
          const nextSibling = index === currentNode.children.length - 1 ? null : `versions_${currentNode.children[index + 1]}`
          newState.navList[`versions_${version}`] = new TreeNode({
            id: version,
            type: 'versions',
            parentNode: nodeAddress,
            prevSibling,
            nextSibling
          })
        })
      }
      break
    case 'versions':
      if (currentNode.pages.length || currentNode.groups.length) {
        newState.navList[nodeAddress].firstChild = currentNode.pages.length ? `pages_${currentNode.pages[0]}` : currentNode.groups.length ? `groups_${currentNode.groups[0]}` : null
        currentNode.pages.forEach((page, index) => {
          const prevSibling = index === 0 ? null : `pages_${currentNode.pages[index - 1]}`
          const nextSibling = index === currentNode.pages.length - 1 ? currentNode.groups.length ? `groups_${currentNode.groups[0]}` : null : `pages_${currentNode.pages[index + 1]}`
          newState.navList[`pages_${page}`] = new TreeNode({
            id: page,
            type: 'pages',
            parentNode: nodeAddress,
            prevSibling,
            nextSibling

          })
          newState.navList[nodeAddress].lastChild = `pages_${page}`
        })
        currentNode.groups.forEach((group, index) => {
          const prevSibling = index === 0 ? currentNode.pages.length ? `pages_${currentNode.pages[currentNode.pages.length - 1]}` : null : `groups_${currentNode.groups[index - 1]}`
          const nextSibling = index === currentNode.groups.length - 1 ? null : `groups_${currentNode.groups[index + 1]}`

          newState.navList[`groups_${group}`] = new TreeNode({
            id: group,
            type: 'groups',
            parentNode: nodeAddress,
            prevSibling,
            nextSibling
          })

          newState.navList[nodeAddress].lastChild = `groups_${group}`
        })
      }
      break
    case 'groups':
      if (currentNode.pages.length || currentNode.endpoints.length) {
        newState.navList[nodeAddress].firstChild = currentNode.pages.length ? `pages_${currentNode.pages[0]}` : currentNode.endpoints.length ? `endpoints_${currentNode.endpoints[0]}` : null
        currentNode.pages.forEach((page, index) => {
          const prevSibling = index === 0 ? null : `pages_${currentNode.pages[index - 1]}`
          const nextSibling = index === currentNode.pages.length - 1 ? currentNode.groups.length ? `groups_${currentNode.groups[0]}` : null : `pages_${currentNode.pages[index + 1]}`

          newState.navList[`pages_${page}`] = new TreeNode({
            id: page,
            type: 'pages',
            parentNode: nodeAddress,
            prevSibling,
            nextSibling

          })

          newState.navList[nodeAddress].lastChild = `pages_${page}`
        })
        currentNode.endpoints.forEach((endpoint, index) => {
          const prevSibling = index === 0 ? currentNode.pages.length ? `pages_${currentNode.pages[currentNode.pages.length - 1]}` : null : `endpoints_${currentNode.endpoints[index - 1]}`
          const nextSibling = index === currentNode.endpoints.length - 1 ? null : `endpoints_${currentNode.endpoints[index + 1]}`

          newState.navList[`endpoints_${endpoint}`] = new TreeNode({
            id: endpoint,
            type: 'endpoints',
            parentNode: nodeAddress,
            prevSibling,
            nextSibling
          })

          newState.navList[nodeAddress].lastChild = `endpoints_${endpoint}`
        })
      }
      break
    default: break
  }
  return newState
}

class TreeNode {
  constructor ({ id, type, parentNode, prevSibling, nextSibling }) {
    this.id = id
    this.type = type

    this.focused = false
    this.expanded = false
    this.isEpandable = !!((type === 'collections' || type === 'versions' || type === 'groups'))

    this.nextSibling = nextSibling
    this.prevSibling = prevSibling
    this.parentNode = parentNode

    this.firstChild = null
    this.lastChild = null
  }
}

export default sidebarReducer
