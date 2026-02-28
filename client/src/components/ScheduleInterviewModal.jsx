import { useState } from 'react';
import { interviewsAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function ScheduleInterviewModal({ application, onClose, onScheduled }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time) {
      showToast('Please select date and time', 'error');
      return;
    }

    const scheduledAt = new Date(`${formData.date}T${formData.time}`);
    
    setLoading(true);
    try {
      const response = await interviewsAPI.scheduleInterview(application._id, {
        scheduledAt: scheduledAt.toISOString(),
        notes: formData.notes
      });

      if (response.success) {
        showToast('Interview scheduled successfully', 'success');
        onScheduled(response.interview);
        onClose();
      }
    } catch (error) {
      console.error('Schedule interview error:', error);
      showToast(error.response?.data?.message || 'Failed to schedule interview', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-['Inter']">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-[#E2E8F0]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1E293B]">Schedule Interview</h2>
              <p className="text-[#64748B] text-sm mt-0.5">
                with {application.applicant?.displayName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Interview Date
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 focus:border-[#1152d4] text-[#1E293B] transition-colors"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Interview Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 focus:border-[#1152d4] text-[#1E293B] transition-colors"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Notes for Applicant <span className="text-[#64748B] font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g., Please prepare a brief introduction about yourself..."
              rows={3}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1152d4]/20 focus:border-[#1152d4] text-[#1E293B] placeholder:text-[#94A3B8] resize-none transition-colors"
            />
          </div>

          {/* Info */}
          <div className="bg-[#EBF1FF] border border-[#1152d4]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#1152d4] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-[#1152d4]">Video Interview</p>
                <p className="text-[#64748B] mt-0.5">A video call room will be created and both parties will receive a join link at the scheduled time.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#1E293B] rounded-lg hover:bg-[#F8FAFC] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#1152d4] text-white rounded-lg hover:bg-[#0d42a8] transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
