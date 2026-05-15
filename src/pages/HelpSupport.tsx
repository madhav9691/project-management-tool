import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Search, ExternalLink, FileText, Users, FolderKanban, BarChart3, Shield, CheckCircle2 } from 'lucide-react';


const faqs = [
  { q: 'How do I create a new project?', a: 'Go to Projects tab → Click "New Project" → Fill all required fields → Click "Create Project". The project will be saved and appear in the projects list.' },
  { q: 'How do I assign tasks to team members?', a: 'Go to Tasks & Tickets → Click "Create Task" → Select the project → Choose the team member from "Assigned To" dropdown → Fill task details → Save.' },
  { q: 'Why can I only see some projects?', a: 'Resources (Developers/QA) only see projects they are assigned to. Project Managers and above can see all projects. Contact your PM to be assigned to a project.' },
  { q: 'How do I update my task status?', a: 'Go to Tasks & Tickets → Find your task → Use the status dropdown directly on the task card to change from Open → In Progress → QA → Completed.' },
  { q: 'How do I change my password?', a: 'Click your profile avatar (top-right) → Account Settings → Change Password tab → Enter current password → Enter new password → Confirm → Save.' },
  { q: 'How do I export data?', a: 'Go to Admin Settings → Data Management tab → Click "Export Full Backup". This downloads a JSON file with all your data.' },
  { q: 'How do weekly meetings work?', a: 'Go to Weekly Meetings → Click "New Meeting" → All active projects are auto-populated → Fill in last week summary, this week progress, next week targets → Add resource availability and achievements → Save.' },
  { q: 'What do the occupancy colors mean?', a: 'Green (0-49%) = Available, Yellow (50-89%) = Busy, Red (90-100%) = Fully Occupied. You can adjust occupancy in the Resources tab.' },
  { q: 'How do milestones work?', a: 'Milestones are divided into Sales (payments) and Operational (deliveries). Go to Milestones → Add Milestone → Choose category → Fill details. Project-wise view shows both side by side.' },
  { q: 'Who can delete projects?', a: 'Only Super Admin, Management, and Project Managers can create, edit, or delete projects. Other roles have view-only access.' },
];

const modules = [
  { name: 'Dashboard', desc: 'Executive overview with stats, charts, and alerts', icon: BarChart3 },
  { name: 'Projects', desc: 'Create, manage, and track running/dedicated/maintenance projects', icon: FolderKanban },
  { name: 'Tasks & Tickets', desc: 'Kanban board, project-wise and resource-wise task management', icon: FileText },
  { name: 'Resources', desc: 'Team occupancy tracking, skills, and availability management', icon: Users },
  { name: 'Weekly Meetings', desc: 'Wednesday board meeting reports with project status and achievements', icon: Book },
  { name: 'Milestones', desc: 'Sales and operational milestone tracking with payment status', icon: CheckCircle2 },
  { name: 'Reports', desc: 'Live reports: overview, projects, tasks, resources, collections, delayed', icon: BarChart3 },
  { name: 'Admin Settings', desc: 'User management, roles, system info, and data management', icon: Shield },
];

export const HelpSupport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div><h1 className="text-2xl font-bold text-gray-900">Help & Support</h1><p className="text-gray-500 mt-1">Guides, FAQ, and contact information</p></div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center">
          <Book className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">User Guide</h3>
          <p className="text-sm text-blue-700 mt-1">Step-by-step instructions for all features</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-5 rounded-xl text-center">
          <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Contact Support</h3>
          <p className="text-sm text-green-700 mt-1">Reach out to the development team</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl text-center">
          <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">FAQ</h3>
          <p className="text-sm text-purple-700 mt-1">Frequently asked questions</p>
        </div>
      </div>

      {/* Module Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Book className="w-5 h-5" /> Module Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map(m => { const I = m.icon; return (
            <div key={m.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0"><I className="w-4 h-4 text-blue-600" /></div>
              <div><p className="font-medium text-gray-900 text-sm">{m.name}</p><p className="text-xs text-gray-500">{m.desc}</p></div>
            </div>
          ); })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Frequently Asked Questions</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search FAQs..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="space-y-2">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedFaq(isOpen ? null : idx)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                  <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                {isOpen && <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-200 pt-3">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Contact Support</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
            <div><p className="text-sm font-medium text-gray-900">Email Support</p><p className="text-sm text-blue-600">Madhavarao@krify.com</p></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
            <div><p className="text-sm font-medium text-gray-900">Phone Support</p><p className="text-sm text-green-600">+91 9966589691</p></div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700"><strong>Office:</strong> Krify Software Technologies, Andhra Pradesh, India</p>
          <p className="text-sm text-blue-700 mt-1"><strong>Website:</strong> <a href="https://krify.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">krify.com <ExternalLink className="w-3 h-3" /></a></p>
        </div>
      </div>

      {/* Version */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>Krify Project Management Portal v1.0.0 (Pilot)</p>
        <p>Built with React + TypeScript + Tailwind CSS</p>
        <p>© {new Date().getFullYear()} Krify Software Technologies. All rights reserved.</p>
      </div>
    </div>
  );
};
