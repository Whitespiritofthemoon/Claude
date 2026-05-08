'use client'

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface DailyLog {
  date: string
  studyMinutes: number
  quizzesDone: number
  pointsEarned: number
}

interface Props {
  totalContents: number
  totalPoints: number
  totalQuizzes: number
  avgScore: number
  dailyLogs: DailyLog[]
}

export default function ProfileStats({ totalContents, totalPoints, totalQuizzes, avgScore, dailyLogs }: Props) {
  const stats = [
    { label: 'İçerik', value: totalContents, icon: '📚' },
    { label: 'Puan', value: totalPoints, icon: '⚡' },
    { label: 'Quiz', value: totalQuizzes, icon: '🎯' },
    { label: 'Başarı', value: `${avgScore}%`, icon: '🌟' },
  ]

  const chartData = dailyLogs
    .slice()
    .reverse()
    .map((log) => ({
      day: log.date.slice(5),
      puan: log.pointsEarned,
      quiz: log.quizzesDone,
    }))

  return (
    <div className="mb-4">
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-bold text-sm">{stat.value}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3">📊 Son 7 Gün Puan Aktivitesi</h3>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2d2d44', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(108,99,255,0.1)' }}
              />
              <Bar dataKey="puan" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? '#6c63ff' : '#6c63ff66'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
