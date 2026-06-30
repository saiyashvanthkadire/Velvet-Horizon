import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Clock, User, X, Send, Calendar, Share2, Twitter, Facebook, Link, MessageCircle, Check, Upload, Image, Sparkles, Trash2 } from 'lucide-react';
import { BLOG_POSTS } from '../data';
import { BlogPost, BlogComment } from '../types';
import { auth } from '../lib/firebase';
import { getBlogStats, submitBlogComment, toggleBlogLike, getCustomBlogPosts, saveBlogPost, deleteBlogPost, syncAuthWithBackend } from '../lib/api';

interface BlogProps {
  setCurrentTab?: (tab: string) => void;
}

export default function Blog({ setCurrentTab }: BlogProps = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Track reactive current user state
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [localDbUser, setLocalDbUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const res = await syncAuthWithBackend();
          if (res && res.user) {
            setLocalDbUser(res.user);
          }
        } catch (e) {
          console.error("Failed to sync auth in Blog:", e);
        }
      } else {
        setLocalDbUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sharing Tooltip/Overlay State
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Write Blog Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Fan Review');
  const [newBlogSummary, setNewBlogSummary] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogImageUrl, setNewBlogImageUrl] = useState('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600');
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

  // Drag & Drop / Photo Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [guestAuthorName, setGuestAuthorName] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPEG, PNG, GIF, WEBP) are supported.');
      return;
    }
    // Limit to 4.5MB to be safe with DB transport
    if (file.size > 4.5 * 1024 * 1024) {
      setUploadError('Image size must be less than 4.5MB.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewBlogImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const getShareUrl = (postId: string) => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?tab=blog&post=${postId}`;
  };

  const getShareText = (title: string) => {
    return `Check out this Velvet Horizon blog post: "${title}"`;
  };

  const handleCopyLink = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getShareUrl(postId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2500);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  // Comment Writing State
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  // Load real database stats for blog posts (likes and comments)
  const loadBlogStatsFromDb = async (loadedPosts: BlogPost[]) => {
    try {
      const { comments, likes } = await getBlogStats();
      
      const merged = loadedPosts.map(post => {
        const postDbComments = comments
          .filter((c: any) => c.postId === String(post.id))
          .sort((a: any, b: any) => a.id - b.id) // Sort by database ID ascending (chronological)
          .map((c: any) => ({
            id: 'db-' + c.id,
            author: c.author,
            content: c.content,
            date: c.date,
          }));

        const postDbLikesCount = likes.filter((l: any) => l.postId === String(post.id)).length;

        // Display comments chronologically (static comments first, then db comments chronologically)
        return {
          ...post,
          likes: post.likes + postDbLikesCount,
          comments: [...(post.comments || []), ...postDbComments],
        };
      });

      setPosts(merged);
      
      // Handle deep-linking once on first load
      const params = new URLSearchParams(window.location.search);
      const postIdParam = params.get('post');
      
      if (selectedPost) {
        const found = merged.find(p => p.id === selectedPost.id);
        if (found) {
          setSelectedPost(found);
        }
      } else if (postIdParam) {
        const found = merged.find(p => p.id === postIdParam);
        if (found) {
          setSelectedPost(found);
        }
      }
    } catch (e) {
      console.error("Failed to merge blog stats:", e);
      setPosts(loadedPosts);
    }
  };

  const fetchAndMergeAllPosts = async () => {
    try {
      // 1. Get static posts
      let staticPosts: BlogPost[] = [];
      const savedPosts = localStorage.getItem('vh_blog_posts_v1');
      if (savedPosts) {
        try {
          staticPosts = JSON.parse(savedPosts);
        } catch (e) {
          staticPosts = BLOG_POSTS;
        }
      } else {
        staticPosts = BLOG_POSTS;
        localStorage.setItem('vh_blog_posts_v1', JSON.stringify(BLOG_POSTS));
      }

      // 2. Get database-saved custom posts
      let mappedCustomPosts: BlogPost[] = [];
      try {
        const customDbPosts = await getCustomBlogPosts();
        mappedCustomPosts = customDbPosts.map((dbPost: any) => ({
          id: 'dbpost-' + dbPost.id,
          title: dbPost.title,
          date: dbPost.date,
          category: dbPost.category,
          summary: dbPost.summary,
          content: dbPost.content,
          imageUrl: dbPost.imageUrl || dbPost.image_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
          likes: 0,
          comments: [],
          readTime: dbPost.readTime || dbPost.read_time || "3 min read",
          author: dbPost.author,
          userId: dbPost.userId || dbPost.user_id,
        }));
      } catch (err) {
        console.error("Failed to load custom blog posts from database:", err);
      }

      const combined = [...mappedCustomPosts, ...staticPosts];
      
      // 3. Load stats and comments for all posts
      await loadBlogStatsFromDb(combined);
    } catch (e) {
      console.error("Failed to load and merge posts:", e);
    }
  };

  // Initial Load with LocalStorage synchronization & URL routing
  useEffect(() => {
    fetchAndMergeAllPosts();
  }, []);

  // Synchronize browser address bar with selected blog post
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (selectedPost) {
      params.set('post', selectedPost.id);
    } else {
      params.delete('post');
    }
    url.search = params.toString();
    window.history.replaceState(null, '', url.toString());
  }, [selectedPost]);

  const savePostsState = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    // Separate localposts from dbposts to keep local storage clean
    const localPostsOnly = updatedPosts.filter(p => !p.id.startsWith('dbpost-'));
    localStorage.setItem('vh_blog_posts_v1', JSON.stringify(localPostsOnly));

    if (selectedPost) {
      const synchedSelected = updatedPosts.find(p => p.id === selectedPost.id);
      if (synchedSelected) {
        setSelectedPost(synchedSelected);
      }
    }
  };

  const handleLikeClick = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (auth.currentUser) {
      try {
        await toggleBlogLike(postId);
        // Reload fresh stats from database
        await fetchAndMergeAllPosts();
        return;
      } catch (err) {
        console.error("Failed to sync like with PostgreSQL:", err);
      }
    }

    const updated = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likes + 1
        };
      }
      return post;
    });
    savePostsState(updated);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    if (currentUser) {
      if (!commentContent) {
        showToast('Please fill out comment content.');
        return;
      }

      try {
        await submitBlogComment(selectedPost.id, commentContent);
        setCommentContent('');
        await fetchAndMergeAllPosts();
        return;
      } catch (err) {
        console.error("Failed to post comment to PostgreSQL:", err);
      }
    } else {
      showToast('Please sign in to post comments.');
      return;
    }

    if (!commentAuthor || !commentContent) {
      showToast('Please fill out both your name and comment content.');
      return;
    }

    const newComment: BlogComment = {
      id: 'com-' + Date.now(),
      author: commentAuthor,
      content: commentContent,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const updated = posts.map((post) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment] // Append at the end (chronological)
        };
      }
      return post;
    });

    savePostsState(updated);
    setCommentAuthor('');
    setCommentContent('');
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle || !newBlogContent || !newBlogSummary) {
      showToast('Please fill out all required fields.');
      return;
    }

    setIsSubmittingBlog(true);
    try {
      if (auth.currentUser) {
        await saveBlogPost({
          title: newBlogTitle,
          content: newBlogContent,
          summary: newBlogSummary,
          category: newBlogCategory,
          imageUrl: newBlogImageUrl,
        });
      } else {
        const authorName = guestAuthorName.trim() || 'Guest Fan';
        const customPost: BlogPost = {
          id: 'localpost-' + Date.now(),
          title: newBlogTitle,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          category: newBlogCategory,
          summary: newBlogSummary,
          content: newBlogContent,
          imageUrl: newBlogImageUrl,
          likes: 0,
          comments: [],
          readTime: `${Math.max(1, Math.ceil(newBlogContent.split(/\s+/).length / 200))} min read`,
          author: authorName,
        };
        const savedPosts = localStorage.getItem('vh_blog_posts_v1');
        let currentPostsList: BlogPost[] = [];
        if (savedPosts) {
          try {
            currentPostsList = JSON.parse(savedPosts);
          } catch (e) {
            currentPostsList = [...BLOG_POSTS];
          }
        } else {
          currentPostsList = [...BLOG_POSTS];
        }
        const updatedList = [customPost, ...currentPostsList];
        localStorage.setItem('vh_blog_posts_v1', JSON.stringify(updatedList));
      }

      setNewBlogTitle('');
      setNewBlogCategory('Fan Review');
      setNewBlogSummary('');
      setNewBlogContent('');
      setGuestAuthorName('');
      setNewBlogImageUrl('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600');
      setIsWriteModalOpen(false);
      
      await fetchAndMergeAllPosts();
      showToast('Your blog post has been saved successfully!');
    } catch (err: any) {
      console.error('Failed to save blog post:', err);
      showToast('Error saving blog post: ' + (err.message || err));
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening reader modal when clicking delete
    
    if (!confirm('Are you sure you want to delete this blog post permanently?')) {
      return;
    }

    try {
      if (postId.startsWith('dbpost-')) {
        await deleteBlogPost(postId);
      }

      // Filter out deleted post from local state
      const updatedList = posts.filter(p => p.id !== postId);
      savePostsState(updatedList);
      
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      
      showToast('Blog post deleted permanently.');
    } catch (err: any) {
      console.error('Failed to delete blog post:', err);
      showToast('Error deleting post: ' + (err.message || err));
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-[#BC6C25] dark:bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-mono text-xs tracking-wider uppercase font-bold animate-bounce">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0]" id="blog-section-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="blog-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">THE ECHO CHAMBER</span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight">Velvet Horizon Blogs</h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Studio technical guides, equipment reviews, live tours backstage journals, and Answers to guitar delays configurations written directly by us."
        </p>
      </div>

      {/* Action Bar / Share Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] shadow-xs" id="blog-action-bar">
        <div className="text-left space-y-1">
          <h2 className="font-serif font-bold text-lg text-[#3D3A35] dark:text-[#E2E8F0]">Have a story or review to share?</h2>
          <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8]">
            {auth.currentUser ? "Publish your own blog post directly to the Velvet Horizon feed!" : "Log in to post globally, or share a guest post locally."}
          </p>
        </div>
        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="px-6 py-3 rounded-full bg-[#BC6C25] hover:bg-[#A05C1E] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md hover:scale-[1.02] flex items-center space-x-2 cursor-pointer focus:outline-none"
          id="write-blog-trigger"
        >
          <span>+ Share Your Blog</span>
        </button>
      </div>

      {/* Write Blog Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" id="blog-write-modal">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D111C] border border-[#E5DED4] dark:border-[#1E2638] rounded-[24px] overflow-hidden shadow-xl flex flex-col text-left my-8">
            {/* Header close panel */}
            <div className="p-5 border-b border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between bg-[#F2ECE4]/20 dark:bg-[#111625]/30">
              <span className="font-mono text-[9px] font-bold px-3 py-1 rounded-full bg-[#BC6C25]/10 dark:bg-emerald-500/10 border border-[#BC6C25]/20 dark:border-emerald-500/20 text-[#BC6C25] dark:text-emerald-400 uppercase tracking-widest">
                SHARE NEW BLOG DISPATCH
              </span>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1 px-4 rounded-full border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#1D2535] bg-white dark:bg-[#111625] text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white text-xs font-mono font-bold tracking-widest uppercase cursor-pointer flex items-center space-x-1.5 focus:outline-none"
                id="blog-write-close"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleBlogSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto max-h-[80vh] bg-[#F9F6F2] dark:bg-[#0A0D14]" id="write-blog-form">
              <div className="space-y-1">
                <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Blog Title *</label>
                <input
                  type="text"
                  required
                  value={newBlogTitle}
                  onChange={(e) => setNewBlogTitle(e.target.value)}
                  placeholder="e.g. My Experience at the SF Show!"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none"
                />
              </div>

              {!currentUser && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Your Name / Author Name *</label>
                  <input
                    type="text"
                    required
                    value={guestAuthorName}
                    onChange={(e) => setGuestAuthorName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Category *</label>
                  <select
                    value={newBlogCategory}
                    onChange={(e) => setNewBlogCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none animate-none"
                  >
                    <option value="Fan Review">Fan Review</option>
                    <option value="Studio Diary">Studio Diary</option>
                    <option value="Gear & Guide">Gear & Guide</option>
                    <option value="On the Road">On the Road</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">
                    Cover Photo *
                  </label>
                  
                  {/* Drag and Drop Zone / Preview */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      dragActive
                        ? 'border-[#BC6C25] dark:border-emerald-500 bg-[#BC6C25]/5 dark:bg-emerald-500/5'
                        : 'border-[#E5DED4] dark:border-[#2A354F] hover:border-[#BC6C25] dark:hover:border-emerald-500/50 bg-white dark:bg-[#1C2335]'
                    }`}
                  >
                    <input
                      type="file"
                      id="blog-image-upload"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {newBlogImageUrl ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <div className="relative group w-full max-w-xs aspect-video rounded-xl overflow-hidden shadow-sm border border-[#E5DED4] dark:border-[#2A354F]">
                          <img
                            src={newBlogImageUrl}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <p className="text-white text-xs font-mono">Drag or click to replace</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-[#6B655C] dark:text-[#94A3B8] font-mono flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Image selected and ready!</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2 flex flex-col items-center">
                        <div className="p-3 rounded-full bg-[#BC6C25]/10 dark:bg-emerald-500/10 text-[#BC6C25] dark:text-emerald-400">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#3D3A35] dark:text-[#E2E8F0]">
                            Drag & drop cover photo here, or <span className="text-[#BC6C25] dark:text-emerald-400 underline decoration-dotted">browse</span>
                          </p>
                          <p className="text-[10px] text-[#6B655C] dark:text-[#94A3B8] font-mono">
                            Supports JPEG, PNG, GIF, WEBP (Max 4.5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-red-500 font-mono mt-1 font-semibold">⚠️ {uploadError}</p>
                  )}

                  {/* Cover Preset Option / Fallback Link */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase block font-bold">Or Select Preset Cover:</span>
                      <div className="flex gap-1.5 h-[34px]">
                        {[
                          { name: 'Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600' },
                          { name: 'Concert', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600' },
                          { name: 'Guitar', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600' },
                          { name: 'Synth', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600' },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setNewBlogImageUrl(preset.url);
                              setUploadError('');
                            }}
                            className={`flex-1 text-[9px] font-mono font-bold rounded-lg border uppercase transition-all duration-150 truncate cursor-pointer ${
                              newBlogImageUrl === preset.url
                                ? 'bg-[#BC6C25] dark:bg-emerald-600 text-white border-transparent'
                                : 'bg-white dark:bg-[#1C2335] text-[#6B655C] dark:text-[#94A3B8] border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4]'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase block font-bold">Or Enter Custom Image URL:</span>
                      <input
                        type="url"
                        value={newBlogImageUrl.startsWith('data:') ? '' : newBlogImageUrl}
                        onChange={(e) => {
                          if (e.target.value) {
                            setNewBlogImageUrl(e.target.value);
                            setUploadError('');
                          }
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-xs focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none h-[34px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Brief Summary *</label>
                  <span className="font-mono text-[9px] text-gray-400">{newBlogSummary.length}/150 chars</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={newBlogSummary}
                  onChange={(e) => setNewBlogSummary(e.target.value)}
                  placeholder="Summarize your blog post in a single sentence..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Narrative Content *</label>
                <textarea
                  required
                  rows={8}
                  value={newBlogContent}
                  onChange={(e) => setNewBlogContent(e.target.value)}
                  placeholder="Write your blog content here... Share your thoughts, setup configurations, show guides, or concert reviews!"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-white dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-sm focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none resize-none font-serif leading-relaxed"
                />
              </div>

              {!auth.currentUser && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                  <p className="font-serif text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 <strong>Posting as Guest:</strong> Since you are not signed in, this blog post will be saved in your local browser session. To publish globally for all Velvet Horizon fans, please log in!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingBlog}
                className={`w-full py-3.5 rounded-xl bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 font-mono text-xs font-bold text-white tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none shadow-sm ${
                  isSubmittingBlog ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              >
                {isSubmittingBlog ? (
                  <span>SAVING DISPATCH...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SAVE & PUBLISH DISPATCH</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Blogs list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blogs-grid">
        {posts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] hover:border-[#4A5D4E]/30 dark:hover:border-emerald-500/30 transition-all flex flex-col h-full overflow-hidden cursor-pointer shadow-sm"
            id={`blog-card-${post.id}`}
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#F2ECE4] dark:bg-[#151B2B] border-b border-[#E5DED4] dark:border-b-[#1E2638]">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500 brightness-95"
                referrerPolicy="no-referrer"
              />

              {/* Overlaid category widget */}
              <div className="absolute top-4 left-4 block">
                <span className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#BC6C25] dark:text-[#F59E0B] uppercase tracking-wider leading-none">
                  {post.category}
                </span>
              </div>

              {/* Overlaid Delete button to delete the post permanently */}
              <button
                onClick={(e) => handleDeletePost(post.id, e)}
                className="absolute top-4 right-4 p-2 rounded-full bg-red-500/90 hover:bg-red-600 text-white border border-red-400/20 shadow-md transition-all cursor-pointer hover:scale-110 flex items-center justify-center focus:outline-none z-10"
                title="Delete this blog post permanently"
                id={`blog-delete-btn-${post.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Post Summary details */}
            <div className="p-5 flex-grow flex flex-col justify-between text-left space-y-4">
              <div className="space-y-2">
                {/* Meta details */}
                <div className="flex items-center space-x-3 text-[10px] font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#6B655C] dark:text-[#94A3B8]" />
                    <span>{post.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#6B655C] dark:text-[#94A3B8]" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base leading-snug text-[#3D3A35] dark:text-[#E2E8F0] group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B] transition-colors">
                  {post.title}
                </h3>

                <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>

              {/* Footer row containing counters */}
              <div className="pt-3.5 border-t border-[#F0EBE3] dark:border-t-[#1E2638] flex items-center justify-between text-[11px] font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-[#6B655C] dark:text-[#94A3B8]" />
                  <span>By {post.author.split(' ')[0]}</span>
                </span>

                <div className="flex items-center space-x-3">
                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLikeClick(post.id, e)}
                    className="flex items-center space-x-1 hover:text-[#BC6C25] dark:hover:text-[#F59E0B] transition-colors cursor-pointer focus:outline-none"
                    id={`blog-like-btn-${post.id}`}
                  >
                    <Heart className="w-3.5 h-3.5 text-[#BC6C25] dark:text-[#F59E0B] fill-current" />
                    <span>{post.likes}</span>
                  </button>

                  <span className="flex items-center space-x-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#6B655C] dark:text-[#94A3B8]" />
                    <span>{post.comments.length}</span>
                  </span>

                  {/* Share button with popup */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveShareId(activeShareId === post.id ? null : post.id);
                      }}
                      className="flex items-center space-x-1 hover:text-[#BC6C25] dark:hover:text-[#F59E0B] text-[#6B655C] dark:text-[#94A3B8] transition-colors cursor-pointer focus:outline-none"
                      title="Share post"
                      id={`blog-share-btn-${post.id}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {activeShareId === post.id && (
                      <div className="absolute right-0 bottom-full mb-2 p-1.5 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl shadow-lg flex items-center space-x-1 z-20 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(post.title))}&url=${encodeURIComponent(getShareUrl(post.id))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#1DA1F2] transition-all"
                          title="Share on Twitter"
                        >
                          <Twitter className="w-3.5 h-3.5 fill-current" />
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(post.id))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#1877F2] transition-all"
                          title="Share on Facebook"
                        >
                          <Facebook className="w-3.5 h-3.5 fill-current" />
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(post.title) + ' ' + getShareUrl(post.id))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#25D366] transition-all"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(post.id, e)}
                          className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#BC6C25] dark:text-[#F59E0B] transition-all flex items-center justify-center min-w-[24px]"
                          title="Copy Link"
                        >
                          {copiedPostId === post.id ? (
                            <span className="text-[8px] font-bold font-mono text-emerald-600 dark:text-emerald-400">COPIED</span>
                          ) : (
                            <Link className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Blog Detail Fullscreen Overlay Reader */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" id="blog-reader-modal">
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#0D111C] border border-[#E5DED4] dark:border-[#1E2638] rounded-[24px] overflow-hidden shadow-xl flex flex-col text-left my-8">
            {/* Header close panel */}
            <div className="p-5 border-b border-[#E5DED4] dark:border-[#1E2638] flex items-center justify-between bg-[#F2ECE4]/20 dark:bg-[#111625]/30">
              <span className="font-mono text-[9px] font-bold px-3 py-1 rounded-full bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#BC6C25] dark:text-[#F59E0B] uppercase tracking-widest">
                {selectedPost.category}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => handleDeletePost(selectedPost.id, e)}
                  className="p-1 px-4 rounded-full border border-red-200 dark:border-red-950 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 text-xs font-mono font-bold tracking-widest uppercase cursor-pointer flex items-center space-x-1.5 focus:outline-none transition-all"
                  id="blog-reader-delete"
                  title="Delete this blog post permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 px-4 rounded-full border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#1D2535] bg-white dark:bg-[#111625] text-[#6B655C] dark:text-[#94A3B8] hover:text-[#3D3A35] dark:hover:text-white text-xs font-mono font-bold tracking-widest uppercase cursor-pointer flex items-center space-x-1.5 focus:outline-none"
                  id="blog-reader-close"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Content Drawer body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh] bg-[#F9F6F2] dark:bg-[#0A0D14]">
              {/* Cover visual banner */}
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-[#E5DED4] dark:border-[#1E2638]">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title Block */}
              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-xs font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold">
                  <span className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-[#BC6C25] dark:text-[#F59E0B]" />
                    <span className="text-[#3D3A35] dark:text-[#E2E8F0]">By {selectedPost.author}</span>
                  </span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>

                <h2 className="font-serif font-bold text-2xl md:text-3.5xl text-[#3D3A35] dark:text-[#E2E8F0] leading-tight tracking-tight">
                  {selectedPost.title}
                </h2>
                <div className="h-1 w-16 bg-[#BC6C25] dark:bg-[#F59E0B] rounded-full" />
              </div>

              {/* Core blog narrative content */}
              <div className="font-serif text-[#3D3A35] dark:text-[#CBD5E1] text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-wrap py-2 border-b border-[#E5DED4] dark:border-b-[#1E2638]">
                {selectedPost.content}
              </div>

              {/* Share Dispatch Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F2ECE4]/30 dark:bg-[#111625]/30 border border-[#E5DED4] dark:border-[#1E2638]">
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#3D3A35] dark:text-[#E2E8F0]">Share this dispatch</h4>
                  <p className="font-serif text-[10px] text-[#6B655C] dark:text-[#94A3B8]">Broadcast Julian & Chloe's dispatch to your preferred social channel.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText(selectedPost.title))}&url=${encodeURIComponent(getShareUrl(selectedPost.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] rounded-xl text-[#1DA1F2] transition-all flex items-center justify-center shadow-xs"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(selectedPost.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] rounded-xl text-[#1877F2] transition-all flex items-center justify-center shadow-xs"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText(selectedPost.title) + ' ' + getShareUrl(selectedPost.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] rounded-xl text-[#25D366] transition-all flex items-center justify-center shadow-xs"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedPost.id)}
                    className="px-3.5 py-2 bg-white dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] rounded-xl text-xs font-mono font-bold text-[#BC6C25] dark:text-[#F59E0B] transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer focus:outline-none"
                    title="Copy Link"
                  >
                    {copiedPostId === selectedPost.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px]">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-3.5 h-3.5" />
                        <span>COPY LINK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Like bar banner */}
              <div className="flex items-center justify-between pb-6 border-b border-[#E5DED4] dark:border-[#1E2638]">
                <div className="text-left">
                  <h4 className="font-serif font-bold text-[#3D3A35] dark:text-[#E2E8F0] text-sm">Show some support!</h4>
                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic">Click the heart to let Julian & Chloe know you liked this dispatch.</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLikeClick(selectedPost.id)}
                  id="reader-like-increment-btn"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#BC6C25]/10 dark:bg-[#F59E0B]/10 border border-[#BC6C25]/20 dark:border-[#F59E0B]/20 text-xs font-mono font-bold text-[#BC6C25] dark:text-[#F59E0B] hover:bg-[#BC6C25]/20 dark:hover:bg-[#F59E0B]/20 transition-all cursor-pointer focus:outline-none"
                >
                  <Heart className="w-4 h-4 fill-current text-[#BC6C25] dark:text-[#F59E0B]" />
                  <span>{selectedPost.likes} LIKES</span>
                </button>
              </div>

              {/* Interactivity: Fans Comments Area */}
              <div className="space-y-6" id="blog-comments-area">
                <div className="flex items-center space-x-2.5 text-[#3D3A35] dark:text-[#E2E8F0] font-serif">
                  <MessageSquare className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B]" />
                  <h3 className="font-bold text-base">
                    Fan Dialogue ({selectedPost.comments.length})
                  </h3>
                </div>

                {/* Comment composer form */}
                {currentUser ? (
                  <form onSubmit={handleCommentSubmit} className="p-4 rounded-[20px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] text-left space-y-4" id="comment-form">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] font-bold uppercase tracking-widest block">JOIN THE DISCUSSION</span>
                      <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest block">Logged in as {currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">Inquiry / Thoughts</label>
                      <textarea
                        required
                        rows={3}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="What are your thoughts on this writeup?"
                        id="comment-content-input"
                        className="w-full px-4 py-2 rounded-xl border border-[#E5DED4] dark:border-[#2A354F] bg-[#F9F6F2] dark:bg-[#1C2335] text-[#3D3A35] dark:text-[#E2E8F0] text-xs focus:border-[#BC6C25] dark:focus:border-[#F59E0B]/50 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 font-mono text-[10px] font-bold text-white tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 cursor-pointer ml-auto focus:outline-none shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>POST COMMENT</span>
                    </button>
                  </form>
                ) : (
                  <div className="p-6 rounded-[20px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625]/60 text-center space-y-3" id="comment-login-prompt">
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed">
                      💬 Only signed-in Velvet Horizon fans can join the dialogue. Please log in to post your thoughts on this entry!
                    </p>
                    {setCurrentTab && (
                      <button
                        onClick={() => {
                          setSelectedPost(null);
                          setCurrentTab('login');
                        }}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-[#BC6C25] text-[#BC6C25] hover:bg-[#BC6C25] hover:text-white dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white transition-all font-mono text-[10px] font-bold uppercase cursor-pointer"
                      >
                        <span>SIGN IN / REGISTER</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Listing of comments */}
                <div className="space-y-3.5" id="comments-list-wrapper">
                  {selectedPost.comments.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[#E5DED4] dark:border-[#1E2638] rounded-xl bg-white dark:bg-[#111625]">
                      <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] italic">No dialogues posted yet. Be the first to share your perspective!</p>
                    </div>
                  ) : (
                    selectedPost.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-xl border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625]/60 text-left space-y-1.5"
                        id={`comment-box-${comment.id}`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold">
                          <span className="text-[#3D3A35] dark:text-[#E2E8F0]">{comment.author}</span>
                          <span>{comment.date}</span>
                        </div>
                        <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
