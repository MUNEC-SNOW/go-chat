import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../service/types";
import { RootState } from "./store";

interface UserState { 
    user: User
}

const initialState: UserState = {
    user: {
        username: '',
        password: '',
        uuid: '',
        email: '',
        nickname: '',
        avatar: '',
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        }
    }
})

export const { setUser } = userSlice.actions

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer