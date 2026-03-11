import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Activity, Phone, Droplet } from 'lucide-react';

export default function SetupProfile() {
    const navigate = useNavigate();
    const { updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: 'Male',
        age: '',
        bloodGroup: 'A+',
        phone: '',
        diabetesType: 'Type 2'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Use the unified auth updateProfile function from context
            const res = await updateProfile(formData);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.msg || 'Error saving profile');
            }
        } catch (err) {
            console.error(err);
            setError('Error saving profile');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="text-gray-500 mt-2">Help us personalize your experience</p>
                </div>

                {error && <div className="text-red-500 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" name="name" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.name} onChange={handleChange} placeholder="John Doe" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="date" name="dob" required className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.dob} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input type="number" name="age" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.age} onChange={handleChange} placeholder="Years" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select name="gender" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <div className="relative">
                            <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select name="bloodGroup" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.bloodGroup} onChange={handleChange}>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="tel" name="phone" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diabetes Type</label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select name="diabetesType" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={formData.diabetesType} onChange={handleChange}>
                                <option value="Type 1">Type 1</option>
                                <option value="Type 2">Type 2</option>
                                <option value="Gestational">Gestational</option>
                                <option value="Pre-diabetes">Pre-diabetes</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                        Save Profile & Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
