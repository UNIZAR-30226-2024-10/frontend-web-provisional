import React, { useState } from 'react';
import '../styles/Navbar.css';
import { useNavigate, useResolvedPath } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { responsiveFontSizes } from '@mui/material';
const apiUrl = process.env.REACT_APP_API_URL;

function Navbar ({ avatar, userInfo, updateUserInfo }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null); /* Hook para controlar si el menu es visible o no */
  //const [loggedIn, setLoggedIn] = React.useState(false); /* Hook para controlar si el usuario ha iniciado sesión o no */
  const open = Boolean(anchorEl);

  /* Abrir el menú */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  /* Cerrar el menú */
  const handleClose = () => {
    setAnchorEl(null);
  };
  /* Mostrar el perfil de usuario */
  const handleProfile = () => {
    setAnchorEl(null);
    navigate('/profile');
  }
  /* Cerrar sesión */
  const [error,setError] = useState('');
  const handleCloseSesion = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/logout` ,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      console.log(responseData.message);
    }   
    catch (error) {
      setError(error.message);
    }

    updateUserInfo({ field : "loggedIn", value : false});
    setAnchorEl(null);
  }

  const UserAvatar = () => {
    return (
      /* Avatar del usuario */
      <Avatar 
        alt="User"
        src={avatar.image}
        sx={{ bgcolor: avatar.bgcolor, width: 48, height: 48 }}
      />
    );
  }

  const MenuUser = () => {
    return (
      /* Menú desplegable al hacer click sobre la imagen del perfil*/
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{'aria-labelledby': 'basic-button' }}>
        {/* Opciones del menu desplegable */}
        <MenuItem onClick={handleProfile}>Perfil</MenuItem> 
        <MenuItem onClick={handleCloseSesion}>Cerrar Sesión</MenuItem>
      </Menu>
    );
  }
  
  return (
    <div>
      <nav className='navbar'>
        <div className='navbar-title'>
          ChessHub
        </div>
        <div>
          {userInfo.loggedIn ? ( // Aquí comprobamos si el usuario está autenticado
            <>
              <button className='navbar-user-button'
                onClick={handleClick} 
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <UserAvatar />
              </button>
              <MenuUser />
            </>
          ) : (
            // Si el usuario no está autenticado, mostramos el botón de inicio de sesión
            <a className='navbar-login-button' onClick={()=>{
              navigate('/login');
            }}>Iniciar sesión</a>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
