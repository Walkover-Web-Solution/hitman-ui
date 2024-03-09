import { createHashHistory, createBrowserHistory } from 'history'
import { isElectron } from './components/common/utility'
const history = isElectron() ? createHashHistory() : null
export default history
