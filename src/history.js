import { createHashHistory } from 'history'
import { isElectron } from './components/common/utility'
import { useNavigate } from 'react-router-dom'

const navigate = isElectron() ? createHashHistory() : useNavigate()
export default navigate
