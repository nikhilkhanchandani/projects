import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

function Logout() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['jwt']);

  React.useEffect(() => {
    const verifyUser = async () => {
      if (!cookies.jwt) {
        navigate('/login');
        return;
      }

      removeCookie('jwt');
      localStorage.removeItem('userInfo');
      navigate('/login');
    };
    verifyUser();
  }, [navigate, removeCookie, cookies]);
  return null;
}

export default Logout;
