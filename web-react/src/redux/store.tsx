import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import panelReducer from "./panel";

export const store = configureStore({ 
    reducer: {
        user: userReducer,
        panel: panelReducer,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch