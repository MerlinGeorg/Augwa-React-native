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
    const [domain, setDomain] = useState(null);

    return (
        <AuthContext.Provider value={{ authToken, setAuthToken, userName, setUserName, domain, setDomain }}>
            {children}
        </AuthContext.Provider>
    );
};