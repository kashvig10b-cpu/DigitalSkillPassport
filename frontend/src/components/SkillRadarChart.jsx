import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DEFAULT_CATEGORIES = [
  'Programming',
  'Web Development',
  'Database',
  'AI/ML',
  'Problem Solving',
  'Communication',
  'Leadership',
];

const LEVEL_SCORES = {
  Beginner: 35,
  Intermediate: 65,
  Advanced: 85,
  Expert: 100,
};

export default function SkillRadarChart({ skills = [] }) {
  // Aggregate real skills into category radar metrics
  const categoryScores = {};
  DEFAULT_CATEGORIES.forEach((cat) => {
    categoryScores[cat] = { total: 0, count: 0 };
  });

  // Calculate actual scores based on student's MongoDB skills
  skills.forEach((skill) => {
    const cat = skill.category || 'Programming';
    if (!categoryScores[cat]) {
      categoryScores[cat] = { total: 0, count: 0 };
    }
    const score = LEVEL_SCORES[skill.level] || 50;
    categoryScores[cat].total += score;
    categoryScores[cat].count += 1;
  });

  // Generate chart data array
  const radarData = Object.keys(categoryScores).map((category) => {
    const { total, count } = categoryScores[category];
    const avgScore = count > 0 ? Math.round(total / count) : 0;
    return {
      category,
      score: avgScore,
      skillsCount: count,
      fullMark: 100,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{data.category}</p>
          <p className="text-indigo-400 font-medium">Proficiency: {data.score}/100</p>
          <p className="text-slate-400">{data.skillsCount} skills recorded</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      {skills.length === 0 ? (
        <div className="text-center p-6 text-slate-500 text-xs">
          Add skills below to generate your real-time Radar Proficiency Chart.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              stroke="#1e293b"
            />
            <Radar
              name="Skill Proficiency"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.45}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
