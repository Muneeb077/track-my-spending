import React, {useState} from "react";
import { UserContext } from "./create_context";

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    //Function to update user data
    const updateUser = (userData) => {
        setUser(userData);
    };

    //Function to clear user data (e.g., on Logout)
    const clearUser = () => {
        setUser(null);
    };

    return(
        <UserContext.Provider 
        value = {{
            user,
            updateUser,
            clearUser,
        }}>
            {children}    
        </UserContext.Provider>
    );
}

export default UserProvider;