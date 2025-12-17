import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import persistStore from "redux-persist/es/persistStore";
import storage from "redux-persist/lib/storage";
import adminReducer from "./slices/adminSlice";
import contentReducer from "./slices/contentSlice";
import couponReducer from "./slices/couponSlice";
import courseReducer from "./slices/courseSlice";
import liveClassReducer from "./slices/liveClassSlice";
import orderReducer from "./slices/orderSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import teacherReducer from "./slices/teacherSlice";
import userReducer from "./slices/userSlice";

// Configure admin reducer separately to exclude loading and error from persistence
const adminPersistConfig = {
  key: "admin",
  storage,
  blacklist: ["loading", "error"], // Don't persist loading and error states
};

const persistedAdminReducer = persistReducer(adminPersistConfig, adminReducer);

const rootReducer = combineReducers({
  courses: courseReducer,
  admin: persistedAdminReducer, // Use persisted admin reducer
  subscription: subscriptionReducer,
  liveClasses: liveClassReducer,
  coupons: couponReducer,
  user: userReducer,
  order: orderReducer,
  content: contentReducer,
  teacher: teacherReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  migrate: (state) => {
    // Ensure content slice has proper structure during migration
    if (state && state.content) {
      if (!state.content.folders || typeof state.content.folders !== 'object') {
        state.content.folders = {};
      }
      if (!state.content.loadingByFolder || typeof state.content.loadingByFolder !== 'object') {
        state.content.loadingByFolder = {};
      }
      if (!state.content.operationLoading || typeof state.content.operationLoading !== 'object') {
        state.content.operationLoading = {};
      }
    }
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
