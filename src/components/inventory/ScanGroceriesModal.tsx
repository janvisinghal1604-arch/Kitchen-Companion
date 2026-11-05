import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useKitchen } from '../../context/KitchenContext';
import { AIDetectedItem, IngredientCategory, StorageLocation } from '../../types';
import { analyzeGroceryImage, hasGeminiApiKey } from '../../lib/ai';
import {
  Camera,
  Upload,
  CheckCircle2,
  Sparkles,
  Info,
  Trash2,
  Edit2,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface ScanGroceriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScanGroceriesModal: React.FC<ScanGroceriesModalProps> = ({ isOpen, onClose }) => {
  const { addMultipleKitchenItems } = useKitchen();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<AIDetectedItem[]>([]);
  const [aiNote, setAiNote] = useState<string>('');
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  const isGeminiReady = hasGeminiApiKey();

  const handleReset = () => {
    setImagePreview(null);
    setDetectedItems([]);
    setStep('upload');
    setIsAnalyzing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleImage = () => {
    // Provide a sample image of fresh market groceries
    setImagePreview('https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80');
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeGroceryImage(imagePreview);
      setDetectedItems(result.items);
      setAiNote(result.notes);
      setIsLiveAI(result.isLiveAI);
      setStep('review');
    } catch (err: any) {
      alert(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleItemChange = (id: string, updates: Partial<AIDetectedItem>) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setDetectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmAndAdd = async () => {
    const selected = detectedItems.filter((item) => item.selected);
    if (selected.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const itemsToAdd = selected.map((item) => {
      const useBy = new Date();
      useBy.setDate(useBy.getDate() + (item.estimated_days_fresh || 5));

      return {
        custom_name: item.custom_name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        storage_location: item.storage_location,
        purchase_date: today,
        estimated_use_by: useBy.toISOString().split('T')[0],
        notes: `Detected via ${isLiveAI ? 'Gemini AI Vision' : 'AI Grocery Scan'}`
      };
    });

    await addMultipleKitchenItems(itemsToAdd);
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Scan Groceries"
      subtitle="Multimodal AI identifies ingredients from photos or receipts."
      maxWidth="xl"
    >
      {step === 'upload' ? (
        <div className="space-y-4">
          {/* Key status callout */}
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              isGeminiReady
                ? 'bg-sage-50 border-sage-200 text-sage-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {isGeminiReady
                  ? 'Gemini 1.5 Multimodal Vision is connected and ready!'
                  : 'AI Grocery Scan (Demo & Setup)'}
              </p>
              <p className="mt-0.5 opacity-90 leading-relaxed">
                {isGeminiReady
                  ? 'Your photos will be processed through your configured Gemini Vision key.'
                  : 'You can test the photo scan workflow right now with instant demo produce detection, or configure your free Gemini API key in Settings for live image recognition.'}
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-ink-border rounded-2xl p-6 text-center bg-cream-50/50 hover:bg-cream-100 transition">
            {imagePreview ? (
              <div className="relative inline-block max-w-full">
                <img
                  src={imagePreview}
                  alt="Scanned Groceries Preview"
                  className="max-h-56 mx-auto rounded-xl object-contain shadow-card border border-ink-border"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 p-1.5 bg-tomato-500 text-white rounded-full shadow-soft hover:bg-tomato-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-cream-200 flex items-center justify-center text-sage-800 mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="font-medium text-ink-primary mb-1">
                  Upload a photo of groceries or kitchen produce
                </h4>
                <p className="text-xs text-ink-secondary mb-4 max-w-xs">
                  Supports JPG, PNG, or WEBP up to 5MB.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-sage-800 hover:bg-sage-700 text-white rounded-xl text-xs font-medium transition shadow-soft"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File / Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseSampleImage}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-cream-200 hover:bg-cream-300 text-ink-primary rounded-xl text-xs font-medium transition"
                  >
                    <span>Use Sample Produce</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2 text-[11px] text-ink-secondary">
            <ShieldAlert className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
            <p>
              <strong>Food Safety Note:</strong> Visual AI provides rough estimates for inventory
              convenience. Never rely on an image alone to evaluate freshness or food safety. Always inspect smell and texture.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-ink-border text-ink-secondary hover:bg-cream-100 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing}
              className="flex items-center gap-2 px-5 py-2 bg-sage-800 hover:bg-sage-700 text-white rounded-xl text-xs font-medium transition shadow-soft disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Groceries</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: Confirmation & Edit Screen */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-cream-50 p-3 rounded-xl border border-cream-200">
            <div>
              <p className="text-xs font-semibold text-ink-primary">
                Identified {detectedItems.length} potential items
              </p>
              <p className="text-[11px] text-ink-secondary">{aiNote}</p>
            </div>
            <button
              onClick={() => setStep('upload')}
              className="text-xs text-sage-800 hover:underline"
            >
              Rescan Photo
            </button>
          </div>

          {/* List of Detected Items */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {detectedItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.selected
                    ? 'bg-white border-sage-300 shadow-soft'
                    : 'bg-cream-100/50 border-ink-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-4 h-4 text-sage-800 rounded border-ink-border focus:ring-sage-400"
                    />
                    <input
                      type="text"
                      value={item.custom_name}
                      onChange={(e) => handleItemChange(item.id, { custom_name: e.target.value })}
                      className="font-medium text-xs md:text-sm text-ink-primary bg-transparent border-b border-dashed border-ink-border focus:border-sage-600 focus:outline-none px-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-200 text-ink-secondary">
                      {Math.round(item.confidence * 100)}% match
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-ink-muted hover:text-tomato-500 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-ink-secondary block">Qty & Unit</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, { quantity: parseFloat(e.target.value) || 1 })
                        }
                        className="w-14 px-2 py-1 rounded-lg border border-ink-border text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, { unit: e.target.value })}
                        className="w-14 px-2 py-1 rounded-lg border border-ink-border text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-ink-secondary block">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        handleItemChange(item.id, { category: e.target.value as IngredientCategory })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-ink-border text-xs bg-white"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Grains">Grains</option>
                      <option value="Pulses">Pulses</option>
                      <option value="Spices">Spices</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Packaged Food">Packaged Food</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-ink-secondary block">Estimated Days</label>
                    <input
                      type="number"
                      min="1"
                      value={item.estimated_days_fresh}
                      onChange={(e) =>
                        handleItemChange(item.id, {
                          estimated_days_fresh: parseInt(e.target.value) || 5
                        })
                      }
                      className="w-full px-2 py-1 rounded-lg border border-ink-border text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
            <span className="text-xs text-ink-secondary">
              {detectedItems.filter((i) => i.selected).length} items selected to add
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('upload')}
                className="px-3.5 py-2 rounded-xl border border-ink-border text-xs text-ink-secondary hover:bg-cream-100"
              >
                Back
              </button>
              <button
                onClick={handleConfirmAndAdd}
                disabled={detectedItems.filter((i) => i.selected).length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-sage-800 hover:bg-sage-700 text-white rounded-xl text-xs font-medium transition shadow-soft disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Confirmed Ingredients</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
