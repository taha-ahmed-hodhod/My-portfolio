import type { Locale } from './types';

export interface AdminDictionary {
  // Navigation Sections
  navSectionMain: string;
  navSectionContent: string;
  navSectionSystem: string;

  // Tabs
  tabOverview: string;
  tabProfile: string;
  tabProjects: string;
  tabCategories: string;
  tabCertificates: string;
  tabTestimonials: string;
  tabExperience: string;
  tabSkills: string;
  tabEducation: string;
  tabSettings: string;

  // TopBar
  searchPlaceholder: string;
  searchEmpty: string;
  notificationsTitle: string;
  noPendingTestimonials: string;
  pendingReviewsCount: string;
  reviewAction: string;
  viewLiveSite: string;
  signOut: string;
  languageToggle: string;
  adminRole: string;

  // Bento Overview
  heroGreetingMorning: string;
  heroGreetingAfternoon: string;
  heroGreetingEvening: string;
  heroSubtitle: string;
  quickAddProject: string;
  systemLiveStatus: string;
  realtimeActive: string;

  // Real Stat Cards
  statTotalProjects: string;
  statTechStack: string;
  statCertificates: string;
  statPendingReviews: string;
  statExperienceItems: string;
  statActiveSections: string;
  statVerified: string;
  statPendingAction: string;

  // Recent Content Section
  recentProjectsTitle: string;
  recentProjectsSub: string;
  viewAll: string;
  noRecentProjects: string;

  // Common Actions
  add: string;
  edit: string;
  delete: string;
  save: string;
  saving: string;
  cancel: string;
  close: string;
  search: string;
  filter: string;
  refresh: string;
  preview: string;
  publish: string;
  unpublish: string;
  approve: string;
  reject: string;
  uploadImage: string;
  uploading: string;
  dragDropImage: string;
  webpOptimizedNotice: string;
  pickIcon: string;
  autoDetect: string;

  // Status Badges
  statusPublished: string;
  statusDraft: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;

  // Modals & Forms
  createTitle: string;
  editTitle: string;
  confirmDeleteTitle: string;
  confirmDeleteMessage: string;
  confirmDeleteAction: string;

  // Toasts
  toastSavedSuccess: string;
  toastDeleteSuccess: string;
  toastApprovedSuccess: string;
  toastRejectedSuccess: string;
  toastSaveError: string;
  toastAuthRequired: string;
}

