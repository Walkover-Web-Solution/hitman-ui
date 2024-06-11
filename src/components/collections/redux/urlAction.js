import { ON_URL_SETTING } from "./urlReducer";
import {ON_UPDATING_URL} from "./urlReducer";

export const setLatestUrl = (url) => ({
    type: ON_URL_SETTING,
    payload: url,
  });

export const updateLatestUrl = (url) => ({
  type: ON_UPDATING_URL,
  payload: url,
})