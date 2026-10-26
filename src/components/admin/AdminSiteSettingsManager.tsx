import React from 'react';
import {
  Briefcase,
  UserCheck,
  History,
  Award,
  MessageSquareQuote,
  MessageCircle,
  Eye,
  Sliders,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import type { Locale } from '../../types';

interface SettingTileDef {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  category: 'content' | 'interactive';
}

const SETTING_TILES: SettingTileDef[] = [
  {
    key: 'section_work_visible',
    icon: Briefcase,
    titleEn: 'Projects Showcase Catalog',
    titleAr: 'معرض المشاريع المختارة',
    descEn: 'Controls visibility of the interactive project showcase, category filters, and pagination bar.',
    descAr: 'التحكم في ظهور أو إخفاء قسم المشاريع، تصنيفات الفلترة، وشريط التنقل بين الصفحات.',
    category: 'content',
  },
  {
    key: 'section_about_visible',
    icon: UserCheck,
    titleEn: 'About & Technical Toolkit',
    titleAr: 'عني والترسانة التقنية',
    descEn: 'Controls visibility of your bio statement, detailed profile story, and interactive skills matrix.',
    descAr: 'التحكم في ظهور قسم النبذة الشخصية، القصة المهنية، ومصفوفة المهارات والتقنيات التفاعلية.',
    category: 'content',
  },
  {
    key: 'section_experience_visible',
    icon: History,
    titleEn: 'Career Experience Timeline',
    titleAr: 'سجل الخبرات المهنية',
    descEn: 'Controls visibility of the chronological career timeline, roles, and achievements.',
    descAr: 'التحكم في ظهور المسار الزمني للخبرات السابقة، الشركات والمسميات الوظيفية.',
    category: 'content',
  },
  {
    key: 'section_certificates_visible',
    icon: Award,
    titleEn: 'Certificates Marquee Ribbon',
    titleAr: 'شريط الشهادات المعتمدة المتحرك',
    descEn: 'Controls visibility of the smooth continuous right-to-left credentials carousel.',
    descAr: 'التحكم في ظهور شريط الشهادات التلقائي السلس مع النوافذ المنبثقة للاعتماد.',
    category: 'content',
  },
  {
    key: 'section_testimonials_visible',
    icon: MessageSquareQuote,
    titleEn: 'Client Testimonials Showcase',
    titleAr: 'شريط مراجعات وتقييمات العملاء',
    descEn: 'Controls visibility of the client feedback carousel on the live public portfolio.',
    descAr: 'التحكم في ظهور أو إخفاء قسم تقييمات وآراء العملاء بالكامل على الموقع الحي.',
    category: 'content',
  },
  {
    key: 'testimonials_button_visible',
    icon: MessageCircle,
    titleEn: 'Visitor "Share Feedback" Modal Button',
    titleAr: 'زر "شاركنا رأيك" للزوار',
    descEn: 'Allows public visitors to click and submit new reviews directly into your moderation queue.',
    descAr: 'إتاحة الفرصة للزوار والعملاء لإرسال تقييمات وملاحظات جديدة لتصلك في قائمة المراجعة.',
    category: 'interactive',
  },
];

interface AdminSiteSettingsManagerProps {
  locale: Locale;
  siteSettings: Record<string, boolean>;
  onToggleSetting: (key: string, value: boolean) => Promise<void> | void;
}

export const AdminSiteSettingsManager: React.FC<AdminSiteSettingsManagerProps> = ({
  locale,
  siteSettings,
  onToggleSetting,
}) => {
  const contentSettings = SETTING_TILES.filter((s) => s.category === 'content');
  const interactiveSettings = SETTING_TILES.filter((s) => s.category === 'interactive');

  const totalActive = SETTING_TILES.filter((s) => siteSettings[s.key] !== false).length;

  return (
    <div className="admin-settings-bento-section">
      {/* Settings Top Hero Banner */}
      <div className="settings-bento-hero">
        <div className="settings-hero-main">
          <div className="settings-hero-icon-box">
            <Sliders size={22} className="settings-hero-icon" />
          </div>
          <div>
            <h3 className="settings-hero-title">
              {locale === 'ar' ? 'إعدادات ورؤية أقسام الموقع' : 'Portfolio Visibility & System Settings'}
            </h3>
            <span className="settings-hero-sub">
              {locale === 'ar'
                ? 'تحكم فوري ودقيق في ظهور الأقسام والميزات التفاعلية على البورتفوليو الحي دون تعديل الكود'
                : 'Granular real-time toggles to control which sections and features appear on the live site.'}
            </span>
          </div>
        </div>

        {/* Live Telemetry Pill */}
        <div className="settings-telemetry-pill">
          <ShieldCheck size={16} className="telemetry-pill-icon" />
          <span>
            {locale === 'ar'
              ? `${totalActive} من ${SETTING_TILES.length} أقسام وميزات نشطة حالياً`
              : `${totalActive} of ${SETTING_TILES.length} features active live`}
          </span>
        </div>
      </div>

      {/* Cluster 1: Public Portfolio Sections */}
      <div className="settings-cluster-card">
        <div className="settings-cluster-header">
          <h4 className="cluster-title">
            {locale === 'ar' ? 'أقسام البورتفوليو الرئيسية' : 'Public Portfolio Sections'}
          </h4>
          <span className="cluster-sub">
            {locale === 'ar'
              ? 'التحكم في الأقسام المعروضة للزوار على الصفحة الرئيسية'
              : 'Toggle visibility of core showcase sections on the main portfolio page'}
          </span>
        </div>

        <div className="settings-tiles-grid">
          {contentSettings.map((tile) => {
            const Icon = tile.icon;
            const isLive = siteSettings[tile.key] !== false;

            return (
              <div key={tile.key} className={`settings-bento-tile ${isLive ? 'is-active' : 'is-muted'}`}>
                <div className="tile-icon-bubble">
                  <Icon size={20} className={isLive ? 'tile-icon-teal' : 'tile-icon-dim'} />
                </div>

                <div className="tile-content">
                  <div className="tile-header-line">
                    <h5 className="tile-title">{locale === 'ar' ? tile.titleAr : tile.titleEn}</h5>
                    <span className={`tile-live-badge ${isLive ? 'badge-live' : 'badge-off'}`}>
                      <span className="live-dot" />
                      <span>{isLive ? (locale === 'ar' ? 'ظاهر' : 'Live') : (locale === 'ar' ? 'مخفي' : 'Hidden')}</span>
                    </span>
                  </div>

                  <p className="tile-desc">{locale === 'ar' ? tile.descAr : tile.descEn}</p>
                </div>

                <div className="tile-switch-box">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => onToggleSetting(tile.key, e.target.checked)}
                      aria-label={`Toggle ${locale === 'ar' ? tile.titleAr : tile.titleEn}`}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cluster 2: Interactive Engagement Features */}
      <div className="settings-cluster-card">
        <div className="settings-cluster-header">
          <h4 className="cluster-title">
            {locale === 'ar' ? 'الميزات التفاعلية ومشاركة الزوار' : 'Visitor Engagement & Interactions'}
          </h4>
          <span className="cluster-sub">
            {locale === 'ar'
              ? 'التحكم في نوافذ جمع التقييمات وقنوات التواصل المباشرة'
              : 'Manage public input forms and interactive client engagement triggers'}
          </span>
        </div>

        <div className="settings-tiles-grid">
          {interactiveSettings.map((tile) => {
            const Icon = tile.icon;
            const isLive = siteSettings[tile.key] !== false;

            return (
              <div key={tile.key} className={`settings-bento-tile ${isLive ? 'is-active' : 'is-muted'}`}>
                <div className="tile-icon-bubble">
                  <Icon size={20} className={isLive ? 'tile-icon-teal' : 'tile-icon-dim'} />
                </div>

                <div className="tile-content">
                  <div className="tile-header-line">
                    <h5 className="tile-title">{locale === 'ar' ? tile.titleAr : tile.titleEn}</h5>
                    <span className={`tile-live-badge ${isLive ? 'badge-live' : 'badge-off'}`}>
                      <span className="live-dot" />
                      <span>{isLive ? (locale === 'ar' ? 'مفعل' : 'Enabled') : (locale === 'ar' ? 'معطل' : 'Disabled')}</span>
                    </span>
                  </div>

                  <p className="tile-desc">{locale === 'ar' ? tile.descAr : tile.descEn}</p>
                </div>

                <div className="tile-switch-box">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => onToggleSetting(tile.key, e.target.checked)}
                      aria-label={`Toggle ${locale === 'ar' ? tile.titleAr : tile.titleEn}`}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
