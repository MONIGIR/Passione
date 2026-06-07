import { useState } from 'react';
import '../styles/login.css';
//Crea un css y lo importas aqui.
export const LoginRegister = () => {
    const [IsLogIn, setIsLogin] = useState(true);

    //Capturador de credenciales
    const [Email, setEmail] = useState('');
    const [Contraseña, setContraseña] = useState('');
    const [role, setRole] = useState('usuario');
    const [Nombre, setNombre] = useState('');

    //Manejador de envio de formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (IsLogIn) {
            console.log('Inicia sesion con :', { Email, Contraseña });
        } else {
            console.log('Registrar usuario', { Nombre, Email, Contraseña, role });
        }
    };

    //Renderizado condicional del formulario
    return (
        <div className='Container-Autorizacion'>
            <div className='Carta-autorizacion'>
                <h2>{IsLogIn ? 'Iniciar Sesion' : 'Crear Cuenta'}</h2>
                <p className='autorizar-sub'>
                    {IsLogIn ? 'Bienvenido' : 'Registrate para entrar'}
                </p>
                
                <form onSubmit={handleSubmit} className='autorizar-formulario'>
                    {!IsLogIn && (
                        <div className='formulario'>
                            <label htmlFor='nombre'>Nombre Completo</label>
                            <input
                                type='text'
                                id='nombre'
                                value={Nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder='Nombre'
                                required
                            />
                        </div>
                    )}
                    <div className='formulario'>
                        <label htmlFor='Email'>Correo Electronico</label>
                        <input
                            type='email'
                            id='Email'
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='correo@ejemplo.com'
                            required
                        />
                    </div>
                    <div className='formulario'>
                        <label htmlFor='Contraseña'>Contraseña</label>
                        <input
                            type='password'
                            id='Contraseña'
                            value={Contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            placeholder='......'
                            required
                        />
                    </div>
                    {!IsLogIn && (
                        <div className='formulario'>
                            <label htmlFor='role'>Tipo de Usuario</label>
                            <select
                                id='role'
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className='selector-formulario'
                            >
                                <option value='usuario'>Usuario</option>
                                <option value='administrador'>Administrador</option>
                            </select>
                        </div>
                    )}
                    <button type='submit' className='btn-submit'>
                        {IsLogIn ? 'Ingresar' : 'Registrarse'}
                    </button>
                </form>
                <div className='autorizar-alternar'>
                    <p>
                        <button type='button' onClick={() => setIsLogin(!IsLogIn)} className='btn-alternar'>
                            {IsLogIn ? 'Registrate Aqui' : 'Inicia sesion'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

