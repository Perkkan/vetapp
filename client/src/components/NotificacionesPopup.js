import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemButton,
  ListItemSecondaryAction,
  Typography, 
  Divider, 
  Box, 
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificacionesService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificacionesPopup = () => {
  const { currentUser } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [noLeidas, setNoLeidas] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  
  // Para el polling de notificaciones
  const pollingInterval = useRef(null);
  const POLLING_TIME = 30000; // 30 segundos
  
  useEffect(() => {
    if (currentUser) {
      fetchNotificaciones();
      
      // Configurar polling para verificar nuevas notificaciones periódicamente
      pollingInterval.current = setInterval(() => {
        fetchNotificaciones(true);
      }, POLLING_TIME);
    }
    
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [currentUser]);
  
  const fetchNotificaciones = async (silent = false) => {
    if (!currentUser) return;
    
    try {
      if (!silent) setLoading(true);
      
      const response = await notificacionesService.getNotificacionesByUsuario(
        currentUser.id, 
        { limit: 10, offset: 0 }
      );
      
      setNotificaciones(response.data.data);
      setNoLeidas(response.data.no_leidas);
      setHasMore(response.data.total > response.data.data.length);
      setPage(0);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };
  
  const loadMoreNotificaciones = async () => {
    if (!currentUser || loading) return;
    
    try {
      setLoading(true);
      
      const nextPage = page + 1;
      const response = await notificacionesService.getNotificacionesByUsuario(
        currentUser.id, 
        { 
          limit: 10, 
          offset: nextPage * 10,
          incluirLeidas: true
        }
      );
      
      setNotificaciones([...notificaciones, ...response.data.data]);
      setHasMore(response.data.total > notificaciones.length + response.data.data.length);
      setPage(nextPage);
    } catch (error) {
      console.error('Error al cargar más notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  
  const handleMarcarLeida = async (id) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      
      // Actualizar estado local
      setNotificaciones(notificaciones.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      ));
      
      if (noLeidas > 0) {
        setNoLeidas(noLeidas - 1);
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };
  
  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionesService.marcarTodasComoLeidas(currentUser.id);
      
      // Actualizar estado local
      setNotificaciones(notificaciones.map(notif => ({ ...notif, leida: true })));
      setNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };
  
  const handleEliminarNotificacion = async (id) => {
    try {
      await notificacionesService.eliminarNotificacion(id);
      
      // Actualizar estado local
      const notifToRemove = notificaciones.find(n => n.id === id);
      setNotificaciones(notificaciones.filter(n => n.id !== id));
      
      if (notifToRemove && !notifToRemove.leida && noLeidas > 0) {
        setNoLeidas(noLeidas - 1);
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };
  
  const handleNavigateToRelatedItem = (notificacion) => {
    // Marcar como leída
    handleMarcarLeida(notificacion.id);
    
    // Navegar a la página relacionada según el tipo
    if (notificacion.relacionado_tipo && notificacion.relacionado_id) {
      switch (notificacion.relacionado_tipo) {
        case 'paciente':
          navigate(`/pacientes/${notificacion.relacionado_id}`);
          break;
        case 'hospitalizacion':
          navigate(`/hospitalizacion/${notificacion.relacionado_id}`);
          break;
        case 'cita':
          navigate(`/citas/${notificacion.relacionado_id}`);
          break;
        case 'usuario':
          navigate(`/usuarios/${notificacion.relacionado_id}`);
          break;
        case 'clinica':
          navigate(`/clinicas/${notificacion.relacionado_id}`);
          break;
        default:
          // Sin acción específica
          break;
      }
    }
    
    handleClosePopover();
  };
  
  const getIconForNotificacion = (tipo) => {
    switch (tipo) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };
  
  const formatDate = (fecha) => {
    return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'notificaciones-popover' : undefined;
  
  return (
    <>
      <IconButton
        aria-describedby={id}
        color="inherit"
        onClick={handleOpenPopover}
      >
        <Badge badgeContent={noLeidas} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 360, 
            maxHeight: 480,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificaciones</Typography>
          {noLeidas > 0 && (
            <Button 
              size="small" 
              onClick={handleMarcarTodasLeidas}
              disabled={loading}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>
        
        <Divider />
        
        <List sx={{ overflow: 'auto', maxHeight: 360 }}>
          {notificaciones.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No tienes notificaciones" 
                secondary="Las nuevas notificaciones aparecerán aquí"
              />
            </ListItem>
          ) : (
            notificaciones.map((notificacion) => (
              <React.Fragment key={notificacion.id}>
                <ListItem 
                  disablePadding
                  sx={{
                    backgroundColor: notificacion.leida ? 'inherit' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    }
                  }}
                >
                  <ListItemButton onClick={() => handleNavigateToRelatedItem(notificacion)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${notificacion.tipo}.light` }}>
                        {getIconForNotificacion(notificacion.tipo)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: notificacion.leida ? 'normal' : 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {notificacion.titulo}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {notificacion.mensaje}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notificacion.fecha_creacion)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="eliminar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarNotificacion(notificacion.id);
                        }}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {hasMore && !loading && (
            <Box sx={{ p: 1 }}>
              <Button 
                fullWidth 
                size="small" 
                onClick={loadMoreNotificaciones}
              >
                Cargar más
              </Button>
            </Box>
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificacionesPopup; 