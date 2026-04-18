// ============================================================================
// STATE MACHINE LOGIC FOR ISO 9001 INVENTORY MANAGEMENT
// ============================================================================

/**
 * RAW MATERIAL BATCH STATE MACHINE
 * 
 * Transitions:
 *  QUARANTINE -> APPROVED (QC Pass)
 *  QUARANTINE -> REJECTED (QC Fail)
 *  APPROVED -> ALLOCATED (Batch Card Created)
 *  ALLOCATED -> CONSUMED (All inventory consumed in production)
 *  Any State -> EXPIRED (Expiry date passed)
 *  Any State -> SCRAP (Manual action)
 */

export enum RawMaterialStatus {
  QUARANTINE = 'QUARANTINE',
  APPROVED = 'APPROVED',
  ALLOCATED = 'ALLOCATED',
  CONSUMED = 'CONSUMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  SCRAP = 'SCRAP',
}

export interface RawMaterialStateTransition {
  from: RawMaterialStatus;
  to: RawMaterialStatus;
  condition: (context: any) => boolean;
  action?: (context: any) => Promise<void>;
  auditMessage: string;
}

export class RawMaterialStateMachine {
  private static readonly VALID_TRANSITIONS: RawMaterialStateTransition[] = [
    {
      from: RawMaterialStatus.QUARANTINE,
      to: RawMaterialStatus.APPROVED,
      condition: (ctx) => ctx.qcTestPassed === true,
      auditMessage: 'Material approved by QC',
    },
    {
      from: RawMaterialStatus.QUARANTINE,
      to: RawMaterialStatus.REJECTED,
      condition: (ctx) => ctx.qcTestPassed === false,
      auditMessage: 'Material rejected by QC',
    },
    {
      from: RawMaterialStatus.APPROVED,
      to: RawMaterialStatus.ALLOCATED,
      condition: (ctx) => ctx.batchCardId !== null,
      auditMessage: 'Material allocated to batch card',
    },
    {
      from: RawMaterialStatus.ALLOCATED,
      to: RawMaterialStatus.CONSUMED,
      condition: (ctx) => ctx.quantityOnHand === 0,
      auditMessage: 'Material fully consumed in production',
    },
    // Expiry transitions (from any state)
    {
      from: RawMaterialStatus.APPROVED,
      to: RawMaterialStatus.EXPIRED,
      condition: (ctx) => new Date() > ctx.expiryDate,
      auditMessage: 'Material expired',
    },
    {
      from: RawMaterialStatus.ALLOCATED,
      to: RawMaterialStatus.EXPIRED,
      condition: (ctx) => new Date() > ctx.expiryDate,
      auditMessage: 'Material expired (was allocated)',
    },
    // Scrap (manual action from any state)
    {
      from: RawMaterialStatus.APPROVED,
      to: RawMaterialStatus.SCRAP,
      condition: (ctx) => ctx.scrappedReason !== null,
      auditMessage: 'Material scrapped',
    },
    {
      from: RawMaterialStatus.ALLOCATED,
      to: RawMaterialStatus.SCRAP,
      condition: (ctx) => ctx.scrappedReason !== null,
      auditMessage: 'Allocated material scrapped',
    },
  ];

  static canTransition(from: RawMaterialStatus, to: RawMaterialStatus): boolean {
    return this.VALID_TRANSITIONS.some(
      (t) => t.from === from && t.to === to
    );
  }

  static getValidTransitions(currentState: RawMaterialStatus): RawMaterialStatus[] {
    return this.VALID_TRANSITIONS
      .filter((t) => t.from === currentState)
      .map((t) => t.to);
  }

  static async executeTransition(
    from: RawMaterialStatus,
    to: RawMaterialStatus,
    context: any
  ): Promise<boolean> {
    const transition = this.VALID_TRANSITIONS.find(
      (t) => t.from === from && t.to === to
    );

    if (!transition) {
      return false;
    }

    if (!transition.condition(context)) {
      return false;
    }

    if (transition.action) {
      await transition.action(context);
    }

    return true;
  }
}

// ============================================================================
// INVENTORY LOT STATE MACHINE
// ============================================================================

