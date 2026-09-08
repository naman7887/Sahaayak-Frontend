import api from "./api";

export const userService = {
  getProfile: async () => {
    return await api.get("/users/profile");
  },

  updateProfile: async (profileData) => {
    return await api.patch("/users/profile", profileData);
  },
};

export default userService;
