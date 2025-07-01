// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API } from "@/lib/axios";

export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar?: string;
  role: string;
  is_verified: boolean;
  is_deleted: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// ===== ASYNC ACTION: fetch user from /me =====
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/me");
      if (res.status === 200 && res.data.user) {
        return res.data.user as User;
      }
      return rejectWithValue("User not found");
    } catch (err) {
      return rejectWithValue("Failed to fetch user");
    }
  }
);

// ===== ASYNC ACTION: logout =====
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await API.post("/logout");
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Dùng nếu login trả về user trực tiếp (bạn có thể thêm nếu cần)
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
