/**
 * Dar al Dawa Medical Center - Central Configuration & Data
 * Easily customizable data source for departments, doctors, packages, contact info, and bilingual content.
 */

export interface Doctor {
  id: string;
  name: string;
  nameUrdu: string;
  departmentId: string;
  specialty: string;
  specialtyUrdu: string;
  qualification: string;
  experience: string;
  opdTimings: string;
  opdTimingsUrdu: string;
  days: string;
  daysUrdu: string;
  feePKR: number;
  image: string;
  about: string;
  aboutUrdu: string;
  pmdcNo: string;
  active?: boolean;
}

export interface Department {
  id: string;
  title: string;
  titleUrdu: string;
  iconName: string;
  description: string;
  descriptionUrdu: string;
  fullDescription?: string;
  image?: string;
  order?: number;
  features: string[];
  featuresUrdu: string[];
  headDoctor: string;
}

export interface ServiceFacility {
  id: string;
  title: string;
  titleUrdu: string;
  iconName: string;
  description: string;
  descriptionUrdu: string;
  badge?: string;
  badgeUrdu?: string;
  image: string;
}

export interface HealthPackage {
  id: string;
  title: string;
  titleUrdu: string;
  originalPrice: number;
  discountedPrice: number;
  popular?: boolean;
  category: string;
  categoryUrdu: string;
  testsIncluded: string[];
  testsIncludedUrdu: string[];
  fastingRequired: string;
  fastingRequiredUrdu: string;
  reportTime: string;
  reportTimeUrdu: string;
}

export interface Testimonial {
  id: string;
  name: string;
  nameUrdu: string;
  city: string;
  cityUrdu: string;
  rating: number;
  department: string;
  departmentUrdu: string;
  comment: string;
  commentUrdu: string;
  date: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleUrdu: string;
  slug: string;
  category: string;
  categoryUrdu: string;
  author: string;
  authorUrdu: string;
  date: string;
  readTime: string;
  readTimeUrdu: string;
  image: string;
  excerpt: string;
  excerptUrdu: string;
  content: string[];
  contentUrdu: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  questionUrdu: string;
  answer: string;
  answerUrdu: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleUrdu: string;
  category: 'facilities' | 'theatres' | 'wards' | 'diagnostics';
  categoryLabel: string;
  categoryLabelUrdu: string;
  image: string;
  description: string;
  descriptionUrdu: string;
}

export const HOSPITAL_CONFIG = {
  name: "Dar al Dawa Medical Center",
  nameUrdu: "دار الدواء میڈیکل سنٹر",
  tagline: "Caring for You, Every Step of the Way",
  taglineUrdu: "ہر قدم پر آپ کی صحت اور دیکھ بھال کا امین",
  logo: "/assets/aistudio/image_424d9421.png",
  favicon: "/assets/aistudio/image_424d9421.png",
  shortDesc: "Premier tertiary-care teaching & general hospital in Lahore, Punjab delivering 24/7 critical emergency care, world-class surgical facilities, and compassionate specialized treatments.",
  shortDescUrdu: "لاہور، پنجاب میں 24/7 ایمرجنسی، جدید ترین سرجیکل اور اسپیشلسٹ طبی سہولیات سے آراستہ جدید ترین ہسپتال۔",
  
  socialLinks: {
    facebook: "https://facebook.com/daraldawamedical",
    instagram: "https://instagram.com/daraldawamedical",
    youtube: "https://youtube.com/@daraldawamedical",
    tiktok: "https://tiktok.com/@daraldawamedical",
    twitter: "https://twitter.com/daraldawamedical"
  },

  contact: {
    emergencyNumber: "042-111-327-227", // 042-111-DAR-DAR
    emergencyNumberRaw: "042111327227",
    mobileEmergency: "+92 300 1234567",
    receptionPhone: "+92 42 35789000",
    phoneNumbers: ["042-111-327-227", "+92 42 35789000", "+92 300 1234567"],
    whatsapp: "+92 300 1234567",
    whatsappClean: "923001234567",
    email: "info@daraldawa.pk",
    appointmentEmail: "appointments@daraldawa.pk",
    address: "42-A, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan",
    addressUrdu: "42-اے، مین بلیوارڈ، گلبرگ 3، لاہور، پنجاب، پاکستان",
    landmark: "Near Siddiq Trade Center & Liberty Roundabout",
    landmarkUrdu: "صدیق ٹریڈ سنٹر اور لبرٹی چوک کے قریب",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13606.843789048386!2d74.34003295!3d31.50570885!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919045a687353f1%3A0xe546b2b512c8b8a3!2sGulberg%20III%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s",
    hours: {
      emergency: "24 Hours / 7 Days a Week",
      emergencyUrdu: "24 گھنٹے / ہفتے کے 7 دن بلا تعطل",
      opd: "Mon - Sat: 8:00 AM – 10:00 PM | Sun: 10:00 AM – 4:00 PM",
      opdUrdu: "پیر تا ہفتہ: صبح 8 تا رات 10 بجے | اتوار: صبح 10 تا شام 4 بجے",
      lab: "24 Hours (Home Sampling 7:00 AM – 8:00 PM)",
      labUrdu: "24 گھنٹے (گھر سے خون کے نمونے: صبح 7 تا شام 8 بجے)",
      pharmacy: "24/7 Open In-House Pharmacy",
      pharmacyUrdu: "24/7 اندرونی مستند فارمیسی"
    }
  },

  trustStats: [
    { value: "25+", label: "Years of Healthcare Excellence", labelUrdu: "سال کا بے مثال طبی اعتماد" },
    { value: "50+", label: "Senior Consultant Specialists", labelUrdu: "سینئر ماہر ڈاکٹرز و سرجنز" },
    { value: "120K+", label: "Happy Patients Treated", labelUrdu: "صحت یاب ہونے والے مریض" },
    { value: "24/7", label: "Immediate Emergency & ICU", labelUrdu: "فوری ایمرجنسی اور آئی سی یو" }
  ],

  accreditations: [
    {
      name: "Punjab Healthcare Commission (PHC)",
      nameUrdu: "پنجاب ہیلتھ کیئر کمیشن",
      badge: "Regular License Category-1",
      badgeUrdu: "کیٹیگری-1 ریگولر لائسنس یافتہ",
      desc: "Full compliance with PHC healthcare service delivery standards."
    },
    {
      name: "Pakistan Medical & Dental Council (PMDC)",
      nameUrdu: "پاکستان میڈیکل اینڈ ڈینٹل کونسل",
      badge: "PMDC Recognized Faculty",
      badgeUrdu: "تسلیم شدہ فیکلٹی اور ڈاکٹرز",
      desc: "All medical specialists hold verified PMDC qualifications."
    },
    {
      name: "Sehat Sahulat Program / Sehat Card Plus",
      nameUrdu: "صحت کارڈ پلس پینل ہسپتال",
      badge: "Government Empaneled",
      badgeUrdu: "حکومتی پینل",
      desc: "Free inpatient treatment under Punjab Sehat Card facility."
    },
    {
      name: "ISO 9001:2015 Certified",
      nameUrdu: "آئی ایس او 9001:2015 مصدقہ",
      badge: "International Standard",
      badgeUrdu: "بین الاقوامی معیار",
      desc: "Certified for medical care, laboratory diagnostics, and patient safety."
    }
  ],

  insurancePartners: [
    "State Life Sehat Card Plus",
    "Jubilee Life Insurance",
    "EFU General Insurance",
    "Adamjee Insurance",
    "Pak-Qatar Family Takaful",
    "Askari General Insurance",
    "Fauji Foundation",
    "WAPDA Hospital Panel"
  ]
};

