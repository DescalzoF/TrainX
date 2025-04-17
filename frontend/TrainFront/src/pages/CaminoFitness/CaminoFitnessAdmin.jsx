import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './CaminoFitnessAdmin.css';

function CaminoFitnessAdmin() {
    const [caminoPrograms, setCaminoPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentProgram, setCurrentProgram] = useState({ nameCF: '', descriptionCF: '' });
    const { isAdmin, getToken } = useAuth();
    const navigate = useNavigate();

    // Form for new/edit program
    const [formData, setFormData] = useState({
        nameCF: '',
        descriptionCF: ''
    });

    // Check if user is admin, redirect if not
    useEffect(() => {
        if (!isAdmin) {
            navigate('/camino');
        }
    }, [isAdmin, navigate]);

    // Fetch all camino fitness programs
    useEffect(() => {
        const fetchCaminoPrograms = async () => {
            try {
                const response = await fetch('/api/caminoFitness');
                if (!response.ok) {
                    throw new Error('Failed to fetch camino fitness programs');
                }
                const data = await response.json();
                setCaminoPrograms(data);
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setError('Error loading camino fitness programs. Please try again.');
                setLoading(false);
            }
        };

        fetchCaminoPrograms();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Create new program
    const handleCreateProgram = async (e) => {
        e.preventDefault();

        if (!formData.nameCF || !formData.descriptionCF) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch('/api/caminoFitness', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error creating program');
            }

            const newProgram = await response.json();
            setCaminoPrograms([...caminoPrograms, newProgram]);
            setFormData({ nameCF: '', descriptionCF: '' });
            alert('Programa creado con éxito');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al crear el programa');
        }
    };

    // Start editing a program
    const handleEdit = (program) => {
        setEditMode(true);
        setCurrentProgram(program);
        setFormData({
            nameCF: program.nameCF,
            descriptionCF: program.descriptionCF
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditMode(false);
        setCurrentProgram({ nameCF: '', descriptionCF: '' });
        setFormData({ nameCF: '', descriptionCF: '' });
    };

    // Update program
    const handleUpdateProgram = async (e) => {
        e.preventDefault();

        if (!formData.nameCF || !formData.descriptionCF) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch(`/api/caminoFitness/${currentProgram.idCF}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error updating program');
            }

            const updatedProgram = await response.json();
            setCaminoPrograms(caminoPrograms.map(prog =>
                prog.idCF === currentProgram.idCF ? updatedProgram : prog
            ));

            setEditMode(false);
            setCurrentProgram({ nameCF: '', descriptionCF: '' });
            setFormData({ nameCF: '', descriptionCF: '' });
            alert('Programa actualizado con éxito');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al actualizar el programa');
        }
    };

    // Delete program
    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este programa?')) {
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch(`/api/caminoFitness/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error deleting program');
            }

            setCaminoPrograms(caminoPrograms.filter(prog => prog.idCF !== id));
            alert('Programa eliminado con éxito');
        } catch (err) {
            console.error('Error:', err);
            alert('Error al eliminar el programa');
        }
    };

    if (loading) return <div className="loading">Cargando...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Administrar Camino Fitness</h1>
                <button
                    className="back-button"
                    onClick={() => navigate('/camino')}
                >
                    Volver
                </button>
            </div>

            <div className="admin-content">
                <div className="program-form-container">
                    <h2>{editMode ? 'Editar Programa' : 'Crear Nuevo Programa'}</h2>
                    <form onSubmit={editMode ? handleUpdateProgram : handleCreateProgram}>
                        <div className="form-group">
                            <label htmlFor="nameCF">Nombre del Programa</label>
                            <input
                                type="text"
                                id="nameCF"
                                name="nameCF"
                                value={formData.nameCF}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="descriptionCF">Descripción</label>
                            <textarea
                                id="descriptionCF"
                                name="descriptionCF"
                                value={formData.descriptionCF}
                                onChange={handleInputChange}
                                rows="5"
                                required
                            />
                        </div>
                        <div className="form-buttons">
                            {editMode && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handleCancelEdit}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className="submit-button">
                                {editMode ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="programs-list-container">
                    <h2>Programas Existentes</h2>
                    {caminoPrograms.length > 0 ? (
                        <div className="programs-list">
                            {caminoPrograms.map((program) => (
                                <div key={program.idCF} className="program-item">
                                    <div className="program-details">
                                        <h3>{program.nameCF}</h3>
                                        <p className="description-preview">
                                            {program.descriptionCF.substring(0, 100)}
                                            {program.descriptionCF.length > 100 ? '...' : ''}
                                        </p>
                                    </div>
                                    <div className="program-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(program)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(program.idCF)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-programs">No hay programas disponibles.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CaminoFitnessAdmin;