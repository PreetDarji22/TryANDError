import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bold, Italic, Code, List, ListOrdered, X, Image as ImageIcon, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AskQuestion() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['react']);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (clean && !tags.includes(clean) && tags.length < 5) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Image Upload helper
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(formData);
      const imageTag = `<img src="${res.url}" alt="Uploaded Image" class="max-w-full h-auto rounded my-2" />`;
      setDescription(prev => prev + '\n' + imageTag);
    } catch (err) {
      alert(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Question
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }

    if (tags.length === 0) {
      setError('At least one relevant tag is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createQuestion({
        title: title.trim(),
        description: description.trim(),
        tags,
      });

      navigate(`/questions/${res.question.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-[#0f172a] mb-8">Ask a public question</h1>
      
      {error && (
        <div className="mb-6 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Title Box */}
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-2xs">
            <h2 className="text-base font-semibold text-[#0f172a]">Title</h2>
            <p className="text-xs text-[#475569] mb-3">Be specific and imagine you're asking a question to another person.</p>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to handle JWT authentication refresh tokens in React & Express?" 
              required
            />
          </div>
          
          {/* Details Box */}
          <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-2xs overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#0f172a]">Details of your problem</h2>
              <p className="text-xs text-[#475569]">Introduce the problem and expand on what you put in the title. Mention users with @username.</p>
            </div>
            
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center px-4 py-2 gap-2">
              <button 
                type="button" 
                onClick={() => setDescription(prev => prev + '<strong>Bold</strong>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setDescription(prev => prev + '<em>Italic</em>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-[#cbd5e1] mx-1"></div>
              <button 
                type="button" 
                onClick={() => setDescription(prev => prev + '<pre><code>// Code snippet</code></pre>')}
                className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"
                title="Code block"
              >
                <Code className="h-4 w-4" />
              </button>
              
              <label className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors cursor-pointer" title="Upload Image">
                <ImageIcon className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {uploadingImage && <span className="text-xs text-[#3b49df]">Uploading image...</span>}
            </div>
            
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[250px] p-4 text-sm focus:outline-none resize-y" 
              placeholder="Write your question here... (HTML or markdown formatting supported)"
              required
            ></textarea>
          </div>
          
          {/* Tags Box */}
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-2xs">
            <h2 className="text-base font-semibold text-[#0f172a]">Tags</h2>
            <p className="text-xs text-[#475569] mb-3">Add up to 5 tags (press Enter or comma after typing tag name).</p>
            <div className="flex items-center flex-wrap gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 py-2 min-h-10 focus-within:ring-2 focus-within:ring-[#3b49df]/20 focus-within:border-[#3b49df]">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb] border border-[#bfdbfe]">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:bg-[#dbeafe] rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 min-w-[150px] text-xs focus:outline-none placeholder:text-[#94a3b8]" 
                  placeholder={tags.length === 0 ? "Type tag name and press Enter (e.g. react)" : "Add more tags..."} 
                />
              )}
            </div>
          </div>
          
          <Button type="submit" variant="primary" disabled={submitting} className="flex items-center gap-2">
            <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Post Your Question'}
          </Button>
        </div>
        
        {/* Right sidebar tips */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] shadow-2xs">
            <div className="border-b border-[#e2e8f0] px-4 py-3 bg-[#f1f5f9] rounded-t-lg">
              <h3 className="font-semibold text-[#0f172a] text-sm">Drafting Tips</h3>
            </div>
            <div className="p-4 text-xs text-[#334155]">
              <ul className="list-disc pl-4 space-y-2.5">
                <li>Summarize your problem in a clear, concise title.</li>
                <li>Describe what you tried and what you expected to happen.</li>
                <li>Include code snippets or error output when relevant.</li>
                <li>Tag your question with relevant technology names.</li>
                <li>Use <code>@username</code> to mention specific community members.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
