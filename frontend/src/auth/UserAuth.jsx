import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'

const UserAuth = ({ children }) => {
    const { user, loading: userLoading } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setLoading(false);
        }

        if (!token) {
            navigate('/login');
        }

        if (!user && !userLoading && !token) {
            navigate('/login');
        }
    }, [user, token, userLoading, navigate]);

    if (loading && userLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserAuth;