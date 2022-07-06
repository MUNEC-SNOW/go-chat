import { createSlice } from "@reduxjs/toolkit";
import { User } from "../service/types";

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        value : {} as User
    },
    reducers: {
        setUser: (state, action) => {
            state.value = action.payload;
        }
    }
})

export const { setUser } = userSlice.actions

export default userSlice.reducer