import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import QuickActions from '../components/QuickActions';
import { useChat } from '../context/ChatContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { openChat } = useChat();
    const navigate = useNavigate();

    const [readings, setReadings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [newReading, setNewReading] = useState({ glucoseLevel: '', measurementType: 'Random', notes: '' });

    const fetchReadings = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const res = await axios.get(`${API_URL}/api/readings`, config);
            setReadings(res.data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);



    const handleAddReading = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post(`${API_URL}/api/readings`, newReading, { headers: { 'x-auth-token': token } });
            setShowModal(false);
            setNewReading({ glucoseLevel: '', measurementType: 'Random', notes: '' });
            fetchReadings();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePredictNext = async () => {
        setIsPredicting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/readings/predict-next`, { headers: { 'x-auth-token': token } });

            if (res.data && res.data.prediction) {
                alert(`Predicted Next Glucose Level: ${res.data.prediction.toFixed(1)} mg/dL`);
            } else {
                alert("Prediction generated, but format was unexpected.");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || err.response?.data?.message || "Failed to predict next reading. Make sure the model is trained.");
        } finally {
            setIsPredicting(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#0F8A7D]">GlucoTrack</h1>
                    <p className="text-gray-500 text-sm">Welcome back, {user?.fullName || 'User'}!</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-600 transition-all font-medium shadow-sm"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>

            <QuickActions
                onAddReading={() => setShowModal(true)}
                onViewCharts={() => navigate('/trends')}
                onAIHelper={openChat}
                onPredict={handlePredictNext}
                onProfile={() => navigate('/profile')}
            />

            {/* Educational Content Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome to GlucoTrack</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Blood glucose (blood sugar) is the main source of energy for your body. It comes from the food you eat, especially carbohydrates, and is carried through the bloodstream to your cells. The hormone insulin, released by the pancreas, helps glucose enter cells to be used for energy.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-gray-700">
                            <span className="font-bold text-[#0F8A7D]">•</span>
                            <span><strong>Normal fasting level:</strong> 70–120 mg/dL.</span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-700">
                            <span className="font-bold text-red-500">•</span>
                            <span><strong>High blood glucose:</strong> Hyperglycemia → may indicate diabetes.</span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-700">
                            <span className="font-bold text-blue-500">•</span>
                            <span><strong>Low blood glucose:</strong> Hypoglycemia → can cause dizziness, sweating, confusion.</span>
                        </li>
                    </ul>
                    <p className="text-gray-600">
                        Keeping blood glucose stable is important for energy, brain function, and preventing long-term health issues.
                    </p>
                </div>

                <div className="pt-6 border-t border-gray-50 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Instruction to use the Web-app</h3>
                    <ol className="space-y-3 text-gray-700">
                        {[
                            "Wash and dry your hands.",
                            "Turn on the device.",
                            "Place your finger or hand on the sensor.",
                            "Stay still while measuring.",
                            "Wait for the reading to display in screen.",
                            "Now you can see your glucose level in web app.",
                            "Turn off the device and store safely."
                        ].map((step, index) => (
                            <li key={index} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-[#0F8A7D] bg-opacity-10 text-[#0F8A7D] rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Dashboard Content */}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in-up">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">New Glucose Reading</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddReading} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Glucose Level (mg/dL)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F8A7D] outline-none transition-all"
                                    placeholder="e.g. 120"
                                    value={newReading.glucoseLevel}
                                    onChange={(e) => setNewReading({ ...newReading, glucoseLevel: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F8A7D] outline-none appearance-none bg-white transition-all"
                                        value={newReading.measurementType}
                                        onChange={(e) => setNewReading({ ...newReading, measurementType: e.target.value })}
                                    >
                                        <option value="Fasting">Fasting</option>
                                        <option value="Before Meal">Before Meal</option>
                                        <option value="After Meal">After Meal</option>
                                        <option value="Bedtime">Bedtime</option>
                                        <option value="Random">Random</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F8A7D] outline-none transition-all"
                                    rows="3"
                                    placeholder="Any additional details..."
                                    value={newReading.notes}
                                    onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#0F8A7D] text-white rounded-xl hover:bg-[#007f70] font-medium shadow-md transition-colors">Save Reading</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