/**
 * INVENTORY LOT STATE MACHINE (FEFO - First Expired, First Out)
 * 
 * Transitions:
 *  QUARANTINE -> APPROVED (Parent batch approved by QC)
 *  APPROVED -> ALLOCATED (Batch card reserves specific lot)
 *  ALLOCATED -> CONSUMED (Production consumes the lot)
 *  APPROVED -> EXPIRED (Auto-transition when expiry date passes)
 *  Any State -> REJECTED
 */

export enum InventoryState {
  QUARANTINE = 'QUARANTINE',
  APPROVED = 'APPROVED',
  ALLOCATED = 'ALLOCATED',
  CONSUMED = 'CONSUMED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export class InventoryLotStateMachine {
  /**
   * FEFO Ordering: Earlier expiry dates should be consumed first
   * Returns lots sorted by expiry date (earliest first)
   */
  static sortByFEFO(lots: any[]): any[] {
    return lots.sort((a, b) => {
      const dateA = new Date(a.expiryDate).getTime();
      const dateB = new Date(b.expiryDate).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Auto-check for expired lots
   * Should be run periodically or before allocation
   */
  static checkExpiration(lot: any, today: Date = new Date()): InventoryState {
    if (today > new Date(lot.expiryDate)) {
      return InventoryState.EXPIRED;
    }
    return lot.state;
  }

  /**
   * Reserve inventory for batch card (FEFO order)
   * Returns reserved lots in order of FEFO
   */
  static async allocateForBatchCard(
    availableLots: any[],
    requiredQuantity: number
  ): Promise<any[]> {
    const sorted = this.sortByFEFO(availableLots);
    const allocated = [];
    let remainingQuantity = requiredQuantity;

    for (const lot of sorted) {
      if (remainingQuantity <= 0) break;

      const canAllocate = Math.min(lot.quantityOnHand, remainingQuantity);
      allocated.push({
        lot,
        allocatedQuantity: canAllocate,
        allocationOrder: allocated.length + 1, // FEFO order
      });

      remainingQuantity -= canAllocate;
    }

    if (remainingQuantity > 0) {
      throw new Error(
        `Insufficient inventory. Missing: ${remainingQuantity} units`
      );
    }

    return allocated;
  }

  /**
   * Update consumption from allocated lot
   */
  static async consumeFromLot(
    lot: any,
    quantityConsumed: number
  ): Promise<void> {
    lot.quantityOnHand -= quantityConsumed;
    lot.quantityReserved -= quantityConsumed;

    // Auto-transition to CONSUMED when fully consumed
    if (lot.quantityOnHand === 0 && lot.state === InventoryState.ALLOCATED) {
      lot.state = InventoryState.CONSUMED;
    }
  }
}

// ============================================================================
// BATCH CARD STATE MACHINE
// ============================================================================

/**
 * BATCH CARD (PRODUCTION ORDER) STATE MACHINE
 * 
 * Transitions:
 *  PENDING -> RELEASED (Manager approval)
 *  RELEASED -> IN_PRODUCTION (Production started)
 *  IN_PRODUCTION -> PRODUCTION_COMPLETE (All RM consumed, FG produced)
 *  PRODUCTION_COMPLETE -> FG_QC_PENDING (Awaiting FG quality test)
 *  FG_QC_PENDING -> FG_APPROVED (QC passed)
 *  FG_QC_PENDING -> FG_REJECTED (QC failed, batch scrapped)
 *  FG_APPROVED -> READY_TO_DISPATCH
 *  READY_TO_DISPATCH -> COMPLETED (Delivered to client)
 *  Any State -> CANCELLED
 */

export enum BatchCardStatus {
  PENDING = 'PENDING',
  RELEASED = 'RELEASED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  PRODUCTION_COMPLETE = 'PRODUCTION_COMPLETE',
  FG_QC_PENDING = 'FG_QC_PENDING',
  FG_APPROVED = 'FG_APPROVED',
  FG_REJECTED = 'FG_REJECTED',
  READY_TO_DISPATCH = 'READY_TO_DISPATCH',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class BatchCardStateMachine {
  private static readonly VALID_TRANSITIONS = [
    { from: BatchCardStatus.PENDING, to: BatchCardStatus.RELEASED },
    { from: BatchCardStatus.RELEASED, to: BatchCardStatus.IN_PRODUCTION },
    {
      from: BatchCardStatus.IN_PRODUCTION,
      to: BatchCardStatus.PRODUCTION_COMPLETE,
    },
    {
      from: BatchCardStatus.PRODUCTION_COMPLETE,
      to: BatchCardStatus.FG_QC_PENDING,
    },
    { from: BatchCardStatus.FG_QC_PENDING, to: BatchCardStatus.FG_APPROVED },
    { from: BatchCardStatus.FG_QC_PENDING, to: BatchCardStatus.FG_REJECTED },
    { from: BatchCardStatus.FG_APPROVED, to: BatchCardStatus.READY_TO_DISPATCH },
    {
      from: BatchCardStatus.READY_TO_DISPATCH,
      to: BatchCardStatus.COMPLETED,
    },
    // Can cancel from any state except COMPLETED
    ...Object.values(BatchCardStatus)
      .filter((s) => s !== BatchCardStatus.COMPLETED)
      .map((s) => ({
        from: s as BatchCardStatus,
        to: BatchCardStatus.CANCELLED,
      })),
  ];

  static canTransition(
    from: BatchCardStatus,
    to: BatchCardStatus
  ): boolean {
    return this.VALID_TRANSITIONS.some(
      (t) => t.from === from && t.to === to
    );
  }

  static getValidTransitions(currentState: BatchCardStatus): BatchCardStatus[] {
    return this.VALID_TRANSITIONS
      .filter((t) => t.from === currentState)
      .map((t) => t.to);
  }

  /**
   * Check if production is ready (all RM allocated and available)
   */
  static isProductionReady(batchCard: any): boolean {
    return (
      batchCard.formulas.length > 0 &&
      batchCard.allocations.every((a: any) => a.status === 'ALLOCATED')
    );
  }

  /**
   * Calculate expected yield
   */
  static calculateTheoreticalYield(
    plannedQuantity: number,
    theoreticalYield: number
  ): number {
    return plannedQuantity * (theoreticalYield / 100);
  }

  /**
   * Calculate actual yield %
   */
  static calculateYieldPercent(
    actualProduced: number,
    theoreticalYield: number
  ): number {
    return (actualProduced / theoreticalYield) * 100;
  }
}

// ============================================================================
// FINISHED GOODS STATE MACHINE
// ============================================================================

/**
 * FINISHED GOODS STATE MACHINE
 * 
 * Transitions:
 *  QUARANTINE -> APPROVED (QC passed)
 *  QUARANTINE -> REJECTED (QC failed)
 *  APPROVED -> ALLOCATED (Delivery note created)
 *  ALLOCATED -> DISPATCHED (Store issue voucher issued)
 *  DISPATCHED -> DELIVERED (Confirmed at client)
 */

export enum FinishedGoodsState {
  QUARANTINE = 'QUARANTINE',
  APPROVED = 'APPROVED',
  ALLOCATED = 'ALLOCATED',
  DISPATCHED = 'DISPATCHED',
  RETURNED = 'RETURNED',
}

export class FinishedGoodsStateMachine {
  private static readonly VALID_TRANSITIONS = [
    {
      from: FinishedGoodsState.QUARANTINE,
      to: FinishedGoodsState.APPROVED,
    },
    {
      from: FinishedGoodsState.APPROVED,
      to: FinishedGoodsState.ALLOCATED,
    },
    {
      from: FinishedGoodsState.ALLOCATED,
      to: FinishedGoodsState.DISPATCHED,
    },
    {
      from: FinishedGoodsState.DISPATCHED,
      to: FinishedGoodsState.RETURNED,
    },
  ];

  static canTransition(
    from: FinishedGoodsState,
    to: FinishedGoodsState
  ): boolean {
    return this.VALID_TRANSITIONS.some(
      (t) => t.from === from && t.to === to
    );
  }

  static getValidTransitions(currentState: FinishedGoodsState): FinishedGoodsState[] {
    return this.VALID_TRANSITIONS
      .filter((t) => t.from === currentState)
      .map((t) => t.to);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const StateMachines = {
  RawMaterial: RawMaterialStateMachine,
  InventoryLot: InventoryLotStateMachine,
  BatchCard: BatchCardStateMachine,
  FinishedGoods: FinishedGoodsStateMachine,
};
