"use client";

import { useState } from "react";

export default function Home() {
  const [faceFile, setFaceFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!faceFile || !audioFile) {
      setError("Please upload both a face file and an audio file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    // Prepare the form data exactly how FastAPI expects it
    const formData = new FormData();
    formData.append("face_file", faceFile);
    formData.append("audio_file", audioFile);

    try {
      // Send the request to our local FastAPI backend
      const response = await fetch("http://localhost:8000/api/v1/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // The backend sends back the MP4 file directly.
      // We turn that raw data (blob) into a temporary URL the browser can play.
      const videoBlob = await response.blob();
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } catch (err) {
      setError(err.message || "An error occurred while generating the video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            🗣️ EchoAvatar
          </h1>
          <p className="text-lg text-gray-600">AI Lip-Sync Video Generator</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Face Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Upload Face
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFaceFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {faceFile && (
                  <p className="mt-2 text-sm text-green-600 truncate">
                    {faceFile.name}
                  </p>
                )}
              </div>

              {/* Audio Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Upload Audio
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {audioFile && (
                  <p className="mt-2 text-sm text-green-600 truncate">
                    {audioFile.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {isLoading
                ? "⏳ Generating Video (This may take a few minutes)..."
                : "🚀 Generate Video"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Video */}
          {videoUrl && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                🎉 Generation Complete!
              </h2>
              <div className="w-full max-w-xl mx-auto rounded-lg overflow-hidden bg-black shadow-lg">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
