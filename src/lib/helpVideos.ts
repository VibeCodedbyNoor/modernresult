export interface HelpVideo {
  id: string;
  titleKey: string;
  descriptionKey: string;
  youtubeId: string;
  category: 'getting-started' | 'exams' | 'credits' | 'settings' | 'referrals';
}

export const helpVideos: HelpVideo[] = [
  {
    id: 'overview',
    titleKey: 'help.vid_overview',
    descriptionKey: 'help.vid_overview_desc',
    youtubeId: 'mOJtmiu0ZiU',
    category: 'getting-started',
  },
  {
    id: 'create-exam',
    titleKey: 'help.vid_create_exam',
    descriptionKey: 'help.vid_create_exam_desc',
    youtubeId: 'mOJtmiu0ZiU',
    category: 'exams',
  },
  {
    id: 'upload-results',
    titleKey: 'help.vid_upload',
    descriptionKey: 'help.vid_upload_desc',
    youtubeId: 'mOJtmiu0ZiU',
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
    youtubeId: 'mOJtmiu0ZiU',
    category: 'settings',
  },
];

export const videoTranslations: Record<string, Record<string, string>> = {
  en: {
    'help.vid_overview': 'Complete Tutorial – Full Platform Guide',
    'help.vid_overview_desc': 'Learn signup, school setup, exam creation, result upload, design change & more. Covers everything except buying credits. 📱 Recorded on PC — the method is the same on mobile.',
    'help.vid_create_exam': 'How to Create an Exam',
    'help.vid_create_exam_desc': 'Step-by-step guide to creating your first exam (covered in the full tutorial)',
    'help.vid_upload': 'How to Upload Results',
    'help.vid_upload_desc': 'Upload Excel/CSV files and map columns correctly (covered in the full tutorial)',
    'help.vid_credits': 'How to Buy Credits',
    'help.vid_credits_desc': 'Purchase credits via Easypaisa or JazzCash — Video coming soon!',
    'help.vid_design': 'How to Change Portal Design',
    'help.vid_design_desc': 'Choose and apply a new design template for your portal (covered in the full tutorial)',
  },
  ur: {
    'help.vid_overview': 'مکمل ٹیوٹوریل – پورے پلیٹ فارم کی رہنمائی',
    'help.vid_overview_desc': 'سائن اپ، اسکول سیٹ اپ، امتحان بنانا، نتائج اپ لوڈ، ڈیزائن تبدیل کرنا سب سیکھیں۔ کریڈٹس خریدنے کے علاوہ سب کچھ شامل ہے۔ 📱 پی سی پر ریکارڈ کیا گیا — موبائل پر بھی طریقہ ایک ہی ہے۔',
    'help.vid_create_exam': 'امتحان کیسے بنائیں',
    'help.vid_create_exam_desc': 'اپنا پہلا امتحان بنانے کی مرحلہ وار رہنمائی (مکمل ٹیوٹوریل میں شامل ہے)',
    'help.vid_upload': 'نتائج کیسے اپ لوڈ کریں',
    'help.vid_upload_desc': 'ایکسل/CSV فائلیں اپ لوڈ کریں اور کالم صحیح میپ کریں (مکمل ٹیوٹوریل میں شامل ہے)',
    'help.vid_credits': 'کریڈٹس کیسے خریدیں',
    'help.vid_credits_desc': 'ایزی پیسہ یا جیز کیش سے کریڈٹس خریدیں — ویڈیو جلد آ رہی ہے!',
    'help.vid_design': 'پورٹل ڈیزائن کیسے تبدیل کریں',
    'help.vid_design_desc': 'اپنے پورٹل کے لیے نیا ڈیزائن ٹیمپلیٹ منتخب کریں (مکمل ٹیوٹوریل میں شامل ہے)',
  },
};