export const DEPARTMENTS: Department[] = [
  {
    id: "emergency",
    title: "Emergency & Trauma",
    titleUrdu: "ایمرجنسی اور ٹراما سنٹر",
    iconName: "ShieldAlert",
    description: "24/7 rapid response trauma care, advanced resuscitation suites, and immediate life-saving emergency medical interventions.",
    descriptionUrdu: "24 گھنٹے ٹراما اور فوری جان بچانے والے ایمرجنسی علاج کے لیے جدید ترین آئی سی یو لائف سپورٹ سسٹم۔",
    features: ["24/7 On-duty Trauma Surgeons", "Cardiac Resuscitation Room", "High-Dependency Critical Beds", "Rapid Triage & Zero Wait"],
    featuresUrdu: ["24 گھنٹے ٹراما سرجنز دستیاب", "کارڈیک ریسیسیٹیشن روم", "ہائی ڈیپینڈینسی آئی سی یو بیڈز", "بغیر انتظار فوری علاج"],
    headDoctor: "Dr. Bilal Hassan"
  },
  {
    id: "cardiology",
    title: "Cardiology & Heart Care",
    titleUrdu: "امراضِ قلب و کارڈیالوجی",
    iconName: "HeartPulse",
    description: "Comprehensive cardiac diagnostics, ECG, Echocardiography, Holter monitoring, angiography coordination, and heart failure care.",
    descriptionUrdu: "دل کی بیماریوں کی تشخیص، ایکو کارڈیوگرافی، ای سی جی، اور ہارٹ اٹیک کا جدید ترین علاج۔",
    features: ["Digital Echo & Color Doppler", "TMT Stress Testing", "24hr Holter Monitoring", "Cardiac CCU with Telemetry"],
    featuresUrdu: ["ڈیجیٹل ایکو و ڈوپلر", "ٹی ایم ٹی اسسٹریس ٹیسٹ", "24 گھنٹے ہولٹر مانیٹرنگ", "کارڈیالوجی سی سی یو وارڈ"],
    headDoctor: "Dr. Tariq Mahmood"
  },
  {
    id: "gynecology",
    title: "Gynecology & Obstetrics",
    titleUrdu: "امراضِ نسواں و زچگی",
    iconName: "Baby",
    description: "Compassionate maternal care, high-risk pregnancy management, painless delivery, C-sections, and advanced infertility clinics.",
    descriptionUrdu: "محفوظ زچگی، بغیر تکلیف ڈلیوری، نارمل و آپریشن ڈلیوری، اور بانجھ پن کا ماہرانہ علاج۔",
    features: ["Private Labor Suites", "Epidural Painless Delivery", "Fetal Wellbeing Sonography", "Infertility & Laparoscopy"],
    featuresUrdu: ["پرائیویٹ لیبر رومز", "بغیر درد نارمل زچگی", "جدید الٹراساؤنڈ سہولت", "بانجھ پن کا علاج"],
    headDoctor: "Dr. Ayesha Siddiqa"
  },
  {
    id: "pediatrics",
    title: "Pediatrics & Neonatology",
    titleUrdu: "امراضِ اطفال و نومولود",
    iconName: "Smile",
    description: "Dedicated child healthcare from birth through adolescence, equipped with a Level-III Neonatal Intensive Care Unit (NICU).",
    descriptionUrdu: "بچوں اور قبل از وقت پیدا ہونے والے نوزائیدہ بچوں کے لیے جدید ترین این آئی سی یو (NICU) اور ویکسینیشن۔",
    features: ["Level-III NICU with Incubators", "Pediatric Emergency", "Routine Child Vaccination", "Child Growth & Nutrition"],
    featuresUrdu: ["جدید این آئی سی یو و انکیوبیٹرز", "چائلڈ ایمرجنسی سنٹر", "مفت سرکاری و پرائیویٹ ویکسین", "بچوں کی جسمانی نشوونما"],
    headDoctor: "Dr. Zainab Malik"
  },
  {
    id: "orthopedics",
    title: "Orthopedics & Joint Replacement",
    titleUrdu: "ہڈی، جوڑ و مہرہ سرجری",
    iconName: "Activity",
    description: "Expert joint replacement (knee & hip), complex fracture fixations, arthroscopic sports injury repair, and spine surgery.",
    descriptionUrdu: "گھٹنے اور کولہے کے جوڑ کی تبدیلی، فریکچر کا علاج، اور کمر درد و مہروں کی مائیکرو سرجری۔",
    features: ["Knee & Hip Replacement", "Keyhole Arthroscopy", "Spine Decompression", "Rehabilitation Physiotherapy"],
    featuresUrdu: ["جوڑوں کی تبدیلی کا آپریشن", "دوربین سے جوڑوں کی سرجری", "کمر کے مہروں کا علاج", "فزیوتھراپی سنٹر"],
    headDoctor: "Dr. Farhan Ali Cheema"
  },
  {
    id: "general-medicine",
    title: "General Medicine & Diabetology",
    titleUrdu: "جنرل میڈیسن و ذیابیطس",
    iconName: "Stethoscope",
    description: "Holistic internal medicine care covering Diabetes mellitus, Hypertension, liver diseases (Hepatitis B & C), and infectious fevers.",
    descriptionUrdu: "شوگر، بلڈ پریشر، ہیپاٹائٹس بی اور سی، گردے اور عمومی امراض کا جامع کنٹرول۔",
    features: ["Personalized Diabetes Protocol", "Hypertension Clinic", "Hepatitis Eradication Unit", "Geriatric Elderly Care"],
    featuresUrdu: ["شوگر کنٹرول کلینک", "ہائی بلڈ پریشر سنٹر", "ہیپاٹائٹس کا علاج", "بزرگ مریضوں کی دیکھ بھال"],
    headDoctor: "Dr. Muhammad Imran"
  },
  {
    id: "dental",
    title: "Dental Surgery & Implantology",
    titleUrdu: "دندان سازی و ڈینٹل امپلانٹ",
    iconName: "Sparkles",
    description: "Painless root canal treatment, dental implants, cosmetic teeth whitening, pediatric dentistry, and jaw surgery.",
    descriptionUrdu: "جدید ڈینٹل امپلانٹ، روٹ کینال، دانتوں کی خوبصورتی، بریسز اور مسوڑھوں کی دیکھ بھال۔",
    features: ["Digital Dental X-Ray (OPG)", "Titanium Dental Implants", "Laser Teeth Whitening", "Invisalign & Braces"],
    featuresUrdu: ["ڈیجیٹل او پی جی ایکسرے", "مستقل دانتوں کے امپلانٹ", "لیزر وائٹننگ", "بریسز کی تنصیب"],
    headDoctor: "Dr. Usman Tariq"
  },
  {
    id: "ent",
    title: "ENT (Ear, Nose & Throat)",
    titleUrdu: "کان، ناک اور گلے کے امراض",
    iconName: "Ear",
    description: "Microscopic ear surgeries, endoscopic sinus surgery, tonsillectomy, snoring treatments, and clinical audiology.",
    descriptionUrdu: "کان کے پردے کی مائیکرو سرجری، سائنس کا دوربینی علاج، اور سماعت کے ٹیسٹ۔",
    features: ["Endoscopic Sinus Surgery (FESS)", "Tympanoplasty & Mastoid", "Audiometry Hearing Booth", "Snoring / Sleep Apnea Care"],
    featuresUrdu: ["دوربین سے ناک کی سرجری", "کان کے پردے کی پیوند کاری", "کمپیوٹرائزڈ آڈیو میٹری", "خراٹوں کا علاج"],
    headDoctor: "Dr. Noman Arshad"
  },
  {
    id: "ophthalmology",
    title: "Ophthalmology & Eye Surgery",
    titleUrdu: "امراضِ چشم و لیزر سرجری",
    iconName: "Eye",
    description: "Phaco sutureless cataract surgery with premium foldable lenses, glaucoma laser care, diabetic retinopathy, and vision testing.",
    descriptionUrdu: "بغیر ٹانکے موتیا کا فیکو آپریشن، کالے موتیے کا لیزر علاج، اور شوگر سے متاثرہ آنکھوں کا علاج۔",
    features: ["No-Stitch Phaco Cataract", "YAG Laser Capsulotomy", "OCT Retinal Scan", "Pediatric Squint Clinic"],
    featuresUrdu: ["بغیر ٹانکے کے سفید موتیا آپریشن", "یاگ لیزر مشین", "او سی ٹی آنکھ کا اسکین", "بھینگے پن کا علاج"],
    headDoctor: "Dr. M. Qasim Bashir"
  },
  {
    id: "dermatology",
    title: "Dermatology & Cosmetology",
    titleUrdu: "امراضِ جلد، بال و لیزر",
    iconName: "Flame",
    description: "Clinical skin solutions for acne, eczema, psoriasis, hair loss (PRP therapy), and state-of-the-art cosmetic laser treatments.",
    descriptionUrdu: "کیل مہاسے، الرجی، ایگزیما، گرتے بالوں کے لیے پی آر پی (PRP) اور جدید لیزر علاج۔",
    features: ["PRP Hair Restoration", "Acne Scar Resurfacing", "HydraFacial Medical Cleanse", "Skin Allergy Patch Tests"],
    featuresUrdu: ["پی آر پی بالوں کا علاج", "کیل مہاسوں کے داغ کا خاتمہ", "میڈیکل ہائیڈرا فیشل", "جلد کی الرجی ٹیسٹ"],
    headDoctor: "Dr. Sadia Noreen"
  },
  {
    id: "radiology",
    title: "Radiology & Advanced Imaging",
    titleUrdu: "ریڈیالوجی و جدید اسکیننگ",
    iconName: "Scan",
    description: "High-definition diagnostic imaging with 128-Slice CT scanner, 1.5T MRI, 4D Color Ultrasound, and Low-Dose Digital X-Ray.",
    descriptionUrdu: "128 سلائس سی ٹی اسکین، ایم آر آئی، 4D کلر ڈوپلر الٹراساؤنڈ اور ڈیجیٹل ایکسرے۔",
    features: ["128-Slice Multi-detector CT", "4D Pregnancy Ultrasound", "Digital Mammography", "Instant Digital PACS Reports"],
    featuresUrdu: ["128 سلائس ملٹی ڈیٹیکٹر سی ٹی", "4D حاملہ خواتین کا الٹراساؤنڈ", "ڈیجیٹل میموگرافی", "فوری آن لائن رپورٹ"],
    headDoctor: "Dr. Naveed Raza"
  },
  {
    id: "laboratory",
    title: "Pathology & Clinical Laboratory",
    titleUrdu: "پیتھالوجی و لیبارٹری",
    iconName: "FlaskConical",
    description: "Fully automated, ISO-compliant medical laboratory offering 500+ diagnostic tests with barcode precision and Lahore-wide home sampling.",
    descriptionUrdu: "مکمل خودکار آئی ایس او معیاری لیب، تیز رفتار آن لائن رپورٹس اور گھر سے مفت نمونے حاصل کرنے کی سہولت۔",
    features: ["Barcode Error-Free Testing", "Free Home Sample Collection", "Same-Day Blood Reports", "WhatsApp & Portal Download"],
    featuresUrdu: ["بارکوڈ ٹیسٹنگ سسٹم", "لاہور بھر میں مفت ہوم سیمپلنگ", "اسی روز بلڈ رپورٹس", "واٹس ایپ پر فوری رپورٹ"],
    headDoctor: "Prof. Dr. Mansoor Ahmad"
  },
  {
    id: "pharmacy",
    title: "24/7 In-House Pharmacy",
    titleUrdu: "24 گھنٹے ان ہاؤس فارمیسی",
    iconName: "Pill",
    description: "Fully temperature-controlled pharmacy stocking 100% genuine multinational and national pharmaceuticals, vaccines, and surgical supplies.",
    descriptionUrdu: "مستند دوائیوں کا وسیع ذخیرہ، کولڈ چین انسولین اور ویکسین، اور تجربہ کار مستند فارماسسٹ۔",
    features: ["100% Genuine Medicine Guarantee", "Strict Cold-Chain Vaccines", "Computerized Billing", "Emergency Doorstep Delivery"],
    featuresUrdu: ["100 فیصد اصلی ادویات", "کولڈ چین کے تحت ویکسین", "کمپیوٹرائزڈ انوائس", "ایمرجنسی ہوم ڈیلیوری"],
    headDoctor: "Pharm. Raheel Butt"
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: "doc-tariq",
    name: "Dr. Tariq Mahmood",
    nameUrdu: "ڈاکٹر طارق محمود",
    departmentId: "cardiology",
    specialty: "Consultant Interventional Cardiologist",
    specialtyUrdu: "کنسلٹنٹ انٹروینشنل ماہر امراضِ قلب",
    qualification: "MBBS, FCPS (Cardiology), FACC (USA)",
    experience: "22+ Years Experience",
    opdTimings: "05:00 PM – 09:00 PM",
    opdTimingsUrdu: "شام 5 تا رات 9 بجے",
    days: "Monday to Friday",
    daysUrdu: "پیر تا جمعہ",
    feePKR: 3000,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    about: "Former Head of Cardiology at Punjab Institute of Cardiology (PIC). Specializes in coronary angiograms, post-infarction care, and preventive hypertension management.",
    aboutUrdu: "پی آئی سی کے سابق سربراہ اور نامور ماہر امراضِ قلب، دل کے دورے اور ہائی بلڈ پریشر کے ماہر۔",
    pmdcNo: "12894-P"
  },
  {
    id: "doc-ayesha",
    name: "Dr. Ayesha Siddiqa",
    nameUrdu: "ڈاکٹر عائشہ صدیقہ",
    departmentId: "gynecology",
    specialty: "Senior Consultant Gynecologist & Obstetrician",
    specialtyUrdu: "سینئر کنسلٹنٹ ماہر امراضِ نسواں و زچگی",
    qualification: "MBBS, FCPS (Obs & Gynae), MRCOG (UK)",
    experience: "18+ Years Experience",
    opdTimings: "10:00 AM – 03:00 PM",
    opdTimingsUrdu: "صبح 10 تا سہ پہر 3 بجے",
    days: "Monday to Saturday",
    daysUrdu: "پیر تا ہفتہ",
    feePKR: 2500,
    image: "https://images.unsplash.com/photo-1594824813588-e25dfb0439ef?auto=format&fit=crop&w=600&q=80",
    about: "Gold medalist gynecologist trained in London, UK. Renowned for painless deliveries, high-risk twin pregnancies, and laparoscopic fertility surgeries.",
    aboutUrdu: "برطانیہ سے تربیت یافتہ، بے درد زچگی اور پیچیدہ حمل کے کیسز کی مایہ ناز ماہر۔",
    pmdcNo: "19321-P"
  },
  {
    id: "doc-farhan",
    name: "Dr. Farhan Ali Cheema",
    nameUrdu: "ڈاکٹر فرحان علی چیمہ",
    departmentId: "orthopedics",
    specialty: "Chief Orthopedic & Spine Surgeon",
    specialtyUrdu: "چیف آرتھوپیڈک و اسپائن سرجن",
    qualification: "MBBS, FCPS (Ortho), Fellowship Arthroscopy (Germany)",
    experience: "16+ Years Experience",
    opdTimings: "04:00 PM – 08:00 PM",
    opdTimingsUrdu: "شام 4 تا رات 8 بجے",
    days: "Mon, Wed, Fri, Sat",
    daysUrdu: "پیر، بدھ، جمعہ، ہفتہ",
    feePKR: 2800,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    about: "Pioneer of minimally invasive joint replacement in Lahore. Has completed more than 3,500 successful knee and hip replacements with rapid recovery protocols.",
    aboutUrdu: "جرمنی سے تربیت یافتہ، گھٹنے و کولہے کے جوڑوں کی تبدیلی اور کھیلوں کے زخموں کے سرجن۔",
    pmdcNo: "24115-P"
  },
  {
    id: "doc-zainab",
    name: "Dr. Zainab Malik",
    nameUrdu: "ڈاکٹر زینب ملک",
    departmentId: "pediatrics",
    specialty: "Consultant Pediatrician & Neonatologist",
    specialtyUrdu: "کنسلٹنٹ ماہر امراضِ اطفال و نوزائیدہ بچے",
    qualification: "MBBS, FCPS (Pediatrics), MCPS",
    experience: "14+ Years Experience",
    opdTimings: "11:00 AM – 04:00 PM",
    opdTimingsUrdu: "صبح 11 تا سہ پہر 4 بجے",
    days: "Monday to Friday",
    daysUrdu: "پیر تا جمعہ",
    feePKR: 2000,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    about: "Dedicated pediatrician known for gentle patient care, childhood asthma management, pediatric nutrition, and neonatal intensive monitoring.",
    aboutUrdu: "بچوں کے سینے کے امراض، نمونیا، غذائی کمی اور نوزائیدہ بچوں کی دیکھ بھال کی ماہر۔",
    pmdcNo: "28409-P"
  },
  {
    id: "doc-imran",
    name: "Dr. Muhammad Imran",
    nameUrdu: "ڈاکٹر محمد عمران",
    departmentId: "general-medicine",
    specialty: "Consultant Physician & Diabetologist",
    specialtyUrdu: "کنسلٹنٹ فزیشن و شوگر اسپیشلسٹ",
    qualification: "MBBS, FCPS (Medicine), MRCP (UK)",
    experience: "20+ Years Experience",
    opdTimings: "03:00 PM – 07:00 PM",
    opdTimingsUrdu: "سہ پہر 3 تا شام 7 بجے",
    days: "Monday to Saturday",
    daysUrdu: "پیر تا ہفتہ",
    feePKR: 2500,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    about: "Senior internal medicine physician focusing on complex metabolic disorders, diabetic foot prevention, hypertension, and resistant viral fevers.",
    aboutUrdu: "شوگر اور بلڈ پریشر کے مریضوں کے پچیدہ مسائل اور عمومی فزیشن کیئر کے سینئر ڈاکٹر۔",
    pmdcNo: "16782-P"
  },
  {
    id: "doc-sadia",
    name: "Dr. Sadia Noreen",
    nameUrdu: "ڈاکٹر سعدیہ نورین",
    departmentId: "dermatology",
    specialty: "Consultant Dermatologist & Aesthetician",
    specialtyUrdu: "کنسلٹنٹ ماہر امراضِ جلد و کاسمیٹک سرجن",
    qualification: "MBBS, FCPS (Dermatology)",
    experience: "12+ Years Experience",
    opdTimings: "05:00 PM – 08:30 PM",
    opdTimingsUrdu: "شام 5 تا رات 8:30 بجے",
    days: "Tuesday, Thursday, Saturday",
    daysUrdu: "منگل، جمعرات، ہفتہ",
    feePKR: 2500,
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
    about: "Specialized in stubborn acne treatments, hair thinning therapies (PRP), pigmentation correction, and medical-grade anti-aging skin protocols.",
    aboutUrdu: "ایکنی، بالوں کا گرنا، جلد کی الرجی اور جدید لیزر علاج کی مستند کنسلٹنٹ۔",
    pmdcNo: "33890-P"
  },
  {
    id: "doc-bilal",
    name: "Dr. Bilal Hassan",
    nameUrdu: "ڈاکٹر بلال حسن",
    departmentId: "emergency",
    specialty: "Chief Emergency Medicine & Trauma Surgeon",
    specialtyUrdu: "چیف ایمرجنسی میڈیسن و ٹراما سرجن",
    qualification: "MBBS, FCPS (Emergency Medicine), ATLS (USA)",
    experience: "15+ Years Experience",
    opdTimings: "24/7 On-Duty Rota & Resuscitation",
    opdTimingsUrdu: "24 گھنٹے ایمرجنسی شفٹ و نگہداشت",
    days: "Monday to Sunday (24/7)",
    daysUrdu: "پیر تا اتوار (24 گھنٹے)",
    feePKR: 2000,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80",
    about: "Lead trauma director specialized in acute myocardial infarction stabilization, polytrauma resuscitation, stroke protocol, and advanced life support.",
    aboutUrdu: "ایمرجنسی و ٹراما کے ماہر سرجن، دل کے دورے اور فوری جان بچانے والی طبی سہولیات کے نگراں۔",
    pmdcNo: "31289-P"
  },
  {
    id: "doc-usman",
    name: "Dr. Usman Tariq",
    nameUrdu: "ڈاکٹر عثمان طارق",
    departmentId: "dental",
    specialty: "Consultant Dental Surgeon & Implantologist",
    specialtyUrdu: "کنسلٹنٹ ڈینٹل سرجن و امپلانٹ اسپیشلسٹ",
    qualification: "BDS, RDS, C-Implants (USA), MCPS",
    experience: "13+ Years Experience",
    opdTimings: "04:00 PM – 09:00 PM",
    opdTimingsUrdu: "شام 4 تا رات 9 بجے",
    days: "Monday to Saturday",
    daysUrdu: "پیر تا ہفتہ",
    feePKR: 1500,
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    about: "Specializes in painless computer-guided titanium dental implants, root canal treatment, Hollywood smile design, veneers, and orthodontic braces.",
    aboutUrdu: "مستقل ڈینٹل امپلانٹ، روٹ کینال، اور کاسمیٹک دانتوں کی خوبصورتی کے نامور ماہر۔",
    pmdcNo: "21908-D"
  },
  {
    id: "doc-noman",
    name: "Dr. Noman Arshad",
    nameUrdu: "ڈاکٹر نعمان ارشد",
    departmentId: "ent",
    specialty: "Consultant ENT, Head & Neck Surgeon",
    specialtyUrdu: "کنسلٹنٹ ای این ٹی، ناک، کان، گلا و ہیڈ اینڈ نیک سرجن",
    qualification: "MBBS, FCPS (ENT), Fellowship Rhinology (UK)",
    experience: "16+ Years Experience",
    opdTimings: "05:00 PM – 08:30 PM",
    opdTimingsUrdu: "شام 5 تا رات 8:30 بجے",
    days: "Mon, Tue, Thu, Fri",
    daysUrdu: "پیر، منگل، جمعرات، جمعہ",
    feePKR: 2500,
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=600&q=80",
    about: "Pioneer in functional endoscopic sinus surgery (FESS), tympanoplasty, micro-laryngeal surgery, snoring treatments, and audiology hearing diagnostics.",
    aboutUrdu: "ناک، کان اور گلے کے جدید مائیکرو اسکوپک اور دوربینی آپریشنز کے سینئر کنسلٹنٹ۔",
    pmdcNo: "26441-P"
  },
  {
    id: "doc-qasim",
    name: "Dr. M. Qasim Bashir",
    nameUrdu: "ڈاکٹر محمد قاسم بشیر",
    departmentId: "ophthalmology",
    specialty: "Consultant Eye Surgeon & Phaco Specialist",
    specialtyUrdu: "کنسلٹنٹ ماہر امراضِ چشم و فیکو سرجن",
    qualification: "MBBS, FCPS (Ophthalmology), FRCS (Glasgow)",
    experience: "19+ Years Experience",
    opdTimings: "03:30 PM – 07:30 PM",
    opdTimingsUrdu: "سہ پہر 3:30 تا شام 7:30 بجے",
    days: "Monday to Friday",
    daysUrdu: "پیر تا جمعہ",
    feePKR: 2500,
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=600&q=80",
    about: "Over 8,000 successful sutureless cataract surgeries performed with premium multifocal and toric IOL implants, plus diabetic retinopathy laser treatments.",
    aboutUrdu: "بغیر ٹانکے کے سفید موتیے کے فیکو آپریشن، کالے موتیے اور ریٹینا لیزر کے معروف سرجن۔",
    pmdcNo: "18920-P"
  },
  {
    id: "doc-naveed",
    name: "Dr. Naveed Raza",
    nameUrdu: "ڈاکٹر نوید رضا",
    departmentId: "radiology",
    specialty: "Consultant Radiologist & Cross-Sectional Imaging",
    specialtyUrdu: "کنسلٹنٹ ریڈیالوجسٹ و امیجنگ اسپیشلسٹ",
    qualification: "MBBS, DMRD, FCPS (Radiology)",
    experience: "17+ Years Experience",
    opdTimings: "09:00 AM – 03:00 PM",
    opdTimingsUrdu: "صبح 9 تا سہ پہر 3 بجے",
    days: "Monday to Saturday",
    daysUrdu: "پیر تا ہفتہ",
    feePKR: 2000,
    image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=600&q=80",
    about: "Expert in 128-slice CT angiography reporting, 4D anomaly pregnancy ultrasound, MRI brain/musculoskeletal diagnostics, and image-guided biopsies.",
    aboutUrdu: "سی ٹی اسکین، ایم آر آئی اور 4D کلر ڈوپلر الٹراساؤنڈ کی مستند رپورٹنگ کے سربراہ۔",
    pmdcNo: "27814-P"
  },
  {
    id: "doc-mansoor",
    name: "Prof. Dr. Mansoor Ahmad",
    nameUrdu: "پروفیسر ڈاکٹر منصور احمد",
    departmentId: "laboratory",
    specialty: "Consultant Pathologist & Laboratory Director",
    specialtyUrdu: "کنسلٹنٹ پیتھالوجسٹ و ڈائریکٹر لیبارٹری",
    qualification: "MBBS, M.Phil (Pathology), FRCPath",
    experience: "25+ Years Experience",
    opdTimings: "09:00 AM – 05:00 PM",
    opdTimingsUrdu: "صبح 9 تا شام 5 بجے",
    days: "Monday to Saturday",
    daysUrdu: "پیر تا ہفتہ",
    feePKR: 1500,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
    about: "Oversees all automated biochemical, hematological, microbiological, and histopathological clinical analyses under strict ISO 15189 compliance.",
    aboutUrdu: "25 سالہ تجربہ کار پیتھالوجسٹ، تمام خون و بائیوپسی ٹیسٹوں کے تصدیق کنندہ۔",
    pmdcNo: "11520-P"
  },
  {
    id: "doc-raheel",
    name: "Pharm. Raheel Butt",
    nameUrdu: "فارماسسٹ راحیل بٹ",
    departmentId: "pharmacy",
    specialty: "Chief Clinical Pharmacist",
    specialtyUrdu: "چیف کلینیکل فارماسسٹ",
    qualification: "Pharm-D, M.Phil (Clinical Pharmacy), RPh",
    experience: "11+ Years Experience",
    opdTimings: "08:00 AM – 10:00 PM",
    opdTimingsUrdu: "صبح 8 تا رات 10 بجے",
    days: "Monday to Sunday (Daily)",
    daysUrdu: "پیر تا اتوار (روزانہ)",
    feePKR: 500,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    about: "Coordinates hospital pharmacovigilance, drug interaction safety screening, cold chain vaccine potency, and in-patient dosage regimens.",
    aboutUrdu: "مستند کلینیکل فارماسسٹ، ادویات کے درست استعمال اور محفوظ ترسیل کے نگراں۔",
    pmdcNo: "09441-Pharm"
  }
];