export const adminI18n: Record<Locale, AdminDictionary> = {
  en: {
    navSectionMain: 'Main',
    navSectionContent: 'Content Management',
    navSectionSystem: 'System & Config',

    tabOverview: 'Overview',
    tabProfile: 'Profile Info',
    tabProjects: 'Projects',
    tabCategories: 'Categories',
    tabCertificates: 'Certificates',
    tabTestimonials: 'Testimonials',
    tabExperience: 'Experience',
    tabSkills: 'Skill Groups',
    tabEducation: 'Education',
    tabSettings: 'Site Settings',

    searchPlaceholder: 'Search anything across dashboard...',
    searchEmpty: 'No matching items found',
    notificationsTitle: 'Pending Notifications',
    noPendingTestimonials: 'All testimonials are moderated. No pending reviews.',
    pendingReviewsCount: 'pending review(s) awaiting approval',
    reviewAction: 'Review',
    viewLiveSite: 'View Live Portfolio',
    signOut: 'Sign Out',
    languageToggle: 'العربية',
    adminRole: 'Verified Administrator',

    heroGreetingMorning: 'Good morning, Taha',
    heroGreetingAfternoon: 'Good afternoon, Taha',
    heroGreetingEvening: 'Good evening, Taha',
    heroSubtitle: 'Manage your portfolio content, technical toolkit, and client reviews in real-time.',
    quickAddProject: 'New Project',
    systemLiveStatus: 'Supabase Connected',
    realtimeActive: 'Realtime Sync Active',

    statTotalProjects: 'Total Projects',
    statTechStack: 'Tech Stack',
    statCertificates: 'Certificates',
    statPendingReviews: 'Pending Reviews',
    statExperienceItems: 'Career Roles',
    statActiveSections: 'Active Sections',
    statVerified: 'Verified & live',
    statPendingAction: 'Needs attention',

    recentProjectsTitle: 'Recently Added Projects',
    recentProjectsSub: 'The latest additions to your live portfolio showcase',
    viewAll: 'View All',
    noRecentProjects: 'No projects recorded yet. Click "New Project" to create one.',

    add: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save Changes',
    saving: 'Saving...',
    cancel: 'Cancel',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh Data',
    preview: 'Preview',
    publish: 'Publish',
    unpublish: 'Unpublish',
    approve: 'Approve',
    reject: 'Reject',
    uploadImage: 'Upload Image',
    uploading: 'Optimizing & Uploading...',
    dragDropImage: 'Drag & drop image here or click to browse (Auto-converts to WebP)',
    webpOptimizedNotice: 'Optimized via HTML5 Canvas (WebP, max 1920px)',
    pickIcon: 'Pick Icon',
    autoDetect: 'Auto Detect',

    statusPublished: 'Published',
    statusDraft: 'Draft',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',

    createTitle: 'Create New Entry',
    editTitle: 'Edit Entry',
    confirmDeleteTitle: 'Confirm Deletion',
    confirmDeleteMessage: 'Are you sure you want to delete this item? This action is permanent.',
    confirmDeleteAction: 'Delete Permanently',

    toastSavedSuccess: 'Saved and synchronized successfully',
    toastDeleteSuccess: 'Item deleted successfully',
    toastApprovedSuccess: 'Testimonial approved and published',
    toastRejectedSuccess: 'Testimonial rejected',
    toastSaveError: 'Failed to save changes. Please try again.',
    toastAuthRequired: 'Admin session required for this operation',
  },
  ar: {
    navSectionMain: 'الرئيسية',
    navSectionContent: 'إدارة المحتوى',
    navSectionSystem: 'النظام والإعدادات',

    tabOverview: 'نظرة عامة',
    tabProfile: 'الملف التعريفي',
    tabProjects: 'المشاريع',
    tabCategories: 'التصنيفات',
    tabCertificates: 'الشهادات',
    tabTestimonials: 'آراء العملاء',
    tabExperience: 'الخبرات المهنية',
    tabSkills: 'مجموعات المهارات',
    tabEducation: 'المؤهلات الدراسية',
    tabSettings: 'إعدادات الموقع',

    searchPlaceholder: 'البحث في جميع عناصر لوحة التحكم...',
    searchEmpty: 'لم يتم العثور على أي نتائج مطابقة',
    notificationsTitle: 'الإشعارات المعلقة',
    noPendingTestimonials: 'جميع الآراء مراجعة. لا توجد آراء معلقة.',
    pendingReviewsCount: 'تقييمات جديدة بانتظار المراجعة والاعتماد',
    reviewAction: 'مراجعة',
    viewLiveSite: 'معاينة الموقع مباشرة',
    signOut: 'تسجيل الخروج',
    languageToggle: 'English',
    adminRole: 'مدير النظام المعتمد',

    heroGreetingMorning: 'صباح الخير، طه',
    heroGreetingAfternoon: 'مساء الخير، طه',
    heroGreetingEvening: 'مساء الخير، طه',
    heroSubtitle: 'إدارة محتوى معرض أعمالك، مهاراتك التقنية، وتوصيات العملاء مباشرة وفورياً.',
    quickAddProject: 'مشروع جديد',
    systemLiveStatus: 'متصل مع سوبابيز',
    realtimeActive: 'المزامنة الحية مفعلة',

    statTotalProjects: 'إجمالي المشاريع',
    statTechStack: 'التقنيات المسجلة',
    statCertificates: 'الشهادات المعتمدة',
    statPendingReviews: 'آراء بالانتظار',
    statExperienceItems: 'المحطات المهنية',
    statActiveSections: 'الأقسام المفعلة',
    statVerified: 'معتمد ومتاح للعامة',
    statPendingAction: 'يتطلب اتخاذ إجراء',

    recentProjectsTitle: 'أحدث المشاريع المضافة',
    recentProjectsSub: 'آخر المشاريع المضافة لمعرض أعمالك الحي',
    viewAll: 'عرض الكل',
    noRecentProjects: 'لم يتم تسجيل أي مشاريع حتى الآن. انقر على "مشروع جديد" للإضافة.',

    add: 'إضافة جديد',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    close: 'إغلاق',
    search: 'بحث',
    filter: 'تصفية',
    refresh: 'تحديث البيانات',
    preview: 'معاينة',
    publish: 'نشر',
    unpublish: 'إلغاء النشر',
    approve: 'موافقة ونشر',
    reject: 'رفض',
    uploadImage: 'رفع صورة',
    uploading: 'جاري الضغط والرفع...',
    dragDropImage: 'اسحب الصورة هنا أو اضغط للاختيار (يتم التحويل التلقائي لصيغة WebP)',
    webpOptimizedNotice: 'تم الضغط والمعالجة عبر Canvas (WebP, أقصى عرض 1920px)',
    pickIcon: 'اختيار أيقونة',
    autoDetect: 'اكتشاف تلقائي',

    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    statusPending: 'معلق',
    statusApproved: 'معتمد',
    statusRejected: 'مرفوض',

    createTitle: 'إضافة عنصر جديد',
    editTitle: 'تعديل العنصر',
    confirmDeleteTitle: 'تأكيد الحذف',
    confirmDeleteMessage: 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
    confirmDeleteAction: 'حذف نهائياً',

    toastSavedSuccess: 'تم الحفظ والمزامنة بنجاح',
    toastDeleteSuccess: 'تم حذف العنصر بنجاح',
    toastApprovedSuccess: 'تم اعتماد التقييم ونشره في الموقع',
    toastRejectedSuccess: 'تم رفض التقييم بنجاح',
    toastSaveError: 'تعذر حفظ التغييرات. يرجى المحاولة لاحقاً.',
    toastAuthRequired: 'يتطلب هذا الإجراء صلاحيات مدير النظام',
  },
};
