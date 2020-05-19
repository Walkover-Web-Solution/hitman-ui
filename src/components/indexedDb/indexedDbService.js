import { openDB } from "idb";

let db = null;

const getDataBase = async () => {
  if (db) return db;
  else {
    db = await createDataBase();
    return db;
  }
};

const createDataBase = async () => {
  const dbName = "hitman";
  const version = 1;

  db = await openDB(dbName, version, {
    upgrade(db, oldVersion, newVersion, transaction) {
      const environmentStore = db.createObjectStore("environment");
      db.createObjectStore("tabs", {
        keyPath: "id",
        autoIncrement: true,
      });
      const tabsMetadataStore = db.createObjectStore("tabs_metadata");
      const authDataStore = db.createObjectStore("authData");
      const responseDataStore = db.createObjectStore("responseData");

      environmentStore.put(null, "currentEnvironmentId");
      tabsMetadataStore.put(null, "activeTabId");
      tabsMetadataStore.put([], "tabsOrder");
      authDataStore.put({}, "currentAuthData");
      responseDataStore.put({}, "currentResponse");
    },
  });
  return db;
};

const addData = async (storeName, val, key) => {
  if (!db) {
    await getDataBase();
  }
  const tx = db.transaction(storeName, "readwrite");
  const store = await tx.objectStore(storeName);
  await store.put(val, key);
  await tx.done;
};

const getValue = async (storeName, key) => {
  if (!db) {
    await getDataBase();
  }
  const value = await db.transaction(storeName).objectStore(storeName).get(key);
  return value;
};

const getAllKeys = async (storeName) => {
  if (!db) {
    await getDataBase();
  }
  const keys = await db
    .transaction(storeName)
    .objectStore(storeName)
    .getAllKeys();
  return keys;
};

const getAllValues = async (storeName) => {
  if (!db) {
    await getDataBase();
  }
  const values = await db
    .transaction(storeName)
    .objectStore(storeName)
    .getAll();
  return values;
};

const getAllData = async (storeName) => {
  if (!db) {
    await getDataBase();
  }
  const keys = await getAllKeys(storeName);
  const values = await getAllValues(storeName);
  let data = {};
  keys.map((key, index) => (data[key] = values[index]));
  return data;
};

const updateData = async (storeName, val, key) => {
  addData(storeName, val, key);
};

const deleteData = async (storeName, key) => {
  if (!db) {
    await getDataBase();
  }
  const tx = await db.transaction(storeName, "readwrite");
  const store = await tx.objectStore(storeName);
  await store.delete(key);
  await tx.done;
};

const deleteDataByIndex = async (storeName, index) => {
  if (!db) {
    await getDataBase();
  }
  const keys = await getAllKeys(storeName);
  deleteData(storeName, keys[index]);
};

const clearStore = async (storeName) => {
  if (!db) {
    await getDataBase();
  }
  const tx = await db.transaction(storeName, "readwrite");
  const store = await tx.objectStore(storeName);
  await store.clear(storeName);
  await tx.done;
};

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
};
