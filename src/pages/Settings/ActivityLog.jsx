import React from 'react';
import { Activity } from 'lucide-react';

const ActivityLog = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
      <p className="mt-1 text-sm text-slate-500">A full audit trail of actions taken in your account.</p>
    </div>

    <div className="rounded-[24px] border border-slate-200 bg-white p-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
        <Activity size={24} />
      </div>
      <div className="mt-5 text-lg font-semibold text-slate-800">Activity log coming soon</div>
      <div className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
        You'll be able to see who added members, changed plans, and more — all in one timeline.
      </div>
    </div>
  </div>
);

export default ActivityLog;
