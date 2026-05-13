// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// WEEKLY MEETINGS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockWeeklyMeetings, mockProjects } from '../data/mockData';

import { formatDate } from '../utils/formatters';

import {
  Calendar,
  Plus,
  Download,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const WeeklyMeetings: React.FC = () => {
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>('wm-001');

  const toggleMeeting = (id: string) => {
    setExpandedMeeting(expandedMeeting === id ? null : id);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weekly Board Meetings</h1>
          <p className="text-gray-500 mt-1">Track weekly status and progress updates</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>
      </div>

      {/* Meeting Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">This Week&apos;s Board Meeting</h2>
            <p className="text-blue-100">Wednesday, {formatDate(new Date())}</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{mockProjects.filter(p => p.status === 'Active').length} Active Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>2 Risks Identified</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>75% Avg Progress</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Meeting History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Meeting History</h3>
        
        {mockWeeklyMeetings.map((meeting) => {
          const isExpanded = expandedMeeting === meeting.id;
          
          return (
            <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Meeting Header */}
              <button
                onClick={() => toggleMeeting(meeting.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">
                      Weekly Board Meeting - Week {getWeekNumber(meeting.meetingDate)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(meeting.meetingDate)} • {meeting.projectStatuses.length} projects reviewed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                    Completed
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Meeting Details */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  {/* Notes */}
                  <div className="py-4">
                    <h5 className="font-medium text-gray-900 mb-2">Meeting Notes</h5>
                    <p className="text-gray-600">{meeting.meetingNotes}</p>
                  </div>

                  {/* Project Statuses */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Project Updates</h5>
                    {meeting.projectStatuses.map((status) => (
                      <div key={status.projectId} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-gray-900">{status.projectName}</h6>
                          <span className="text-sm font-medium text-gray-600">
                            {status.completionPercentage}% Complete
                          </span>
                        </div>
                        
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${status.completionPercentage}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Last Week</p>
                            <p className="text-gray-700">{status.lastWeekSummary}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Current Week</p>
                            <p className="text-gray-700">{status.currentWeekProgress}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Next Week Targets</p>
                            <p className="text-gray-700">{status.nextWeekTargets}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Collections Status</p>
                            <p className="text-gray-700">{status.collectionsStatus}</p>
                          </div>
                        </div>

                        {status.risks.length > 0 && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">Risks:</span>
                            </div>
                            <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                              {status.risks.map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
