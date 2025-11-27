import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Clock, Zap, Database } from 'lucide-react'

function PerformancePanel() {
  // Sample performance data
  const latencyData = [
    { model: 'Mistral', avgLatency: 1250, minLatency: 980, maxLatency: 1520 },
    { model: 'LLaMA3', avgLatency: 1450, minLatency: 1100, maxLatency: 1780 },
    { model: 'Phi-3', avgLatency: 980, minLatency: 750, maxLatency: 1240 }
  ]

  const accuracyData = [
    { model: 'Mistral', accuracy: 4.2, relevance: 4.5, completeness: 4.0 },
    { model: 'LLaMA3', accuracy: 4.4, relevance: 4.3, completeness: 4.2 },
    { model: 'Phi-3', accuracy: 3.8, relevance: 4.0, completeness: 3.9 }
  ]

  const retrievalMetrics = [
    { metric: 'Avg Chunks Retrieved', value: '5.2' },
    { metric: 'Avg Retrieval Time', value: '124ms' },
    { metric: 'Cache Hit Rate', value: '67%' },
    { metric: 'Total Queries', value: '156' }
  ]

  const performanceOverTime = [
    { query: 1, mistral: 1200, llama3: 1400, phi3: 950 },
    { query: 2, mistral: 1250, llama3: 1450, phi3: 980 },
    { query: 3, mistral: 1180, llama3: 1380, phi3: 920 },
    { query: 4, mistral: 1300, llama3: 1500, phi3: 1020 },
    { query: 5, mistral: 1220, llama3: 1420, phi3: 960 },
    { query: 6, mistral: 1280, llama3: 1480, phi3: 1000 },
    { query: 7, mistral: 1240, llama3: 1440, phi3: 970 },
    { query: 8, mistral: 1260, llama3: 1460, phi3: 990 },
    { query: 9, mistral: 1230, llama3: 1430, phi3: 950 },
    { query: 10, mistral: 1270, llama3: 1470, phi3: 1010 }
  ]

  const StatCard = ({ icon: Icon, title, value, change, changeType }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center space-x-1 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              <span>{change}</span>
            </p>
          )}
        </div>
        <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive analysis of model and retrieval performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clock}
          title="Avg Response Time"
          value="1.2s"
          change="-15% vs last week"
          changeType="positive"
        />
        <StatCard
          icon={Zap}
          title="Fastest Model"
          value="Phi-3"
          change="980ms avg"
          changeType="positive"
        />
        <StatCard
          icon={Database}
          title="Documents Indexed"
          value="42"
          change="+8 this week"
          changeType="positive"
        />
        <StatCard
          icon={TrendingUp}
          title="Accuracy Score"
          value="4.1/5"
          change="Across all models"
          changeType="positive"
        />
      </div>

      {/* Latency Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Average Latency by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={latencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="model" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="avgLatency" fill="#3B82F6" name="Avg Latency" />
            <Bar dataKey="minLatency" fill="#10B981" name="Min Latency" />
            <Bar dataKey="maxLatency" fill="#EF4444" name="Max Latency" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quality Metrics by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="model" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 5]} label={{ value: 'Score (out of 5)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Bar dataKey="accuracy" fill="#8B5CF6" name="Accuracy" />
            <Bar dataKey="relevance" fill="#EC4899" name="Relevance" />
            <Bar dataKey="completeness" fill="#F59E0B" name="Completeness" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Over Time */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Response Time Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="query" stroke="#9CA3AF" label={{ value: 'Query Number', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#9CA3AF" label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="mistral" stroke="#3B82F6" strokeWidth={2} name="Mistral" />
            <Line type="monotone" dataKey="llama3" stroke="#8B5CF6" strokeWidth={2} name="LLaMA3" />
            <Line type="monotone" dataKey="phi3" stroke="#10B981" strokeWidth={2} name="Phi-3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Retrieval Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Retrieval System Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {retrievalMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {metric.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {metric.metric}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Comparison Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Model Comparison Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Model</th>
                <th className="px-4 py-3 text-center">Avg Latency</th>
                <th className="px-4 py-3 text-center">Accuracy</th>
                <th className="px-4 py-3 text-center">Hallucinations</th>
                <th className="px-4 py-3 text-center">Best Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-3 font-medium">Mistral 7B</td>
                <td className="px-4 py-3 text-center">1250ms</td>
                <td className="px-4 py-3 text-center">4.2/5</td>
                <td className="px-4 py-3 text-center">Low</td>
                <td className="px-4 py-3 text-center">Balanced</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">LLaMA 3 8B</td>
                <td className="px-4 py-3 text-center">1450ms</td>
                <td className="px-4 py-3 text-center">4.4/5</td>
                <td className="px-4 py-3 text-center">Very Low</td>
                <td className="px-4 py-3 text-center">Accuracy</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Phi-3 Mini</td>
                <td className="px-4 py-3 text-center">980ms</td>
                <td className="px-4 py-3 text-center">3.8/5</td>
                <td className="px-4 py-3 text-center">Medium</td>
                <td className="px-4 py-3 text-center">Speed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PerformancePanel