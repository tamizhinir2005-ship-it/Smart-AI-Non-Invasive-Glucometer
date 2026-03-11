import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Activity, TrendingUp, Calendar, ArrowLeft, Bot } from 'lucide-react';
import GlucoseChart from '../components/GlucoseChart';
import { useNavigate } from 'react-router-dom';

export default function Trends() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [readings, setReadings] = useState([]);
    const [stats, setStats] = useState({ count: 0, average: 0, current: 0 });
    const [filterType, setFilterType] = useState('all');
    const [isTraining, setIsTraining] = useState(false);

    const fetchReadings = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const res = await axios.get('http://localhost:5000/api/readings', config);
            setReadings(res.data);

            const statsRes = await axios.get('http://localhost:5000/api/readings/stats', config);
            setStats(statsRes.data);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => {
        fetchReadings();
    }, []);

    const getFilteredReadings = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        switch (filterType) {
            case 'today':
                return readings.filter(r => new Date(r.recordedAt) >= today);
            case 'week':
                return readings.filter(r => new Date(r.recordedAt) >= lastWeek);
            case 'month':
                return readings.filter(r => new Date(r.recordedAt) >= lastMonth);
            default:
                return readings.slice(0, 30);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/readings/${id}`, { headers: { 'x-auth-token': token } });
            fetchReadings();
        } catch (err) {
            console.error(err);
        }
    };

    const handleTrainModel = async () => {
        setIsTraining(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/readings/train-model', {}, { headers: { 'x-auth-token': token } });
            alert(res.data.msg || "Model trained successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || err.response?.data?.message || "Failed to train model. Ensure you have enough readings.");
        } finally {
            setIsTraining(false);
        }
    };

    const getLevelColor = (level) => {
        if (level < 70) return 'text-blue-500 bg-blue-50';
        if (level > 120) return 'text-red-500 bg-red-50';
        return 'text-green-500 bg-green-50';
    };

    const getAnalysis = () => {
        if (readings.length === 0) return null;

        const avg = parseFloat(stats.average);
        let statusText = "Normal";
        let statusColor = "text-green-600";
        let advice = "Great job! Your average glucose levels are within the healthy target range. Keep maintaining your healthy lifestyle.";

        if (avg < 70) {
            statusText = "Low";
            statusColor = "text-blue-600";
            advice = "Your average glucose level is lower than the target range. Please ensure you are following your dietary plan and consult your doctor if this persists.";
        } else if (avg > 120) {
            statusText = "High";
            statusColor = "text-red-600";
            advice = "Your average glucose level is above the target range. Monitoring your sugar intake and regular physical activity can help. Consult your healthcare provider for adjustments.";
        }

        return (
            <div className="mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#0F8A7D] bg-opacity-10 rounded-lg">
                        <Activity className="w-5 h-5 text-[#0F8A7D]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Analysis & Insights</h3>
                </div>
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Based on your <span className="font-semibold text-[#0F8A7D]">{stats.count} readings</span> analyzed,
                        your average glucose level is <span className={`font-bold ${statusColor}`}>{stats.average} mg/dL</span>,
                        which is considered <span className={`font-bold ${statusColor}`}>{statusText}</span>.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#0F8A7D]">
                        <p className="text-gray-600 italic">"{advice}"</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-blue-50 bg-opacity-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Observation</p>
                            <p className="text-sm text-gray-700">Your readings show {readings.length > 5 ? 'consistent tracking' : 'initial data points'} over the selected period.</p>
                        </div>
                        <div className="p-3 bg-green-50 bg-opacity-50 rounded-lg border border-green-100">
                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Recommendation</p>
                            <p className="text-sm text-gray-700">Continue logging measurements at different times of the day for better accuracy.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const chartData = getFilteredReadings();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Glucose Trends</h1>
                    <p className="text-gray-500 text-sm">Analyze your progress over time</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Current Glucose</p>
                        <h2 className={`text-3xl font-bold mt-1 ${getLevelColor(stats.current).split(' ')[0]}`}>{stats.current} <span className="text-lg text-gray-400 font-normal">mg/dL</span></h2>
                    </div>
                    <div className={`p-3 rounded-full ${getLevelColor(stats.current)} bg-opacity-20`}>
                        <Activity className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">7-Day Average</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.average} <span className="text-lg text-gray-400 font-normal">mg/dL</span></h2>
                    </div>
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Readings</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.count}</h2>
                    </div>
                    <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap gap-2 justify-between items-center w-full">
                        <button
                            onClick={handleTrainModel}
                            disabled={isTraining}
                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 ${isTraining ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0F8A7D] hover:bg-[#007f70] shadow-sm'}`}
                        >
                            <Bot className="w-4 h-4" />
                            {isTraining ? 'Training Model...' : 'Train AI Model'}
                        </button>
                        <div className="flex gap-2">
                            {['today', 'week', 'month', 'all'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filterType === type ? 'bg-[#0F8A7D] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <GlucoseChart data={chartData} />
                    </div>
                    {getAnalysis()}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 h-[500px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 sticky top-0 bg-white pb-2 z-10">Recent History</h3>
                    <div className="space-y-3">
                        {readings.map((reading) => (
                            <div key={reading._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                                <div>
                                    <p className={`font-bold ${getLevelColor(reading.glucoseLevel).split(' ')[0]}`}>{reading.glucoseLevel} mg/dL</p>
                                    <p className="text-xs text-gray-500">{new Date(reading.recordedAt).toLocaleString()} • {reading.measurementType}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${getLevelColor(reading.glucoseLevel).split(' ')[0].replace('text', 'bg')}`}></span>
                                    <button onClick={() => handleDelete(reading._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {readings.length === 0 && <p className="text-center text-gray-400 py-4">No readings yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
