import { useState, useRef, useEffect } from "react";
import { Mic, Square, X } from "lucide-react";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (audioBlob: Blob) => void;
}

export function VoiceRecordingModal ({ isOpen, onClose, onSave }: VoiceRecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-[9999]">
      <div className="bg-[#13072c] rounded-3xl border border-white/20 w-full max-w-md mx-4 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="text-red-400" /> Record Voice Note
          </h2>
          <button onClick={handleClose}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* body */}
        <div className="p-6 space-y-6 text-center">
          <div className={`w-24 h-24 mx-auto flex items-center justify-center rounded-full border-4 ${isRecording ? "border-red-500 bg-red-500/20 animate-pulse" : "border-gray-400 bg-gray-400/10"}`}>
            {isRecording ? (
              <button className="cursor-pointer" onClick={stopRecording}>
              <Square className="w-8 h-8 text-red-500" />
              </button>
            ) : (

              <button className="cursor-pointer" onClick={startRecording}>
              <Mic className="w-8 h-8 text-gray-400" />
              </button>
            )}
          </div>
          <div className="text-3xl font-mono text-white">{formatTime(recordingTime)}</div>

          {audioUrl && (
            <div className="bg-white/10 rounded-xl p-4">
<audio controls src={audioUrl} className="w-full" />
            </div>
          )}

          {!isRecording && !audioBlob && (
            <p className="text-gray-400 text-sm">
              Click the record button to start recording your voice note
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-3 px-6 py-4">
          {!audioBlob ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex-1 px-4 py-3  cursor-pointer +rounded-xl font-semibold transition ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              }`}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setRecordingTime(0);
                }}
                className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold"
              >
                Re-record
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold"
              >
                Send Voice Note
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
