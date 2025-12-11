/**
 * OCR Result Component
 * Displays OCR results with confidence meter
 */

'use client';

import { OcrResult as OcrResultType } from '../hooks/useOcr';

interface OcrResultProps {
  result: OcrResultType;
  onRetake?: () => void;
  onSync?: () => void;
}

export function OcrResult({ result, onRetake, onSync }: OcrResultProps) {
  const confidencePercent = Math.round(result.confidence * 100);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Excellent';
    if (confidence >= 0.5) return 'Good';
    return 'Low';
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Confidence Meter */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Detection Confidence</span>
          <span className={`text-sm font-bold px-2 py-1 rounded ${getConfidenceColor(result.confidence)}`}>
            {getConfidenceLabel(result.confidence)} ({confidencePercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              result.confidence >= 0.8
                ? 'bg-green-600'
                : result.confidence >= 0.5
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>

      {/* Detected Values */}
      <div className="grid grid-cols-2 gap-4">
        {/* Clock */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Game Clock</div>
          <div className="text-3xl font-bold text-gray-900">
            {result.clock || <span className="text-gray-400">--:--</span>}
          </div>
        </div>

        {/* Score */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Score</div>
          <div className="text-3xl font-bold text-gray-900">
            {result.score.home !== null && result.score.away !== null ? (
              <>
                {result.score.home} - {result.score.away}
              </>
            ) : (
              <span className="text-gray-400">-- - --</span>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Processing Time:</span>
          <span className="font-mono">{result.metadata.processingTime}ms</span>
        </div>
        {result.metadata.imageWidth && result.metadata.imageHeight && (
          <div className="flex justify-between mt-1">
            <span>Image Size:</span>
            <span className="font-mono">
              {result.metadata.imageWidth}x{result.metadata.imageHeight}
            </span>
          </div>
        )}
        <div className="flex justify-between mt-1">
          <span>Raw Text:</span>
          <span className="font-mono truncate ml-2">{result.rawText || 'N/A'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Retake Photo
          </button>
        )}
        {onSync && result.clock && (
          <button
            onClick={onSync}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sync Player
          </button>
        )}
      </div>
    </div>
  );
}
