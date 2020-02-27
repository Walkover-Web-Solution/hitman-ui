import { ADD_COLLECTION } from "../constants/action-types";

export function addCollection(payload) {
  return { type: ADD_COLLECTION, payload };
}
