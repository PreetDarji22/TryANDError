import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tag } from '../components/ui/Tag';
import { Bold, Italic, Link, Code, List, ListOrdered, X } from 'lucide-react';

export default function AskQuestion() {
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-[#0f172a] mb-8">Ask a public question</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#0f172a]">Title</h2>
            <p className="text-sm text-[#475569] mb-4">Be specific and imagine you're asking a question to another person.</p>
            <Input placeholder="e.g. Is there an R function for finding the index of an element in a vector?" />
          </div>
          
          <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#0f172a]">What are the details of your problem?</h2>
              <p className="text-sm text-[#475569]">Introduce the problem and expand on what you put in the title. Minimum 20 characters.</p>
            </div>
            
            <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center px-4 py-2 gap-2">
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Bold className="h-4 w-4" /></button>
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Italic className="h-4 w-4" /></button>
              <div className="w-px h-5 bg-[#cbd5e1] mx-1"></div>
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Link className="h-4 w-4" /></button>
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Code className="h-4 w-4" /></button>
              <div className="w-px h-5 bg-[#cbd5e1] mx-1"></div>
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><List className="h-4 w-4" /></button>
              <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><ListOrdered className="h-4 w-4" /></button>
            </div>
            
            <textarea 
              className="w-full min-h-[250px] p-4 text-sm focus:outline-none resize-y" 
              placeholder="Write your question here..."
            ></textarea>
          </div>
          
          <div className="rounded-lg border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#0f172a]">Tags</h2>
            <p className="text-sm text-[#475569] mb-4">Add up to 5 tags to describe what your question is about. Start typing to see suggestions.</p>
            <div className="flex items-center flex-wrap gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 py-2 min-h-10 focus-within:ring-2 focus-within:ring-[#3b49df]/20 focus-within:border-[#3b49df]">
              <span className="inline-flex items-center gap-1 rounded bg-[#eff6ff] px-2 py-1 text-xs font-medium text-[#2563eb] border border-[#bfdbfe]">
                javascript
                <button className="hover:bg-[#dbeafe] rounded-full p-0.5"><X className="h-3 w-3" /></button>
              </span>
              <input type="text" className="flex-1 min-w-[150px] text-sm focus:outline-none placeholder:text-[#94a3b8]" placeholder="e.g. (javascript html css)" />
            </div>
          </div>
          
          <Button variant="primary">Review your question</Button>
        </div>
        
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] shadow-sm">
            <div className="border-b border-[#e2e8f0] px-4 py-3 bg-[#f1f5f9] rounded-t-lg">
              <h3 className="font-semibold text-[#0f172a]">Drafting Tips</h3>
            </div>
            <div className="p-4 text-sm text-[#334155]">
              <ul className="list-disc pl-5 space-y-3">
                <li>Summarize your problem in a one-line title.</li>
                <li>Describe your problem in more detail.</li>
                <li>Describe what you tried and what you expected to happen.</li>
                <li>Add "tags" which help surface your question to members of the community.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
