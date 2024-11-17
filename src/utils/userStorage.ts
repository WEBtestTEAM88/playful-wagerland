import { User } from "@/types/casino";

export const saveUser = (user: User) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const loadCurrentUser = (): User | null => {
  const savedUser = localStorage.getItem('currentUser');
  return savedUser ? JSON.parse(savedUser) : null;
};

export const loadUsers = (): User[] => {
  const savedUsers = localStorage.getItem('casinoUsers');
  return savedUsers ? JSON.parse(savedUsers) : [];
};

export const persistUsers = (users: User[]) => {
  localStorage.setItem('casinoUsers', JSON.stringify(users));
};