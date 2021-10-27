import store from '../../../../store/store'
import sidebarActionTypes from './sidebarActionTypes'

const toggleItem = (type, id) => {
  const { expanded, isEpandable, focused } = store.getState().sidebar.navList[`${type}_${id}`]

  if (!focused) store.dispatch({ type: sidebarActionTypes.FOCUS_ITEM, payload: `${type}_${id}` })

  if (isEpandable) {
    if (!expanded) { store.dispatch({ type: sidebarActionTypes.EXPAND_ITEM }) } else { store.dispatch({ type: sidebarActionTypes.COLLAPSE_ITEM }) }
  }
}

const sidebarActions = {
  toggleItem
}

export default sidebarActions
