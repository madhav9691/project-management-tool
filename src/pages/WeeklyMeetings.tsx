import React, { useState, useEffect } from 'react';
import { mockWeeklyMeetings } from '../data/mockData';
import { getProjectsFromStorage, getMeetingsFromStorage, saveMeetingsToStorage, getResourcesFromStorage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import type { WeeklyMeeting, ProjectWeeklyStatus, Project, Resource, ResourceAvailabilityEntry, AchievementEntry, WeeklyAchievements } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';
import { Calendar, Plus, Download, ChevronRight, ChevronDown, AlertCircle, CheckCircle2, TrendingUp, X, Save, Users, Eye, Edit2, Trash2, BarChart3, DollarSign, Rocket, Award, UserCheck } from 'lucide-react';

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const emptyAchievements = (): WeeklyAchievements => ({
  projectFundsReceived: [], amcFundsReceived: [], projectsGoLive: [], otherAchievements: []
});

export const WeeklyMeetings: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<WeeklyMeeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<WeeklyMeeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<WeeklyMeeting | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'resources' | 'achievements'>('projects');

  // Form state
  const [fDate, setFDate] = useState('');
  const [fNotes, setFNotes] = useState('');
  const [fStatuses, setFStatuses] = useState<ProjectWeeklyStatus[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [fResAvail, setFResAvail] = useState<ResourceAvailabilityEntry[]>([]);
  const [fAchievements, setFAchievements] = useState<WeeklyAchievements>(emptyAchievements());

  useEffect(() => {
    const sm = getMeetingsFromStorage();
    setMeetings(sm.length > 0 ? sm : (() => { saveMeetingsToStorage(mockWeeklyMeetings); return mockWeeklyMeetings; })());
    setProjects(getProjectsFromStorage());
    setResources(getResourcesFromStorage());
  }, []);

  const persist = (u: WeeklyMeeting[]) => { setMeetings(u); saveMeetingsToStorage(u); };
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'On Hold');

  const initForm = (m?: WeeklyMeeting | null) => {
    if (m) {
      setFDate(m.meetingDate ? formatDate(m.meetingDate, 'yyyy-MM-dd') : '');
      setFNotes(m.meetingNotes || '');
      setFStatuses(m.projectStatuses || []);
      setSelectedProjects(m.projectStatuses.map(ps => ps.projectId));
      setFResAvail(m.resourceAvailability || resources.map(r => ({ resourceName: r.name, department: r.department, occupancy: r.occupancyPercentage, currentProject: r.currentProjects?.[0] || '', availableHours: Math.round((r.availability || 40) * (100 - r.occupancyPercentage) / 100), notes: '' })));
      setFAchievements(m.lastWeekAchievements || emptyAchievements());
    } else {
      setFDate(formatDate(new Date(), 'yyyy-MM-dd'));
      setFNotes('');
      const autoSt: ProjectWeeklyStatus[] = activeProjects.map(p => ({
        projectId: p.id, projectName: p.projectName,
        lastWeekSummary: '', currentWeekProgress: p.currentWeekUpdates || '',
        nextWeekTargets: p.nextWeekTarget || '', risks: p.risks || [],
        escalations: p.escalations || [], collectionsStatus: '', demoStatus: '', liveStatus: '',
        completionPercentage: p.completionPercentage || 0
      }));
      setFStatuses(autoSt);
      setSelectedProjects(activeProjects.map(p => p.id));
      setFResAvail(resources.map(r => ({ resourceName: r.name, department: r.department, occupancy: r.occupancyPercentage, currentProject: r.currentProjects?.[0] || '', availableHours: Math.round((r.availability || 40) * (100 - r.occupancyPercentage) / 100), notes: '' })));
      setFAchievements(emptyAchievements());
    }
    setActiveTab('projects');
  };

  const openNewForm = () => { setEditingMeeting(null); initForm(null); setShowForm(true); };
  const openEditForm = (m: WeeklyMeeting) => { setEditingMeeting(m); initForm(m); setShowForm(true); };

  const handleToggleProject = (pid: string) => {
    if (selectedProjects.includes(pid)) {
      setSelectedProjects(p => p.filter(id => id !== pid));
      setFStatuses(p => p.filter(s => s.projectId !== pid));
    } else {
      setSelectedProjects(p => [...p, pid]);
      const proj = projects.find(p => p.id === pid);
      if (proj) setFStatuses(p => [...p, { projectId: proj.id, projectName: proj.projectName, lastWeekSummary: '', currentWeekProgress: proj.currentWeekUpdates || '', nextWeekTargets: proj.nextWeekTarget || '', risks: proj.risks || [], escalations: proj.escalations || [], collectionsStatus: '', demoStatus: '', liveStatus: '', completionPercentage: proj.completionPercentage || 0 }]);
    }
  };

  const updateStatus = (pid: string, field: string, value: any) => setFStatuses(p => p.map(s => s.projectId === pid ? { ...s, [field]: value } : s));
  const updateResAvail = (idx: number, field: string, value: any) => setFResAvail(p => p.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  // Achievement helpers
  const addFundEntry = (type: 'projectFundsReceived' | 'amcFundsReceived' | 'projectsGoLive') => {
    setFAchievements(p => ({ ...p, [type]: [...p[type], { projectName: '', amount: 0, notes: '' }] }));
  };
  const updateFundEntry = (type: 'projectFundsReceived' | 'amcFundsReceived' | 'projectsGoLive', idx: number, field: string, value: any) => {
    setFAchievements(p => ({ ...p, [type]: p[type].map((e, i) => i === idx ? { ...e, [field]: value } : e) }));
  };
  const removeFundEntry = (type: 'projectFundsReceived' | 'amcFundsReceived' | 'projectsGoLive', idx: number) => {
    setFAchievements(p => ({ ...p, [type]: p[type].filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if (!fDate) return;
    const data: WeeklyMeeting = {
      id: editingMeeting?.id || `wm-${Date.now()}`, meetingDate: new Date(fDate), meetingNotes: fNotes,
      projectStatuses: fStatuses, resourceAvailability: fResAvail, lastWeekAchievements: fAchievements,
      createdBy: user?.name || 'Unknown', createdAt: editingMeeting?.createdAt || new Date()
    };
    persist(editingMeeting ? meetings.map(m => m.id === editingMeeting.id ? data : m) : [data, ...meetings]);
    setShowForm(false); setEditingMeeting(null);
  };

  const handleDelete = (id: string) => { if (window.confirm('Delete this meeting record?')) persist(meetings.filter(m => m.id !== id)); };

  const totalActive = activeProjects.length;
  const avgProgress = totalActive > 0 ? Math.round(activeProjects.reduce((a, p) => a + p.completionPercentage, 0) / totalActive) : 0;
  const totalRisks = activeProjects.reduce((a, p) => a + (p.risks?.length || 0), 0);

  // Achievement entry row builder
  const achievementRow = (type: 'projectFundsReceived' | 'amcFundsReceived' | 'projectsGoLive', entry: AchievementEntry, idx: number, _label: string) => (
    <div key={idx} className="flex items-center gap-2">
      <input type="text" value={entry.projectName} onChange={e => updateFundEntry(type, idx, 'projectName', e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Project / Client name" />
      {type !== 'projectsGoLive' && (
        <input type="number" value={entry.amount || ''} onChange={e => updateFundEntry(type, idx, 'amount', parseFloat(e.target.value) || 0)}
          className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Amount $" />
      )}
      <input type="text" value={entry.notes} onChange={e => updateFundEntry(type, idx, 'notes', e.target.value)}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Notes" />
      <button type="button" onClick={() => removeFundEntry(type, idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Board Meetings</h1>
          <p className="text-gray-500 mt-1">Every Wednesday — Project progress, resource availability & achievements</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={openNewForm} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> New Meeting</button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">This Week&apos;s Board Meeting</h2>
            <p className="text-blue-200 text-sm">Wednesday, {formatDate(new Date(), 'MMMM dd, yyyy')}</p>
            <div className="flex flex-wrap gap-5 mt-4 text-sm">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {totalActive} Active Projects</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> {avgProgress}% Avg Progress</span>
              <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {totalRisks} Risks</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {resources.length} Resources</span>
            </div>
          </div>
          <div className="hidden lg:flex w-20 h-20 bg-white/10 rounded-full items-center justify-center"><Calendar className="w-10 h-10" /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Active Projects', v: totalActive, i: BarChart3, c: 'bg-blue-500' },
          { l: 'Avg Completion', v: `${avgProgress}%`, i: TrendingUp, c: 'bg-green-500' },
          { l: 'Open Risks', v: totalRisks, i: AlertCircle, c: 'bg-red-500' },
          { l: 'Meetings Held', v: meetings.length, i: Calendar, c: 'bg-purple-500' },
        ].map(st => { const I = st.i; return (
          <div key={st.l} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2"><div className={`p-1.5 ${st.c.replace('500','100')} rounded-lg`}><I className={`w-4 h-4 ${st.c.replace('bg-','text-')}`} /></div><span className="text-sm text-gray-500">{st.l}</span></div>
            <p className="text-2xl font-bold text-gray-900">{st.v}</p>
          </div>
        ); })}
      </div>

      {/* Meeting History */}
      <h3 className="text-lg font-semibold text-gray-900">Meeting History</h3>
      {meetings.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="font-medium text-gray-900">No meetings recorded yet</p></div>}
      {meetings.map(meeting => {
        const isExp = expandedMeeting === meeting.id;
        const mAvg = meeting.projectStatuses.length > 0 ? Math.round(meeting.projectStatuses.reduce((a, s) => a + s.completionPercentage, 0) / meeting.projectStatuses.length) : 0;
        const mRisks = meeting.projectStatuses.reduce((a, s) => a + s.risks.length, 0);
        const ach = meeting.lastWeekAchievements;
        const achCount = (ach?.projectFundsReceived?.length || 0) + (ach?.amcFundsReceived?.length || 0) + (ach?.projectsGoLive?.length || 0);
        return (
          <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
              <button onClick={() => setExpandedMeeting(isExp ? null : meeting.id)} className="flex items-center gap-3 flex-1 text-left">
                <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Week {getWeekNumber(new Date(meeting.meetingDate))} — {formatDate(meeting.meetingDate, 'EEE, MMM dd, yyyy')}</h4>
                  <p className="text-xs text-gray-500">{meeting.projectStatuses.length} projects • {mAvg}% avg • {mRisks} risks{achCount > 0 ? ` • ${achCount} achievements` : ''}</p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => setViewingMeeting(meeting)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                <button onClick={() => openEditForm(meeting)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(meeting.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setExpandedMeeting(isExp ? null : meeting.id)} className="p-1.5 text-gray-400">{isExp ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</button>
              </div>
            </div>
            {isExp && (
              <div className="px-5 pb-5 border-t border-gray-200 pt-4 space-y-4">
                {meeting.meetingNotes && <div className="bg-blue-50 p-3 rounded-lg text-sm"><p className="font-medium text-blue-900 mb-1">Meeting Notes</p><p className="text-blue-700">{meeting.meetingNotes}</p></div>}
                {/* Project statuses inline */}
                {meeting.projectStatuses.map(ps => (
                  <div key={ps.projectId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2"><h5 className="font-semibold text-gray-900 text-sm">{ps.projectName}</h5><span className="text-xs font-medium text-gray-600">{ps.completionPercentage}%</span></div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3"><div className={cn('h-full rounded-full', ps.completionPercentage >= 90 ? 'bg-green-500' : ps.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: `${ps.completionPercentage}%` }} /></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div><p className="text-gray-400">Last Week</p><p className="text-gray-700">{ps.lastWeekSummary || '—'}</p></div>
                      <div><p className="text-gray-400">This Week</p><p className="text-gray-700">{ps.currentWeekProgress || '—'}</p></div>
                      <div><p className="text-gray-400">Next Week</p><p className="text-gray-700">{ps.nextWeekTargets || '—'}</p></div>
                    </div>
                    {ps.risks.length > 0 && <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600"><strong>Risks:</strong> {ps.risks.join(', ')}</div>}
                  </div>
                ))}
                {/* Achievements inline */}
                {ach && achCount > 0 && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-900 flex items-center gap-2 mb-2"><Award className="w-4 h-4" /> Last Week Achievements</h5>
                    {ach.projectFundsReceived.map((e, i) => <p key={i} className="text-sm text-green-700">💰 Project Fund: <strong>{e.projectName}</strong> — ${e.amount?.toLocaleString()} {e.notes && `(${e.notes})`}</p>)}
                    {ach.amcFundsReceived.map((e, i) => <p key={i} className="text-sm text-green-700">🔄 AMC Fund: <strong>{e.projectName}</strong> — ${e.amount?.toLocaleString()} {e.notes && `(${e.notes})`}</p>)}
                    {ach.projectsGoLive.map((e, i) => <p key={i} className="text-sm text-green-700">🚀 Go Live: <strong>{e.projectName}</strong> {e.notes && `— ${e.notes}`}</p>)}
                    {ach.otherAchievements.map((e, i) => <p key={i} className="text-sm text-green-700">⭐ {e}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ═══ CREATE/EDIT FORM ═══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', editingMeeting ? 'bg-blue-100' : 'bg-green-100')}><Calendar className={cn('w-5 h-5', editingMeeting ? 'text-blue-600' : 'text-green-600')} /></div>
                <div><h3 className="text-lg font-bold text-gray-900">{editingMeeting ? 'Edit Meeting' : 'New Weekly Meeting'}</h3><p className="text-sm text-gray-500">Wednesday Board Meeting Report</p></div>
              </div>
              <button onClick={() => { setShowForm(false); setEditingMeeting(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Meeting Info */}
              <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Calendar className="w-5 h-5 text-blue-600" /> Meeting Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date <span className="text-red-500">*</span></label><input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Created By</label><input type="text" value={user?.name || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm cursor-not-allowed" /></div>
                </div>
                <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Notes</label><textarea value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Key decisions, action items..." /></div>
              </section>

              {/* Tab navigation for 3 sections */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { id: 'projects' as const, label: 'Project Status', icon: BarChart3, count: fStatuses.length },
                  { id: 'resources' as const, label: 'Resource Availability', icon: UserCheck, count: fResAvail.length },
                  { id: 'achievements' as const, label: 'Last Week Achievements', icon: Award, count: (fAchievements.projectFundsReceived.length + fAchievements.amcFundsReceived.length + fAchievements.projectsGoLive.length + fAchievements.otherAchievements.length) },
                ].map(t => { const I = t.icon; return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center', activeTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
                    <I className="w-4 h-4" /> {t.label} <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{t.count}</span>
                  </button>
                ); })}
              </div>

              {/* ─── TAB 1: PROJECT STATUS ─── */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <section className="bg-green-50/60 border border-green-100 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-green-600" /> Select Projects ({selectedProjects.length})</h4>
                    <div className="border border-gray-200 bg-white rounded-lg p-2 max-h-36 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {activeProjects.map(p => (
                          <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                            <input type="checkbox" checked={selectedProjects.includes(p.id)} onChange={() => handleToggleProject(p.id)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                            <span className="text-sm flex-1">{p.projectNumber} — {p.projectName}</span>
                            <span className="text-xs text-gray-400">{p.completionPercentage}%</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>
                  {fStatuses.map((ps, idx) => (
                    <section key={ps.projectId} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2"><span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">{idx + 1}</span>{ps.projectName}</h4>
                        <div className="flex items-center gap-2"><span className="text-sm text-gray-500">Completion:</span><input type="number" min="0" max="100" value={ps.completionPercentage} onChange={e => updateStatus(ps.projectId, 'completionPercentage', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg text-center" /><span className="text-sm text-gray-500">%</span></div>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3"><div className={cn('h-full rounded-full', ps.completionPercentage >= 90 ? 'bg-green-500' : ps.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: `${ps.completionPercentage}%` }} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Last Week Summary</label><textarea value={ps.lastWeekSummary} onChange={e => updateStatus(ps.projectId, 'lastWeekSummary', e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="What was completed?" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Current Week Progress</label><textarea value={ps.currentWeekProgress} onChange={e => updateStatus(ps.projectId, 'currentWeekProgress', e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="What's being worked on?" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Next Week Targets</label><textarea value={ps.nextWeekTargets} onChange={e => updateStatus(ps.projectId, 'nextWeekTargets', e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="What's planned?" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Collections Status</label><input type="text" value={ps.collectionsStatus} onChange={e => updateStatus(ps.projectId, 'collectionsStatus', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" placeholder="Payment status" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Risks (comma separated)</label><input type="text" value={ps.risks.join(', ')} onChange={e => updateStatus(ps.projectId, 'risks', e.target.value.split(',').map(r => r.trim()).filter(Boolean))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Escalations (comma separated)</label><input type="text" value={ps.escalations.join(', ')} onChange={e => updateStatus(ps.projectId, 'escalations', e.target.value.split(',').map(r => r.trim()).filter(Boolean))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" /></div>
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* ─── TAB 2: RESOURCE AVAILABILITY ─── */}
              {activeTab === 'resources' && (
                <section className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-1"><UserCheck className="w-5 h-5 text-purple-600" /> Resource Availability ({fResAvail.length} resources)</h4>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Resource</th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Department</th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-32">Occupancy %</th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Current Project</th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-20">Free Hrs</th>
                          <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {fResAvail.map((r, idx) => {
                          const oc = r.occupancy;
                          const occC = oc >= 90 ? 'bg-red-500' : oc >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{r.resourceName}</td>
                              <td className="px-3 py-2 text-xs text-gray-600">{r.department}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', occC)} style={{ width: `${oc}%` }} /></div>
                                  <input type="number" min="0" max="100" value={oc} onChange={e => updateResAvail(idx, 'occupancy', parseInt(e.target.value) || 0)}
                                    className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded text-center" />
                                </div>
                              </td>
                              <td className="px-3 py-2"><input type="text" value={r.currentProject} onChange={e => updateResAvail(idx, 'currentProject', e.target.value)} className="w-full px-2 py-1 text-xs border border-gray-200 rounded" placeholder="Project name" /></td>
                              <td className="px-3 py-2"><input type="number" min="0" value={r.availableHours} onChange={e => updateResAvail(idx, 'availableHours', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-xs border border-gray-200 rounded text-center" /></td>
                              <td className="px-3 py-2"><input type="text" value={r.notes} onChange={e => updateResAvail(idx, 'notes', e.target.value)} className="w-full px-2 py-1 text-xs border border-gray-200 rounded" placeholder="On leave, bench..." /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* ─── TAB 3: LAST WEEK ACHIEVEMENTS ─── */}
              {activeTab === 'achievements' && (
                <div className="space-y-4">
                  {/* Project Funds Received */}
                  <section className="bg-green-50/60 border border-green-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Project Funds Received</h4>
                      <button type="button" onClick={() => addFundEntry('projectFundsReceived')} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    <div className="space-y-2">
                      {fAchievements.projectFundsReceived.length === 0 && <p className="text-sm text-gray-400">No project funds recorded. Click Add to enter.</p>}
                      {fAchievements.projectFundsReceived.map((e, i) => achievementRow('projectFundsReceived', e, i, 'Project Fund'))}
                    </div>
                  </section>

                  {/* AMC Funds Received */}
                  <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-600" /> AMC / Maintenance Funds Received</h4>
                      <button type="button" onClick={() => addFundEntry('amcFundsReceived')} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    <div className="space-y-2">
                      {fAchievements.amcFundsReceived.length === 0 && <p className="text-sm text-gray-400">No AMC funds recorded. Click Add to enter.</p>}
                      {fAchievements.amcFundsReceived.map((e, i) => achievementRow('amcFundsReceived', e, i, 'AMC Fund'))}
                    </div>
                  </section>

                  {/* Projects Go Live */}
                  <section className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Rocket className="w-5 h-5 text-orange-600" /> Projects Gone Live</h4>
                      <button type="button" onClick={() => addFundEntry('projectsGoLive')} className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700"><Plus className="w-3 h-3" /> Add</button>
                    </div>
                    <div className="space-y-2">
                      {fAchievements.projectsGoLive.length === 0 && <p className="text-sm text-gray-400">No projects went live. Click Add to enter.</p>}
                      {fAchievements.projectsGoLive.map((e, i) => achievementRow('projectsGoLive', e, i, 'Go Live'))}
                    </div>
                  </section>

                  {/* Other Achievements */}
                  <section className="bg-yellow-50/60 border border-yellow-100 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Award className="w-5 h-5 text-yellow-600" /> Other Achievements</h4>
                    <textarea value={fAchievements.otherAchievements.join('\n')} onChange={e => setFAchievements(p => ({ ...p, otherAchievements: e.target.value.split('\n').filter(Boolean) }))} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Enter each achievement on a new line..." />
                  </section>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setShowForm(false); setEditingMeeting(null); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={!fDate} className={cn('flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow', !fDate && 'opacity-50 cursor-not-allowed')}><Save className="w-4 h-4" /> {editingMeeting ? 'Update Meeting' : 'Save Meeting'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ VIEW MEETING ═══ */}
      {viewingMeeting && (() => {
        const vm = viewingMeeting;
        const vmAvg = vm.projectStatuses.length > 0 ? Math.round(vm.projectStatuses.reduce((a, s) => a + s.completionPercentage, 0) / vm.projectStatuses.length) : 0;
        const vmRisks = vm.projectStatuses.reduce((a, s) => a + s.risks.length, 0);
        const vAch = vm.lastWeekAchievements;
        const vRes = vm.resourceAvailability || [];
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div><h3 className="text-lg font-bold text-gray-900">Weekly Meeting Report</h3><p className="text-sm text-gray-500">Week {getWeekNumber(new Date(vm.meetingDate))} — {formatDate(vm.meetingDate, 'EEEE, MMMM dd, yyyy')}</p></div>
                <button onClick={() => setViewingMeeting(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{vm.projectStatuses.length}</p><p className="text-xs text-gray-600">Projects</p></div>
                  <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{vmAvg}%</p><p className="text-xs text-gray-600">Avg Progress</p></div>
                  <div className="bg-red-50 p-3 rounded-lg text-center"><p className="text-2xl font-bold text-red-600">{vmRisks}</p><p className="text-xs text-gray-600">Risks</p></div>
                </div>
                {vm.meetingNotes && <div className="bg-blue-50 p-4 rounded-lg text-sm"><p className="font-medium text-blue-900 mb-1">Meeting Notes</p><p className="text-blue-700">{vm.meetingNotes}</p></div>}

                {/* Project Status */}
                <h4 className="font-semibold text-gray-900">Project-wise Status</h4>
                {vm.projectStatuses.map(ps => (
                  <div key={ps.projectId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2"><h5 className="font-semibold text-gray-900 text-sm">{ps.projectName}</h5><span className={cn('px-2 py-0.5 text-xs rounded-full', ps.completionPercentage >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>{ps.completionPercentage}%</span></div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3"><div className={cn('h-full rounded-full', ps.completionPercentage >= 90 ? 'bg-green-500' : ps.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: `${ps.completionPercentage}%` }} /></div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-gray-400">Last Week</p><p className="text-gray-700">{ps.lastWeekSummary || '—'}</p></div>
                      <div><p className="text-gray-400">This Week</p><p className="text-gray-700">{ps.currentWeekProgress || '—'}</p></div>
                      <div><p className="text-gray-400">Next Week</p><p className="text-gray-700">{ps.nextWeekTargets || '—'}</p></div>
                      <div><p className="text-gray-400">Collections</p><p className="text-gray-700">{ps.collectionsStatus || '—'}</p></div>
                    </div>
                    {ps.risks.length > 0 && <p className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600"><strong>Risks:</strong> {ps.risks.join(', ')}</p>}
                  </div>
                ))}

                {/* Resource Availability */}
                {vRes.length > 0 && (<>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><UserCheck className="w-5 h-5" /> Resource Availability</h4>
                  <div className="bg-gray-50 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100"><tr><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Resource</th><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Dept</th><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Occupancy</th><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Project</th><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Free Hrs</th><th className="px-3 py-2 text-left text-[10px] uppercase text-gray-500">Notes</th></tr></thead>
                      <tbody className="divide-y divide-gray-200">{vRes.map((r, i) => {
                        const oc = r.occupancy;
                        return (<tr key={i}><td className="px-3 py-2 font-medium">{r.resourceName}</td><td className="px-3 py-2 text-gray-600 text-xs">{r.department}</td><td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', oc >= 90 ? 'bg-red-500' : oc >= 70 ? 'bg-yellow-500' : 'bg-green-500')} style={{ width: `${oc}%` }} /></div><span className="text-xs">{oc}%</span></div></td><td className="px-3 py-2 text-xs">{r.currentProject || '—'}</td><td className="px-3 py-2 text-xs font-medium">{r.availableHours}h</td><td className="px-3 py-2 text-xs text-gray-500">{r.notes || '—'}</td></tr>);
                      })}</tbody>
                    </table>
                  </div>
                </>)}

                {/* Achievements */}
                {vAch && (vAch.projectFundsReceived.length > 0 || vAch.amcFundsReceived.length > 0 || vAch.projectsGoLive.length > 0 || vAch.otherAchievements.length > 0) && (<>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Award className="w-5 h-5" /> Last Week Achievements</h4>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
                    {vAch.projectFundsReceived.map((e, i) => <p key={`pf${i}`} className="text-sm text-green-700 flex items-center gap-2"><DollarSign className="w-4 h-4" /> <strong>{e.projectName}</strong> — ${e.amount?.toLocaleString()} {e.notes && <span className="text-green-600">({e.notes})</span>}</p>)}
                    {vAch.amcFundsReceived.map((e, i) => <p key={`af${i}`} className="text-sm text-blue-700 flex items-center gap-2"><DollarSign className="w-4 h-4" /> AMC: <strong>{e.projectName}</strong> — ${e.amount?.toLocaleString()} {e.notes && <span className="text-blue-600">({e.notes})</span>}</p>)}
                    {vAch.projectsGoLive.map((e, i) => <p key={`gl${i}`} className="text-sm text-orange-700 flex items-center gap-2"><Rocket className="w-4 h-4" /> Go Live: <strong>{e.projectName}</strong> {e.notes && `— ${e.notes}`}</p>)}
                    {vAch.otherAchievements.map((e, i) => <p key={`oa${i}`} className="text-sm text-gray-700 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> {e}</p>)}
                  </div>
                </>)}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={() => { setViewingMeeting(null); openEditForm(vm); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                  <button onClick={() => setViewingMeeting(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
