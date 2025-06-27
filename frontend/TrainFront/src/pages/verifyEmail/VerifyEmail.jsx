import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const hasVerified = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            toast.error('Token de verificación no encontrado');
            return;
        }

        // Prevent double execution
        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true; // Set flag immediately

        const verifyEmail = async () => {
            try {
                console.log('Attempting to verify with token:', token);

                const response = await fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Response status:', response.status);
                const data = await response.json();

                if (response.ok) {
                    console.log('Success response data:', data);
                    setStatus('success');
                    toast.success('¡Email verificado exitosamente!');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    console.log('Error response data:', data);
                    setStatus('error');
                    toast.error(data?.message || 'Error al verificar email');
                }
            } catch (error) {
                setStatus('error');
                toast.error('Error de conexión');
                console.error('Error:', error);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {status === 'verifying' && (
                    <div className="status-content">
                        <div className="spinner"></div>
                        <h2 className="title">Verificando email...</h2>
                        <p className="description">
                            Por favor espera mientras verificamos tu cuenta.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="status-content">
                        <div className="icon success-icon">✓</div>
                        <h2 className="title">¡Email Verificado!</h2>
                        <p className="description">
                            Tu cuenta ha sido verificada exitosamente.
                        </p>
                        <p className="sub-description">
                            Serás redirigido al login en unos segundos...
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                        >
                            Ir al Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="status-content">
                        <div className="icon error-icon">✕</div>
                        <h2 className="title">Error de Verificación</h2>
                        <p className="description">
                            El enlace de verificación es inválido o ha expirado.
                        </p>
                        <div className="button-group">
                            <button
                                onClick={() => navigate('/signup')}
                                className="btn btn-primary"
                            >
                                Registrarse Nuevamente
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-secondary"
                            >
                                Ir al Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;