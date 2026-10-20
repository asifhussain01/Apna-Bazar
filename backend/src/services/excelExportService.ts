import ExcelJS from 'exceljs';
import { IOrder } from '../models/Order';

export class ExcelExportService {
  /**
   * Sanitize text against Formula Injection (CSV / Excel macro injection)
   * Any cell text starting with =, +, -, @, or tab is prepended with a single quote.
   */
  private static sanitizeFormula(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value).trim();
    if (/^[=+\-@\t\r]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Generates a styled Excel workbook buffer containing Orders Summary and Line Items
   */
  public static async generateOrdersExcel(orders: IOrder[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ShopEase Apna Bazar System';
    workbook.created = new Date();

    // ----------------------------------------------------
    // Sheet 1: Orders Summary
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet('Orders Summary', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    });

    summarySheet.columns = [
      { header: 'Order ID', key: 'orderNumber', width: 20 },
      { header: 'Date & Time', key: 'date', width: 22 },
      { header: 'Customer Name', key: 'customerName', width: 22 },
      { header: 'Phone Number', key: 'phoneNumber', width: 16 },
      { header: 'Village / Town', key: 'village', width: 20 },
      { header: 'District', key: 'district', width: 18 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'PIN Code', key: 'pincode', width: 12 },
      { header: 'Landmark / Shop', key: 'landmark', width: 26 },
      { header: 'Items Count', key: 'itemsCount', width: 14 },
      { header: 'Subtotal (₹)', key: 'subtotal', width: 14 },
      { header: 'Delivery Fee (₹)', key: 'deliveryFee', width: 16 },
      { header: 'Total Amount (₹)', key: 'totalAmount', width: 16 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Payment Status', key: 'paymentStatus', width: 16 },
      { header: 'Order Status', key: 'orderStatus', width: 18 },
      { header: 'Delivery Notes', key: 'notes', width: 25 },
      { header: 'Rejection/Cancel Reason', key: 'reason', width: 25 }
    ];

    // Style header row
    const headerRow1 = summarySheet.getRow(1);
    headerRow1.height = 26;
    headerRow1.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Deep Navy Blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    // Populate data rows
    orders.forEach(order => {
      const row = summarySheet.addRow({
        orderNumber: this.sanitizeFormula(order.orderNumber),
        date: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '',
        customerName: this.sanitizeFormula(order.deliveryAddress.fullName),
        phoneNumber: this.sanitizeFormula(order.deliveryAddress.phoneNumber),
        village: this.sanitizeFormula(order.deliveryAddress.village),
        district: this.sanitizeFormula(order.deliveryAddress.district),
        state: this.sanitizeFormula(order.deliveryAddress.state),
        pincode: this.sanitizeFormula(order.deliveryAddress.pincode),
        landmark: this.sanitizeFormula(order.deliveryAddress.landmark),
        itemsCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryCharge,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        notes: this.sanitizeFormula(order.deliveryAddress.deliveryInstructions || ''),
        reason: this.sanitizeFormula(order.rejectionReason || order.cancellationReason || '')
      });

      // Align numbers and dates
      row.getCell('subtotal').numFmt = '₹#,##0.00';
      row.getCell('deliveryFee').numFmt = '₹#,##0.00';
      row.getCell('totalAmount').numFmt = '₹#,##0.00';
      row.getCell('itemsCount').numFmt = '#,##0';
    });

    // ----------------------------------------------------
    // Sheet 2: Order Line Items
    // ----------------------------------------------------
    const itemsSheet = workbook.addWorksheet('Order Line Items', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    });

    itemsSheet.columns = [
      { header: 'Order ID', key: 'orderNumber', width: 20 },
      { header: 'Product Name (English)', key: 'nameEn', width: 28 },
      { header: 'Product Name (Hindi)', key: 'nameHi', width: 28 },
      { header: 'SKU', key: 'sku', width: 16 },
      { header: 'Unit / Pack', key: 'unit', width: 14 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit Price (₹)', key: 'unitPrice', width: 15 },
      { header: 'Line Total (₹)', key: 'itemTotal', width: 15 },
      { header: 'Customer Village', key: 'village', width: 20 }
    ];

    const headerRow2 = itemsSheet.getRow(1);
    headerRow2.height = 26;
    headerRow2.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF065F46' } // Forest Green
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    orders.forEach(order => {
      order.items.forEach(item => {
        const row = itemsSheet.addRow({
          orderNumber: this.sanitizeFormula(order.orderNumber),
          nameEn: this.sanitizeFormula(item.name.en),
          nameHi: this.sanitizeFormula(item.name.hi),
          sku: this.sanitizeFormula(item.sku),
          unit: this.sanitizeFormula(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemTotal: item.itemTotal,
          village: this.sanitizeFormula(order.deliveryAddress.village)
        });

        row.getCell('unitPrice').numFmt = '₹#,##0.00';
        row.getCell('itemTotal').numFmt = '₹#,##0.00';
        row.getCell('quantity').numFmt = '#,##0';
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
