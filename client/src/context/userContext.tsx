import React,{ createContext, useState } from 'react';
import type {user} from "@/types/index"

interface userContextType{
    user : user | null;
    setUser : React.Dispatch<React.SetStateAction<user | null>>;
    isResumeAvailable: boolean;
    setIsResumeAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultUserContext: userContextType = {
    user: null,
    setUser: () => {},
    isResumeAvailable: false,
    setIsResumeAvailable: () => {},
};


export const UserContext = createContext<userContextType>(defaultUserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<user | null>(null);
    const [isResumeAvailable, setIsResumeAvailable] = React.useState<boolean>(false);

    return (
        <UserContext.Provider value={{ user, setUser , isResumeAvailable , setIsResumeAvailable }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
