import { useState, useEffect } from 'react';
import { Heart, Handshake, ShieldAlert, Bookmark, Send, Plus, MessageSquare, User } from 'lucide-react';
import { Post, UserProfile } from '../types';
import UserProfileModal from './UserProfileModal';

export default function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [savedIdeas, setSavedIdeas] = useState<number[]>([]);
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'subscriptions'>('all');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    const res = await fetch(`/api/feed?filter=${filter}`);
    setPosts(await res.json());
  };

  const fetchProfile = async (userId: number) => {
    const res = await fetch(`/api/users/${userId}/profile`);
    if (res.ok) {
      setSelectedProfile(await res.json());
    }
  };

  const handleToggleSubscribe = async (userId: number) => {
    const res = await fetch(`/api/users/${userId}/subscribe`, { method: 'POST' });
    if (res.ok) {
      if (selectedProfile && selectedProfile.id === userId) {
        fetchProfile(userId);
      }
      fetchPosts();
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newPost })
    });
    setNewPost('');
    fetchPosts();
  };

  const handleComment = async (postId: number) => {
    if (!newComment.trim()) return;
    await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    });
    setNewComment('');
    setCommentingPostId(null);
    fetchPosts();
  };

  const handleReaction = async (postId: number, type: string) => {
    await fetch(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    fetchPosts();
  };

  const toggleSave = (id: number) => {
    setSavedIdeas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Пульс Vibe</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('subscriptions')}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${filter === 'subscriptions' ? 'bg-[#5A5A40] text-white border-[#5A5A40]' : 'bg-white border-black/5 text-black/60 hover:border-[#5A5A40]'}`}
          >
            Мои подписки
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${filter === 'all' ? 'bg-[#5A5A40] text-white border-[#5A5A40]' : 'bg-white border-black/5 text-black/60 hover:border-[#5A5A40]'}`}
          >
            Все посты
          </button>
        </div>
      </div>

      {/* Create Post */}
      <div className="bg-white dark:bg-[#151619] p-6 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 space-y-4">
        <textarea 
          className="w-full p-4 rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border-none focus:ring-2 focus:ring-[#5A5A40] resize-none h-32 text-sm text-black dark:text-white"
          placeholder="Поделись своими мыслями или сделкой..."
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-[#5A5A40] transition-colors">
              <Plus size={20} />
            </button>
          </div>
          <button 
            onClick={handlePost}
            className="flex items-center gap-2 px-6 py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-bold hover:bg-[#4A4A30] transition-colors"
          >
            <Send size={16} />
            Опубликовать
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-[#151619] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/10 space-y-6">
            <div className="flex justify-between items-start">
              <div 
                className="flex items-center gap-3 cursor-pointer group/user"
                onClick={() => fetchProfile(post.user_id)}
              >
                <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 flex items-center justify-center font-bold text-[#5A5A40] group-hover/user:bg-[#5A5A40] group-hover/user:text-white transition-all">
                  {post.username[0]}
                </div>
                <div>
                  <p className="font-bold group-hover/user:text-[#5A5A40] transition-colors">{post.username}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{new Date(post.created_at).toLocaleString('ru-RU')}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSave(post.id)}
                className={`p-2 rounded-xl transition-colors ${savedIdeas.includes(post.id) ? 'bg-[#5A5A40] text-white' : 'bg-[#F5F5F0] dark:bg-white/5 text-black/40 dark:text-white/40'}`}
              >
                <Bookmark size={20} fill={savedIdeas.includes(post.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="text-[#1A1A1A] dark:text-white/90 leading-relaxed">
              {post.content}
            </div>

            {post.is_trade_share && (
              <div className="bg-[#F5F5F0] dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-lg">😌</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-black/40 dark:text-white/40">Реальная сделка</p>
                    <p className="font-medium text-sm">Купил GAZP по ₽124.5</p>
                  </div>
                </div>
                <div className="text-emerald-600 font-mono font-bold text-sm">+2.4%</div>
              </div>
            )}

            <div className="flex items-center gap-6 pt-4 border-t border-black/5 dark:border-white/10">
              <button 
                onClick={() => handleReaction(post.id, 'like')}
                className={`flex items-center gap-2 transition-colors group ${post.reactions?.find(r => r.type === 'like')?.user_reacted ? 'text-rose-500' : 'text-black/40 dark:text-white/40 hover:text-rose-500'}`}
              >
                <div className={`p-2 rounded-xl ${post.reactions?.find(r => r.type === 'like')?.user_reacted ? 'bg-rose-50' : 'bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-rose-50'}`}>
                  <Heart size={18} fill={post.reactions?.find(r => r.type === 'like')?.user_reacted ? 'currentColor' : 'none'} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase">Классно</span>
                  <span className="text-[10px] font-mono">{post.reactions?.find(r => r.type === 'like')?.count || 0}</span>
                </div>
              </button>

              <button 
                onClick={() => handleReaction(post.id, 'handshake')}
                className={`flex items-center gap-2 transition-colors group ${post.reactions?.find(r => r.type === 'handshake')?.user_reacted ? 'text-amber-600' : 'text-black/40 dark:text-white/40 hover:text-amber-600'}`}
              >
                <div className={`p-2 rounded-xl ${post.reactions?.find(r => r.type === 'handshake')?.user_reacted ? 'bg-amber-50' : 'bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-amber-50'}`}>
                  <Handshake size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase">Пожатие</span>
                  <span className="text-[10px] font-mono">{post.reactions?.find(r => r.type === 'handshake')?.count || 0}</span>
                </div>
              </button>

              <button 
                onClick={() => handleReaction(post.id, 'horror')}
                className={`flex items-center gap-2 transition-colors group ${post.reactions?.find(r => r.type === 'horror')?.user_reacted ? 'text-indigo-600' : 'text-black/40 dark:text-white/40 hover:text-indigo-600'}`}
              >
                <div className={`p-2 rounded-xl ${post.reactions?.find(r => r.type === 'horror')?.user_reacted ? 'bg-indigo-50' : 'bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-indigo-50'}`}>
                  <ShieldAlert size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase">Ужас</span>
                  <span className="text-[10px] font-mono">{post.reactions?.find(r => r.type === 'horror')?.count || 0}</span>
                </div>
              </button>

              <button 
                onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                className="flex items-center gap-2 text-black/40 dark:text-white/40 hover:text-[#5A5A40] transition-colors group ml-auto"
              >
                <div className="p-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-[#5A5A40]/5">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[10px] font-bold uppercase">Обсудить</span>
              </button>
            </div>

            {/* Comments Section */}
            {(post.comments && post.comments.length > 0 || commentingPostId === post.id) && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-4">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center font-bold text-[#5A5A40] text-xs shrink-0">
                      {comment.username[0]}
                    </div>
                    <div className="bg-[#F5F5F0] dark:bg-white/5 p-3 rounded-2xl flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold">{comment.username}</span>
                        <span className="text-[10px] text-black/40 dark:text-white/40">{new Date(comment.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-black/80 dark:text-white/80">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {commentingPostId === post.id && (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      className="flex-1 px-4 py-2 rounded-xl bg-[#F5F5F0] dark:bg-white/5 border-none focus:ring-2 focus:ring-[#5A5A40] text-sm text-black dark:text-white"
                      placeholder="Напиши комментарий..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                    />
                    <button 
                      onClick={() => handleComment(post.id)}
                      className="p-2 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4A4A30] transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-black/40 italic">
            {filter === 'subscriptions' ? 'Вы пока ни на кого не подписаны или в ленте подписок нет постов.' : 'Лента пока пуста. Будь первым, кто поделится мыслями!'}
          </div>
        )}
      </div>

      {selectedProfile && (
        <UserProfileModal 
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onToggleSubscribe={() => handleToggleSubscribe(selectedProfile.id)}
          onPostAction={fetchPosts}
        />
      )}
    </div>
  );
}
