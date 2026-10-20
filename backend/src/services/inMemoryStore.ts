import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const isMongoConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Seed Categories
export const inMemoryCategories = [
  {
    _id: '66f001000000000000000001',
    name: { en: 'Atta, Rice & Grains', hi: 'आटा, चावल और अनाज' },
    slug: 'atta-rice-grains',
    description: { en: 'Fresh chakki atta, basmati rice, poha and suji', hi: 'ताज़ा चक्की आटा, बढ़िया चावल, पोहा और सूजी' },
    iconName: 'nutrition-outline',
    displayOrder: 1,
    isActive: true
  },
  {
    _id: '66f001000000000000000002',
    name: { en: 'Dals & Pulses', hi: 'दालें और दलहन' },
    slug: 'dals-pulses',
    description: { en: 'Protein rich Arhar, Moong, Chana dal', hi: 'अरहर, मूँग, चना की शुद्ध दालें' },
    iconName: 'leaf-outline',
    displayOrder: 2,
    isActive: true
  },
  {
    _id: '66f001000000000000000003',
    name: { en: 'Cooking Oils & Ghee', hi: 'खाद्य तेल और शुद्ध घी' },
    slug: 'oils-ghee',
    description: { en: 'Pure mustard oil and Desi ghee', hi: 'शुद्ध सरसों तेल और देसी घी' },
    iconName: 'water-outline',
    displayOrder: 3,
    isActive: true
  },
  {
    _id: '66f001000000000000000004',
    name: { en: 'Spices, Salt & Sugar', hi: 'मसाले, नमक और चीनी' },
    slug: 'spices-salt-sugar',
    description: { en: 'Turmeric, red chili, Tata salt', hi: 'हल्दी, मिर्च, नमक' },
    iconName: 'flame-outline',
    displayOrder: 4,
    isActive: true
  },
  {
    _id: '66f001000000000000000005',
    name: { en: 'Tea & Morning Drinks', hi: 'चाय और पेय' },
    slug: 'tea-drinks',
    description: { en: 'Kadak chai patti', hi: 'कड़क दानेदार चाय पत्ती' },
    iconName: 'cafe-outline',
    displayOrder: 5,
    isActive: true
  },
  {
    _id: '66f001000000000000000006',
    name: { en: 'Soaps & Detergents', hi: 'साबुन और सर्फ' },
    slug: 'soaps-cleaning',
    description: { en: 'Bath soaps and washing powder', hi: 'साबुन और कपड़े धोने का पाउडर' },
    iconName: 'sparkles-outline',
    displayOrder: 6,
    isActive: true
  },
  {
    _id: '66f001000000000000000007',
    name: { en: 'Biscuits & Snacks', hi: 'बिस्कुट और नमकीन' },
    slug: 'snacks-biscuits',
    description: { en: 'Parle-G, Good Day biscuits', hi: 'पारले-जी बिस्कुट' },
    iconName: 'fast-food-outline',
    displayOrder: 7,
    isActive: true
  }
];

// Seed Products
export const inMemoryProducts = [
  {
    _id: '66f002000000000000000001',
    name: { en: 'Aashirvaad Shudh Chakki Atta', hi: 'आशीर्वाद शुद्ध चक्की आटा' },
    description: {
      en: '100% whole wheat flour, naturally rich in dietary fibre. Makes soft, fluffy rotis.',
      hi: '100% साबुत गेहूं से बना शुद्ध आटा। रोटियां हमेशा नरम और फूली रहती हैं।'
    },
    category: inMemoryCategories[0],
    sku: 'AT-AASH-5KG',
    price: 260,
    salePrice: 235,
    stockQuantity: 45,
    lowStockThreshold: 10,
    unit: '5 kg',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['atta', 'flour', 'wheat', 'आटा']
  },
  {
    _id: '66f002000000000000000002',
    name: { en: 'Daily Basmati Rice (Pariwar)', hi: 'पारिवारिक बासमती चावल' },
    description: {
      en: 'Aromatic, non-sticky long grain rice ideal for everyday family lunch.',
      hi: 'रोज़ाना खाने के लिए लंबा और खुशबूदार बासमती चावल।'
    },
    category: inMemoryCategories[0],
    sku: 'RC-BASM-5KG',
    price: 340,
    salePrice: 299,
    stockQuantity: 30,
    lowStockThreshold: 8,
    unit: '5 kg',
    images: ['https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['rice', 'basmati', 'चावल']
  },
  {
    _id: '66f002000000000000000003',
    name: { en: 'Desi Arhar / Toor Dal', hi: 'देसी अरहर दाल (तुअर दाल)' },
    description: {
      en: 'Unpolished protein-rich arhar dal. Cooks fast and tastes naturally sweet.',
      hi: 'बिना पॉलिश की शुद्ध अरहर दाल। जल्दी पकती है और स्वादिष्ट बनती है।'
    },
    category: inMemoryCategories[1],
    sku: 'DL-ARHAR-1KG',
    price: 175,
    salePrice: 155,
    stockQuantity: 50,
    lowStockThreshold: 10,
    unit: '1 kg',
    images: ['https://images.unsplash.com/photo-1585735622950-ec188b48ef11?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['arhar', 'dal', 'दाल']
  },
  {
    _id: '66f002000000000000000004',
    name: { en: 'Fortune Kachi Ghani Mustard Oil', hi: 'फॉर्च्यून कच्ची घानी सरसों तेल' },
    description: {
      en: 'Pure cold pressed mustard oil with authentic aroma.',
      hi: 'तीखा और शुद्ध कच्ची घानी सरसों का तेल।'
    },
    category: inMemoryCategories[2],
    sku: 'OIL-MUST-1L',
    price: 165,
    salePrice: 148,
    stockQuantity: 60,
    lowStockThreshold: 12,
    unit: '1 Litre Pouch',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['mustard', 'oil', 'सरसों', 'तेल']
  },
  {
    _id: '66f002000000000000000005',
    name: { en: 'Amul Pure Desi Ghee', hi: 'अमुल शुद्ध देसी घी' },
    description: {
      en: 'Rich granular ghee made from pure milk fat.',
      hi: 'शुद्ध दूध से बना दानेदार देसी घी।'
    },
    category: inMemoryCategories[2],
    sku: 'GH-AMUL-500ML',
    price: 330,
    salePrice: 310,
    stockQuantity: 4, // Intentionally low to test low-stock alert!
    lowStockThreshold: 5,
    unit: '500 ml',
    images: ['https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['ghee', 'amul', 'घी']
  },
  {
    _id: '66f002000000000000000006',
    name: { en: 'Tata Salt Vacuum Evaporated', hi: 'टाटा नमक - देश का नमक' },
    description: {
      en: 'Pure iodised vacuum evaporated salt.',
      hi: 'आयोडीन युक्त शुद्ध नमक।'
    },
    category: inMemoryCategories[3],
    sku: 'SP-TATA-SALT-1KG',
    price: 28,
    salePrice: 26,
    stockQuantity: 100,
    lowStockThreshold: 20,
    unit: '1 kg',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: false,
    tags: ['salt', 'tata', 'नमक']
  },
  {
    _id: '66f002000000000000000007',
    name: { en: 'Brooke Bond Red Label Tea', hi: 'रेड लेबल चाय पत्ती' },
    description: {
      en: 'Strong, aromatic tea leaves for your morning chai.',
      hi: 'कड़क और स्वाद से भरपूर दानेदार चाय पत्ती।'
    },
    category: inMemoryCategories[4],
    sku: 'TEA-REDL-250G',
    price: 135,
    salePrice: 124,
    stockQuantity: 50,
    lowStockThreshold: 10,
    unit: '250 g',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['tea', 'chai', 'चाय']
  },
  {
    _id: '66f002000000000000000008',
    name: { en: 'Surf Excel Quick Wash Detergent', hi: 'सर्फ एक्सेल वाशिंग पाउडर' },
    description: {
      en: 'Removes tough stains easily and keeps clothes bright.',
      hi: 'कड़े दाग आसानी से हटाए और कपड़ों में ताज़गी बनाए रखे।'
    },
    category: inMemoryCategories[5],
    sku: 'CL-SURF-1KG',
    price: 145,
    salePrice: 132,
    stockQuantity: 35,
    lowStockThreshold: 8,
    unit: '1 kg',
    images: ['https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['detergent', 'surf', 'सर्फ']
  },
  {
    _id: '66f002000000000000000009',
    name: { en: 'Parle-G Original Glucose Biscuits', hi: 'पारले-जी बिस्कुट (बड़ा पैक)' },
    description: {
      en: 'India\'s favourite tea-time biscuit.',
      hi: 'चाय के साथ सबका मनपसंद पारले-जी बिस्कुट।'
    },
    category: inMemoryCategories[6],
    sku: 'SN-PARLEG-800G',
    price: 90,
    salePrice: 78,
    stockQuantity: 70,
    lowStockThreshold: 15,
    unit: '800 g Family Pack',
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    isFeatured: true,
    tags: ['parle-g', 'biscuit', 'बिस्कुट']
  }
];

// Seed Users
export const inMemoryUsers: any[] = [
  {
    _id: '66f000000000000000000001',
    phoneNumber: '9876543210',
    fullName: 'दुकानदार',
    role: 'admin',
    languagePreference: 'hi',
    isActive: true,
    addresses: [
      {
        fullName: 'दुकानदार',
        phoneNumber: '9876543210',
        state: 'उत्तर प्रदेश',
        district: 'वाराणसी',
        village: 'रामपुर',
        pincode: '221001',
        landmark: 'मुख्य चौराहा, दुकान नं. 4',
        isDefault: true
      }
    ]
  }
];

// Seed Shop Settings
export let inMemorySettings: any = {
  _id: '66f003000000000000000001',
  shopName: {
    en: 'Apna Bazar',
    hi: 'अपना बाज़ार'
  },
  contactPhone: '+919876543210',
  whatsappNumber: '+919876543210',
  address: {
    en: 'Shop No. 4, Main Chauraha, Near Panchayat Bhawan, Rampur Village',
    hi: 'दुकान नं. 4, मुख्य चौराहा, पंचायत भवन के पास, रामपुर'
  },
  supportHours: {
    en: '7:30 AM to 8:30 PM (All 7 Days)',
    hi: 'सुबह 7:30 से रात 8:30 बजे तक (सातों दिन)'
  },
  defaultDeliveryFee: 20,
  freeDeliveryMinAmount: 499,
  announcement: {
    en: 'Fast village delivery within 2 to 4 hours! Cash on Delivery available.',
    hi: 'आपके गाँव में 2 से 4 घंटे में होम डिलीवरी! सामान मिलने पर नकद भुगतान करें।',
    isActive: true
  }
};

// Seed Orders
export const inMemoryOrders: any[] = [
  {
    _id: '66f004000000000000000001',
    orderNumber: 'AB-20261018-8421',
    isGuest: false,
    deliveryAddress: {
      fullName: 'सुरेश प्रसाद (Suresh Prasad)',
      phoneNumber: '9812345678',
      state: 'उत्तर प्रदेश',
      district: 'वाराणसी',
      village: 'रामपुर गाँव (Rampur)',
      pincode: '221001',
      landmark: 'प्राथमिक विद्यालय के सामने'
    },
    items: [
      {
        product: '66f002000000000000000001',
        name: { en: 'Aashirvaad Shudh Chakki Atta', hi: 'आशीर्वाद शुद्ध चक्की आटा' },
        sku: 'AT-AASH-5KG',
        unitPrice: 235,
        quantity: 1,
        unit: '5 kg',
        itemTotal: 235
      },
      {
        product: '66f002000000000000000004',
        name: { en: 'Fortune Mustard Oil', hi: 'फॉर्च्यून सरसों तेल' },
        sku: 'OIL-MUST-1L',
        unitPrice: 148,
        quantity: 2,
        unit: '1 Litre',
        itemTotal: 296
      }
    ],
    subtotal: 531,
    deliveryCharge: 0,
    totalAmount: 531,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PLACED',
    statusHistory: [
      {
        status: 'PLACED',
        timestamp: new Date(Date.now() - 3600000),
        note: 'ऑर्डर दर्ज हुआ (Order placed via COD)',
        updatedBy: 'CUSTOMER'
      }
    ],
    createdAt: new Date(Date.now() - 3600000)
  },
  {
    _id: '66f004000000000000000002',
    orderNumber: 'AB-20261018-6219',
    isGuest: false,
    deliveryAddress: {
      fullName: 'महेन्द्र पाल (Mahendra Pal)',
      phoneNumber: '9823456789',
      state: 'उत्तर प्रदेश',
      district: 'वाराणसी',
      village: 'बेलवा गाँव (Belwa)',
      pincode: '221002',
      landmark: 'शिव मंदिर के पीछे'
    },
    items: [
      {
        product: '66f002000000000000000003',
        name: { en: 'Desi Arhar / Toor Dal', hi: 'देसी अरहर दाल' },
        sku: 'DL-ARHAR-1KG',
        unitPrice: 155,
        quantity: 2,
        unit: '1 kg',
        itemTotal: 310
      }
    ],
    subtotal: 310,
    deliveryCharge: 20,
    totalAmount: 330,
    paymentMethod: 'COD',
    paymentStatus: 'COLLECTED',
    orderStatus: 'DELIVERED',
    statusHistory: [
      { status: 'PLACED', timestamp: new Date(Date.now() - 7200000), note: 'ऑर्डर दर्ज हुआ' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 6000000), note: 'दुकानदार द्वारा स्वीकार' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 5000000), note: 'पैक किया गया' },
      { status: 'SHIPPED', timestamp: new Date(Date.now() - 4000000), note: 'गाँव के लिए रवाना' },
      { status: 'DELIVERED', timestamp: new Date(Date.now() - 2000000), note: 'सफलतापूर्वक डिलीवर हुआ' }
    ],
    createdAt: new Date(Date.now() - 7200000)
  }
];

export const inMemoryNotifications: any[] = [
  {
    _id: '66f005000000000000000001',
    targetRole: 'ADMIN',
    title: { en: 'New Order #AB-20261018-8421', hi: 'नया ऑर्डर प्राप्त हुआ #AB-20261018-8421' },
    body: { en: 'Order of ₹531 for Rampur Village', hi: 'रामपुर गाँव से ₹531 का नया ऑर्डर आया है' },
    type: 'ORDER_PLACED',
    orderNumber: 'AB-20261018-8421',
    isRead: false,
    createdAt: new Date()
  }
];
