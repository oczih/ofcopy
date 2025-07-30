"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AppWrapper from "../../components/AppWrapper";
import { Camera, X, ZoomIn, ZoomOut } from 'lucide-react';
import userservice from "../services/userservice";
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/utils'
import { uploadContent } from "@/app/services/uploadmediaservice";
import Image from "next/image";

export default function ApplyCreator() {
  return (
      <ApplyCreatorPage />
  );
}

function ApplyCreatorPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [formData, setFormData] = useState({
    s3Key: "",
    country: "",
    gender: "",
    profilePic: null as File | null,
    handle: "",
    displayName: "",
    bio: "",
    subscriptionPrice: "3.99",
    idFrontPhoto: null as File | null,
    idBackPhoto: null as File | null,
    selfieWithId: null as File | null,
    birthDate: "",
    fullLegalName: ""
  });

  const totalSteps = 6;
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.handle) return;
  
      try {
        const users = await userservice.get();
        console.log(users)
        const userfound = users.users.find((u) => u.username === formData.handle)
        if(userfound){
          setUsernameAvailable(false)
        }
      } catch (error) {
        console.error("Username check failed", error);
      }
    };
  
    checkUsername();
  }, [formData.handle]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (success && session?.user && !session.user.creator) {
      interval = setInterval(async () => {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user?.creator) {
            await update();
            window.location.reload();
          }
        }
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [success, session, update]);
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);
  if (status === "loading") return null;
  if (!session?.user) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setSelectedImage(file);
      setCropModalOpen(true);
    }
  };
  
  function handleFileIdPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? []);
    const newFiles = selectedFiles.filter(
      file => !files.some(f => f.name === file.name && f.size === file.size)
    );
    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [
      ...prev,
      ...newFiles.map(file => URL.createObjectURL(file))
    ]);
  }
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.country) {
          setError("Please select your country of residence");
          return false;
        }
        break;
      case 2:
        if (!formData.gender) {
          setError("Please select your gender");
          return false;
        }
        break;
      case 3:
        if (!formData.handle || !formData.displayName || !formData.profilePic) {
          setError("Please complete all profile setup fields");
          return false;
        }
        if (formData.handle.length < 3) {
          setError("Handle must be at least 3 characters long");
          return false;
        }
        if(!usernameAvailable){
          setError("Handle not available or not allowed")
          return false
        }
        break;
      case 4:
        if (!formData.bio || formData.bio.length < 10) {
          setError("Bio must be at least 10 characters long");
          return false;
        }
        break;
      case 5:
        const price = parseFloat(formData.subscriptionPrice);
        if (isNaN(price) || price < 3.99 || price > 100) {
          setError("Subscription price must be between $3.99 and $100.00");
          return false;
        }
        break;
      case 6:
        console.log(formData)
        if (!formData.idFrontPhoto || !formData.selfieWithId || !formData.birthDate || !formData.fullLegalName) {
          setError("Please complete all identity verification requirements");
          return false;
        }
        break;
    }
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null) {
          formDataToSend.append(key, String(value));
        }
      });
      
      formDataToSend.append("email", session.user.email || "");
      formDataToSend.append("username", session.user.name || session.user.email || "");

      const uploadPromises = files.map(async (file) => {
        const s3Key = await uploadContent(file);
      
        if (!s3Key) {
          console.error("Failed to get s3Key for file:", file.name);
          return;
        }
      
        const formDataToSend = new FormData();
        formDataToSend.append("s3Key", s3Key);
        formDataToSend.append("fileName", file.name);
        // Add any other fields needed for your /apply endpoint
      
        const response = await fetch(`/api/creators/apply`, {
          method: "POST",
          body: formDataToSend,
        });
      
        if (!response.ok) {
          console.error('Post creation with file failed');
        }
      });
      
      await Promise.all(uploadPromises);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Country of Residence</h2>
              <p className="text-gray-300">Let us know where you're located</p>
            </div>
            <div>
              <label className="block mb-2 text-white font-medium">Select your country</label>
              <select
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    style={{
                      backgroundColor: 'rgb(64, 18, 139)',
                      fontSize: '18px',
                      lineHeight: '1.5',
                    }}
                    className="w-full p-3 rounded-md text-white border-2 border-white/20 hover:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all duration-300 cursor-pointer"
                  >
                  <option value="">Choose your country...</option>
                      <option value="AF" className="text-lg py-2">🇦🇫 Afghanistan</option>
                      <option value="AL">🇦🇱 Albania</option>
                      <option value="DZ">🇩🇿 Algeria</option>
                      <option value="AD">🇦🇩 Andorra</option>
                      <option value="AO">🇦🇴 Angola</option>
                      <option value="AG">🇦🇬 Antigua and Barbuda</option>
                      <option value="AR">🇦🇷 Argentina</option>
                      <option value="AM">🇦🇲 Armenia</option>
                      <option value="AU">🇦🇺 Australia</option>
                      <option value="AT">🇦🇹 Austria</option>
                      <option value="AZ">🇦🇿 Azerbaijan</option>
                      <option value="BS">🇧🇸 Bahamas</option>
                      <option value="BD">🇧🇩 Bangladesh</option>
                      <option value="BB">🇧🇧 Barbados</option>
                      <option value="BY">🇧🇾 Belarus</option>
                      <option value="BE">🇧🇪 Belgium</option>
                      <option value="BZ">🇧🇿 Belize</option>
                      <option value="BJ">🇧🇯 Benin</option>
                      <option value="BT">🇧🇹 Bhutan</option>
                      <option value="BO">🇧🇴 Bolivia</option>
                      <option value="BA">🇧🇦 Bosnia and Herzegovina</option>
                      <option value="BW">🇧🇼 Botswana</option>
                      <option value="BR">🇧🇷 Brazil</option>
                      <option value="BN">🇧🇳 Brunei Darussalam</option>
                      <option value="BG">🇧🇬 Bulgaria</option>
                      <option value="BF">🇧🇫 Burkina Faso</option>
                      <option value="BI">🇧🇮 Burundi</option>
                      <option value="CV">🇨🇻 Cabo Verde</option>
                      <option value="KH">🇰🇭 Cambodia</option>
                      <option value="CM">🇨🇲 Cameroon</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="CF">🇨🇫 Central African Republic</option>
                      <option value="TD">🇹🇩 Chad</option>
                      <option value="CL">🇨🇱 Chile</option>
                      <option value="CN">🇨🇳 China</option>
                      <option value="CO">🇨🇴 Colombia</option>
                      <option value="KM">🇰🇲 Comoros</option>
                      <option value="CG">🇨🇬 Congo (Republic)</option>
                      <option value="CR">🇨🇷 Costa Rica</option>
                      <option value="HR">🇭🇷 Croatia</option>
                      <option value="CU">🇨🇺 Cuba</option>
                      <option value="CY">🇨🇾 Cyprus</option>
                      <option value="CZ">🇨🇿 Czechia</option>
                      <option value="DK">🇩🇰 Denmark</option>
                      <option value="DJ">🇩🇯 Djibouti</option>
                      <option value="DM">🇩🇲 Dominica</option>
                      <option value="DO">🇩🇴 Dominican Republic</option>
                      <option value="EC">🇪🇨 Ecuador</option>
                      <option value="EG">🇪🇬 Egypt</option>
                      <option value="SV">🇸🇻 El Salvador</option>
                      <option value="GQ">🇬🇶 Equatorial Guinea</option>
                      <option value="ER">🇪🇷 Eritrea</option>
                      <option value="EE">🇪🇪 Estonia</option>
                      <option value="SZ">🇸🇿 Eswatini</option>
                      <option value="ET">🇪🇹 Ethiopia</option>
                      <option value="FJ">🇫🇯 Fiji</option>
                      <option value="FI">🇫🇮 Finland</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="GA">🇬🇦 Gabon</option>
                      <option value="GM">🇬🇲 Gambia</option>
                      <option value="GE">🇬🇪 Georgia</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="GH">🇬🇭 Ghana</option>
                      <option value="GR">🇬🇷 Greece</option>
                      <option value="GD">🇬🇩 Grenada</option>
                      <option value="GT">🇬🇹 Guatemala</option>
                      <option value="GN">🇬🇳 Guinea</option>
                      <option value="GW">🇬🇼 Guinea-Bissau</option>
                      <option value="GY">🇬🇾 Guyana</option>
                      <option value="HT">🇭🇹 Haiti</option>
                      <option value="HN">🇭🇳 Honduras</option>
                      <option value="HU">🇭🇺 Hungary</option>
                      <option value="IS">🇮🇸 Iceland</option>
                      <option value="IN">🇮🇳 India</option>
                      <option value="ID">🇮🇩 Indonesia</option>
                      <option value="IR">🇮🇷 Iran</option>
                      <option value="IQ">🇮🇶 Iraq</option>
                      <option value="IE">🇮🇪 Ireland</option>
                      <option value="IL">🇮🇱 Israel</option>
                      <option value="IT">🇮🇹 Italy</option>
                      <option value="JM">🇯🇲 Jamaica</option>
                      <option value="JP">🇯🇵 Japan</option>
                      <option value="JO">🇯🇴 Jordan</option>
                      <option value="KZ">🇰🇿 Kazakhstan</option>
                      <option value="KE">🇰🇪 Kenya</option>
                      <option value="KI">🇰🇮 Kiribati</option>
                      <option value="KW">🇰🇼 Kuwait</option>
                      <option value="KG">🇰🇬 Kyrgyzstan</option>
                      <option value="LA">🇱🇦 Laos</option>
                      <option value="LV">🇱🇻 Latvia</option>
                      <option value="LB">🇱🇧 Lebanon</option>
                      <option value="LS">🇱🇸 Lesotho</option>
                      <option value="LR">🇱🇷 Liberia</option>
                      <option value="LY">🇱🇾 Libya</option>
                      <option value="LI">🇱🇮 Liechtenstein</option>
                      <option value="LT">🇱🇹 Lithuania</option>
                      <option value="LU">🇱🇺 Luxembourg</option>
                      <option value="MG">🇲🇬 Madagascar</option>
                      <option value="MW">🇲🇼 Malawi</option>
                      <option value="MY">🇲🇾 Malaysia</option>
                      <option value="MV">🇲🇻 Maldives</option>
                      <option value="ML">🇲🇱 Mali</option>
                      <option value="MT">🇲🇹 Malta</option>
                      <option value="MH">🇲🇭 Marshall Islands</option>
                      <option value="MR">🇲🇷 Mauritania</option>
                      <option value="MU">🇲🇺 Mauritius</option>
                      <option value="MX">🇲🇽 Mexico</option>
                      <option value="FM">🇫🇲 Micronesia</option>
                      <option value="MD">🇲🇩 Moldova</option>
                      <option value="MC">🇲🇨 Monaco</option>
                      <option value="MN">🇲🇳 Mongolia</option>
                      <option value="ME">🇲🇪 Montenegro</option>
                      <option value="MA">🇲🇦 Morocco</option>
                      <option value="MZ">🇲🇿 Mozambique</option>
                      <option value="MM">🇲🇲 Myanmar</option>
                      <option value="NA">🇳🇦 Namibia</option>
                      <option value="NR">🇳🇷 Nauru</option>
                      <option value="NP">🇳🇵 Nepal</option>
                      <option value="NL">🇳🇱 Netherlands</option>
                      <option value="NZ">🇳🇿 New Zealand</option>
                      <option value="NI">🇳🇮 Nicaragua</option>
                      <option value="NE">🇳🇪 Niger</option>
                      <option value="NG">🇳🇬 Nigeria</option>
                      <option value="KP">🇰🇵 North Korea</option>
                      <option value="MK">🇲🇰 North Macedonia</option>
                      <option value="NO">🇳🇴 Norway</option>
                      <option value="OM">🇴🇲 Oman</option>
                      <option value="PK">🇵🇰 Pakistan</option>
                      <option value="PW">🇵🇼 Palau</option>
                      <option value="PA">🇵🇦 Panama</option>
                      <option value="PG">🇵🇬 Papua New Guinea</option>
                      <option value="PY">🇵🇾 Paraguay</option>
                      <option value="PE">🇵🇪 Peru</option>
                      <option value="PH">🇵🇭 Philippines</option>
                      <option value="PL">🇵🇱 Poland</option>
                      <option value="PT">🇵🇹 Portugal</option>
                      <option value="QA">🇶🇦 Qatar</option>
                      <option value="RO">🇷🇴 Romania</option>
                      <option value="RU">🇷🇺 Russia</option>
                      <option value="RW">🇷🇼 Rwanda</option>
                      <option value="KN">🇰🇳 Saint Kitts and Nevis</option>
                      <option value="LC">🇱🇨 Saint Lucia</option>
                      <option value="VC">🇻🇨 Saint Vincent & the Grenadines</option>
                      <option value="WS">🇼🇸 Samoa</option>
                      <option value="SM">🇸🇲 San Marino</option>
                      <option value="ST">🇸🇹 Sao Tome & Principe</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                      <option value="SN">🇸🇳 Senegal</option>
                      <option value="RS">🇷🇸 Serbia</option>
                      <option value="SC">🇸🇨 Seychelles</option>
                      <option value="SL">🇸🇱 Sierra Leone</option>
                      <option value="SG">🇸🇬 Singapore</option>
                      <option value="SK">🇸🇰 Slovakia</option>
                      <option value="SI">🇸🇮 Slovenia</option>
                      <option value="SB">🇸🇧 Solomon Islands</option>
                      <option value="SO">🇸🇴 Somalia</option>
                      <option value="ZA">🇿🇦 South Africa</option>
                      <option value="KR">🇰🇷 South Korea</option>
                      <option value="ES">🇪🇸 Spain</option>
                      <option value="LK">🇱🇰 Sri Lanka</option>
                      <option value="SD">🇸🇩 Sudan</option>
                      <option value="SR">🇸🇷 Suriname</option>
                      <option value="SE">🇸🇪 Sweden</option>
                      <option value="CH">🇨🇭 Switzerland</option>
                      <option value="SY">🇸🇾 Syria</option>
                      <option value="TJ">🇹🇯 Tajikistan</option>
                      <option value="TZ">🇹🇿 Tanzania</option>
                      <option value="TH">🇹🇭 Thailand</option>
                      <option value="TG">🇹🇬 Togo</option>
                      <option value="TO">🇹🇴 Tonga</option>
                      <option value="TT">🇹🇹 Trinidad and Tobago</option>
                      <option value="TN">🇹🇳 Tunisia</option>
                      <option value="TR">🇹🇷 Türkiye</option>
                      <option value="TM">🇹🇲 Turkmenistan</option>
                      <option value="UG">🇺🇬 Uganda</option>
                      <option value="UA">🇺🇦 Ukraine</option>
                      <option value="AE">🇦🇪 United Arab Emirates</option>
                      <option value="GB">🇬🇧 United Kingdom</option>
                      <option value="US">🇺🇸 United States</option>
                      <option value="UY">🇺🇾 Uruguay</option>
                      <option value="UZ">🇺🇿 Uzbekistan</option>
                      <option value="VE">🇻🇪 Venezuela</option>
                      <option value="VN">🇻🇳 Vietnam</option>
                      <option value="YE">🇾🇪 Yemen</option>
                      <option value="ZM">🇿🇲 Zambia</option>
                      <option value="ZW">🇿🇼 Zimbabwe</option>
                  {/* Optionally add: other UN observer states */}
                </select>

            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Gender</h2>
              <p className="text-gray-300">This helps us understand our creator community</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {["Male", "Female", "Other", "Prefer not to say"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleInputChange("gender", option)}
                  className={`p-4 rounded-lg border-2 transition-all duration-100 cursor-pointer ${
                    formData.gender === option
                      ? "border-white bg-white/20 text-white"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Profile Setup</h2>
                <p className="text-gray-300">Set up your creator profile</p>
              </div>
        
              <div>
                <div className="flex justify-center">
                  
                {cropModalOpen && selectedImage && (
                  <>
                    {/* Dark Backdrop */}
                    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm rounded-3xl pointer-events-none" />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-white/20">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white">Crop Your Photo</h3>
                            <p className="text-gray-300 text-sm">Adjust your profile picture</p>
                          </div>
                          <button
                            onClick={() => setCropModalOpen(false)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Cropper Container */}
                        <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6 bg-black/20 border border-white/10">
                          <Cropper
                            image={URL.createObjectURL(selectedImage)}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                          />
                        </div>

                        {/* Zoom Controls */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300">Zoom</span>
                            <span className="text-sm text-white font-medium">{Math.round(zoom * 100)}%</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={zoom}
                              onChange={(e) => setZoom(Number(e.target.value))}
                              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <button
                              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <button
                            className="flex-1 px-6 py-3 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/10"
                            onClick={() => setCropModalOpen(false)}
                          >
                            Cancel
                          </button>
                          <button
                            className="flex-1 px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all duration-200 shadow-lg"
                            onClick={async () => {
                              const cropped = await getCroppedImg(
                                URL.createObjectURL(selectedImage),
                                croppedAreaPixels
                              );
                              setCroppedImage(cropped);
                              setFormData((prev) => ({
                                ...prev,
                                profilePic: new File([cropped], "profile.jpg"),
                              }));
                              setCropModalOpen(false);
                            }}
                          >
                            Apply Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex justify-center">
                  <label
                    htmlFor="profilePicUpload"
                    className="relative w-40 h-40 flex items-center justify-center rounded-full bg-white/10 border-2 border-dashed cursor-pointer hover:bg-white/20 transition"
                  >
                    {formData.profilePic ? (
                      <Image
                        src={URL.createObjectURL(formData.profilePic)}
                        alt="Profile preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                    {/* Optional overlay icon to indicate "change" */}
                    <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full">
                      <Camera className="w-4 h-4 text-black" />
                    </div>
                  </label>

                        <input
                          id="profilePicUpload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange("profilePic", e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>

                </div>
              </div>

        
              <div>
                <label className="block mb-2 text-white font-medium">Handle (@username)</label>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">@</span>
                  <input
                    value={formData.handle}
                    onChange={(e) =>
                      handleInputChange("handle", e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-4 py-2 text-white bg-transparent border border-gray-600 rounded-md hover:border-white cursor-text placeholder-gray-400 transition text-sm"
                  />
                  {!usernameAvailable && (
                    <div>

                    </div>
                  )}
                </div>

              </div>
        
              <div>
                <label className="block mb-2 text-white font-medium">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  className="w-full px-4 py-2 text-white bg-transparent border border-gray-600 rounded-md hover:border-white cursor-text placeholder-gray-400 transition text-sm"
                />
              </div>
            </div>
          );
        

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-300">Write a compelling bio for your profile</p>
            </div>
            <div>
              <label className="block mb-2 text-white font-medium">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell your potential subscribers about yourself, your content, and what makes you unique..."
                className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10 focus:ring-2 focus:ring-pink-500/30 transition-all duration-300 resize-none"
                rows={6}
              />
              <div className="text-right text-sm text-gray-400 mt-1">
                {formData.bio.length}/500 characters
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Subscription Pricing</h2>
              <p className="text-gray-300">Set your monthly subscription price</p>
            </div>
            <div>
              <label className="block mb-2 text-white font-medium">Monthly Subscription Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <Input
                  type="number"
                  min="3.99"
                  max="100"
                  step="0.01"
                  value={formData.subscriptionPrice}
                  onChange={(e) => handleInputChange("subscriptionPrice", e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Minimum: $3.99 • Maximum: $100.00
              </p>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="font-semibold text-white mb-2">Your Earnings</h4>
                <div className="text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Subscription price:</span>
                    <span>${parseFloat(formData.subscriptionPrice || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (20%):</span>
                    <span>-${(parseFloat(formData.subscriptionPrice || "0") * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2 mt-2">
                    <span>Your earnings per subscriber:</span>
                    <span>${(parseFloat(formData.subscriptionPrice || "0") * 0.8).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Identity Verification</h2>
              <p className="text-gray-300">Verify your identity for payout purposes</p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">📋 Required Documents</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Clear photo of your government-issued photo ID (front)</li>
                <li>• Photo of yourself holding your ID with a sign</li>
                <li>• Photo of the back of your ID (if applicable)</li>
              </ul>
            </div>

            <div>
              <label className="block mb-2 text-white font-medium">Full Legal Name</label>
              <Input
                value={formData.fullLegalName}
                onChange={(e) => handleInputChange("fullLegalName", e.target.value)}
                placeholder="As shown on your ID"
              />
            </div>

            <div>
              <label className="block mb-2 text-white font-medium">Date of Birth</label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-white font-medium">ID Front Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileIdPhotoChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
              />
              {formData.idFrontPhoto && (
                <p className="text-green-400 text-sm mt-1">✓ ID front photo uploaded</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-white font-medium">ID Back Photo (if applicable)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileIdPhotoChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-gray-600"
              />
              {formData.idBackPhoto && (
                <p className="text-green-400 text-sm mt-1">✓ ID back photo uploaded</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-white font-medium">Selfie with ID and Sign</label>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
                <p className="text-sm text-yellow-200">
                  <strong>Hold a sign with:</strong><br/>
                  1. Today's date: {new Date().toLocaleDateString()}<br/>
                  2. Your date of birth<br/>
                  3. Your full legal name<br/>
                  4. The word "Fanslio"
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileIdPhotoChange}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
              />
              {formData.selfieWithId && (
                <p className="text-green-400 text-sm mt-1">✓ Selfie with ID uploaded</p>
              )}
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">⏱️ Review Process</h3>
              <p className="text-sm text-gray-300 mb-2">
                The Fanslio team will review your application within <strong>24-48 hours</strong>.
              </p>
              <p className="text-sm text-gray-300 mb-2">
                You'll receive an email once approved or if additional documentation is needed.
              </p>
              <p className="text-sm text-gray-300">
                Questions? Contact us at <strong>ashleygreybiz@gmail.com</strong>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl max-w-2xl w-full text-center animate-fade-in">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold mb-4 gradient-text">Application Submitted Successfully!</h1>
              <div className="text-left bg-white/5 rounded-lg p-6 mb-6 space-y-3">
                <h3 className="font-semibold text-white">What happens next?</h3>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>✓ Our team will review your application within 24-48 hours</p>
                  <p>✓ You'll receive an email confirmation once approved</p>
                  <p>✓ If additional documentation is needed, we'll contact you via email</p>
                  <p>✓ Add <strong>noreply@fanslio.com</strong> and <strong>help@fanslio.com</strong> to your safe senders list</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Thank you for your interest in becoming a Fanslio creator! We're excited to potentially welcome you to our community.
              </p>
              <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-pink-500 to-purple-600">
                Back to Home
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      
      
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-8 relative z-10">
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-2xl w-full animate-fade-in overflow-hidden s">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-white">Become a Creator</h1>
                <span className="text-sm text-gray-300">Step {currentStep} of {totalSteps}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className={`min-h-[400px]`}>
              {renderStep()}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="px-6"
              >
                Previous
              </Button>
              
              <div className="flex space-x-3">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 px-8"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}