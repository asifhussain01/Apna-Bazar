import { OrderStatus } from '../models/Order';

describe('Order Status State Machine Transitions', () => {
  const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PLACED: ['CONFIRMED', 'CANCELLED', 'REJECTED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
    REJECTED: []
  };

  function canTransition(current: OrderStatus, target: OrderStatus): boolean {
    return VALID_TRANSITIONS[current].includes(target);
  }

  it('allows PLACED to transition to CONFIRMED, CANCELLED, or REJECTED', () => {
    expect(canTransition('PLACED', 'CONFIRMED')).toBe(true);
    expect(canTransition('PLACED', 'CANCELLED')).toBe(true);
    expect(canTransition('PLACED', 'REJECTED')).toBe(true);
    expect(canTransition('PLACED', 'DELIVERED')).toBe(false); // cannot jump directly to delivered
  });

  it('allows CONFIRMED to transition to PREPARING', () => {
    expect(canTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransition('CONFIRMED', 'REJECTED')).toBe(false); // cannot reject after confirmation
  });

  it('allows PREPARING to transition to SHIPPED', () => {
    expect(canTransition('PREPARING', 'SHIPPED')).toBe(true);
  });

  it('allows SHIPPED to transition to OUT_FOR_DELIVERY and DELIVERED', () => {
    expect(canTransition('SHIPPED', 'OUT_FOR_DELIVERY')).toBe(true);
    expect(canTransition('SHIPPED', 'DELIVERED')).toBe(true);
  });

  it('prohibits any transitions out of terminal states (DELIVERED, CANCELLED, REJECTED)', () => {
    expect(canTransition('DELIVERED', 'PLACED')).toBe(false);
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false);
    expect(canTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(canTransition('REJECTED', 'CONFIRMED')).toBe(false);
  });
});
