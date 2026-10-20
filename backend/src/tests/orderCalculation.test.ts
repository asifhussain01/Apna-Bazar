describe('Order Calculation & Delivery Rules', () => {
  const DEFAULT_DELIVERY_FEE = 20;
  const FREE_DELIVERY_THRESHOLD = 499;

  function calculateDeliveryFee(subtotal: number): number {
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  }

  function calculateTotal(items: Array<{ price: number; quantity: number }>): {
    subtotal: number;
    deliveryFee: number;
    total: number;
  } {
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const deliveryFee = calculateDeliveryFee(subtotal);
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    };
  }

  it('should charge standard delivery fee of ₹20 when subtotal is below ₹499', () => {
    const items = [
      { price: 155, quantity: 2 } // Subtotal: 310
    ];
    const result = calculateTotal(items);
    expect(result.subtotal).toBe(310);
    expect(result.deliveryFee).toBe(20);
    expect(result.total).toBe(330);
  });

  it('should waive delivery fee (₹0) when subtotal reaches or exceeds ₹499', () => {
    const items = [
      { price: 235, quantity: 2 }, // 470
      { price: 58, quantity: 1 }   // 58 -> Total: 528
    ];
    const result = calculateTotal(items);
    expect(result.subtotal).toBe(528);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(528);
  });

  it('should qualify for free delivery at exact ₹499 threshold', () => {
    const items = [
      { price: 499, quantity: 1 }
    ];
    const result = calculateTotal(items);
    expect(result.subtotal).toBe(499);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(499);
  });
});
