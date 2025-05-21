import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    especialidad: '',
    horario: '',
    direccion: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // TODO: Implementar la llamada a la API para obtener los datos del usuario
    // Por ahora usamos datos de ejemplo
    setFormData({
      nombre: 'Dr. Juan Pérez',
      email: 'juan@veterinaria.com',
      telefono: '123456789',
      rol: 'Veterinario',
      especialidad: 'Cirugía',
      horario: 'Lunes a Viernes 9:00 - 17:00',
      direccion: 'Calle Principal 123',
      password: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implementar la lógica para actualizar el perfil
    console.log('Actualizar perfil:', formData);
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Mi Perfil
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
            >
              {formData.nombre.charAt(0)}
            </Avatar>
          </Grid>

          <Grid item xs={12}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Veterinario">Veterinario</MenuItem>
                    <MenuItem value="Asistente">Asistente</MenuItem>
                    <MenuItem value="Cuidador">Cuidador</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Especialidad"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>

                {isEditing && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Cambiar Contraseña
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Contraseña Actual"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nueva Contraseña"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirmar Nueva Contraseña"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </Grid>
                  </>
                )}

                {isEditing && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Guardar Cambios
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserProfile; 