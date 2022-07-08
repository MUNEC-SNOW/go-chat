import { createSlice } from "@reduxjs/toolkit";
import { User } from "../service/types";

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user : {} as User
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        }
    }
})

export const { setUser } = userSlice.actions

export default userSlice.reducer