import { ExcelExportService } from '../services/excelExportService';

describe('Excel Export & Formula Injection Sanitization', () => {
  it('should neutralize formula injection characters (=, +, -, @) with a single quote', () => {
    const sanitize = (ExcelExportService as any).sanitizeFormula;

    expect(sanitize('=1+1')).toBe("'=1+1");
    expect(sanitize('+cmd|/c calc')).toBe("'+cmd|/c calc");
    expect(sanitize('-5+5')).toBe("'-5+5");
    expect(sanitize('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
    expect(sanitize('\tEvilTab')).toBe("'\tEvilTab");
  });

  it('should preserve safe text without prepending single quotes', () => {
    const sanitize = (ExcelExportService as any).sanitizeFormula;

    expect(sanitize('Ramesh Kumar')).toBe('Ramesh Kumar');
    expect(sanitize('रामपुर गाँव (Rampur Village)')).toBe('रामपुर गाँव (Rampur Village)');
    expect(sanitize('Near Shiv Temple')).toBe('Near Shiv Temple');
    expect(sanitize('9876543210')).toBe('9876543210');
  });

  it('should generate a valid binary Excel buffer with Hindi and English characters', async () => {
    const mockOrder: any = {
      orderNumber: 'AB-20261018-1001',
      createdAt: new Date(),
      deliveryAddress: {
        fullName: 'रामेश्वर दयाल (Rameshwar)',
        phoneNumber: '9876543210',
        village: 'रामपुर (Rampur)',
        district: 'वाराणसी (Varanasi)',
        state: 'उत्तर प्रदेश (UP)',
        pincode: '221001',
        landmark: 'शिव मंदिर के पीछे'
      },
      items: [
        {
          product: '60d0fe4f5311236168a109ca',
          name: { en: 'Aashirvaad Atta', hi: 'आशीर्वाद चक्की आटा' },
          sku: 'AT-AASH-5KG',
          unit: '5 kg',
          quantity: 2,
          unitPrice: 235,
          itemTotal: 470
        }
      ],
      subtotal: 470,
      deliveryCharge: 20,
      totalAmount: 490,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED'
    };

    const buffer = await ExcelExportService.generateOrdersExcel([mockOrder]);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000); // Valid xlsx zip structure
  });
});
