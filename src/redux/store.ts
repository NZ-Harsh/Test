import {thunk} from "redux-thunk";
import { persistStore } from "redux-persist";
import {
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
  Middleware,
  compose,
} from "redux";
import TreeDataReducer from "./reducers/TreedataReducer";

// Combine reducers
const appReducer = combineReducers({
TreeDataReducer
});

// Logger middleware
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('DevReduxState Dispatching action:', action);
  const result = next(action);
  console.log('DevReduxState Updated state:', store.getState());
  return result;
};

// Middleware array
const middleware = [thunk, loggerMiddleware];

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistedReducer = appReducer; 

// Create Redux store
export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

// Create persistor
export const persistor = persistStore(store);

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
