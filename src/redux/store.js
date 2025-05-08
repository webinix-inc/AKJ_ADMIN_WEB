import { configureStore, combineReducers } from "@reduxjs/toolkit";
import courseReducer from "./slices/courseSlice";
import adminReducer from "./slices/adminSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import couponReducer from "./slices/couponSlice";
import orderReducer from "./slices/orderSlice";
import userReducer from "./slices/userSlice";
import contentReducer from "./slices/contentSlice";
import liveClassReducer from "./slices/liveClassSlice";
import teacherReducer from "./slices/teacherSlice"
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";

const rootReducer = combineReducers({
  courses: courseReducer,
  admin: adminReducer,
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
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
