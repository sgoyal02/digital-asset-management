import { createContext } from "react";
import { AuthContextType } from "../utils/types";

export const AuthContext = createContext<AuthContextType | null>(null);