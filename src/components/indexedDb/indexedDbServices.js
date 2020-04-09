import { openDB, deleteDB } from "https://unpkg.com/idb?module";

(async () => {
  //...

  const dbName = "mydbname";
  const storeName = "store1";
  const version = 1; //versions start at 1

  const db = await openDB(dbName, version, {
    upgrade(db, oldVersion, newVersion, transaction) {
      const store = db.createObjectStore(storeName);
    },
  });
})();
