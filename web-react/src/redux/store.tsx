import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import panelReducer from "./panel";

export default configureStore({ 
    reducer: {
        user: userReducer,
        panel: panelReducer,
    }
})