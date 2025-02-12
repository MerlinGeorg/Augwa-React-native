import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [userName, setUserName] = useState(null);  // Store the username here

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken, userName, setUserName }}>
            {children}
        </AuthContext.Provider>
    );
};