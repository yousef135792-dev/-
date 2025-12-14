// Simple translations object for the site
window.TRANSLATIONS = {
  en: {
    orgName: 'Kafalat Children Gaza',
    home: 'Home',
    register: 'Register Orphan',
    list: 'Orphans List',
    donors: 'Donors',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Logout',
    reports_monthly: 'Monthly Reports',
    reports_yearly: 'Yearly Reports',
    reports_custom: 'Custom Reports',

    /* form labels */
    child_information: 'CHILD INFORMATION',
    child_name: 'CHILD NAME',
    guardian_name: 'GURDIAN NAME',
    birthday: 'BIRTHDAY',
    child_id: 'CHILD ID',
    phone: 'PHONE',
    location: 'LOCATION',
    adoption_info: 'ADOPTION INFO',
    donor_name: 'DONOR NAME',
    donor_phone: 'DONOR PHONE',
    address: 'ADDRESS',
    child_image: 'CHILD IMAGE',
      place_child_name: 'e.g. Ahmad Ali',
      place_guardian_name: 'e.g. Guardian full name',
      place_child_id: 'Unique child identifier',
      place_phone: 'Numbers only',
      place_location: 'City / Area',
      place_donor_name: 'Donor full name',
      place_donor_phone: 'Numbers only',
      place_address: 'Donor address',
      btn_save: 'Save',
      btn_reset: 'Reset',
      btn_edit: 'Edit',
      btn_delete: 'Delete',
      msg_saved: 'Orphan registered successfully',
      msg_fill_required: 'Please fill all required fields',
      msg_phone_invalid: 'Phone must be digits only',

    save: 'Save',
    reset: 'Reset',
    edit: 'Edit',
    delete: 'Delete',
    saved_success: 'Orphan saved successfully',
    delete_confirm: 'Are you sure you want to delete this record?',
    deleted: 'Deleted',
    undo: 'Undo',

    export: 'Export',
    import: 'Import',
    import_prompt: 'Choose a JSON file to import',
    import_success: 'Import completed',
    import_error: 'Import failed: invalid file',

    print: 'Print Certificate',
    contact_title: 'CONTACT INFORMATION'
  },
  ar: {
    orgName: 'كفالة أطفال غزة',
    home: 'الرئيسية',
    register: 'تسجيل يتيم',
    list: 'قائمة الأيتام',
    donors: 'الكافلون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    reports_monthly: 'تقارير شهرية',
    reports_yearly: 'تقارير سنوية',
    reports_custom: 'تقارير مخصصة',

    /* form labels */
    child_information: 'معلومات الطفل',
    child_name: 'اسم الطفل',
    guardian_name: 'اسم الوصي',
    birthday: 'تاريخ الميلاد',
    child_id: 'معرّف الطفل',
    phone: 'الهاتف',
    location: 'الموقع',
    adoption_info: 'معلومات التبني',
    donor_name: 'اسم المتبرع',
    donor_phone: 'هاتف المتبرع',
    address: 'العنوان',
    child_image: 'صورة الطفل',
      place_child_name: 'مثال: أحمد علي',
      place_guardian_name: 'مثال: اسم ولي الأمر',
      place_child_id: 'معرّف فريد للطفل',
      place_phone: 'أرقام فقط',
      place_location: 'المدينة / المنطقة',
      place_donor_name: 'اسم المتبرع',
      place_donor_phone: 'أرقام فقط',
      place_address: 'عنوان المتبرع',
      btn_save: 'حفظ',
      btn_reset: 'إعادة تعيين',
      btn_edit: 'تعديل',
      btn_delete: 'حذف',
      msg_saved: 'تم تسجيل اليتيم بنجاح',
      msg_fill_required: 'يرجى ملء جميع الحقول المطلوبة',
      msg_phone_invalid: 'يجب أن يحتوي الهاتف على أرقام فقط',

    save: 'حفظ',
    reset: 'إعادة تعيين',
    edit: 'تعديل',
    delete: 'حذف',
    saved_success: 'تم حفظ اليتيم بنجاح',
    delete_confirm: 'هل أنت متأكد أنك تريد حذف هذا السجل؟',
    deleted: 'تم الحذف',
    undo: 'تراجع',

    export: 'تصدير',
    import: 'استيراد',
    import_prompt: 'اختر ملف JSON للاستيراد',
    import_success: 'تم الاستيراد بنجاح',
    import_error: 'فشل الاستيراد: ملف غير صالح',

    print: 'طباعة الشهادة',
    contact_title: 'معلومات الاتصال'
  }
};

