"use client";

import { useState } from "react";

const PREMADE_AVATARS = [
  "/avatars_images/avatar1.jpg",
  "/avatars_images/avatar2.jpg",
  "/avatars_images/avatar3.png",
  "/avatars_images/avatar4.jpg",
];

export default function Home() {
  const [faceFile, setFaceFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [inputType, setInputType] = useState("audio"); // 'audio', 'text', or 'ai'
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [scriptText, setScriptText] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectPremadeAvatar = async (imagePath) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const file = new File([blob], imagePath.split("/").pop(), {
        type: blob.type,
      });
      setFaceFile(file);
    } catch (err) {
      setError("Failed to load pre-made avatar.");
    }
  };

  const handlePreviewAudio = async () => {
    if (!scriptText.trim()) {
      setError("Please enter a script text to preview.");
      return;
    }
    setIsAudioLoading(true);
    setError(null);
    setPreviewAudioUrl(null);

    const formData = new FormData();
    formData.append("script_text", scriptText);
    formData.append("voice_gender", voiceGender);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/generate-audio",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setPreviewAudioUrl(url);
    } catch (err) {
      setError(
        err.message || "An error occurred while generating audio preview.",
      );
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!aiPrompt.trim()) {
      setError("Please enter a topic for the AI.");
      return;
    }
    setIsAiLoading(true);
    setError(null);
    setPreviewAudioUrl(null); // Clear previous audio preview
    setVideoUrl(null); // Clear previous generated video

    const formData = new FormData();
    formData.append("topic", aiPrompt);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/generate-script",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setScriptText(data.script);
      setInputType("text"); // Switch to text tab so user can review and preview
    } catch (err) {
      setError(err.message || "An error occurred while generating the script.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!faceFile) {
      setError("Please upload a face file.");
      return;
    }
    if (inputType === "audio" && !audioFile) {
      setError("Please upload an audio file.");
      return;
    }
    if (inputType === "text" && !scriptText.trim()) {
      setError("Please enter a script text.");
      return;
    }
    if (inputType === "ai") {
      setError(
        "Please generate the script first by clicking '✨ Generate Script'.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    // Prepare the form data exactly how FastAPI expects it
    const formData = new FormData();
    formData.append("face_file", faceFile);
    if (inputType === "audio") {
      formData.append("audio_file", audioFile);
    } else {
      formData.append("script_text", scriptText);
      formData.append("voice_gender", voiceGender);
    }

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
    <main className="min-h-screen bg-slate-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 pb-1 tracking-tight">
            EchoAvatar AI
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Bring static images to life with highly realistic AI lip-syncing.
            Upload a face, add your audio or script, and generate stunning video
            in minutes.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden p-6 sm:p-10">
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Face Upload */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col h-full relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm">
                    1
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Avatar Face
                  </h2>
                </div>

                {/* Pre-made Avatars Gallery */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {PREMADE_AVATARS.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Avatar ${index + 1}`}
                      onClick={() => handleSelectPremadeAvatar(src)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full cursor-pointer object-cover border-4 transition-all hover:scale-105 hover:shadow-md ${
                        faceFile && faceFile.name === src.split("/").pop()
                          ? "border-blue-500 shadow-md scale-105 ring-2 ring-blue-200 ring-offset-2"
                          : "border-white shadow-sm hover:border-blue-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-300"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
                    Or Upload Custom
                  </span>
                  <div className="flex-grow border-t border-slate-300"></div>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFaceFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white focus:outline-none focus:border-blue-500"
                  />
                  {faceFile && (
                    <p className="mt-3 text-sm font-medium text-emerald-600 text-center truncate px-2">
                      ✅ {faceFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Audio or Text Input */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-purple-100 text-purple-700 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm">
                    2
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Audio Source
                  </h2>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap bg-slate-200/60 p-1.5 rounded-xl mb-6 w-full gap-1">
                  <button
                    type="button"
                    onClick={() => setInputType("audio")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputType === "audio" ? "bg-white shadow-sm text-blue-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
                  >
                    🎙️ Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType("text")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputType === "text" ? "bg-white shadow-sm text-blue-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
                  >
                    ✍️ Type Script
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType("ai")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputType === "ai" ? "bg-white shadow-sm text-purple-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
                  >
                    ✨ Ask AI
                  </button>
                </div>

                {inputType === "audio" && (
                  <div className="flex-grow flex flex-col justify-center text-center space-y-4">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white focus:outline-none focus:border-blue-500"
                    />
                    {audioFile && (
                      <p className="text-sm font-medium text-emerald-600 truncate px-2">
                        ✅ {audioFile.name}
                      </p>
                    )}
                  </div>
                )}

                {inputType === "text" && (
                  <div className="space-y-4 flex-grow flex flex-col">
                    <textarea
                      rows="3"
                      placeholder="Hi there! I am your AI avatar..."
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      className="w-full flex-grow rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border outline-none resize-none text-slate-900 bg-white transition-shadow focus:shadow-md"
                    />
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
                            Voice:
                          </label>
                          <select
                            value={voiceGender}
                            onChange={(e) => setVoiceGender(e.target.value)}
                            className="text-sm border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-slate-50 cursor-pointer text-slate-900 w-full sm:w-auto"
                          >
                            <option value="female">Female (Jenny)</option>
                            <option value="male">Male (Guy)</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handlePreviewAudio}
                          disabled={isAudioLoading || !scriptText.trim()}
                          className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 shadow-sm flex items-center justify-center gap-2"
                        >
                          {isAudioLoading ? "⏳ Loading..." : "🔊 Preview"}
                        </button>
                      </div>
                      {previewAudioUrl && (
                        <audio
                          src={previewAudioUrl}
                          controls
                          autoPlay
                          className="w-full mt-4 h-10 outline-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                {inputType === "ai" && (
                  <div className="space-y-4 flex-grow flex flex-col">
                    <textarea
                      rows="3"
                      placeholder="What should the avatar talk about? (e.g., 'A 20-second welcome message for my tech blog')"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full flex-grow rounded-xl border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-4 border outline-none resize-none text-slate-900 bg-white transition-shadow focus:shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateScript}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isAiLoading
                        ? "⏳ Asking Gemini..."
                        : "✨ Generate Script"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-4 px-8 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-xl"
                }`}
              >
                {isLoading
                  ? "⏳ Generating Magic (This may take a minute)..."
                  : "🚀 Generate Video"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-500">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Video */}
          {videoUrl && (
            <div className="mt-12 border-t border-slate-200 pt-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center tracking-tight">
                🎉 Generation Complete!
              </h2>
              <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-slate-900/10 mb-6">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="flex justify-center">
                <a
                  href={videoUrl}
                  download="echo-avatar-video.mp4"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                  <span>📥</span> Download Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
