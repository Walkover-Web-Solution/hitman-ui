import { openDB, deleteDB } from 'idb'
import { getOrgId } from '../common/utility'

let db = null

const getDataBase = async () => {
  const orgId = getOrgId()
  const dbName = orgId ? `techdoc_${orgId}` : 'techdoc_public'
  if (db) return db
  else {
    db = await createDataBase(dbName)
    return db
  }
}

const createDataBase = async (dbName) => {
  const version = 1

  db = await openDB(dbName, version, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore('endpoints')
      db.createObjectStore('fileUploadMetadata')
      const authDataStore = db.createObjectStore('authData')
      const responseDataStore = db.createObjectStore('responseData')
      authDataStore.put({}, 'currentAuthData')
      responseDataStore.put({}, 'currentResponse')
      const metaData = db.createObjectStore('meta_data')
      metaData.put(dbName.split('_')[1], 'org_id')
      metaData.put(dbName, 'db_name')
      metaData.put(null, 'updated_at')
    }
  })
  return db
}

const addData = async (storeName, val, key) => {
  if (!db) {
    await getDataBase()
  }
  const tx = db.transaction(storeName, 'readwrite')
  const store = await tx.objectStore(storeName)
  if (storeName === 'tabs') await store.put(val)
  else await store.put(val, key)
  await tx.done
}

const addMultipleData = async (storeName, valueArray) => {
  if (!db) {
    await getDataBase()
  }
  const tx = db.transaction(storeName, 'readwrite')
  for (const value of valueArray) {
    const store = await tx.objectStore(storeName)
    await store.put(value, value.id)
  }
  await tx.done
}

const getValue = async (storeName, key) => {
  if (!db) {
    await getDataBase()
  }
  const value = await db.transaction(storeName).objectStore(storeName).get(key)
  return value
}

const getAllKeys = async (storeName) => {
  if (!db) {
    await getDataBase()
  }
  const keys = await db.transaction(storeName).objectStore(storeName).getAllKeys()
  return keys
}

const getAllValues = async (storeName) => {
  if (!db) {
    await getDataBase()
  }
  const values = await db.transaction(storeName).objectStore(storeName).getAll()
  return values
}

const getAllData = async (storeName) => {
  if (!db) {
    await getDataBase()
  }
  const keys = await getAllKeys(storeName)
  const values = await getAllValues(storeName)
  const data = {}
  keys.map((key, index) => (data[key] = values[index]))
  return data
}

const updateData = async (storeName, val, key) => {
  addData(storeName, val, key)
}

const deleteData = async (storeName, key) => {
  if (!db) {
    await getDataBase()
  }
  const tx = await db.transaction(storeName, 'readwrite')
  const store = await tx.objectStore(storeName)
  await store.delete(key)
  await tx.done
}

const deleteDataByIndex = async (storeName, index) => {
  if (!db) {
    await getDataBase()
  }
  const keys = await getAllKeys(storeName)
  deleteData(storeName, keys[index])
}

const clearStore = async (storeName) => {
  if (!db) {
    await getDataBase()
  }
  const tx = await db.transaction(storeName, 'readwrite')
  const store = await tx.objectStore(storeName)
  await store.clear(storeName)
  await tx.done
}

const deleteDataBase = async (name) => {
  await deleteDB(name)
}

export default {
  createDataBase,
  getDataBase,
  addData,
  getValue,
  getAllKeys,
  getAllValues,
  getAllData,
  updateData,
  deleteData,
  deleteDataByIndex,
  clearStore,
  deleteDataBase,
  addMultipleData
}
