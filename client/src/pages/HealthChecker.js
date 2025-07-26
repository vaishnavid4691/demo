import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload, Camera, FileText, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import Tesseract from 'tesseract.js';

const HealthChecker = () => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [healthReport, setHealthReport] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Reset previous results
      setExtractedText('');
      setHealthReport(null);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setExtractedText('');
      setHealthReport(null);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const analyzeHealthInfo = (text) => {
    const textLower = text.toLowerCase();
    const report = {
      fssaiStatus: 'unknown',
      expiryStatus: 'unknown',
      fssaiNumber: null,
      expiryDate: null,
      warnings: [],
      recommendations: []
    };

    // Check for FSSAI license
    const fssaiMatch = text.match(/fssai[:\s]*(\d{14})/i) || text.match(/lic[:\s]*no[:\s]*(\d{14})/i);
    if (fssaiMatch) {
      report.fssaiNumber = fssaiMatch[1];
      report.fssaiStatus = 'valid';
    } else if (textLower.includes('fssai') || textLower.includes('license')) {
      report.fssaiStatus = 'found_but_unreadable';
    } else {
      report.fssaiStatus = 'not_found';
      report.warnings.push('FSSAI license number not found');
    }

    // Check for expiry date
    const datePatterns = [
      /(?:exp|expiry|expire|best\s*before|use\s*by|valid\s*till)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const dateStr = matches[1] || matches[0];
        const date = parseDate(dateStr);
        if (date) {
          report.expiryDate = date;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (date < today) {
            report.expiryStatus = 'expired';
            report.warnings.push('Product has expired');
          } else if (date <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            report.expiryStatus = 'expiring_soon';
            report.warnings.push('Product expiring within 7 days');
          } else {
            report.expiryStatus = 'valid';
          }
          break;
        }
      }
    }

    // Additional checks
    if (textLower.includes('organic')) {
      report.recommendations.push('Organic product - good for health');
    }
    if (textLower.includes('natural')) {
      report.recommendations.push('Natural ingredients detected');
    }
    if (textLower.includes('preservative free') || textLower.includes('no preservatives')) {
      report.recommendations.push('Preservative-free product');
    }

    // Overall health score
    let score = 50; // Base score
    if (report.fssaiStatus === 'valid') score += 30;
    if (report.expiryStatus === 'valid') score += 20;
    if (report.warnings.length === 0) score += 10;
    if (report.recommendations.length > 0) score += 10;
    
    report.healthScore = Math.min(100, score);
    
    return report;
  };

  const parseDate = (dateStr) => {
    // Try different date formats
    const formats = [
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
      /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/,
      /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let day, month, year;
        if (match[3].length === 4) {
          // DD/MM/YYYY or MM/DD/YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        } else if (match[1].length === 4) {
          // YYYY/MM/DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // DD/MM/YY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]) + 2000;
        }

        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return new Date(year, month - 1, day);
        }
      }
    }
    return null;
  };

  const scanImage = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanProgress(0);
    setExtractedText('');
    setHealthReport(null);

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        'eng+hin',
        {
          logger: ({ status, progress }) => {
            if (status === 'recognizing text') {
              setScanProgress(Math.round(progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      setExtractedText(text);
      
      // Analyze the extracted text for health information
      const analysis = analyzeHealthInfo(text);
      setHealthReport(analysis);
      
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractedText('Error occurred while scanning the image. Please try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getHealthScoreBackground = (score) => {
    if (score >= 80) return 'bg-success-100 border-success-200';
    if (score >= 60) return 'bg-warning-100 border-warning-200';
    return 'bg-danger-100 border-danger-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('healthChecker')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload an image of product labels to check FSSAI certification, expiry dates, and get health recommendations
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
        >
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-600">Image selected. Click "Scan Image" to analyze.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">{t('uploadImage')}</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer inline-flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Select Image</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Scan Button */}
        {selectedFile && (
          <div className="mt-6 text-center">
            <button
              onClick={scanImage}
              disabled={isScanning}
              className="bg-success-600 text-white px-8 py-3 rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isScanning ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>{t('scanning')} ({scanProgress}%)</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Scan Image</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {healthReport && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Analysis Report</h2>
          
          {/* Health Score */}
          <div className={`rounded-lg p-4 border-2 mb-6 ${getHealthScoreBackground(healthReport.healthScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Health Score</h3>
                <p className="text-gray-600">Overall safety assessment</p>
              </div>
              <div className={`text-3xl font-bold ${getHealthScoreColor(healthReport.healthScore)}`}>
                {healthReport.healthScore}/100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FSSAI Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>FSSAI Certification</span>
              </h3>
              
              {healthReport.fssaiStatus === 'valid' ? (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="text-success-800 font-medium">{t('fssaiValid')}</span>
                  </div>
                  {healthReport.fssaiNumber && (
                    <p className="text-sm text-success-700 mt-1">
                      License: {healthReport.fssaiNumber}
                    </p>
                  )}
                </div>
              ) : healthReport.fssaiStatus === 'found_but_unreadable' ? (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-warning-600" />
                    <span className="text-warning-800 font-medium">FSSAI Found but Unreadable</span>
                  </div>
                </div>
              ) : (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-danger-600" />
                    <span className="text-danger-800 font-medium">{t('fssaiInvalid')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expiry Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Expiry Check</span>
              </h3>
              
              {healthReport.expiryStatus === 'valid' ? (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="text-success-800 font-medium">{t('healthy')}</span>
                  </div>
                  {healthReport.expiryDate && (
                    <p className="text-sm text-success-700 mt-1">
                      Expires: {healthReport.expiryDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : healthReport.expiryStatus === 'expiring_soon' ? (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-warning-600" />
                    <span className="text-warning-800 font-medium">Expiring Soon</span>
                  </div>
                  {healthReport.expiryDate && (
                    <p className="text-sm text-warning-700 mt-1">
                      Expires: {healthReport.expiryDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : healthReport.expiryStatus === 'expired' ? (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-danger-600" />
                    <span className="text-danger-800 font-medium">{t('expired')}</span>
                  </div>
                  {healthReport.expiryDate && (
                    <p className="text-sm text-danger-700 mt-1">
                      Expired: {healthReport.expiryDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-800 font-medium">Expiry Date Not Found</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {healthReport.warnings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-danger-600" />
                <span>Warnings</span>
              </h3>
              <div className="space-y-2">
                {healthReport.warnings.map((warning, index) => (
                  <div key={index} className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <p className="text-danger-800">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {healthReport.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span>Recommendations</span>
              </h3>
              <div className="space-y-2">
                {healthReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-success-50 border border-success-200 rounded-lg p-3">
                    <p className="text-success-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Text</h2>
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {extractedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthChecker;