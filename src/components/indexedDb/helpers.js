import moment from 'moment'
import idbService from './indexedDbService'

// window.addEventListener('online', () => { console.log('online!'); });
// window.addEventListener('offline', () => { console.log('offline!'); });

export const willFetch = async (timestamp) => {
  /** if arg timestamp is a a falsy value then use IDB
   * else get meta_data org_id and see if it is a flasy value or less than the timestamp received then fetch
   * or return false otherwise
   */
  const IDBUpdatedAt = await idbService.getValue('meta_data', 'updated_at')
  console.log('IDBUpdatedAt', IDBUpdatedAt)
  if (!moment(IDBUpdatedAt).isValid) {
    return true
  }
  if (
    moment(timestamp).isValid &&
    moment(IDBUpdatedAt).isValid &&
    moment(timestamp).diff(moment(IDBUpdatedAt))
  ) {
    return true
  }
  return false
}
