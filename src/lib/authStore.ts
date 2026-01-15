// In-memory user store
export type UserRole = "regular_user" | "ca" | "admin";

interface User {
  name: string;
  company: string;
  email: string;
  password: string;
  roles: UserRole[];
}

interface AuthStore {
  users: User[];
  currentUser: User | null;
  activeRole: UserRole | null;
}

const authStore: AuthStore = {
  users: [
    {
      name: "Admin",
      company: "Numor",
      email: "admin@numor.com",
      password: "admin",
      roles: ["admin"],
    },
  ],
  currentUser: null,
  activeRole: null,
};

export const registerUser = (user: Omit<User, 'roles'> & { roles?: UserRole[] }): { success: boolean; error?: string } => {
  const existingUser = authStore.users.find((u) => u.email === user.email);
  const requestedRoles = user.roles || ["regular_user"];
  
  if (existingUser) {
    // If user exists and trying to register as CA, add "ca" role if not already present
    if (requestedRoles.includes("ca") && !existingUser.roles.includes("ca")) {
      existingUser.roles.push("ca");
      return { success: true };
    }
    return { success: false, error: "User with this email already exists" };
  }
  
  authStore.users.push({
    ...user,
    roles: requestedRoles,
  });
  return { success: true };
};

export const loginUser = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
  const user = authStore.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  authStore.currentUser = user;
  // Set active role: prefer "ca" if available, otherwise "regular_user"
  authStore.activeRole = user.roles.includes("ca") ? "ca" : "regular_user";
  return { success: true, user };
};

export const logoutUser = (): void => {
  authStore.currentUser = null;
  authStore.activeRole = null;
};

export const getCurrentUser = (): User | null => {
  return authStore.currentUser;
};

export const getActiveRole = (): UserRole | null => {
  return authStore.activeRole;
};

export const setActiveRole = (role: UserRole): void => {
  if (authStore.currentUser?.roles.includes(role)) {
    authStore.activeRole = role;
  }
};

export const hasRole = (role: UserRole): boolean => {
  return authStore.currentUser?.roles.includes(role) ?? false;
};
