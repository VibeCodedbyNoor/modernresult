export interface HelpVideo {
  id: string;
  titleKey: string;
  descriptionKey: string;
  youtubeId: string; // Replace with real YouTube IDs when ready
  category: 'getting-started' | 'exams' | 'credits' | 'settings' | 'referrals';
}

// Add your real YouTube video IDs here. Use empty string to hide a video.
export const helpVideos: HelpVideo[] = [
  {
    id: 'overview',
    titleKey: 'help.vid_overview',
    descriptionKey: 'help.vid_overview_desc',
    youtubeId: 'rh5KMo02dTU',
    category: 'getting-started',
  },
  {
    id: 'create-exam',
    titleKey: 'help.vid_create_exam',
    descriptionKey: 'help.vid_create_exam_desc',
    youtubeId: '',
    category: 'exams',
  },
  {
    id: 'upload-results',
    titleKey: 'help.vid_upload',
    descriptionKey: 'help.vid_upload_desc',
    youtubeId: '',
    category: 'exams',
  },
  {
    id: 'buy-credits',
    titleKey: 'help.vid_credits',
    descriptionKey: 'help.vid_credits_desc',
    youtubeId: '',
    category: 'credits',
  },
  {
    id: 'change-design',
    titleKey: 'help.vid_design',
    descriptionKey: 'help.vid_design_desc',
    youtubeId: '',
    category: 'settings',
  },
];

// Video title/desc translations - add these to translations.ts if you want them translated
// For now they use English fallback keys
export const videoTranslations: Record<string, Record<string, string>> = {
  en: {
    'help.vid_overview': 'Complete Overview',
    'help.vid_overview_desc': 'Learn how to use the full platform in 5 minutes',
    'help.vid_create_exam': 'How to Create an Exam',
    'help.vid_create_exam_desc': 'Step-by-step guide to creating your first exam',
    'help.vid_upload': 'How to Upload Results',
    'help.vid_upload_desc': 'Upload Excel/CSV files and map columns correctly',
    'help.vid_credits': 'How to Buy Credits',
    'help.vid_credits_desc': 'Purchase credits via Easypaisa or JazzCash',
    'help.vid_design': 'How to Change Portal Design',
    'help.vid_design_desc': 'Choose and apply a new design template for your portal',
  },
  ur: {
    'help.vid_overview': 'مکمل جائزہ',
    'help.vid_overview_desc': '5 منٹ میں پورا پلیٹ فارم استعمال کرنا سیکھیں',
    'help.vid_create_exam': 'امتحان کیسے بنائیں',
    'help.vid_create_exam_desc': 'اپنا پہلا امتحان بنانے کی مرحلہ وار رہنمائی',
    'help.vid_upload': 'نتائج کیسے اپ لوڈ کریں',
    'help.vid_upload_desc': 'ایکسل/CSV فائلیں اپ لوڈ کریں اور کالم صحیح میپ کریں',
    'help.vid_credits': 'کریڈٹس کیسے خریدیں',
    'help.vid_credits_desc': 'ایزی پیسہ یا جیز کیش سے کریڈٹس خریدیں',
    'help.vid_design': 'پورٹل ڈیزائن کیسے تبدیل کریں',
    'help.vid_design_desc': 'اپنے پورٹل کے لیے نیا ڈیزائن ٹیمپلیٹ منتخب کریں اور لگائیں',
  },
};
