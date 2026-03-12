import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const GlucoseChart = ({ data }) => {
    // Data should be array of { recordedAt, glucoseLevel }
    // Format date for XAxis
    // Format data and ensure chronological order for the chart
    const formattedData = [...data].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Glucose Trends</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData}>
                    <defs>
                        <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="recordedAt" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        minTickGap={30}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#3b82f6' }}
                    />

                    {/* Color Zones */}
                    <ReferenceArea y1={0} y2={70} fill="#EFF6FF" fillOpacity={0.5} stroke="none" />
                    <ReferenceArea y1={70} y2={120} fill="#F0FDF4" fillOpacity={0.5} stroke="none" />
                    <ReferenceArea y1={120} fill="#FEF2F2" fillOpacity={0.5} stroke="none" />

                    <Area type="monotone" dataKey="glucoseLevel" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GlucoseChart;
