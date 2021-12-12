import { combineReducers } from "redux";
import homesReducer from "./ducks/homes";

export default combineReducers({
  homes: homesReducer,
});
