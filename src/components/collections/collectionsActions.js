// export function fetchCollections() {
//   console.log("called fetchCollections action");
//   return function(dispatch) {
//     return collectionsService
//       .getCollections()
//       .then(response => response.data)
//       .then(collections => {
//         dispatch(fetchCollectionsAction(collections));
//       });
//   };
// }

export function fetchCollections() {
  return { type: "FETCH_COLLECTIONS" };
}

// export function addCollection(newCollection) {
//   console.log("called addCollection action");
//   return function(dispatch) {
//     return collectionsService
//       .saveCollection(newCollection)
//       .then(response => response.data)
//       .then(newCollection => {
//         dispatch(addCollectionAction(newCollection));
//       });
//   };
// }

export function addCollection() {
  return { type: "ADD_COLLECTION" };
}

export function getData() {
  console.log("get data action creator called");
  return { type: "DATA_REQUESTED" };
}
