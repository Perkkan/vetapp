import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Chip,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Pets,
  Event,
  History,
  People,
  Inventory,
  ExitToApp,
  Receipt as ReceiptIcon,
  AccountCircle,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NotificacionesPopup from './NotificacionesPopup';

const drawerWidth = 240;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentClinica, logout, isAdmin, isSuperAdmin, resetClinica } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleResetClinica = () => {
    resetClinica();
    handleMenuClose();
    navigate('/clinicas');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Pacientes', icon: <Pets />, path: '/pacientes' },
    { text: 'Citas', icon: <Event />, path: '/citas' },
    { text: 'Historiales', icon: <History />, path: '/historiales' },
    { text: 'Veterinarios', icon: <People />, path: '/veterinarios' },
    { text: 'Inventario', icon: <Inventory />, path: '/inventario' },
    { text: 'Propietarios', icon: <People />, path: '/propietarios' }
  ];

  // Solo añadimos la opción de clínicas si el usuario es superadmin
  if (isSuperAdmin) {
    menuItems.push({ text: 'Clínicas', icon: <BusinessIcon />, path: '/clinicas' });
  }

  // Añadimos la opción de facturación solo si el usuario es administrador
  if (isAdmin || isSuperAdmin) {
    menuItems.push({ text: 'Facturación', icon: <ReceiptIcon />, path: '/facturacion' });
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          VetAdmin
        </Typography>
      </Toolbar>
      <Divider />
      
      {isSuperAdmin && currentClinica && (
        <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Clínica Activa:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {currentClinica.nombre}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={handleResetClinica}
            sx={{ fontSize: '0.7rem' }}
          >
            Volver a Admin Central
          </Button>
        </Box>
      )}
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
            {isSuperAdmin && currentClinica && (
              <Chip 
                size="small" 
                label={`Clínica: ${currentClinica.nombre}`} 
                color="secondary" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <NotificacionesPopup />
          
          <Tooltip title="Perfil">
            <IconButton
              size="large"
              edge="end"
              aria-label="cuenta del usuario"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {currentUser?.nombre || 'Usuario'}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                {currentUser?.email || ''}
              </Typography>
            </MenuItem>
            <Divider />
            {isSuperAdmin && currentClinica && (
              <MenuItem onClick={handleResetClinica}>Volver a Admin Central</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 