// Settings translations
window.TRANSLATIONS.en.settings_title = 'Settings';
window.TRANSLATIONS.en.settings_back = 'Back';
window.TRANSLATIONS.en.settings_open_full = 'Open full page';
window.TRANSLATIONS.en.settings_sections = {
  language: 'Language',
  account: 'Account',
  notifications: 'Notifications',
  design: 'Design / Theme',
  advanced: 'Advanced'
};
window.TRANSLATIONS.en.lang_ar = 'Arabic';
window.TRANSLATIONS.en.lang_en = 'English';
window.TRANSLATIONS.en.profile_name = 'Full Name';
window.TRANSLATIONS.en.profile_email = 'Email';
window.TRANSLATIONS.en.profile_phone = 'Phone';
window.TRANSLATIONS.en.profile_password = 'Password';
window.TRANSLATIONS.en.save_changes = 'Save Changes';
window.TRANSLATIONS.en.notifications_enable = 'Enable Notifications';
window.TRANSLATIONS.en.theme_day = 'Day Mode';
window.TRANSLATIONS.en.theme_night = 'Night Mode';
window.TRANSLATIONS.en.advanced_manage_donors = 'Manage Donors';
window.TRANSLATIONS.en.advanced_export = 'Export Reports';

window.TRANSLATIONS.ar.settings_title = 'الإعدادات';
window.TRANSLATIONS.ar.settings_back = 'رجوع';
window.TRANSLATIONS.ar.settings_open_full = 'افتح الصفحة الكاملة';
window.TRANSLATIONS.ar.settings_sections = {
  language: 'اللغة',
  account: 'الحساب الشخصي',
  notifications: 'الإشعارات',
  design: 'التصميم / الواجهة',
  advanced: 'خيارات متقدمة'
};
window.TRANSLATIONS.ar.lang_ar = 'العربية';
window.TRANSLATIONS.ar.lang_en = 'English';
window.TRANSLATIONS.ar.profile_name = 'الاسم الكامل';
window.TRANSLATIONS.ar.profile_email = 'البريد الإلكتروني';
window.TRANSLATIONS.ar.profile_phone = 'رقم الهاتف';
window.TRANSLATIONS.ar.profile_password = 'كلمة المرور';
window.TRANSLATIONS.ar.save_changes = 'حفظ التغييرات';
window.TRANSLATIONS.ar.notifications_enable = 'تفعيل الإشعارات';
window.TRANSLATIONS.ar.theme_day = 'الوضع النهاري';
window.TRANSLATIONS.ar.theme_night = 'الوضع الليلي';
window.TRANSLATIONS.ar.advanced_manage_donors = 'إدارة بيانات الكافلين';
window.TRANSLATIONS.ar.advanced_export = 'تصدير التقارير';


// Welcome and quick actions
window.TRANSLATIONS.en.welcomeTitle = 'Welcome to the Orphan Sponsorship System';
window.TRANSLATIONS.en.welcomeMsg = 'Quickly register and manage sponsored orphans. Use the shortcuts below to get started.';
window.TRANSLATIONS.en.quick_register = 'Register Orphan';
window.TRANSLATIONS.en.quick_list = 'Orphans List';
window.TRANSLATIONS.en.quick_donors = 'Donors';
window.TRANSLATIONS.en.quick_reports = 'Reports';

window.TRANSLATIONS.ar.welcomeTitle = 'مرحباً بكم في نظام كفالة أطفال غزة\nمن انفاق في سبيل الله أكيدمى';
window.TRANSLATIONS.ar.welcomeMsg = 'سجّل الأيتام وادِرهم بسرعة وأمان. استخدم الأزرار السريعة أدناه للبدء.';
window.TRANSLATIONS.ar.quick_register = 'تسجيل يتيم جديد';
window.TRANSLATIONS.ar.quick_list = 'قائمة الأيتام';
window.TRANSLATIONS.ar.quick_donors = 'الكافلون';
window.TRANSLATIONS.ar.quick_reports = 'التقارير';

