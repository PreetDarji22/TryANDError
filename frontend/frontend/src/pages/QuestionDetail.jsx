import React from 'react';
import { Tag } from '../components/ui/Tag';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ChevronUp, ChevronDown, Bookmark, Check, Bold, Italic, Link as LinkIcon, Code, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuestionDetail() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 pb-6 border-b border-[#e2e8f0]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-3 leading-snug">
          How to properly implement a Custom Element with Shadow DOM?
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569]">
          <div><span className="text-[#64748b] mr-1">Asked</span> today</div>
          <div><span className="text-[#64748b] mr-1">Modified</span> today</div>
          <div><span className="text-[#64748b] mr-1">Viewed</span> 42 times</div>
        </div>
      </div>

      {/* Question */}
      <div className="flex gap-4 mb-8">
        <div className="flex flex-col items-center gap-2 w-12 shrink-0">
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronUp className="h-8 w-8" /></button>
          <div className="text-xl font-bold text-[#0f172a]">15</div>
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronDown className="h-8 w-8" /></button>
          <button className="text-[#94a3b8] hover:text-[#3b49df] mt-2"><Bookmark className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm">
          <div className="prose prose-sm sm:prose-base max-w-none text-[#334155]">
            <p>I am trying to create a reusable custom element for my web application using standard Web Components APIs. Specifically, I want to encapsulate the styles so they don't leak out, and prevent global styles from leaking in.</p>
            <p>Here is what I have so far:</p>
            <pre className="bg-[#f8fafc] p-4 rounded-md overflow-x-auto border border-[#e2e8f0] text-[13px] text-[#0f172a]"><code>{`class MyComponent extends HTMLElement {
  constructor() {
    super();
    // I think I need to attach shadow DOM here?
  }

  connectedCallback() {
    this.innerHTML = '<div class="wrapper">Hello World</div>';
  }
}
customElements.define('my-component', MyComponent);`}</code></pre>
            <p>When I do this, standard CSS classes from my main stylesheet still affect the <code>.wrapper</code> div. What is the correct pattern to use <code>attachShadow</code> and encapsulate the template?</p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Tag>javascript</Tag>
            <Tag>html</Tag>
            <Tag>web-components</Tag>
            <Tag>shadow-dom</Tag>
          </div>
          
          <div className="mt-6 flex justify-end">
            <div className="bg-[#f8fafc] rounded p-3 flex flex-col gap-1 text-xs border border-[#e2e8f0]">
              <div className="text-[#64748b]">asked Oct 24 at 10:30</div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="dev_asker" className="h-8 w-8 rounded" />
                <span className="font-medium text-[#2563eb]">dev_asker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0f172a]">2 Answers</h2>
        <div className="text-sm text-[#475569]">
          Highest score (default)
        </div>
      </div>

      {/* Answer 1 (Accepted) */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col items-center gap-2 w-12 shrink-0">
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronUp className="h-8 w-8" /></button>
          <div className="text-xl font-bold text-[#0f172a]">42</div>
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronDown className="h-8 w-8" /></button>
          <div className="text-[#10b981] mt-2"><Check className="h-8 w-8" strokeWidth={3} /></div>
        </div>
        <div className="flex-1 min-w-0 bg-white rounded-lg border-2 border-[#10b981]/40 p-6 shadow-sm relative">
          <div className="absolute top-0 right-0 bg-[#d1fae5] text-[#065f46] text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr flex items-center gap-1 border-b border-l border-[#10b981]/40">
            <Check className="h-3.5 w-3.5" /> Accepted
          </div>
          
          <div className="prose prose-sm sm:prose-base max-w-none text-[#334155] mt-2">
            <p>To encapsulate your component using Shadow DOM, you need to call <code>this.attachShadow(&#123; mode: 'open' &#125;)</code> inside your constructor, and then append your content to the resulting <code>shadowRoot</code>.</p>
            <p>Here is the corrected implementation:</p>
            <pre className="bg-[#f8fafc] p-4 rounded-md overflow-x-auto border border-[#e2e8f0] text-[13px] text-[#0f172a]"><code>{`class MyComponent extends HTMLElement {
  constructor() {
    super();
    // Create the shadow root
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Append styles and structure to the shadowRoot, not the element itself
    this.shadowRoot.innerHTML = \`
      <style>
        .wrapper {
          color: blue;
          padding: 10px;
          border: 1px solid #ccc;
        }
      </style>
      <div class="wrapper">Hello Encapsulated World</div>
    \`;
  }
}
customElements.define('my-component', MyComponent);`}</code></pre>
            <p>By doing this, any global styles targeting <code>.wrapper</code> will <strong>not</strong> affect the div inside your component, and the <code>color: blue</code> rule will <strong>not</strong> bleed out to other elements on your page.</p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <div className="bg-[#f8fafc] rounded p-3 flex flex-col gap-1 text-xs border border-[#e2e8f0]">
              <div className="text-[#64748b]">answered Oct 24 at 11:15</div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="sarah_codes" className="h-8 w-8 rounded" />
                <span className="font-medium text-[#2563eb]">sarah_codes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer 2 */}
      <div className="flex gap-4 mb-10">
        <div className="flex flex-col items-center gap-2 w-12 shrink-0">
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronUp className="h-8 w-8" /></button>
          <div className="text-xl font-bold text-[#0f172a]">8</div>
          <button className="text-[#94a3b8] hover:text-[#3b49df]"><ChevronDown className="h-8 w-8" /></button>
        </div>
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm">
          <div className="prose prose-sm sm:prose-base max-w-none text-[#334155]">
            <p>While <code>innerHTML</code> works fine for simple components, if you are building something more complex, you should look into using the <code>&lt;template&gt;</code> tag.</p>
            <p>It's generally more performant because the browser parses the template once, and you can just clone the node when your component connects.</p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <div className="bg-[#f8fafc] rounded p-3 flex flex-col gap-1 text-xs border border-[#e2e8f0]">
              <div className="text-[#64748b]">answered Oct 24 at 12:40</div>
              <div className="flex items-center gap-2 mt-1">
                <Avatar src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" alt="template_master" className="h-8 w-8 rounded" />
                <span className="font-medium text-[#2563eb]">template_master</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Answer */}
      <div className="pt-6 border-t border-[#e2e8f0]">
        <h2 className="text-xl font-bold text-[#0f172a] mb-4">Your Answer</h2>
        <div className="rounded-lg border border-[#e2e8f0] bg-white shadow-sm overflow-hidden flex flex-col mb-4">
          <div className="bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center px-4 py-2 gap-2">
            <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Bold className="h-4 w-4" /></button>
            <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Italic className="h-4 w-4" /></button>
            <div className="w-px h-5 bg-[#cbd5e1] mx-1"></div>
            <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><LinkIcon className="h-4 w-4" /></button>
            <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><Code className="h-4 w-4" /></button>
            <button className="p-1.5 text-[#475569] hover:bg-[#e2e8f0] rounded transition-colors"><ImageIcon className="h-4 w-4" /></button>
          </div>
          <textarea 
            className="w-full min-h-[250px] p-4 text-sm focus:outline-none resize-y" 
            placeholder="Write your detailed answer here..."
          ></textarea>
        </div>
        <Button variant="primary">Post Your Answer</Button>
      </div>
    </div>
  );
}
