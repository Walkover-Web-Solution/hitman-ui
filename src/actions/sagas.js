import { takeEvery, call, put } from "redux-saga/effects";
import collectionsService from "../services/collectionsService";

export default function* watcherSaga() {
  console.log("watcher saga called");
  yield takeEvery("DATA_REQUESTED", workerSaga);
}

function* workerSaga() {
  console.log("worker saga called");
  try {
    console.log("TRY worker saga called");

    const collections = yield call(getData);
    yield put({ type: "FETCH_COLLECTIONS", collections });
  } catch (e) {
    console.log("CATCH worker saga called");

    yield put({ type: "API_ERRORED", payload: e });
  }
}

function getData() {
  return collectionsService.getCollections().then(response => response.data);
}
