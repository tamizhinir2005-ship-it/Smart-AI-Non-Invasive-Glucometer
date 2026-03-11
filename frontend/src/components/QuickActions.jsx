import { PlusCircle, BarChart2, Bot, UserCog, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ onAddReading, onViewCharts, onAIHelper, onPredict }) => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Add Reading',
            icon: <PlusCircle className="w-8 h-8 text-white" />,
            bgColor: 'bg-[#0F8A7D]', // Teal/Green shade
            onClick: onAddReading
        },
        {
            title: 'View Charts',
            icon: <BarChart2 className="w-8 h-8 text-white" />,
            bgColor: 'bg-[#00924E]', // Green shade
            onClick: onViewCharts
        },
        {
            title: 'AI Assistant',
            icon: <Bot className="w-8 h-8 text-white" />,
            bgColor: 'bg-[#008DA8]', // Blue/Cyan shade
            onClick: onAIHelper
        },
        {
            title: 'Predict Next',
            icon: <BrainCircuit className="w-8 h-8 text-white" />,
            bgColor: 'bg-[#6366f1]', // Indigo shade
            onClick: onPredict
        },
        {
            title: 'My Profile',
            icon: <UserCog className="w-8 h-8 text-white" />,
            bgColor: 'bg-[#0F8A7D]', // Teal shade repeated or distinct
            onClick: () => navigate('/profile')
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`${action.bgColor} flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 group active:scale-95`}
                    >
                        <div className="mb-3 p-2 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-colors">
                            {action.icon}
                        </div>
                        <span className="text-white font-semibold text-sm md:text-base text-center">
                            {action.title}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
