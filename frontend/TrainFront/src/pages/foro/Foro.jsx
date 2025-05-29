import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Foro.css';

const Foro = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showPostDetail, setShowPostDetail] = useState(false);
    const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'popular'

    // Form states
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        category: ''
    });

    const [newComment, setNewComment] = useState('');

    const BASE_URL = 'http://localhost:8080';

    // Axios configuration
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch posts when filters change
    useEffect(() => {
        fetchPosts();
    }, [currentPage, selectedCategory, searchTerm, sortBy]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/forum/categories`, {
                headers: getAuthHeaders()
            });
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                console.error('Categories response is not an array:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]); // Ensure categories remains an array on error
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let url = '';

            if (searchTerm) {
                url = `${BASE_URL}/api/forum/posts/search?keyword=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=10`;
            } else if (selectedCategory) {
                url = `${BASE_URL}/api/forum/posts/category/${selectedCategory}?page=${currentPage}&size=10`;
            } else if (sortBy === 'popular') {
                url = `${BASE_URL}/api/forum/posts/popular?page=${currentPage}&size=10`;
            } else {
                url = `${BASE_URL}/api/forum/posts?page=${currentPage}&size=10`;
            }

            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });

            // Ensure response.data.content is an array
            if (response.data && response.data.content && Array.isArray(response.data.content)) {
                setPosts(response.data.content);
                setTotalPages(response.data.totalPages || 0);
            } else {
                console.error('Posts response format is incorrect:', response.data);
                setPosts([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]); // Ensure posts remains an array on error
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchPostDetail = async (postId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/forum/posts/${postId}`, {
                headers: getAuthHeaders()
            });
            setSelectedPost(response.data);
            setShowPostDetail(true);
        } catch (error) {
            console.error('Error fetching post detail:', error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BASE_URL}/api/forum/posts`, newPost, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });

            setShowCreatePost(false);
            setNewPost({ title: '', content: '', category: '' });
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleLikePost = async (postId) => {
        try {
            await axios.post(`${BASE_URL}/api/forum/posts/${postId}/like`, {}, {
                headers: getAuthHeaders()
            });

            fetchPosts();
            if (selectedPost && selectedPost.post.id === postId) {
                fetchPostDetail(postId);
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await axios.post(`${BASE_URL}/api/forum/posts/${selectedPost.post.id}/comments`,
                { content: newComment },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders()
                    }
                }
            );

            setNewComment('');
            fetchPostDetail(selectedPost.post.id);
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            await axios.post(`${BASE_URL}/api/forum/comments/${commentId}/like`, {}, {
                headers: getAuthHeaders()
            });

            fetchPostDetail(selectedPost.post.id);
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchPosts();
    };

    const resetFilters = () => {
        setSelectedCategory('');
        setSearchTerm('');
        setSortBy('recent');
        setCurrentPage(0);
    };

    return (
        <div className="foro-container">
            <header className="foro-header">
                <h1>Foro de la Comunidad</h1>
                <p>Comparte tus experiencias, haz preguntas y conecta con otros miembros</p>
            </header>

            {/* Filters and Search */}
            <div className="foro-controls">
                <div className="foro-search-section">
                    <form onSubmit={handleSearch} className="foro-search-form">
                        <input
                            type="text"
                            placeholder="Buscar en el foro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="foro-search-input"
                        />
                        <button type="submit" className="foro-search-btn">
                            🔍
                        </button>
                    </form>
                </div>

                <div className="filters-section">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        <option value="">Todas las categorías</option>
                        {Array.isArray(categories) && categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="recent">Más recientes</option>
                        <option value="popular">Más populares</option>
                    </select>

                    <button onClick={resetFilters} className="reset-btn">
                        Limpiar filtros
                    </button>
                </div>

                <button
                    onClick={() => setShowCreatePost(true)}
                    className="create-post-btn"
                >
                    ✏️ Crear publicación
                </button>
            </div>

            {/* Posts List */}
            <div className="posts-container">
                {loading ? (
                    <div className="loading">Cargando publicaciones...</div>
                ) : !Array.isArray(posts) || posts.length === 0 ? (
                    <div className="no-posts">
                        <p>No se encontraron publicaciones</p>
                        {(searchTerm || selectedCategory) && (
                            <button onClick={resetFilters} className="reset-btn">
                                Ver todas las publicaciones
                            </button>
                        )}
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <h3
                                    className="post-title"
                                    onClick={() => fetchPostDetail(post.id)}
                                >
                                    {post.title}
                                </h3>
                                <span className="post-category">{post.category}</span>
                            </div>

                            <div className="post-content">
                                <p>{post.content.substring(0, 200)}...</p>
                            </div>

                            <div className="post-meta">
                                <div className="post-author">
                                    <span>Por {post.authorName}</span>
                                    <span className="post-date">{formatDate(post.createdAt)}</span>
                                </div>

                                <div className="post-stats">
                                    <button
                                        onClick={() => handleLikePost(post.id)}
                                        className="like-btn"
                                    >
                                        👍 {post.likes}
                                    </button>
                                    <span className="comment-count">💬 {post.commentCount}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="page-btn"
                    >
                        Anterior
                    </button>

                    <span className="page-info">
            Página {currentPage + 1} de {totalPages}
          </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="page-btn"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Create Post Modal */}
            {showCreatePost && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Crear nueva publicación</h2>
                            <button
                                onClick={() => setShowCreatePost(false)}
                                className="close-btn"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="create-post-form">
                            <input
                                type="text"
                                placeholder="Título de la publicación"
                                value={newPost.title}
                                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                required
                                className="form-input"
                            />

                            <select
                                value={newPost.category}
                                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                                required
                                className="form-select"
                            >
                                <option value="">Selecciona una categoría</option>
                                {Array.isArray(categories) && categories.map(category => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Contenido de la publicación"
                                value={newPost.content}
                                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                required
                                rows={6}
                                className="form-textarea"
                            />

                            <div className="forum-form-actions">
                                <button type="submit" className="submit-btn">
                                    Publicar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePost(false)}
                                    className="cancel-btn"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Post Detail Modal */}
            {showPostDetail && selectedPost && (
                <div className="modal-overlay">
                    <div className="modal post-detail-modal">
                        <div className="modal-header">
                            <h2>{selectedPost.post.title}</h2>
                            <button
                                onClick={() => setShowPostDetail(false)}
                                className="close-btn"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="post-detail-content">
                            <div className="post-main">
                                <div className="post-meta">
                                    <span className="post-category">{selectedPost.post.category}</span>
                                    <span>Por {selectedPost.post.authorName}</span>
                                    <span className="post-date">{formatDate(selectedPost.post.createdAt)}</span>
                                </div>

                                <div className="post-content">
                                    <p>{selectedPost.post.content}</p>
                                </div>

                                <div className="post-actions">
                                    <button
                                        onClick={() => handleLikePost(selectedPost.post.id)}
                                        className="like-btn"
                                    >
                                        👍 {selectedPost.post.likes}
                                    </button>
                                </div>
                            </div>

                            <div className="comments-section">
                                <h3>Comentarios ({selectedPost.comments ? selectedPost.comments.length : 0})</h3>

                                <form onSubmit={handleCreateComment} className="comment-form">
                  <textarea
                      placeholder="Escribe tu comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      className="comment-input"
                  />
                                    <button type="submit" className="comment-submit-btn">
                                        Comentar
                                    </button>
                                </form>

                                <div className="comments-list">
                                    {selectedPost.comments && Array.isArray(selectedPost.comments) &&
                                        selectedPost.comments.map(comment => (
                                            <div key={comment.id} className="comment">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.authorName}</span>
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <div className="comment-content">
                                                    <p>{comment.content}</p>
                                                </div>
                                                <div className="comment-actions">
                                                    <button
                                                        onClick={() => handleLikeComment(comment.id)}
                                                        className="like-btn small"
                                                    >
                                                        👍 {comment.likes}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foro;