import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { DuplicateCheckResult } from '../../types';
import { AlertCircle, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface DuplicateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateInfo: DuplicateCheckResult | null;
  onConfirmKeep: (quantity: number) => void;
  onCancel: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  isOpen,
  onClose,
  duplicateInfo,
  onConfirmKeep,
  onCancel
}) => {
  const [adjustedQty, setAdjustedQty] = useState<number>(duplicateInfo?.enteredQuantity || 1);

  if (!duplicateInfo || !duplicateInfo.existingItem) return null;

  const { existingItem, enteredName, enteredQuantity, enteredUnit } = duplicateInfo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Check: Already in Kitchen"
      subtitle="Mindful shopping check before adding to grocery list"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs md:text-sm">
        {/* Warning callout */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              You already have {existingItem.quantity} {existingItem.unit} of{' '}
              {existingItem.custom_name} in your kitchen!
            </p>
            <p className="mt-1 text-xs opacity-90 leading-relaxed">
              Storage: {existingItem.storage_location} • Estimated use-by: {existingItem.estimated_use_by} (
              {existingItem.freshness_status}).
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          Would you still like to add <strong>{enteredQuantity} {enteredUnit}</strong> of{' '}
          <strong>{enteredName}</strong> to your shopping list, or adjust the quantity?
        </p>

        {/* Quantity adjustment input */}
        <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-center justify-between">
          <label className="font-medium text-ink-primary">Adjust grocery quantity:</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0.1"
              step="any"
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(parseFloat(e.target.value) || 1)}
              className="w-16 px-2.5 py-1.5 rounded-lg border border-ink-border bg-white text-center font-semibold"
            />
            <span className="text-xs text-ink-secondary">{enteredUnit}</span>
          </div>
        </div>

        {/* Action Options */}
        <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
          {/* Action 1: Adjust quantity and keep */}
          <button
            onClick={() => {
              onConfirmKeep(adjustedQty);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-sage-800 hover:bg-sage-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-soft"
          >
            <Check className="w-4 h-4" />
            <span>Add Adjusted Quantity ({adjustedQty} {enteredUnit})</span>
          </button>

          {/* Action 2: Keep original item */}
          <button
            onClick={() => {
              onConfirmKeep(enteredQuantity);
              onClose();
            }}
            className="w-full py-2 px-4 rounded-xl bg-cream-200 hover:bg-cream-300 text-ink-primary text-xs font-medium transition"
          >
            Keep Original ({enteredQuantity} {enteredUnit}) Anyway
          </button>

          {/* Action 3: Cancel / Don't buy */}
          <button
            onClick={() => {
              onCancel();
              onClose();
            }}
            className="w-full py-2 px-4 rounded-xl text-tomato-700 hover:bg-tomato-50 text-xs font-medium transition border border-transparent hover:border-tomato-200"
          >
            Cancel (Use What I Already Have)
          </button>
        </div>
      </div>
    </Modal>
  );
};
