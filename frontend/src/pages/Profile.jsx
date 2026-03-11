import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Edit2, Save, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { user, loading, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        dob: '',
        age: '',
        gender: '',
        phone: '',
        bloodGroup: '',
        diabeticType: 'Type 2'
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || user.name || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                age: user.age || '',
                gender: user.gender || '',
                phone: user.phone || '',
                bloodGroup: user.bloodGroup || '',
                diabeticType: user.diabeticType || user.diabetesType || 'Type 2'
            });
        }
    }, [user, loading]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user && !loading) return <div className="min-h-screen flex items-center justify-center">Please log in to view profile</div>;

    const handleSave = async () => {
        const res = await updateProfile(profileData);
        if (res.success) {
            alert('Profile updated successfully!');
            setIsEditing(false);
        } else {
            alert(res.msg || 'Failed to update profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">

                {/* Header */}
                <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
                        <p className="text-gray-500 text-sm">Update your profile information</p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing ? 'bg-primary text-white hover:bg-blue-700' : 'bg-[#0F8A7D] text-white hover:bg-[#007f70]'}`}
                    >
                        {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit</>}
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">

                    {/* Personal Information */}
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F8A7D] mb-4">
                            <User className="w-5 h-5" /> Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={profileData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.fullName || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dob"
                                        value={profileData.dob}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.dob || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Age */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Age *</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="age"
                                        value={profileData.age}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.age || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                                {isEditing ? (
                                    <select
                                        name="gender"
                                        value={profileData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.gender || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    />
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.phone || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Blood Group */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Blood Group *</label>
                                {isEditing ? (
                                    <select
                                        name="bloodGroup"
                                        value={profileData.bloodGroup}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                    >
                                        <option value="">Select Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                ) : (
                                    <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                        {profileData.bloodGroup || 'Not provided'}
                                    </div>
                                )}
                            </div>

                        </div>
                    </section>

                    {/* Medical Information */}
                    <section>
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0F8A7D] mb-4">
                            <ArrowRight className="w-5 h-5" /> Medical Information
                        </h2>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Diabetes Type *</label>
                            {isEditing ? (
                                <select
                                    name="diabeticType"
                                    value={profileData.diabeticType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#0F8A7D] outline-none"
                                >
                                    <option value="Type 1">Type 1</option>
                                    <option value="Type 2">Type 2</option>
                                    <option value="Prediabetic">Prediabetic</option>
                                    <option value="Gestational">Gestational</option>
                                </select>
                            ) : (
                                <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium min-h-[42px] flex items-center">
                                    {profileData.diabeticType || 'Not provided'}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Footer Action */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!isEditing}
                            className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${isEditing ? 'bg-[#0F8A7D] text-white hover:bg-[#007f70] shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            Save Details
                        </button>
                        {!isEditing && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full mt-3 text-gray-500 text-sm hover:underline"
                            >
                                Continue to Dashboard
                            </button>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
}
