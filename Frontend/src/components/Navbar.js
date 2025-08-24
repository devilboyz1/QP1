import React from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for animated burger menu
const BurgerContainer = styled(Box)(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  cursor: 'pointer',
}));

const BurgerLine = styled('div')(({ theme, isopen }) => ({
  width: '100%',
  height: '2px',
  backgroundColor: 'currentColor',
  borderRadius: '2px',
  transition: 'all 0.3s ease-in-out',
  transformOrigin: 'center',
  
  '&:nth-of-type(1)': {
    transform: isopen === 'true' ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0deg)',
  },
  
  '&:nth-of-type(2)': {
    opacity: isopen === 'true' ? 0 : 1,
    transform: isopen === 'true' ? 'translateX(20px)' : 'translateX(0)',
  },
  
  '&:nth-of-type(3)': {
    transform: isopen === 'true' ? 'rotate(-45deg) translate(7px, -6px)' : 'rotate(0deg)',
  },
}));

function Navbar({ userName, onMenuClick, sidebarOpen }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const logout = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logout successful");
        navigate('/login');
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label={sidebarOpen ? "close menu" : "open menu"}
            edge="start"
            onClick={onMenuClick}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <BurgerContainer>
              <BurgerLine isopen={sidebarOpen?.toString()} />
              <BurgerLine isopen={sidebarOpen?.toString()} />
              <BurgerLine isopen={sidebarOpen?.toString()} />
            </BurgerContainer>
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          QP1 Quotation System
        </Typography>
        {userName ? (
          <>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mr: 2,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Welcome, {userName}
            </Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
