import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";

import { apiCallBegan, apiCallSuccess, apiCallFailed } from "./actions";

const baseURL = "https://bayut.p.rapidapi.com";
const headers = {
  "x-rapidapi-host": "bayut.p.rapidapi.com",
  "x-rapidapi-key": "ad776fefb1msh48853a5ce849503p192853jsn62e392df1729",
};

function* handleApiCallBegan(action) {
  const { url, urls, method, data, onStart, onSuccess, onError } =
    action.payload;

  if (onStart) yield put({ type: onStart });
  let result;
  try {
    if (url?.length < 50) {
      const propertyDetails = yield call(axios.request, {
        baseURL,
        url,
        method,
        data,
        headers,
      });
      result = propertyDetails.data;
    } else if (url?.length > 50) {
      const properties = yield call(axios.request, {
        baseURL,
        url,
        method,
        data,
        headers,
      });
      result = { properties: properties.data?.hits };
    } else {
      const propertyForSale = yield call(axios.request, {
        baseURL,
        url: urls[0],
        method,
        data,
        headers,
      });
      const propertyForRent = yield call(axios.request, {
        baseURL,
        url: urls[1],
        method,
        data,
        headers,
      });

      result = {
        propertiesForSale: propertyForSale.data?.hits,
        propertiesForRent: propertyForRent.data?.hits,
      };
    }
    yield put(apiCallSuccess(result));
    if (onSuccess) yield put({ type: onSuccess, payload: result });
  } catch (error) {
    yield put(apiCallFailed(error.message));
    if (onError) yield put({ type: onError, payload: error.message });
  }
}

function* rootSaga() {
  yield takeLatest(apiCallBegan.type, handleApiCallBegan);
}

export default rootSaga;
