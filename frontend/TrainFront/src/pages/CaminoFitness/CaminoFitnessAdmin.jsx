import { useState, useEffect } from 'react';
import './CaminoFitness.css'; // Reuse the same CSS

function CaminoFitnessAdmin() {
    const [caminosList, setCaminosList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nameCF: '',
        descriptionCF: ''
    });
    const [token, setToken] = useState(localStorage.getItem('authToken') || '');

    // Fetch all camino fitness options
    const fetchCaminos = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/caminoFitness');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setCaminosList(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaminos();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = editingId
                ? `http://localhost:8080/api/caminoFitness/${editingId}`
                : 'http://localhost:8080/api/caminoFitness';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save changes');
            }

            // Reset form and refresh list
            setFormData({ nameCF: '', descriptionCF: '' });
            setEditingId(null);
            fetchCaminos();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (camino) => {
        setEditingId(camino.idCF);
        setFormData({
            nameCF: camino.nameCF,
            descriptionCF: camino.descriptionCF
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/caminoFitness/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            fetchCaminos();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ nameCF: '', descriptionCF: '' });
    };

    if (loading) {
        return <div className="admin-panel">Loading...</div>;
    }

    return (
        <div className="admin-panel">
            <h2>{editingId ? 'Edit Camino Fitness' : 'Add New Camino Fitness'}</h2>

            {error && <div className="error">{error}</div>}

            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nameCF">Name:</label>
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
                    <label htmlFor="descriptionCF">Description:</label>
                    <textarea
                        id="descriptionCF"
                        name="descriptionCF"
                        value={formData.descriptionCF}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                </div>

                <div className="action-buttons">
                    <button type="submit" className="admin-button">
                        {editingId ? 'Update' : 'Add'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="admin-button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h2>Manage Camino Fitness Options</h2>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {caminosList.map(camino => (
                    <tr key={camino.idCF}>
                        <td>{camino.idCF}</td>
                        <td>{camino.nameCF}</td>
                        <td>{camino.descriptionCF.substring(0, 50)}...</td>
                        <td className="action-buttons">
                            <button
                                className="admin-button edit-button"
                                onClick={() => handleEdit(camino)}
                            >
                                Edit
                            </button>
                            <button
                                className="admin-button delete-button"
                                onClick={() => handleDelete(camino.idCF)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default CaminoFitnessAdmin;