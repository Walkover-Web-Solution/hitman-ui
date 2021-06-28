import { createHashHistory, createBrowserHistory } from 'history'
import { isElectron } from './components/common/utility'
const history = isElectron() ? createHashHistory() : createBrowserHistory()
export default history
