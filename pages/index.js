import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const postsRef = collection(db, "posts");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };
    fetchPosts();
  }, []);

  // Create or update post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author || !content) return;

    if (editingId) {
      const postDoc = doc(db, "posts", editingId);
      await updateDoc(postDoc, { title, author, content });
      setEditingId(null);
    } else {
      await addDoc(postsRef, { title, author, content, createdAt: new Date() });
    }

    setTitle("");
    setAuthor("");
    setContent("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "posts", id));
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setAuthor(post.author);
    setContent(post.content);
    setEditingId(post.id);
  };

  // Filter posts by search
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffb3b3] to-white p-6 font-sans text-[#222]">
      {/* Header */}
      <header className="site-header text-center mb-10">
        <div className="brand flex justify-center items-center gap-4">
          <div className="logo w-18 h-18 rounded-xl bg-gradient-to-br from-[#f8afa6] to-[#f79489] flex items-center justify-center text-white text-3xl">
            🌸
          </div>
          <div>
            <h1 className="text-4xl font-bold">Mini Blog</h1>
            <p className="subtitle text-gray-600 text-lg">Create. Share. Smile.</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main max-w-6xl mx-auto grid md:grid-cols-[420px_1fr] gap-6">
        {/* Form Card */}
        <section className="card form-card bg-white rounded-2xl shadow-lg p-6 border border-[#f1dada]">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? "Edit Post" : "Create a Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Post Title"
              className="input w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Author"
              className="input w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9]"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your story..."
              className="textarea w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9] min-h-[130px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="form-actions flex gap-3">
              <button className="btn bg-[#f8afa6] hover:bg-[#f79489] text-white font-semibold px-4 py-2 rounded-xl">
                {editingId ? "Save ✨" : "Publish ✨"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setAuthor("");
                    setContent("");
                    setEditingId(null);
                  }}
                  className="btn ghost bg-[#f6eaea] text-[#222] px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Posts Card */}
        <section className="card posts-card bg-white rounded-2xl shadow-lg p-6 border border-[#f1dada]">
          <h2 className="text-2xl font-semibold mb-4">All Posts</h2>
          <input
            type="search"
            placeholder="Search posts by title, author, or content..."
            className="search w-full p-3 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9] mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="posts-list space-y-4">
            {filteredPosts.length === 0 && (
              <div className="empty p-6 border-2 border-dashed border-[#f3caca] rounded-xl text-gray-500 text-center">
                No posts found
              </div>
            )}
            {filteredPosts.map((p) => (
              <PostCard key={p.id} post={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer text-center mt-10 text-gray-600">
        Made with ♥ — Sanskriti
      </footer>
    </div>
  );
}

// PostCard Component
function PostCard({ post, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = post.content.length > 320 ? post.content.slice(0, 320) + "…" : post.content;

  return (
    <div className="post bg-gradient-to-b from-[#fbc2c2] to-[#f9adad] border-l-6 border-[#f79489] p-5 rounded-xl">
      <h3 className="text-[#222] text-xl font-semibold">{post.title}</h3>
      <p className="meta text-gray-600 text-sm mt-1">
        By <strong>{post.author}</strong>
      </p>
      <p className="content mt-2 text-[#222]">{expanded ? post.content : truncated}</p>
      {post.content.length > 320 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="read-more text-[#f79489] font-semibold mt-1 border-none bg-none cursor-pointer"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      <div className="post-actions mt-3 flex gap-2">
        <button
          onClick={() => onEdit(post)}
          className="small-btn px-3 py-1 border border-[#f8afa6] rounded-xl hover:bg-[#ffeaea]"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="small-btn px-3 py-1 border border-[#f8afa6] rounded-xl text-red-500 hover:bg-[#ffeaea]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
