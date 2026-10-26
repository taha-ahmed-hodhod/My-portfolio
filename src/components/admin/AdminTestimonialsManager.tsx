import React, { useMemo, useState } from 'react';
import {
  Check,
  X,
  Trash2,
  Star,
  SearchX,
  MessageSquareQuote,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Locale, Testimonial } from '../../types';
import { adminI18n } from '../../adminI18n';

interface AdminTestimonialsManagerProps {
  locale: Locale;
  testimonials: Testimonial[];
  searchFilter: string;
  onSetStatus: (id: number, status: 'approved' | 'rejected' | 'pending') => Promise<void> | void;
  onRequestDelete: (item: Testimonial) => void;
  testimonialsButtonVisible: boolean;
  onToggleTestimonialsButton: (visible: boolean) => Promise<void> | void;
}

export const AdminTestimonialsManager: React.FC<AdminTestimonialsManagerProps> = ({
  locale,
  testimonials,
  searchFilter,
  onSetStatus,
  onRequestDelete,
  testimonialsButtonVisible,
  onToggleTestimonialsButton,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const t = adminI18n[locale];

  // Counts
  const counts = useMemo(() => {
    return {
      all: testimonials.length,
      pending: testimonials.filter((i) => i.status === 'pending').length,
      approved: testimonials.filter((i) => i.status === 'approved').length,
      rejected: testimonials.filter((i) => i.status === 'rejected').length,
    };
  }, [testimonials]);

  // Filtered list
  const filteredList = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    return testimonials.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Text search query
      if (q) {
        const matchesName = item.client_name.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesCompany = (item.client_company || '').toLowerCase().includes(q);
        const matchesRole = (item.client_role || '').toLowerCase().includes(q);
        if (!matchesName && !matchesContent && !matchesCompany && !matchesRole) {
          return false;
        }
      }
      return true;
    });
  }, [testimonials, statusFilter, searchFilter]);

  // Client avatar initials helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'CL').toUpperCase();
  };

  return (
    <div className="admin-testimonials-bento-section">
      {/* Moderation Controls Header */}
      <div className="testimonials-mod-header">
        <div className="testimonials-mod-title-group">
          <div className="mod-title-icon-box">
            <MessageSquareQuote size={20} className="mod-icon-teal" />
          </div>
          <div>
            <h3 className="testimonials-mod-title">
              {locale === 'ar' ? 'إدارة وتقييمات العملاء' : 'Client Testimonials & Feedback'}
            </h3>
            <span className="testimonials-mod-sub">
              {locale === 'ar'
                ? 'مراجعة آراء الزوار واعتمادها أو رفضها للظهور في البورتفوليو الحي'
                : 'Review incoming feedback, approve for live portfolio display, or reject.'}
            </span>
          </div>
        </div>

        {/* Global Floating Feedback Button Toggle */}
        <div className="testimonials-toggle-pill-card">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={testimonialsButtonVisible}
              onChange={(e) => onToggleTestimonialsButton(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
          <div className="toggle-pill-meta">
            <span className="toggle-pill-label">
              {locale === 'ar' ? 'زر "شاركنا رأيك" بالبورتفوليو' : '"Share Feedback" Button'}
            </span>
            <span className={`toggle-pill-status ${testimonialsButtonVisible ? 'is-live' : 'is-off'}`}>
              {testimonialsButtonVisible ? (
                <>
                  <Eye size={12} />
                  <span>{locale === 'ar' ? 'ظاهر للزوار' : 'Visible Live'}</span>
                </>
              ) : (
                <>
                  <EyeOff size={12} />
                  <span>{locale === 'ar' ? 'مخفي حالياً' : 'Hidden'}</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Status Filter Pills Bar */}
      <div className="testimonials-filter-tray">
        <button
          type="button"
          className={`filter-pill-btn ${statusFilter === 'all' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <span>{locale === 'ar' ? 'جميع المراجعات' : 'All Feedback'}</span>
          <span className="filter-pill-counter">{counts.all}</span>
        </button>

        <button
          type="button"
          className={`filter-pill-btn pill-pending ${statusFilter === 'pending' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <Clock size={14} className="pill-status-icon" />
          <span>{locale === 'ar' ? 'بانتظار المراجعة' : 'Pending Review'}</span>
          <span className={`filter-pill-counter ${counts.pending > 0 ? 'pulse-amber' : ''}`}>
            {counts.pending}
          </span>
        </button>

        <button
          type="button"
          className={`filter-pill-btn pill-approved ${statusFilter === 'approved' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('approved')}
        >
          <CheckCircle2 size={14} className="pill-status-icon" />
          <span>{locale === 'ar' ? 'المعتمدة' : 'Approved'}</span>
          <span className="filter-pill-counter">{counts.approved}</span>
        </button>

        <button
          type="button"
          className={`filter-pill-btn pill-rejected ${statusFilter === 'rejected' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <XCircle size={14} className="pill-status-icon" />
          <span>{locale === 'ar' ? 'المرفوضة' : 'Rejected'}</span>
          <span className="filter-pill-counter">{counts.rejected}</span>
        </button>
      </div>

      {/* Testimonials Bento Cards Grid */}
      <div className="testimonials-bento-grid">
        {filteredList.map((item) => {
          const isPending = item.status === 'pending';
          const isApproved = item.status === 'approved';
          const isRejected = item.status === 'rejected';

          return (
            <div key={item.id} className={`testimonial-bento-card status-${item.status}`}>
              {/* Card Top: Client Meta + Rating + Status Pill */}
              <div className="t-card-header">
                <div className="t-client-group">
                  <div className="t-client-avatar">
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt={item.client_name}
                        className="t-client-img"
                      />
                    ) : (
                      <span className="t-client-initials">{getInitials(item.client_name)}</span>
                    )}
                  </div>
                  <div className="t-client-details">
                    <h4 className="t-client-name">{item.client_name}</h4>
                    <span className="t-client-role-meta">
                      {[item.client_role, item.client_company].filter(Boolean).join(' · ') ||
                        (locale === 'ar' ? 'عميل / زائر' : 'Client / Visitor')}
                    </span>
                  </div>
                </div>

                {/* Rating and Status Badge */}
                <div className="t-header-badges">
                  {/* Gold Stars */}
                  <div
                    className="t-stars-row"
                    aria-label={`Rating: ${item.rating || 5} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <Star
                        key={starIndex}
                        size={14}
                        className={
                          starIndex <= (item.rating || 5)
                            ? 't-star-gold'
                            : 't-star-dim'
                        }
                        fill={starIndex <= (item.rating || 5) ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>

                  {/* Status Indicator */}
                  <span className={`t-status-pill badge-${item.status}`}>
                    <span className="status-dot-pulse" />
                    <span>
                      {isPending
                        ? locale === 'ar'
                          ? 'قيد المراجعة'
                          : 'Pending'
                        : isApproved
                        ? locale === 'ar'
                          ? 'معتمد بالبورتفوليو'
                          : 'Approved'
                        : locale === 'ar'
                        ? 'مرفوض'
                        : 'Rejected'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Card Body: Quoted Message */}
              <div className="t-card-body">
                <p className="t-quote-text">“{item.content}”</p>
              </div>

              {/* Card Footer: Moderation Action Buttons */}
              <div className="t-card-actions">
                <div className="t-primary-actions">
                  {!isApproved && (
                    <button
                      type="button"
                      className="hero-primary-btn btn-sm btn-approve-emerald"
                      onClick={() => onSetStatus(item.id!, 'approved')}
                    >
                      <Check size={14} />
                      <span>{t.approve}</span>
                    </button>
                  )}

                  {!isRejected && (
                    <button
                      type="button"
                      className="hero-secondary-btn btn-sm btn-reject-subtle"
                      onClick={() => onSetStatus(item.id!, 'rejected')}
                    >
                      <X size={14} />
                      <span>{t.reject}</span>
                    </button>
                  )}

                  {!isPending && (
                    <button
                      type="button"
                      className="hero-secondary-btn btn-sm"
                      onClick={() => onSetStatus(item.id!, 'pending')}
                    >
                      <Clock size={13} />
                      <span>{locale === 'ar' ? 'إعادة للمراجعة' : 'Reset to Pending'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="row-action-btn btn-danger btn-sm"
                  onClick={() => onRequestDelete(item)}
                  aria-label={`Delete testimonial from ${item.client_name}`}
                >
                  <Trash2 size={14} />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="testimonials-empty-bento">
          <div className="empty-bento-icon">
            <SearchX size={36} />
          </div>
          <h4 className="empty-bento-title">
            {locale === 'ar' ? 'لا توجد مراجعات مطابقة' : 'No Feedback Found'}
          </h4>
          <p className="empty-bento-sub">
            {searchFilter
              ? locale === 'ar'
                ? `لم يتم العثور على أي نتائج لكلمة البحث "${searchFilter}"`
                : `No client reviews matched your search filter "${searchFilter}"`
              : statusFilter !== 'all'
              ? locale === 'ar'
                ? `لا توجد مراجعات حالياً في قسم (${statusFilter})`
                : `There are currently no reviews in the (${statusFilter}) status.`
              : locale === 'ar'
              ? 'لم يقم أي زائر بتقديم تقييم بعد.'
              : 'No visitors have submitted feedback yet.'}
          </p>
          {(statusFilter !== 'all' || searchFilter) && (
            <button
              type="button"
              className="hero-secondary-btn btn-sm"
              onClick={() => setStatusFilter('all')}
            >
              <span>{locale === 'ar' ? 'عرض جميع المراجعات' : 'Reset Filters'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
