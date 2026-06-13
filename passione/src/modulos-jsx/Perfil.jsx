import { useState } from 'react';
import { actualizarPerfilApi } from '../services/authService';
import '../styles/Perfil.css';

const Perfil = ({ usuario, onActualizar }) => {
  const [nombre, setNombre]             = useState(usuario?.nombre || '');
  const [email, setEmail]               = useState(usuario?.email  || '');
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevoPassword, setNuevoPassword]   = useState('');
  const [confirmar, setConfirmar]           = useState('');
  const [error, setError]   = useState('');
  const [exito, setExito]   = useState('');
  const [guardando, setGuardando] = useState(false);

  const inicial = usuario?.nombre?.[0]?.toUpperCase() || '?';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setExito('');

    const emailCambio    = email.toLowerCase() !== usuario.email.toLowerCase();
    const passwordCambio = nuevoPassword.length > 0;

    if (passwordCambio && nuevoPassword !== confirmar) {
      return setError('Las contraseñas nuevas no coinciden.');
    }
    if (passwordCambio && nuevoPassword.length < 8) {
      return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    }

    const payload = { nombre };
    if (emailCambio)    payload.email          = email;
    if (passwordCambio) payload.nuevoPassword  = nuevoPassword;
    if (emailCambio || passwordCambio) payload.passwordActual = passwordActual;

    setGuardando(true);
    try {
      const actualizado = await actualizarPerfilApi(payload);
      setExito('Perfil actualizado correctamente.');
      setPasswordActual(''); setNuevoPassword(''); setConfirmar('');
      if (onActualizar) onActualizar(actualizado);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="perfil-wrapper">
      <div className="perfil-card">

        {/* Avatar */}
        <div className="perfil-avatar-area">
          <div className="perfil-avatar">{inicial}</div>
          <h2 className="perfil-nombre">{usuario?.nombre}</h2>
          <span className="perfil-badge">{usuario?.role === 'admin' ? '🛡️ Administrador' : '👤 Usuario'}</span>
        </div>

        {error && <div className="perfil-alert error">{error}</div>}
        {exito && <div className="perfil-alert exito">{exito}</div>}

        <form onSubmit={handleSubmit} className="perfil-form">

          <fieldset className="perfil-fieldset">
            <legend>Información general</legend>
            <div className="perfil-group">
              <label>Nombre completo</label>
              <input type="text" value={nombre}
                onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="perfil-group">
              <label>Correo electrónico</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)} required />
              {email.toLowerCase() !== usuario?.email?.toLowerCase() && (
                <small className="perfil-hint">⚠️ Cambiar el email requiere tu contraseña actual.</small>
              )}
            </div>
          </fieldset>

          <fieldset className="perfil-fieldset">
            <legend>Cambiar contraseña <span className="opcional">(opcional)</span></legend>
            <div className="perfil-group">
              <label>Contraseña actual</label>
              <input type="password" value={passwordActual} placeholder="Requerida para cambios sensibles"
                onChange={e => setPasswordActual(e.target.value)} />
            </div>
            <div className="perfil-group">
              <label>Nueva contraseña</label>
              <input type="password" value={nuevoPassword} placeholder="Mínimo 8 caracteres"
                onChange={e => setNuevoPassword(e.target.value)} />
            </div>
            {nuevoPassword && (
              <div className="perfil-group">
                <label>Confirmar nueva contraseña</label>
                <input type="password" value={confirmar} placeholder="Repite la contraseña"
                  onChange={e => setConfirmar(e.target.value)} />
              </div>
            )}
          </fieldset>

          <div className="perfil-info-box">
            <strong>Restricciones de seguridad:</strong>
            <ul>
              <li>No puedes cambiar tu rol de usuario.</li>
              <li>El email y la contraseña requieren verificar la contraseña actual.</li>
              <li>La nueva contraseña debe tener al menos 8 caracteres.</li>
            </ul>
          </div>

          <button type="submit" className="perfil-btn" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
