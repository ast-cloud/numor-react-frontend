// In-memory user store
interface User {
  name: string;
  company: string;
  email: string;
  password: string;
}

interface AuthStore {
  users: User[];
  currentUser: User | null;
}

const authStore: AuthStore = {
  users: [],
  currentUser: null,
};

export const registerUser = (user: User): { success: boolean; error?: string } => {
  const existingUser = authStore.users.find((u) => u.email === user.email);
  if (existingUser) {
    return { success: false, error: "User with this email already exists" };
  }
  authStore.users.push(user);
  return { success: true };
};

export const loginUser = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
  const user = authStore.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  authStore.currentUser = user;
  return { success: true, user };
};

export const logoutUser = (): void => {
  authStore.currentUser = null;
};

export const getCurrentUser = (): User | null => {
  return authStore.currentUser;
};