export const SERVICES_FACILITIES: ServiceFacility[] = [
  {
    id: "lab",
    title: "Diagnostic Pathology Lab",
    titleUrdu: "جدید تشخیصی پیتھالوجی لیب",
    iconName: "TestTubes",
    badge: "ISO 15189",
    badgeUrdu: "آئی ایس او تصدیق شدہ",
    description: "High-throughput fully automated Beckman Coulter and Roche clinical chemistry, hematology, immunology, and culture analyzers.",
    descriptionUrdu: "مکمل خودکار اینالائزرز کے ذریعے فوری اور 100 فیصد درست بلڈ ٹیسٹنگ۔",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "imaging",
    title: "128-Slice CT Scan & 4D Ultrasound",
    titleUrdu: "128 سلائس سی ٹی اسکین اور الٹراساؤنڈ",
    iconName: "Radio",
    badge: "Low Radiation",
    badgeUrdu: "محفوظ ترین ریڈی ایشن",
    description: "Sub-millimeter resolution cross-sectional scanning, CT angiography, 4D anomaly pregnancy scans, and digital color doppler.",
    descriptionUrdu: "ہائی ریزولیوشن سی ٹی اسکین اور جدید ترین ڈوپلر کلر الٹراساؤنڈ مشین۔",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "icu",
    title: "Intensive Care Unit (ICU & NICU)",
    titleUrdu: "انتہائی نگہداشت وارڈ (آئی سی یو و این آئی سی یو)",
    iconName: "HeartHandshake",
    badge: "1:1 Nursing",
    badgeUrdu: "خصوصی 1:1 نرسنگ دیکھ بھال",
    description: "Dedicated 18-bed closed ICU with invasive hemodynamic monitoring, high-flow nasal cannulas, and advanced isolation cubicles.",
    descriptionUrdu: "وینٹی لیٹرز، کارڈیک مانیٹرز اور 24 گھنٹے موجود کنسلٹنٹ انٹینسوسٹ ڈاکٹرز۔",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "theatres",
    title: "Modular Operation Theatres",
    titleUrdu: "ماڈیولر آپریشن تھیٹرز",
    iconName: "Stethoscope",
    badge: "Zero Infection",
    badgeUrdu: "جراثیم سے مکمل پاک",
    description: "Four state-of-the-art sterile surgical suites with HEPA laminar air flow, Karl Storz laparoscopic towers, and Zeiss surgical microscopes.",
    descriptionUrdu: "لیمنار ایئر فلو اور جدید ترین دوربینی و مائیکرو سرجری کا سامان۔",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "pharmacy",
    title: "24/7 In-House Pharmacy",
    titleUrdu: "24 گھنٹے ان ہاؤس فارمیسی",
    iconName: "Pill",
    badge: "Genuine Meds",
    badgeUrdu: "اصلی دوائیوں کی ضمانت",
    description: "Climate-controlled pharmaceutical dispensing with computer verification, cold chain tracking, and surgical consumable inventory.",
    descriptionUrdu: "مستند فارماسسٹ کی زیر نگرانی اصل ادویات کی فوری دستیابی۔",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "home-sampling",
    title: "Free Home Blood Sample Collection",
    titleUrdu: "گھر سے مفت بلڈ سیمپل کلیکشن",
    iconName: "Home",
    badge: "Lahore-wide",
    badgeUrdu: "تمام لاہور میں دستیاب",
    description: "Professional certified phlebotomists visit your doorstep with sterile vacuum collection kits anywhere in Lahore within 60 minutes.",
    descriptionUrdu: "فون یا واٹس ایپ پر آرڈر کریں، ماہر عملہ آپ کے گھر آ کر نمونہ حاصل کرے گا۔",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "online-reports",
    title: "Instant Online Reports & WhatsApp Delivery",
    titleUrdu: "آن لائن اور واٹس ایپ رپورٹس",
    iconName: "FileCheck2",
    badge: "Fast & Secure",
    badgeUrdu: "محفوظ و تیز ترین",
    description: "Receive your verified diagnostic results directly on your smartphone via encrypted PDF download or automated WhatsApp delivery.",
    descriptionUrdu: "رپورٹ تیار ہوتے ہی آپ کے موبائل پر تصدیق شدہ پی ڈی ایف لنک بذریعہ واٹس ایپ موصول۔",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
  }
];

