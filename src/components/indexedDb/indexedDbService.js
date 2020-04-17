import { openDB } from "idb";
let db = null;
const stores = [
  { name: "environment" },
  { name: "tabs", options: { keyPath: "id", autoIncrement: true } },
];

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
      stores.map((store) => db.createObjectStore(store.name, store.options));
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
  const value = await store.put(val, key);
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
};
