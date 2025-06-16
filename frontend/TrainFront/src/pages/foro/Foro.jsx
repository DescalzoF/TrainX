import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Foro.css";

const CATEGORIES = [
    { value: "general", label: "General" },
    { value: "anuncios", label: "Anuncios" },
    { value: "nutricion", label: "Nutrición" },
    { value: "atencion", label: "Atención Al Cliente" },
];

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

function Foro() {
    const [categories] = useState(CATEGORIES);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].value);
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    const [activePost, setActivePost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper to get token header
    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    // Helper to check if user is TrainXAdmin (case-sensitive)
    const isAdmin = user && user.username === "TrainXAdmin";
    // Only admin can post in "anuncios"
    const canPostInCategory = selectedCategory !== "anuncios" || isAdmin;

    // Fetch current logged-in user
    const fetchCurrentUser = () => {
        axios.get("http://localhost:8080/api/users/currentUser", getAuthHeader())
            .then(res => setUser(res.data))
            .catch(err => {
                setError("No se pudo cargar la información del usuario. Inicia sesión nuevamente.");
            });
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) + ' a las ' + date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fetch posts for selected category
    const fetchPosts = () => {
        setLoading(true);
        axios.get("http://localhost:8080/api/forum/posts", getAuthHeader())
            .then(res => {
                const data = res.data;
                const filtered = data
                    .filter(p => p.category === selectedCategory)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(filtered);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load posts");
                setLoading(false);
            });
    };

    // Fetch comments for active post
    const fetchComments = (postId) => {
        axios.get(`http://localhost:8080/api/forum/comments?postId=${postId}`, getAuthHeader())
            .then(res => setComments(res.data))
            .catch(() => setComments([]));
    };

    // Fetch post details and comments
    const fetchPostDetail = (postId) => {
        axios.get(`http://localhost:8080/api/forum/posts/${postId}`, getAuthHeader())
            .then(res => {
                setActivePost(res.data);
                fetchComments(postId);
            })
            .catch(() => setActivePost(null));
    };

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory]);

    useEffect(() => {
        if (activePost) {
            fetchPostDetail(activePost.id);
        }
    }, [activePost?.id]);

    // Handlers
    const handleCategory = (cat) => {
        setSelectedCategory(cat);
        setActivePost(null);
    };

    const handleOpenPost = (post) => setActivePost(post);

    const handleLikePost = (postId, e) => {
        e?.stopPropagation();
        if (!user) {
            setError("Debes iniciar sesión para dar like");
            return;
        }
        axios.post(`http://localhost:8080/api/forum/posts/${postId}/like`, { id: user.id }, getAuthHeader())
            .then(() => {
                fetchPosts();
                if (activePost && activePost.id === postId) {
                    fetchPostDetail(postId);
                }
            })
            .catch(err => {
                if (!err.response || !err.response.data.message?.includes("already liked")) {
                    setError("Error dando like al post. Intenta nuevamente.");
                }
            });
    };

    const handleLikeComment = (commentId) => {
        if (!user) {
            setError("Debes iniciar sesión para dar like");
            return;
        }
        axios.post(`http://localhost:8080/api/forum/comments/${commentId}/like`, { id: user.id }, getAuthHeader())
            .then(() => {
                if (activePost) fetchComments(activePost.id);
            })
            .catch(err => {
                if (!err.response || !err.response.data.message?.includes("already liked")) {
                    setError("Error dando like al comentario. Intenta nuevamente.");
                }
            });
    };

    const handlePostSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            setError("Debes iniciar sesión para publicar");
            return;
        }
        if (selectedCategory === "anuncios" && !isAdmin) {
            setError("Solo el administrador puede publicar en Anuncios.");
            return;
        }
        setLoading(true);
        const categoryObj = categories.find(c => c.value === selectedCategory);
        const postData = {
            title: newPost.title,
            content: newPost.content,
            author: { id: user.id },
            category: { value: selectedCategory, label: categoryObj.label }
        };
        axios.post("http://localhost:8080/api/forum/posting/posts", postData, getAuthHeader())
            .then(() => {
                setShowPostModal(false);
                setNewPost({ title: "", content: "" });
                fetchPosts();
                setLoading(false);
            })
            .catch(err => {
                setError("Error al crear el post: " + (err.response?.data?.message || err.message));
                setLoading(false);
            });
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            setError("Debes iniciar sesión para comentar");
            return;
        }
        const commentData = {
            content: newComment,
            author: { id: user.id }
        };
        axios.post(`http://localhost:8080/api/forum/posts/${activePost.id}/comments`, commentData, getAuthHeader())
            .then(() => {
                setNewComment("");
                fetchPostDetail(activePost.id);
            })
            .catch(() => setError("Error al añadir comentario. Intenta nuevamente."));
    };

    return (
        <div className="foro-container">
            <aside className="foro-sidebar">
                <nav>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            className={`foro-category-btn${selectedCategory === cat.value ? " active" : ""}`}
                            onClick={() => handleCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </nav>
                {canPostInCategory && (
                    <button className="foro-newpost-btn" onClick={() => setShowPostModal(true)}>
                        + Nuevo Post
                    </button>
                )}
            </aside>
            <main className="foro-main">
                {error && <div className="foro-error" onClick={() => setError(null)}>{error}</div>}
                {loading && <div className="foro-loading">Cargando...</div>}

                {!activePost ? (
                    <>
                        <section className="foro-posts-list">
                            {!loading && posts.length === 0 &&
                                <div className="foro-empty">No hay posts aún en esta categoría.</div>
                            }
                            {posts.map(post => (
                                <div className="foro-post-card" key={post.id} onClick={() => handleOpenPost(post)}>
                                    <div className="foro-post-header">
                                        <div className="foro-user-info">
                                            <img
                                                src={post.authorPhoto || DEFAULT_AVATAR}
                                                alt={post.authorName}
                                                className="foro-user-avatar"
                                            />
                                            <div className="foro-post-author">
                                                <span className="foro-author-name">{post.authorName || 'Usuario'}</span>
                                                <span className="foro-author-username">@{post.authorUsername || 'username'}</span>
                                            </div>
                                        </div>
                                        <div className="foro-post-category">{categories.find(c => c.value === post.category)?.label}</div>
                                    </div>
                                    <div className="foro-post-title">{post.title}</div>
                                    <div className="foro-post-meta">
                                        <span className="foro-post-date">{formatDate(post.createdAt)}</span>
                                    </div>
                                    <div className="foro-post-actions">
                                        <button
                                            className="foro-like-btn"
                                            onClick={e => handleLikePost(post.id, e)}
                                        >
                                            ❤️ {post.likes || 0}
                                        </button>
                                        <span className="foro-comments-count">💬 {post.commentCount || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                ) : (
                    <section className="foro-post-detail">
                        {activePost && (
                            <button
                                className="foro-back-btn"
                                onClick={() => setActivePost(null)}
                                aria-label="Volver"
                            >
                                <svg
                                    width="52"
                                    height="52"
                                    viewBox="0 0 52 52"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{ display: "block" }}
                                >
                                    <path
                                        d="M36 26H8"
                                        stroke="white"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M16 16L8 26L16 36"
                                        stroke="white"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        )}
                        <div className="foro-post-detail-card">
                            <div className="foro-post-header">
                                <div className="foro-user-info">
                                    <img
                                        src={activePost.authorPhoto || DEFAULT_AVATAR}
                                        alt={activePost.authorName}
                                        className="foro-user-avatar"
                                    />
                                    <div className="foro-post-author">
                                        <span className="foro-author-name">{activePost.authorName || 'Usuario'}</span>
                                        <span className="foro-author-username">@{activePost.authorUsername || 'username'}</span>
                                    </div>
                                </div>
                                <div className="foro-post-category">
                                    {categories.find(c => c.value === activePost.category)?.label}
                                </div>
                            </div>
                            <h2>{activePost.title}</h2>
                            <div className="foro-post-meta">
                                <span className="foro-post-date">{formatDate(activePost.createdAt)}</span>
                            </div>
                            <div className="foro-post-content">{activePost.content}</div>
                            <div className="foro-post-actions">
                                <button
                                    className="foro-like-btn"
                                    onClick={(e) => handleLikePost(activePost.id, e)}
                                >
                                    ❤️ {activePost.likes || 0}
                                </button>
                            </div>
                        </div>
                        <div className="foro-comments-section">
                            <h3>Comentarios</h3>
                            <form className="foro-comment-form" onSubmit={handleCommentSubmit}>
                                <input
                                    type="text"
                                    placeholder="Escribe un comentario..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    required
                                />
                                <button type="submit">Comentar</button>
                            </form>
                            <div className="foro-comments-list">
                                {comments.length === 0 && <div className="foro-empty">Sé el primero en comentar.</div>}
                                {comments.map(comment => (
                                    <div className="foro-comment-card" key={comment.id}>
                                        <div className="foro-comment-header">
                                            <div className="foro-user-info">
                                                <img
                                                    src={comment.authorPhoto || DEFAULT_AVATAR}
                                                    alt={comment.authorName}
                                                    className="foro-user-avatar"
                                                />
                                                <div className="foro-comment-author">
                                                    <span className="foro-author-name">{comment.authorName || 'Usuario'}</span>
                                                    <span className="foro-author-username">@{comment.authorUsername || 'username'}</span>
                                                </div>
                                            </div>
                                            <span className="foro-comment-date">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <div className="foro-comment-content">{comment.content}</div>
                                        <button
                                            className="foro-like-btn"
                                            onClick={() => handleLikeComment(comment.id)}
                                        >
                                            ❤️ {comment.likes || 0}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            {showPostModal && (
                <div className="foro-modal-bg" onClick={() => setShowPostModal(false)}>
                    <div className="foro-modal" onClick={e => e.stopPropagation()}>
                        <h2>Nuevo Post</h2>
                        <form onSubmit={handlePostSubmit}>
                            <input
                                type="text"
                                placeholder="Título"
                                value={newPost.title}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Contenido"
                                value={newPost.content}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                required
                            />
                            <div className="foro-modal-actions">
                                <button
                                    type="submit"
                                    className="foro-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Publicando...' : 'Publicar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="foro-cancel-btn"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Foro;