export const HEALTH_PACKAGES: HealthPackage[] = [
  {
    id: "basic-wellness",
    title: "Basic Health Screening",
    titleUrdu: "بنیادی ہیلتھ اسکریننگ پیکیج",
    originalPrice: 4200,
    discountedPrice: 2900,
    category: "General Preventive",
    categoryUrdu: "عمومی احتیاطی چیک اپ",
    fastingRequired: "10-12 hours overnight fasting",
    fastingRequiredUrdu: "10 سے 12 گھنٹے کا نہار منہ",
    reportTime: "Same Day (4 Hours)",
    reportTimeUrdu: "اسی دن (4 گھنٹے میں)",
    testsIncluded: [
      "Complete Blood Count (CBC) with ESR",
      "Fasting Blood Sugar (Glucose)",
      "Urine Detailed Report (Urine R/E)",
      "Serum Cholesterol",
      "Blood Pressure & BMI Checkup",
      "Free General Physician Consultation"
    ],
    testsIncludedUrdu: [
      "مکمل بلڈ کاؤنٹ (سی بی سی مع ای ایس آر)",
      "نہار منہ شوگر ٹیسٹ",
      "پیشاب کا تفصیلی معائنہ (یورین آر ای)",
      "کولیسٹرول ٹیسٹ",
      "بلڈ پریشر اور بی ایم آئی چیک اپ",
      "ڈاکٹر کے ساتھ مفت مشورہ"
    ]
  },
  {
    id: "diabetes-care",
    title: "Comprehensive Diabetes Panel",
    titleUrdu: "جامع شوگر و ذیابیطس پیکیج",
    originalPrice: 7500,
    discountedPrice: 4800,
    popular: true,
    category: "Metabolic Care",
    categoryUrdu: "شوگر اور میٹابولزم",
    fastingRequired: "8-10 hours fasting",
    fastingRequiredUrdu: "8 سے 10 گھنٹے کا نہار منہ",
    reportTime: "Same Day (6 Hours)",
    reportTimeUrdu: "اسی دن (6 گھنٹے میں)",
    testsIncluded: [
      "HbA1c (3-Month Sugar Average)",
      "Fasting & 2-Hour Post Prandial Glucose",
      "Kidney Function Tests (Creatinine, Urea)",
      "Complete Lipid Profile (HDL, LDL, Triglycerides)",
      "Urine Microalbumin / Creatinine Ratio",
      "Diabetic Foot Neuropathy Examination",
      "Diabetologist Expert Review"
    ],
    testsIncludedUrdu: [
      "تین ماہ کا اوسط شوگر ٹیسٹ (HbA1c)",
      "نہار منہ اور کھانے کے بعد کی شوگر",
      "گردوں کے افعال کا ٹیسٹ (کریٹینین و یوریا)",
      "مکمل کولیسٹرول و چربی پروفائل",
      "گردوں کے لیے مائیکرو البومن ٹیسٹ",
      "ذیابیطس کے پاؤں کا معائنہ",
      "شوگر اسپیشلسٹ ڈاکٹر کی جانچ"
    ]
  },
  {
    id: "cardiac-screen",
    title: "Cardiac Health & Heart Check",
    titleUrdu: "دل کی صحت و کارڈیالوجی اسکریننگ",
    originalPrice: 14500,
    discountedPrice: 9500,
    popular: true,
    category: "Cardiovascular",
    categoryUrdu: "امراضِ قلب کی روک تھام",
    fastingRequired: "12 hours overnight fasting",
    fastingRequiredUrdu: "12 گھنٹے کا نہار منہ",
    reportTime: "24 Hours with Cardiologist Report",
    reportTimeUrdu: "24 گھنٹے مع کنسلٹنٹ رپورٹ",
    testsIncluded: [
      "12-Lead Resting Digital ECG",
      "Echocardiography (Echo) with Doppler",
      "High Sensitivity Troponin-I / hs-CRP",
      "Complete Lipid Profile (Total, LDL, HDL, VLDL)",
      "Serum Electrolytes (Na, K, Cl)",
      "Liver & Kidney Profile",
      "Consultant Cardiologist Evaluation"
    ],
    testsIncludedUrdu: [
      "12 لیڈ ڈیجیٹل ای سی جی (ECG)",
      "دل کا الٹراساؤنڈ (ایکو کارڈیوگرافی)",
      "کارڈیک بائیو مارکر ٹیسٹ (hs-CRP)",
      "مکمل چکنائی و لپڈ پروفائل",
      "خون کے نمکیات (الیکٹرولائٹس)",
      "جگر اور گردوں کا ٹیسٹ",
      "کنسلٹنٹ امراض قلب سے مشورہ"
    ]
  },
  {
    id: "well-woman",
    title: "Well-Woman / Maternal Screening",
    titleUrdu: "خواتین کی صحت و ہارمون پیکیج",
    originalPrice: 9800,
    discountedPrice: 6200,
    category: "Women's Health",
    categoryUrdu: "صحتِ نسواں",
    fastingRequired: "Not strictly required (Water permitted)",
    fastingRequiredUrdu: "سخت فاقہ ضروری نہیں",
    reportTime: "Same Day (8 Hours)",
    reportTimeUrdu: "اسی دن (8 گھنٹے میں)",
    testsIncluded: [
      "CBC, Serum Iron, Ferritin & TIBC",
      "Thyroid Stimulating Hormone (TSH)",
      "Vitamin D3 & Calcium Profile",
      "Pelvic / Abdominal Ultrasound",
      "Blood Grouping & RH Factor",
      "Consultation with Senior Female Gynecologist"
    ],
    testsIncludedUrdu: [
      "خون کی کمی و فولاد کا معائنہ (آئرن و فیریٹین)",
      "تھائی رائیڈ ٹیسٹ (TSH)",
      "وٹامن ڈی 3 اور کیلشیم لیول",
      "پیٹ اور بچہ دانی کا الٹراساؤنڈ",
      "بلڈ گروپ اور آر ایچ فیکٹر",
      "سینئر لیڈی گائناکالوجسٹ سے معائنہ"
    ]
  },
  {
    id: "executive-health",
    title: "Executive Master Health Profile",
    titleUrdu: "ایگزیکٹو مکمل ماسٹر ہیلتھ چیک اپ",
    originalPrice: 22000,
    discountedPrice: 14500,
    category: "Full Body Master",
    categoryUrdu: "مکمل جسم کا معائنہ",
    fastingRequired: "12 hours overnight fasting",
    fastingRequiredUrdu: "12 گھنٹے کا نہار منہ",
    reportTime: "24 Hours with Consolidated Dossier",
    reportTimeUrdu: "24 گھنٹے مع تفصیلی فائل",
    testsIncluded: [
      "65+ Essential Blood & Urine Parameters",
      "Complete Liver Function Tests (LFTs)",
      "Renal Function Tests (RFTs) & Uric Acid",
      "Whole Abdomen & Pelvis Ultrasound",
      "Chest Digital X-Ray (PA View)",
      "Resting ECG & Serum Vitamin B12 / D3",
      "Comprehensive Multi-Specialist Medical Review"
    ],
    testsIncludedUrdu: [
      "65 سے زائد بنیادی خون و پیشاب کے ٹیسٹس",
      "جگر کے تمام ٹیسٹس (ایل ایف ٹی)",
      "گردوں کے افعال اور یورک ایسڈ",
      "پورے پیٹ کا ڈیجیٹل الٹراساؤنڈ",
      "سینے کا ڈیجیٹل ایکسرے",
      "ای سی جی اور وٹامنز بی 12 و ڈی 3",
      "سینئر فزیشن کے ساتھ حتمی جائزہ رپورٹ"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Muhammad Aslam Sheikh",
    nameUrdu: "محمد اسلم شیخ",
    city: "Model Town, Lahore",
    cityUrdu: "ماڈل ٹاؤن، لاہور",
    rating: 5,
    department: "Cardiology & Emergency",
    departmentUrdu: "کارڈیالوجی و ایمرجنسی",
    comment: "My father had sudden chest pain at 2 AM. The emergency team at Dar al Dawa was exceptionally fast. Within 15 minutes of arrival, ECG and cardiac protocols were in place. Dr. Tariq Mahmood saved his life. I can't thank this hospital enough for their dedication and polite staff.",
    commentUrdu: "رات 2 بجے میرے والد صاحب کے سینے میں شدید درد ہوا۔ دار الدواء کی ایمرجنسی ٹیم نے منٹوں میں کارروائی کی اور ڈاکٹر طارق صاحب نے بروقت علاج کیا۔ عملے کا اخلاق اور جدید سہولیات لاجواب ہیں۔",
    date: "October 2026",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-2",
    name: "Mrs. Shazia Rasheed",
    nameUrdu: "مسز شازیہ رشید",
    city: "DHA Phase 5, Lahore",
    cityUrdu: "ڈی ایچ اے فیز 5، لاہور",
    rating: 5,
    department: "Gynecology & Maternity",
    departmentUrdu: "گائناکالوجی و زچگی",
    comment: "I delivered my daughter here under Dr. Ayesha Siddiqa. The private maternity suite felt like a five-star hotel room with spotless cleanliness. Painless delivery went so smoothly. The nursing sisters cared for me and my baby like family.",
    commentUrdu: "ڈاکٹر عائشہ صدیقہ کی زیر نگرانی میری بیٹی کی پیدائش ہوئی۔ پرائیویٹ روم انتہائی صاف ستھرا اور نرسنگ اسٹاف کا رویہ نہایت شفیق تھا۔ بغیر درد ڈلیوری کا تجربہ شاندار رہا۔",
    date: "September 2026",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-3",
    name: "Chaudhry Tariq Butt",
    nameUrdu: "چوہدری طارق بٹ",
    city: "Civil Lines, Gujranwala",
    cityUrdu: "سول لائنز، گوجرانوالہ",
    rating: 5,
    department: "Orthopedic Surgery",
    departmentUrdu: "آرتھوپیڈک سرجری",
    comment: "I travelled from Gujranwala specifically for knee replacement by Dr. Farhan Ali Cheema. After 4 years of severe arthritis, I was walking with support on day 2 itself! State of the art physiotherapy department and very transparent pricing in PKR.",
    commentUrdu: "میں گوجرانوالہ سے گھٹنے کی تبدیلی کے لیے آیا۔ ڈاکٹر فرحان چیمہ نے دوسرے ہی دن مجھے چلنے کے قابل بنا دیا۔ ہسپتال کے چارجز بہت مناسب اور شفاف ہیں۔",
    date: "August 2026",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-4",
    name: "Fatima Zahra",
    nameUrdu: "فاطمہ زہراء",
    city: "Gulberg III, Lahore",
    cityUrdu: "گلبرگ 3، لاہور",
    rating: 5,
    department: "Diagnostic Lab & Home Sampling",
    departmentUrdu: "لیبارٹری و ہوم سیمپلنگ",
    comment: "Their home sample collection service is a blessing for elderly patients. The phlebotomist arrived punctually with sterile sealed kits. By 4 PM, I received my mother's blood reports on WhatsApp. Smooth and hassle-free!",
    commentUrdu: "گھر سے خون کے نمونے لینے کی سروس بہت کارآمد ہے۔ صبح سیمپل دیا اور شام 4 بجے واٹس ایپ پر مکمل تصدیق شدہ رپورٹ مل گئی۔ انتہائی آسان اور قابل اعتماد سروس۔",
    date: "October 2026",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "dengue-prevention",
    title: "Dengue Fever Prevention & Warning Signs during Monsoon in Lahore",
    titleUrdu: "لاہور میں مون سون کے دوران ڈینگی بخار سے بچاؤ اور خطرے کی علامات",
    slug: "dengue-prevention-lahore",
    category: "Public Health",
    categoryUrdu: "عوامی صحت و تندرستی",
    author: "Dr. Muhammad Imran",
    authorUrdu: "ڈاکٹر محمد عمران",
    date: "Oct 28, 2026",
    readTime: "4 min read",
    readTimeUrdu: "4 منٹ کا مطالعہ",
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80",
    excerpt: "With intermittent rains in Punjab, dengue cases spike. Learn when low platelets become dangerous and how to protect your family without panicking.",
    excerptUrdu: "پنجاب میں بارشوں کے بعد ڈینگی وائرس کا خطرہ بڑھ جاتا ہے۔ جانیے کہ پلیٹلیٹس کب خطرناک حد تک گرتے ہیں اور بروقت کیا اقدامات کرنے چاہیئیں۔",
    content: [
      "Dengue fever is caused by the Aedes aegypti mosquito, which breeds primarily in clean, stagnant water inside homes, plant pots, air cooler trays, and rooftop buckets.",
      "Warning signs requiring immediate hospital emergency evaluation include: persistent vomiting, intense abdominal pain, mucosal bleeding (from gums or nose), sudden extreme lethargy, and a precipitous drop in platelet counts below 50,000.",
      "Hydration is key. Consume plenty of fluids, oral rehydration salts (ORS), fresh juices, and coconut water. Never take Aspirin or Brufen as they thin the blood; only Paracetamol should be used under doctor guidance."
    ],
    contentUrdu: [
      "ڈینگی مچھر گھروں کے اندر صاف ٹھہرے ہوئے پانی، گملوں اور ایئر کولرز میں پیدا ہوتا ہے۔",
      "فوری ہسپتال لانے کی علامات میں مسلسل الٹیاں، پیٹ میں شدید درد، ناک یا مسوڑھوں سے خون آنا اور شدید کمزوری شامل ہیں۔",
      "پانی اور او آر ایس (ORS) کا بکثرت استعمال کریں۔ درد کے لیے بروفین یا ڈسپرین ہرگز مت لیں، صرف پیراسیٹامول کا استعمال کریں۔"
    ]
  },
  {
    id: "diabetes-diet",
    title: "Managing Type 2 Diabetes with Desi Diet & Pakistani Lifestyle",
    titleUrdu: "پاکستانی خوراک اور طرزِ زندگی کے ساتھ شوگر کو کیسے کنٹرول کریں؟",
    slug: "managing-diabetes-pakistan",
    category: "Diabetology",
    categoryUrdu: "ذیابیطس رہنمائی",
    author: "Dr. Muhammad Imran",
    authorUrdu: "ڈاکٹر محمد عمران",
    date: "Oct 15, 2026",
    readTime: "5 min read",
    readTimeUrdu: "5 منٹ کا مطالعہ",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    excerpt: "You do not need to abandon Pakistani cuisine to control your HbA1c. Smart tips for roti portions, desi ghee myths, and chai without sugar.",
    excerptUrdu: "شوگر کنٹرول کرنے کے لیے دیسی کھانوں کو چھوڑنے کی ضرورت نہیں، بس روٹی، چاول اور چینی کے استعمال میں اعتدال اور واک کی عادت اپنائیں۔",
    content: [
      "Pakistan has one of the world's highest prevalence rates of Type 2 Diabetes. The key culprit is refined carbohydrates combined with sedentary urban habits.",
      "Switch to whole grain bran flour (Chokar wala aata), replace white rice with moderate brown basmati, and incorporate bitter gourd (Karela), fenugreek (Methi), and chickpeas into your weekly menu.",
      "A 30-minute brisk walk after dinner lowers post-meal blood sugar surges drastically. Schedule your HbA1c screening every 3 months."
    ],
    contentUrdu: [
      "پاکستان میں شوگر کی بنیادی وجہ میدہ، چینی اور جسمانی ورزش کی کمی ہے۔",
      "چوکر والے آٹے کی روٹی کا استعمال کریں اور چاول کی مقدار کم کریں۔ کریلے، میتھی اور دالوں کا استعمال بڑھائیں۔",
      "روزانہ رات کے کھانے کے بعد 30 منٹ کی تیز واک شوگر کو قدرتی طور پر متوازن رکھنے میں مدد دیتی ہے۔"
    ]
  },
  {
    id: "heart-attack-signs",
    title: "Early Signs of Heart Disease: When to Visit the Emergency Room",
    titleUrdu: "دل کے دورے کی ابتدائی علامات: ہسپتال کب رخ کرنا چاہیے؟",
    slug: "early-signs-heart-attack",
    category: "Cardiology",
    categoryUrdu: "دل کی حفاظت",
    author: "Dr. Tariq Mahmood",
    authorUrdu: "ڈاکٹر طارق محمود",
    date: "Sep 29, 2026",
    readTime: "6 min read",
    readTimeUrdu: "6 منٹ کا مطالعہ",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    excerpt: "Heart attack symptoms in South Asians often present as heartburn, jaw ache, or cold sweats. Discover the critical 'Golden Hour' response.",
    excerptUrdu: "جنوبی ایشیائی افراد میں دل کا دورہ اکثر سینے میں جلن، جبڑے میں درد یا ٹھنڈے پسینوں کی شکل میں بھی ظاہر ہوتا ہے۔ پہلے سنہری گھنٹے کی اہمیت جانیے۔",
    content: [
      "In cardiac emergencies, 'Time is Muscle'. The first 60 minutes after symptoms begin represent the 'Golden Hour' where angioplasty or thrombolytics can completely salvage heart muscle.",
      "Do not mistake chest pressure that radiates to the left arm, neck, or lower jaw as simple gastric acidity, especially in individuals over 40 with a smoking or family history.",
      "Call Dar al Dawa Medical Center's 24/7 cardiac hotline (042-111-327-227) immediately so our cath lab and emergency teams prepare before arrival."
    ],
    contentUrdu: [
      "دل کے دورے میں ابتدائی ایک گھنٹہ سنہری وقت ہوتا ہے جس میں دل کے پٹھوں کو بچایا جا سکتا ہے۔",
      "سینے کے بوجھ، بائیں بازو اور جبڑے کے درد کو محض گیس کی جلن سمجھ کر نظر انداز نہ کریں، خصوصاً 40 سال سے زائد عمر کے افراد۔",
      "فوری طور پر ہماری 24 گھنٹے ایمرجنسی ہیلپ لائن 042-111-327-227 پر رابطہ کریں۔"
    ]
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-visiting",
    question: "What are the visiting hours for inpatients and ICU?",
    questionUrdu: "مریضوں سے ملاقات کے اوقات اور آئی سی یو کے اصول کیا ہیں؟",
    answer: "General Wards & Private Rooms: 12:00 PM to 02:00 PM and 05:00 PM to 08:00 PM daily. For the Intensive Care Unit (ICU/NICU), visiting is restricted to 1 immediate family member between 05:00 PM and 06:00 PM only to ensure patient safety and infection control.",
    answerUrdu: "جنرل وارڈ اور پرائیویٹ کمروں کے لیے دوپہر 12 تا 2 بجے اور شام 5 تا رات 8 بجے۔ آئی سی یو میں مریض کے آرام اور انفیکشن سے بچاؤ کے لیے شام 5 تا 6 بجے صرف ایک فیملی ممبر کو اجازت ہے۔",
    category: "general"
  },
  {
    id: "faq-insurance",
    question: "Which insurance companies and panel cards are accepted?",
    questionUrdu: "کون سی انشورنس کمپنیاں اور پینل کارڈز قبول کیے جاتے ہیں؟",
    answer: "We accept Punjab Sehat Sahulat Program (Sehat Card Plus) for empaneled inpatient admissions, as well as Jubilee Life, EFU General, Adamjee Insurance, Pak-Qatar Takaful, Askari Insurance, WAPDA, and major corporate panels. Our dedicated Panel Desk on the ground floor assists with pre-authorization.",
    answerUrdu: "ہم حکومت پنجاب کے صحت کارڈ پلس کے علاوہ جوبلی، ای ایف یو، آدم جی، پاک قطر تکافل، عسکری اور واپڈا سمیت تمام بڑے کارپوریٹ پینلز پر کیش لیس علاج کی سہولت فراہم کرتے ہیں۔",
    category: "billing"
  },
  {
    id: "faq-reports",
    question: "How can I collect my laboratory and radiology reports online?",
    questionUrdu: "لیب اور ایکسرے کی رپورٹس آن لائن کیسے حاصل کی جا سکتی ہیں؟",
    answer: "Once your test is verified by our pathologist or radiologist, you will receive an automatic SMS and WhatsApp notification containing a secure PDF download link. You can also view and download past reports using your Patient MR Number on our website portal.",
    answerUrdu: "رپورٹ تیار ہوتے ہی آپ کو بذریعہ ایس ایم ایس اور واٹس ایپ تصدیق شدہ لنک مل جاتا ہے۔ اس کے علاوہ ہسپتال کے پورٹل پر اپنا ایم آر نمبر درج کر کے بھی ڈاؤن لوڈ کر سکتے ہیں۔",
    category: "reports"
  },
  {
    id: "faq-emergency",
    question: "What should I do in case of a critical medical emergency?",
    questionUrdu: "شدید ایمرجنسی کی صورت میں کیا طریقہ کار ہے؟",
    answer: "Immediately call our 24/7 dedicated Emergency Hotline at 042-111-327-227 or mobile +92 300 1234567. Our trauma resuscitation team and ICU doctors are ready 24/7. Drive straight to the Emergency entrance on Main Boulevard, Gulberg III.",
    answerUrdu: "فوری طور پر ہماری 24/7 ایمرجنسی ہیلپ لائن 042-111-327-227 یا موبائل 0300-1234567 پر رابطہ کریں۔ ہسپتال کے ایمرجنسی ٹراما سنٹر میں کنسلٹنٹس 24 گھنٹے الرٹ ہیں۔",
    category: "emergency"
  },
  {
    id: "faq-home-sampling",
    question: "Is home blood sample collection available on weekends and Sundays?",
    questionUrdu: "کیا اتوار اور چھٹی کے دن بھی گھر سے بلڈ سیمپل لیا جا سکتا ہے؟",
    answer: "Yes! Our home sample phlebotomy service operates 7 days a week, including Sundays and public holidays, from 07:00 AM to 08:00 PM across all residential societies of Lahore (DHA, Gulberg, Model Town, Johar Town, Bahria, Cantt, etc.).",
    answerUrdu: "جی ہاں! ہوم سیمپلنگ سروس ہفتے کے ساتوں دن بشمول اتوار صبح 7 بجے سے رات 8 بجے تک پورے لاہور (گلبرگ، ڈی ایچ اے، ماڈل ٹاؤن، جوہر ٹاؤن وغیرہ) میں دستیاب ہے۔",
    category: "services"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Modern Hospital Facade & Emergency Reception",
    titleUrdu: "ہسپتال کی جدید عمارت و ایمرجنسی ریسیپشن",
    category: "facilities",
    categoryLabel: "Hospital Exterior & Lobby",
    categoryLabelUrdu: "عمارت و لابی",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1000&q=80",
    description: "Architecturally designed multi-storey facility with round-the-clock emergency entrance and welcoming reception.",
    descriptionUrdu: "24 گھنٹے فعال ایمرجنسی گیٹ اور پرسکون ماحول سے آراستہ ریسیپشن لابی۔"
  },
  {
    id: "gal-2",
    title: "Advanced Laminar Flow Operation Theatre",
    titleUrdu: "جدید لیمنار ایئر فلو آپریشن تھیٹر",
    category: "theatres",
    categoryLabel: "Operation Theatres",
    categoryLabelUrdu: "آپریشن تھیٹرز",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=80",
    description: "Ultra-sterile surgical suites equipped with Karl Storz laparoscopic video towers and precision surgical lighting.",
    descriptionUrdu: "بین الاقوامی معیار کے مطابق جراثیم سے مکمل پاک جدید ترین سرجیکل تھیٹر۔"
  },
  {
    id: "gal-3",
    title: "Intensive Cardiac Care Unit (CCU & ICU)",
    titleUrdu: "کارڈیک کیئر یونٹ (سی سی یو)",
    category: "theatres",
    categoryLabel: "Critical Care",
    categoryLabelUrdu: "کریٹیکل کیئر",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80",
    description: "Bedside multi-parameter cardiac monitors and specialized ventilator life support with 1:1 nurse-to-patient ratio.",
    descriptionUrdu: "مریضوں کی مسلسل نگرانی کے لیے کارڈیک مانیٹرز اور لائف سپورٹ سسٹم۔"
  },
  {
    id: "gal-4",
    title: "128-Slice Multi-detector CT Scanner Suite",
    titleUrdu: "128 سلائس سی ٹی اسکینر روم",
    category: "diagnostics",
    categoryLabel: "Radiology & Imaging",
    categoryLabelUrdu: "ریڈیالوجی و اسکیننگ",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80",
    description: "Rapid low-radiation computed tomography system for coronary, brain, and whole-body diagnostics.",
    descriptionUrdu: "کم تابکاری اور تیز ترین رفتار سے اعصاب اور دل کے معائنے کی جدید مشین۔"
  },
  {
    id: "gal-5",
    title: "Executive Private Patient Suite",
    titleUrdu: "ایگزیکٹو پرائیویٹ مریض کمرہ",
    category: "wards",
    categoryLabel: "Inpatient Rooms",
    categoryLabelUrdu: "مریضوں کے کمرے",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1000&q=80",
    description: "Quiet, comfortable air-conditioned patient recovery suite featuring attendant sofa-bed, smart TV, and ensuite bath.",
    descriptionUrdu: "تیماردار کے قیام کے لیے صوفہ کم بیڈ، ایل ای ڈی ٹی وی اور صاف ستھرا اٹیچ باتھ۔"
  },
  {
    id: "gal-6",
    title: "Automated Clinical Chemistry & Pathology Analyzers",
    titleUrdu: "خودکار پیتھالوجی لیبارٹری",
    category: "diagnostics",
    categoryLabel: "Laboratory",
    categoryLabelUrdu: "لیبارٹری",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1000&q=80",
    description: "High-throughput robotic analyzers processing thousands of blood parameters with barcoded accuracy.",
    descriptionUrdu: "خون کے نمونوں کی تصدیق شدہ جانچ کے لیے مکمل روبوٹک سسٹم۔"
  }
];

export const UI_TRANSLATIONS = {
  en: {
    nav: {
      home: "Home",
      about: "About Us",
      departments: "Departments",
      doctors: "Our Doctors",
      services: "Services",
      packages: "Packages",
      appointment: "Appointments",
      gallery: "Gallery",
      blog: "Health Tips",
      faq: "FAQs",
      contact: "Contact",
      emergencyBtn: "Emergency: 042-111-327-227",
      bookBtn: "Book Appointment"
    },
    topBar: {
      emergency247: "24/7 Emergency Hotline:",
      generalEnquiry: "General:",
      hours: "OPD: Mon-Sat 8AM - 10PM",
      whatsapp: "WhatsApp Us"
    },
    hero: {
      badge: "Lahore's Trusted Healthcare Landmark",
      title: "Caring for You, Every Step of the Way",
      subtitle: "Experience world-class medical treatments in Gulberg, Lahore. Equipped with 24/7 rapid emergency, 50+ senior specialist consultants, laminar-flow theatres, and certified diagnostic laboratories.",
      bookAppointmentBtn: "Book an Appointment",
      emergencyCallBtn: "Call Emergency (24/7)",
      quickBookingTitle: "Quick Appointment",
      quickBookingSub: "Get confirmation within 30 minutes",
      fullName: "Full Name",
      phoneNumber: "Phone (03XX-XXXXXXX)",
      selectDept: "Select Department",
      preferredDate: "Preferred Date",
      submitQuick: "Request Appointment",
      quickSuccess: "Request received! We'll call to confirm your slot."
    },
    about: {
      badge: "About Dar al Dawa",
      heading: "A Tradition of Healing, Science & Human Compassion",
      subheading: "Established in Lahore over two decades ago, Dar al Dawa Medical Center stands as a beacon of clinical excellence and compassionate healthcare.",
      missionTitle: "Our Mission",
      missionText: "To provide ethical, evidence-based, and accessible tertiary healthcare of international standards to all communities of Punjab, regardless of socioeconomic background.",
      visionTitle: "Our Vision",
      visionText: "To be Pakistan's most trusted hospital network, recognized for clinical excellence, state-of-the-art medical technology, and patient-first empathy.",
      storyTitle: "Our Journey in Lahore",
      storyText: "Founded in 1999 as a specialized cardiac and trauma clinic on Main Boulevard Gulberg, Dar al Dawa has evolved into a premier multi-specialty 150-bed medical center. Today, we perform over 6,000 surgical procedures annually and touch hundreds of thousands of lives through preventative and critical medical treatments.",
      accreditationTitle: "Recognitions & Accreditations",
      accreditationSub: "Certified by Pakistan's premier healthcare regulatory authorities."
    },
    departments: {
      badge: "Specialized Medical Centers",
      heading: "Comprehensive Clinical Departments",
      subheading: "From routine family medicine to high-complexity surgeries, our multidisciplinary departments are headed by top Pakistani and foreign-trained medical specialists.",
      viewDoctors: "View Specialist Doctors",
      bookDept: "Book with Department"
    },
    doctors: {
      badge: "Expert Medical Faculty",
      heading: "Meet Our Senior Consultants",
      subheading: "Our team of distinguished professors, surgeons, and physicians hold qualifications from top institutions including PMDC, CPSP, and Royal Colleges UK.",
      qualifications: "Qualifications",
      timings: "OPD Timings",
      days: "Consultation Days",
      consultFee: "Consultation Fee",
      bookConsultation: "Book Appointment",
      allDepartments: "All Departments"
    },
    services: {
      badge: "World-Class Infrastructure",
      heading: "Services & Diagnostic Facilities",
      subheading: "Equipped with state-of-the-art medical technologies to provide fast, reliable, and painless diagnostics and treatments."
    },
    packages: {
      badge: "Preventive Care",
      heading: "Health Screening & Lab Packages",
      subheading: "Early detection saves lives. Avail discounted preventive test packages performed at our ISO-certified pathology lab.",
      popularBadge: "Most Recommended",
      includes: "Key Tests Included:",
      bookPackage: "Book This Package",
      fasting: "Fasting:",
      turnaround: "Report Time:"
    },
    appointment: {
      badge: "Easy Scheduling",
      heading: "Book Your Hospital Appointment Online",
      subheading: "Choose your preferred doctor, date, and convenient time slot. Receive instant confirmation and WhatsApp alerts.",
      form: {
        patientName: "Patient Full Name *",
        phone: "Mobile Phone (Pakistani Format) *",
        phonePlaceholder: "0300-1234567",
        cnic: "CNIC Number (Optional)",
        cnicPlaceholder: "35202-XXXXXXX-X",
        department: "Select Department *",
        doctor: "Select Doctor (Optional)",
        anyDoctor: "First Available Specialist",
        date: "Preferred Appointment Date *",
        timeSlot: "Preferred Time Slot *",
        patientType: "Patient Type",
        newPatient: "New Patient (First Visit)",
        followUp: "Follow-up Visit",
        notes: "Symptoms or Reason for Visit (Optional)",
        notesPlaceholder: "Briefly mention symptoms, e.g., blood pressure checkup, knee pain...",
        submitBtn: "Confirm & Book Appointment",
        whatsappOption: "Open in WhatsApp with Details",
        successHeading: "Appointment Request Received Successfully!",
        successMessage: "Thank you for scheduling with Dar al Dawa Medical Center. Our OPD coordinator will call you to confirm your slot.",
        whatsappSuccessPrompt: "Would you like to send your appointment details directly to our WhatsApp OPD desk for instant token issuance?",
        confirmViaWhatsAppBtn: "Confirm via WhatsApp Now",
        bookAnother: "Book Another Appointment"
      }
    },
    testimonials: {
      badge: "Patient Voices",
      heading: "Words of Trust & Gratitude",
      subheading: "Read genuine feedback from patients and families who experienced healing at Dar al Dawa Medical Center."
    },
    gallery: {
      badge: "Hospital Tour",
      heading: "Inside Dar al Dawa Medical Center",
      subheading: "Take a visual tour through our hygienic wards, modular operation theatres, modern diagnostic labs, and serene recovery rooms.",
      all: "All Areas",
      facilities: "Facilities & Lobby",
      theatres: "Surgical & Critical",
      wards: "Patient Rooms",
      diagnostics: "Diagnostics & Imaging"
    },
    blog: {
      badge: "Doctor's Advice",
      heading: "Health Tips & Medical Insights",
      subheading: "Stay informed with health guidance, seasonal disease prevention, and wellness advice tailored to Pakistan.",
      readMore: "Read Full Article",
      closeArticle: "Close Article"
    },
    faq: {
      badge: "Patient Assistance",
      heading: "Frequently Asked Questions",
      subheading: "Everything you need to know about visiting hours, insurance panels, lab tests, and emergency procedures."
    },
    contact: {
      badge: "Get In Touch",
      heading: "Contact & Hospital Location",
      subheading: "Conveniently located on Main Boulevard Gulberg III in the heart of Lahore, easily accessible via Canal Road and Ferozepur Road.",
      emergencyTitle: "24/7 Emergency & Trauma",
      receptionTitle: "Hospital Reception & Appointments",
      emailTitle: "Email Us",
      addressTitle: "Hospital Address",
      sendMessageTitle: "Send Us an Inquiry",
      sendMessageSub: "Have a general question or feedback? Write to our patient care desk.",
      yourName: "Your Full Name",
      yourEmail: "Email Address",
      yourPhone: "Phone Number",
      subject: "Subject / Query Type",
      message: "Your Message",
      sendBtn: "Send Inquiry",
      messageSent: "Thank you! Your message has been sent to our administration team."
    },
    footer: {
      aboutText: "Dar al Dawa Medical Center is a premier healthcare institution in Lahore, Punjab. Dedicated to clinical excellence, compassionate patient service, and 24/7 emergency care since 1999.",
      quickLinks: "Quick Navigation",
      departmentsList: "Clinical Departments",
      workingHours: "Operating Hours",
      contactInfo: "Hospital Location",
      rightsReserved: "All rights reserved. Registered with Punjab Healthcare Commission (PHC) & PMDC.",
      disclaimer: "Disclaimer: The health tips and information provided on this website are for educational purposes only. In case of an emergency, please visit our 24/7 Emergency Room or contact 042-111-327-227."
    },
    floating: {
      whatsappTooltip: "Chat on WhatsApp",
      callEmergencyTooltip: "Call 24/7 Emergency",
      backToTop: "Back to Top"
    }
  },
  ur: {
    nav: {
      home: "صفحہ اول",
      about: "ہمارے متعلق",
      departments: "شعبہ جات",
      doctors: "ڈاکٹرز",
      services: "سہولیات",
      packages: "ہیلتھ پیکیجز",
      appointment: "آن لائن اپوائنٹمنٹ",
      gallery: "تصاویر",
      blog: "طبی مشورے",
      faq: "عام سوالات",
      contact: "رابطہ",
      emergencyBtn: "ایمرجنسی: 042-111-327-227",
      bookBtn: "اپوائنٹمنٹ بک کریں"
    },
    topBar: {
      emergency247: "24/7 ایمرجنسی ہاٹ لائن:",
      generalEnquiry: "معلومات:",
      hours: "او پی ڈی: پیر تا ہفتہ صبح 8 تا رات 10 بجے",
      whatsapp: "واٹس ایپ کریں"
    },
    hero: {
      badge: "لاہور کا قابلِ اعتماد طبی مرکز",
      title: "ہر قدم پر آپ کی صحت اور دیکھ بھال کا امین",
      subtitle: "گلبرگ، لاہور میں عالمی معیار کا علاج۔ 24 گھنٹے ایمرجنسی، 50 سے زائد سینئر ماہر ڈاکٹرز، جدید ترین آپریشن تھیٹرز اور مستند پیتھالوجی لیب۔",
      bookAppointmentBtn: "اپوائنٹمنٹ بک کریں",
      emergencyCallBtn: "ایمرجنسی کال کریں (24/7)",
      quickBookingTitle: "فوری اپوائنٹمنٹ",
      quickBookingSub: "30 منٹ کے اندر تصدیق حاصل کریں",
      fullName: "پورا نام",
      phoneNumber: "موبائل فون (03XX-XXXXXXX)",
      selectDept: "شعبہ منتخب کریں",
      preferredDate: "مطلوبہ تاریخ",
      submitQuick: "اپوائنٹمنٹ کی درخواست دیں",
      quickSuccess: "درخواست موصول ہو گئی! ہمارا عملہ تصدیق کے لیے رابطہ کرے گا۔"
    },
    about: {
      badge: "دار الدواء کے بارے میں",
      heading: "شفا، جدید میڈیکل سائنس اور انسانی ہمدردی کی روایت",
      subheading: "پچیس سال سے زائد عرصے سے لاہور میں قائم دار الدواء میڈیکل سنٹر اعلیٰ طبی خدمات اور مریضوں کی خدمت میں سرِفہرست ہے۔",
      missionTitle: "ہمارا مشن",
      missionText: "پنجاب کے ہر شہری کو بین الاقوامی معیار کا جدید، محفوظ اور اخلاقی اصولوں پر مبنی علاج بلا امتیاز فراہم کرنا۔",
      visionTitle: "ہمارا عزم",
      visionText: "پاکستان کا سب سے معتبر اور جدید ہسپتال بننا جو علاج کے شاندار نتائج اور مریض دوست ماحول کے لیے جانا جائے۔",
      storyTitle: "ہمارا سفر",
      storyText: "1999ء میں گلبرگ لاہور میں کارڈیک اور ٹراما سنٹر کے طور پر شروع ہونے والا یہ ہسپتال آج 150 بستروں پر مشتمل ایک جدید ترین میڈیکل سنٹر بن چکا ہے۔",
      accreditationTitle: "حکومتی و بین الاقوامی تصدیق نامے",
      accreditationSub: "پنجاب ہیلتھ کیئر کمیشن اور پی ایم ڈی سی سے منظور شدہ ادارہ۔"
    },
    departments: {
      badge: "ماہرانہ شعبہ جات",
      heading: "جامع میڈیکل اور سرجیکل شعبہ جات",
      subheading: "معمولی بیماریوں سے لے کر پیچیدہ ترین سرجری تک، ہمارے تمام شعبہ جات مستند پروفیسر ڈاکٹرز کی زیرِ نگرانی ہیں۔",
      viewDoctors: "ڈاکٹرز کی تفصیل دیکھیں",
      bookDept: "اس شعبے میں اپوائنٹمنٹ لیں"
    },
    doctors: {
      badge: "سینئر میڈیکل فیکلٹی",
      heading: "ہمارے مستند کنسلٹنٹ ڈاکٹرز",
      subheading: "ملکی و غیر ملکی اداروں سے تربیت یافتہ مایہ ناز سرجنز اور فزیشنز جن کا مقصد آپ کی بہترین صحت ہے۔",
      qualifications: "طبی اسناد",
      timings: "او پی ڈی اوقات",
      days: "ملاقات کے دن",
      consultFee: "معائنہ فیس",
      bookConsultation: "وقت لیں",
      allDepartments: "تمام شعبہ جات"
    },
    services: {
      badge: "جدید ترین طبی سہولیات",
      heading: "ہسپتال کی سروسز اور تشخیصی سہولیات",
      subheading: "جدید میڈیکل ٹیکنالوجی کے ذریعے فوری، بے درد اور درست ترین تشخیص و علاج۔"
    },
    packages: {
      badge: "احتیاطی علاج",
      heading: "ہیلتھ اسکریننگ و لیب ٹیسٹ پیکیجز",
      subheading: "بیماری کی بروقت تشخیص زندگی بچاتی ہے۔ رعایتی نرخوں پر لیب ٹیسٹ پیکیجز سے فائدہ اٹھائیں۔",
      popularBadge: "سب سے زیادہ منتخب کردہ",
      includes: "شامل اہم ٹیسٹس:",
      bookPackage: "یہ پیکیج حاصل کریں",
      fasting: "نہار منہ شرط:",
      turnaround: "رپورٹ کا وقت:"
    },
    appointment: {
      badge: "آسان طریقہ کار",
      heading: "آن لائن اپوائنٹمنٹ بک کریں",
      subheading: "اپنی پسند کے ڈاکٹر، تاریخ اور وقت کا انتخاب کریں۔ فوری تصدیق اور واٹس ایپ الرٹ حاصل کریں۔",
      form: {
        patientName: "مریض کا پورا نام *",
        phone: "موبائل نمبر (پاکستانی فارمیٹ) *",
        phonePlaceholder: "0300-1234567",
        cnic: "شناختی کارڈ نمبر (اختیاری)",
        cnicPlaceholder: "35202-XXXXXXX-X",
        department: "شعبہ منتخب کریں *",
        doctor: "ڈاکٹر کا انتخاب کریں (اختیاری)",
        anyDoctor: "پہلا دستیاب ماہر ڈاکٹر",
        date: "مطلوبہ تاریخ *",
        timeSlot: "مطلوبہ وقت کا انتخاب *",
        patientType: "مریض کی قسم",
        newPatient: "نیا مریض (پہلی بار)",
        followUp: "دوبارہ معائنہ (فالو اپ)",
        notes: "علامات یا بیماری کی تفصیل (اختیاری)",
        notesPlaceholder: "مثلاً: بلڈ پریشر چیک اپ، گھٹنے میں درد، بخار...",
        submitBtn: "اپوائنٹمنٹ کنفرم کریں",
        whatsappOption: "واٹس ایپ پر تفصیلات بھیجیں",
        successHeading: "آپ کی اپوائنٹمنٹ کی درخواست موصول ہو گئی ہے!",
        successMessage: "دار الدواء میڈیکل سنٹر کا انتخاب کرنے کا شکریہ۔ او پی ڈی عملہ تصدیق کے لیے جلد کال کرے گا۔",
        whatsappSuccessPrompt: "کیا آپ یہ تفصیلات فوری ٹوکن کے لیے ہمارے واٹس ایپ نمبر پر بھی بھیجنا چاہتے ہیں؟",
        confirmViaWhatsAppBtn: "ابھی واٹس ایپ پر بھیجیں",
        bookAnother: "دوسری اپوائنٹمنٹ بک کریں"
      }
    },
    testimonials: {
      badge: "مریضوں کے تاثرات",
      heading: "اعتماد اور شفایابی کی کہانیاں",
      subheading: "دار الدواء میڈیکل سنٹر سے صحت یاب ہونے والے مریضوں اور ان کے خاندان کے سچے تاثرات۔"
    },
    gallery: {
      badge: "ہسپتال کا معائنہ",
      heading: "دار الدواء میڈیکل سنٹر کے اندرونی مناظر",
      subheading: "ہمارے جدید آپریشن تھیٹرز، پرسکون کمروں، لیبارٹری اور جدید مشینوں کا تصویری جائزہ۔",
      all: "تمام حصے",
      facilities: "لابی و بیرونی منظر",
      theatres: "آپریشن تھیٹر و آئی سی یو",
      wards: "مریضوں کے کمرے",
      diagnostics: "لیب اور ریڈیالوجی"
    },
    blog: {
      badge: "ڈاکٹرز کا مشورہ",
      heading: "صحت کے مفید مشورے و رہنمائی",
      subheading: "پاکستان کے موسمی اور عام امراض سے بچاؤ کے لیے سینئر ڈاکٹرز کی مستند رہنمائی۔",
      readMore: "مکمل مضمون پڑھیں",
      closeArticle: "مضمون بند کریں"
    },
    faq: {
      badge: "مریضوں کی رہنمائی",
      heading: "اکثر پوچھے جانے والے سوالات",
      subheading: "ملاقات کے اوقات، صحت کارڈ، لیب رپورٹس اور ایمرجنسی کے متعلق تمام ضروری معلومات۔"
    },
    contact: {
      badge: "ہم سے رابطہ کریں",
      heading: "رابطہ نمبرز اور ہسپتال کا پتہ",
      subheading: "مین بلیوارڈ گلبرگ 3 لاہور کے مرکز میں واقع، کینال روڈ اور فیروز پور روڈ سے باآسانی قابلِ رسائی۔",
      emergencyTitle: "24 گھنٹے ایمرجنسی و ٹراما",
      receptionTitle: "ہسپتال ریسیپشن و اپوائنٹمنٹس",
      emailTitle: "ہمیں ای میل کریں",
      addressTitle: "ہسپتال کا پتہ",
      sendMessageTitle: "ہمیں پیغام بھیجیں",
      sendMessageSub: "کوئی سوال یا مشورہ؟ نیچے دیے گئے فارم سے ہمیں مطلع کریں۔",
      yourName: "آپ کا پورا نام",
      yourEmail: "ای میل ایڈریس",
      yourPhone: "فون نمبر",
      subject: "موضوع / سوال کی قسم",
      message: "آپ کا پیغام",
      sendBtn: "پیغام ارسال کریں",
      messageSent: "شکریہ! آپ کا پیغام ہماری انتظامیہ کو پہنچ چکا ہے۔"
    },
    footer: {
      aboutText: "دار الدواء میڈیکل سنٹر لاہور میں واقع جدید طبی ادارہ ہے جو 1999ء سے انسانیت کی خدمت اور بہترین علاج میں مصروفِ عمل ہے۔",
      quickLinks: "فوری لنکس",
      departmentsList: "اہم شعبہ جات",
      workingHours: "اوقاتِ کار",
      contactInfo: "ہسپتال کا پتہ",
      rightsReserved: "تمام حقوق محفوظ ہیں۔ پنجاب ہیلتھ کیئر کمیشن سے باقاعدہ رجسٹرڈ۔",
      disclaimer: "انتباہ: اس ویب سائٹ پر دی گئی معلومات صرف عوامی آگاہی کے لیے ہیں۔ ایمرجنسی کی صورت میں فوری طور پر ہمارے 24 گھنٹے ایمرجنسی سنٹر تشریف لائیں یا 042-111-327-227 پر رابطہ کریں۔"
    },
    floating: {
      whatsappTooltip: "واٹس ایپ پر بات کریں",
      callEmergencyTooltip: "24/7 ایمرجنسی کال کریں",
      backToTop: "اوپر جائیں"
    }
  }
};
