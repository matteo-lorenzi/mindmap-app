import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import mindmapSlice from "./slices/mindmapSlice";
import uiSlice from "./slices/uiSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    mindmap: mindmapSlice,
    ui: uiSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: true, // Simplified for now
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
