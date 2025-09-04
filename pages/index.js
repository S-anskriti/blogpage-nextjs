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
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const postsRef = collection(db, "posts");

  // fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    };
    fetchPosts();
  }, []);

  // create/update post
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
    window.location.reload();
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

  // filter posts by search
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffb3b3] to-white p-6">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="flex justify-center items-center gap-4">
          <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-[#f8afa6] to-[#f79489] flex items-center justify-center text-white text-3xl">
            🌸
          </div>
          <div>
            <h1 className="text-4xl font-bold">Mini Blog</h1>
            <p className="text-gray-600 text-lg">Create. Share. Smile.</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto grid md:grid-cols-[420px_1fr] gap-6">
        {/* Form Card */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#f1dada]">
          <h2 className="text-2xl font-semibold mb-4">
            {editingId ? "Edit Post" : "Create a Post"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Post Title"
              className="w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Author"
              className="w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9]"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your story..."
              className="w-full p-4 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9] min-h-[130px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="flex gap-3">
              <button className="bg-[#f8afa6] hover:bg-[#f79489] text-white font-semibold px-4 py-2 rounded-xl">
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
                  className="bg-[#f6eaea] text-[#222] px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Posts Card */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#f1dada]">
          <h2 className="text-2xl font-semibold mb-4">All Posts</h2>
          {/* Search */}
          <input
            type="search"
            placeholder="Search posts by title, author, or content..."
            className="w-full p-3 border rounded-xl border-[#f8b7b7] bg-[#f9f9f9] mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-4">
            {filteredPosts.length === 0 && (
              <div className="p-6 border-2 border-dashed border-[#f3caca] rounded-xl text-gray-500 text-center">
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
      <footer className="text-center mt-10 text-gray-600">
        Made with ♥ — Sanskriti
      </footer>
    </div>
  );
}

// Separate component for Post with Read More toggle
function PostCard({ post, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = post.content.slice(0, 320);

  return (
    <div className="bg-gradient-to-b from-[#fbc2c2] to-[#f9adad] border-l-6 border-[#f79489] p-5 rounded-xl">
      <h3 className="text-xl font-semibold">{post.title}</h3>
      <p className="text-gray-600 text-sm mt-1">
        By <strong>{post.author}</strong>
      </p>
      <p className="mt-2">{expanded ? post.content : truncated}{post.content.length > 320 && "…"}</p>
      {post.content.length > 320 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#f79489] font-semibold mt-1"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(post)}
          className="px-3 py-1 border border-[#f8afa6] rounded-xl hover:bg-[#ffeaea]"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="px-3 py-1 border border-[#f8afa6] rounded-xl text-red-500 hover:bg-[#ffeaea]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
