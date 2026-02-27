import { atomWithStorage } from "jotai/utils";
import { AuthUser } from "../types/AuthTypes";

const initUser: AuthUser | null = null;

export const authUserAtom = atomWithStorage<AuthUser | null>("auth_info", initUser);