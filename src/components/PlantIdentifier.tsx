import React, { useState, useRef } from 'react';
import { Camera, Upload, Zap, Leaf, AlertCircle, CheckCircle, X, RotateCcw } from 'lucide-react';
import { UserPreferences, PlantIdentification } from '../types';
import { plantService } from '../services/plantService';
import { useTranslation } from '../hooks/useTranslation';

interface PlantIdentifierProps {
  userPreferences: UserPreferences;
  isDarkMode: boolean;
}

export const PlantIdentifier: React.FC<PlantIdentifierProps> = ({ userPreferences, isDarkMode }) => {
  const { t } = useTranslation(userPreferences);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlantIdentification | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSelectedImage(imageDataUrl);
        setResult(null);
        stopCamera();
      }
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      let result: PlantIdentification;
      
      if (fileInputRef.current?.files?.[0]) {
        // Analyze uploaded file
        const file = fileInputRef.current.files[0];
        result = await plantService.analyzeImageFile(file);
      } else {
        // Analyze captured photo
        result = await plantService.analyzeImageFromDataUrl(selectedImage);
      }
      
      setResult(result);
    } catch (error) {
      console.error('Plant identification error:', error);
      setResult({
        name: 'Identification failed',
        confidence: 0,
        health: 'Unable to assess',
        recommendations: [
          'Please try again with a clearer image',
          'Ensure good lighting and focus on the plant',
          'Make sure the plant fills most of the frame',
          'Check your internet connection'
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHealthIcon = (health: string) => {
    if (health.toLowerCase().includes('healthy')) return <CheckCircle className="text-green-500" size={20} />;
    if (health.toLowerCase().includes('warning')) return <AlertCircle className="text-yellow-500" size={20} />;
    return <AlertCircle className="text-red-500" size={20} />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 0.6) return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('plant_id')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('farming_tips')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload/Camera Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('plant_id')}</h2>
            
            {showCamera ? (
              /* Camera Interface */
              <div className="space-y-4">
                <div className="relative bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/50 m-4 rounded-lg pointer-events-none"></div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={stopCamera}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Camera size={20} />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : !selectedImage ? (
              /* Upload Interface */
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <div className="mb-4">
                  <Leaf size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Take a photo or upload an image of your plant</p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={startCamera}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Camera size={20} />
                    <span>Use Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Upload size={20} />
                    <span>Upload Image</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  For best results: Use good lighting, focus on leaves/flowers, fill the frame
                </p>
              </div>
            ) : (
              /* Image Preview */
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Plant to identify"
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        <span>Identify Plant</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <Upload size={20} />
                  </button>
                  <button
                    onClick={startCamera}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Analysis Results</h2>
            
            {!result ? (
              <div className="text-center py-12">
                <Leaf size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Capture or upload an image to see identification results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Plant Name & Confidence */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{result.name}</h3>
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full ${getConfidenceColor(result.confidence)}`}>
                      <span className="text-sm font-medium">
                        {(result.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    {result.confidence > 0.8 && (
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium">High confidence</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center space-x-2">
                    {getHealthIcon(result.health)}
                    <span>Health Status</span>
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">{result.health}</p>
                </div>

                {/* Care Recommendations */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Care Recommendations</h4>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={clearImage}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw size={16} />
                    <span>Try Another</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">📸 Photography Tips for Better Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Use natural lighting when possible</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Focus on distinctive features (leaves, flowers, fruits)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Fill the frame with the plant</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500">•</span>
              <span>Avoid blurry or dark images</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};