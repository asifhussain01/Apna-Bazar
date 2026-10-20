import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { ShopSetting } from '../models/ShopSetting';

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to database');

    // 1. Setup Admin Account
    const adminPhone = '9876543210';
    let admin = await User.findOne({ phoneNumber: adminPhone });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin1234', salt);
      admin = await User.create({
        phoneNumber: adminPhone,
        fullName: 'दुकानदार भाई (Ramesh Kumar - Shop Owner)',
        role: 'admin',
        passwordHash,
        languagePreference: 'hi'
      });
      console.log(`[Seed] Created admin account: Phone ${adminPhone}, Password: admin1234`);
    } else {
      console.log('[Seed] Admin account already exists');
    }

    // 2. Setup Shop Settings
    await ShopSetting.deleteMany({});
    await ShopSetting.create({
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
        hi: 'सुबह 7:30 से रात 8:30 बजे तक (हफ्ते के सातों दिन)'
      },
      defaultDeliveryFee: 20,
      freeDeliveryMinAmount: 499,
      announcement: {
        en: 'Fast village delivery within 2 to 4 hours! Cash on Delivery available.',
        hi: 'आपके गाँव में 2 से 4 घंटे में होम डिलीवरी! सामान मिलने पर नकद भुगतान करें।',
        isActive: true
      },
      bannerImages: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80'
      ]
    });
    console.log('[Seed] Default shop settings created');

    // 3. Clear existing categories and products for clean seed
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 4. Categories
    const categoriesData = [
      {
        name: { en: 'Atta, Rice & Grains', hi: 'आटा, चावल और अनाज' },
        slug: 'atta-rice-grains',
        description: { en: 'Fresh chakki atta, premium basmati rice, poha and suji', hi: 'ताज़ा चक्की आटा, बढ़िया चावल, पोहा और सूजी' },
        iconName: 'nutrition-outline',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        displayOrder: 1
      },
      {
        name: { en: 'Dals & Pulses', hi: 'दालें और दलहन' },
        slug: 'dals-pulses',
        description: { en: 'Protein rich Arhar, Moong, Chana and Urad dal', hi: 'अरहर, मूँग, चना और उड़द की शुद्ध दालें' },
        iconName: 'leaf-outline',
        image: 'https://images.unsplash.com/photo-1585735622950-ec188b48ef11?auto=format&fit=crop&w=600&q=80',
        displayOrder: 2
      },
      {
        name: { en: 'Cooking Oils & Ghee', hi: 'खाद्य तेल और शुद्ध घी' },
        slug: 'oils-ghee',
        description: { en: 'Pure mustard oil, refined oil and Desi ghee', hi: 'शुद्ध सरसों तेल, रिफाइंड तेल और देसी घी' },
        iconName: 'water-outline',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
        displayOrder: 3
      },
      {
        name: { en: 'Spices, Salt & Sugar', hi: 'मसाले, नमक और चीनी' },
        slug: 'spices-salt-sugar',
        description: { en: 'Turmeric, red chili, coriander powder, Tata salt', hi: 'हल्दी, मिर्च, धनिया पाउडर और आयोडीन नमक' },
        iconName: 'flame-outline',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
        displayOrder: 4
      },
      {
        name: { en: 'Tea & Morning Drinks', hi: 'चाय और पेय' },
        slug: 'tea-drinks',
        description: { en: 'Strong kadak chai patti and coffee', hi: 'कड़क दानेदार चाय पत्ती और पेय' },
        iconName: 'cafe-outline',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        displayOrder: 5
      },
      {
        name: { en: 'Soaps & Detergents', hi: 'साबुन और सर्फ' },
        slug: 'soaps-cleaning',
        description: { en: 'Bath soaps, washing powder and dish cleaning bars', hi: 'नहाने का साबुन, कपड़े धोने का पाउडर और बर्तन साबुन' },
        iconName: 'sparkles-outline',
        image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
        displayOrder: 6
      },
      {
        name: { en: 'Biscuits & Snacks', hi: 'बिस्कुट और नमकीन' },
        slug: 'snacks-biscuits',
        description: { en: 'Parle-G, Marie, Good Day biscuits and crispy namkeen', hi: 'पारले-जी, मैरी, गुड डे बिस्कुट और नमकीन' },
        iconName: 'fast-food-outline',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
        displayOrder: 7
      }
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Inserted ${insertedCategories.length} categories`);

    const catMap: Record<string, mongoose.Types.ObjectId> = {};
    insertedCategories.forEach(cat => {
      catMap[cat.slug] = cat._id as mongoose.Types.ObjectId;
    });

    // 5. Products
    const productsData = [
      // Atta & Rice
      {
        name: { en: 'Aashirvaad Shudh Chakki Atta', hi: 'आशीर्वाद शुद्ध चक्की आटा' },
        description: {
          en: '100% whole wheat flour, naturally rich in dietary fibre. Makes soft, fluffy rotis.',
          hi: '100% साबुत गेहूं से बना शुद्ध आटा। रोटियां हमेशा नरम और फूली रहती हैं।'
        },
        category: catMap['atta-rice-grains'],
        sku: 'AT-AASH-5KG',
        price: 260,
        salePrice: 235,
        stockQuantity: 45,
        lowStockThreshold: 10,
        unit: '5 kg',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: true,
        tags: ['atta', 'flour', 'wheat', 'आटा', 'गेहूं']
      },
      {
        name: { en: 'Daily Basmati Rice (Pariwar)', hi: 'पारिवारिक बासमती चावल' },
        description: {
          en: 'Aromatic, non-sticky long grain rice ideal for everyday family lunch and pulao.',
          hi: 'रोज़ाना खाने के लिए लंबा और खुशबूदार बासमती चावल।'
        },
        category: catMap['atta-rice-grains'],
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
      // Dals
      {
        name: { en: 'Desi Arhar / Toor Dal', hi: 'देसी अरहर दाल (तुअर दाल)' },
        description: {
          en: 'Unpolished protein-rich arhar dal. Cooks fast and tastes naturally sweet.',
          hi: 'बिना पॉलिश की शुद्ध अरहर दाल। जल्दी पकती है और स्वादिष्ट बनती है।'
        },
        category: catMap['dals-pulses'],
        sku: 'DL-ARHAR-1KG',
        price: 175,
        salePrice: 155,
        stockQuantity: 50,
        lowStockThreshold: 10,
        unit: '1 kg',
        images: ['https://images.unsplash.com/photo-1585735622950-ec188b48ef11?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: true,
        tags: ['arhar', 'toor', 'dal', 'दाल', 'अरहर']
      },
      {
        name: { en: 'Yellow Moong Dal Dhuli', hi: 'पीली मूँग दाल (धुली)' },
        description: {
          en: 'Light and easy to digest dal. Perfect for khichdi and daily nourishment.',
          hi: 'पचने में बेहद हल्की और पौष्टिक मूँग दाल। खिचड़ी और बच्चों के लिए सर्वोत्तम।'
        },
        category: catMap['dals-pulses'],
        sku: 'DL-MOONG-1KG',
        price: 130,
        salePrice: 118,
        stockQuantity: 40,
        lowStockThreshold: 8,
        unit: '1 kg',
        images: ['https://images.unsplash.com/photo-1585735622950-ec188b48ef11?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: false,
        tags: ['moong', 'dal', 'मूँग', 'दाल']
      },
      // Oils & Ghee
      {
        name: { en: 'Fortune Kachi Ghani Mustard Oil', hi: 'फॉर्च्यून कच्ची घानी सरसों का तेल' },
        description: {
          en: 'Pure cold pressed mustard oil with authentic pungent aroma for traditional Indian curries.',
          hi: 'तीखा और शुद्ध कच्ची घानी सरसों का तेल। सब्ज़ियों और अचार के लिए सबसे बेहतरीन।'
        },
        category: catMap['oils-ghee'],
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
        name: { en: 'Amul Pure Desi Ghee', hi: 'अमुल शुद्ध देसी घी' },
        description: {
          en: 'Rich granular ghee made from pure milk fat. Adds taste to rotis, dal tadka and sweets.',
          hi: 'शुद्ध दूध से बना दानेदार देसी घी। रोटी और दाल का स्वाद बढ़ाए।'
        },
        category: catMap['oils-ghee'],
        sku: 'GH-AMUL-500ML',
        price: 330,
        salePrice: 310,
        stockQuantity: 25,
        lowStockThreshold: 5,
        unit: '500 ml',
        images: ['https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: true,
        tags: ['ghee', 'amul', 'घी', 'देसी घी']
      },
      // Spices
      {
        name: { en: 'Tata Salt Vacuum Evaporated Iodised', hi: 'टाटा नमक - देश का नमक' },
        description: {
          en: 'Pure iodised vacuum evaporated salt for good health and taste.',
          hi: 'आयोडीन युक्त शुद्ध नमक जो परिवार की सेहत का ख्याल रखे।'
        },
        category: catMap['spices-salt-sugar'],
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
        name: { en: 'Catch Haldi Powder (Turmeric)', hi: 'कैच शुद्ध हल्दी पाउडर' },
        description: {
          en: 'Pure aromatic turmeric with high natural curcumin content and rich golden colour.',
          hi: 'सुगंधित और शुद्ध हल्दी पाउडर जो सब्ज़ी को दे सुंदर प्राकृतिक रंग।'
        },
        category: catMap['spices-salt-sugar'],
        sku: 'SP-HALDI-200G',
        price: 65,
        salePrice: 58,
        stockQuantity: 40,
        lowStockThreshold: 10,
        unit: '200 g',
        images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: false,
        tags: ['haldi', 'turmeric', 'हल्दी', 'मसाला']
      },
      // Tea
      {
        name: { en: 'Brooke Bond Red Label Tea', hi: 'रेड लेबल चाय पत्ती' },
        description: {
          en: 'Strong, aromatic tea leaves for your morning energy and refreshing village chai.',
          hi: 'कड़क और स्वाद से भरपूर दानेदार चाय पत्ती।'
        },
        category: catMap['tea-drinks'],
        sku: 'TEA-REDL-250G',
        price: 135,
        salePrice: 124,
        stockQuantity: 50,
        lowStockThreshold: 10,
        unit: '250 g',
        images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: true,
        tags: ['tea', 'chai', 'चाय', 'पत्ती']
      },
      // Cleaning
      {
        name: { en: 'Surf Excel Quick Wash Detergent Powder', hi: 'सर्फ एक्सेल वाशिंग पाउडर' },
        description: {
          en: 'Removes tough stains easily and keeps clothes bright and fragrant.',
          hi: 'कड़े दाग आसानी से हटाए और कपड़ों में ताज़गी बनाए रखे।'
        },
        category: catMap['soaps-cleaning'],
        sku: 'CL-SURF-1KG',
        price: 145,
        salePrice: 132,
        stockQuantity: 35,
        lowStockThreshold: 8,
        unit: '1 kg',
        images: ['https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: true,
        tags: ['detergent', 'surf', 'सर्फ', 'कपड़े']
      },
      {
        name: { en: 'Lifebuoy Total Germ Protection Soap', hi: 'लाइफबॉय साबुन (4 का पैक)' },
        description: {
          en: 'Reliable 100% germ protection soap bar for family hygiene.',
          hi: 'कीटाणुओं से संपूर्ण सुरक्षा देने वाला विश्वसनीय साबुन।'
        },
        category: catMap['soaps-cleaning'],
        sku: 'CL-LIFE-PACK4',
        price: 140,
        salePrice: 120,
        stockQuantity: 40,
        lowStockThreshold: 10,
        unit: 'Pack of 4',
        images: ['https://images.unsplash.com/photo-1607006311027-a0684f18d7b3?auto=format&fit=crop&w=600&q=80'],
        isAvailable: true,
        isFeatured: false,
        tags: ['soap', 'lifebuoy', 'साबुन']
      },
      // Biscuits
      {
        name: { en: 'Parle-G Original Glucose Biscuits', hi: 'पारले-जी ग्लूकोज बिस्कुट (बड़ा पैक)' },
        description: {
          en: 'India\'s favourite tea-time biscuit packed with goodness of wheat and milk.',
          hi: 'चाय के साथ सबका मनपसंद पारले-जी बिस्कुट।'
        },
        category: catMap['snacks-biscuits'],
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

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Inserted ${insertedProducts.length} village store products`);

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
