import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Upload, Download, Calendar, BookOpen, Plus, Trash2, Target, Flag } from 'lucide-react';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { InputGroup } from './components/ui/InputGroup';
import { api } from './services/api';

const App = () => {
  // State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purpose, setPurpose] = useState("");
  const [formData, setFormData] = useState({
    testName: "",
    date: new Date().toISOString().split('T')[0],
    subject: "数学",
    score: "",
    maxScore: "100"
  });

  // Load data from API on mount
  useEffect(() => {
    loadRecords();

    // Load purpose from localStorage
    const savedPurpose = localStorage.getItem('study_tracker_purpose');
    if (savedPurpose) {
      setPurpose(savedPurpose);
    }
  }, []);

  // Save purpose to localStorage
  useEffect(() => {
    localStorage.setItem('study_tracker_purpose', purpose);
  }, [purpose]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.fetchRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to load data", error);
      alert("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.testName || !formData.score) return;

    const newRecord = {
      id: Date.now().toString(),
      ...formData,
      score: Number(formData.score),
      maxScore: Number(formData.maxScore),
      percentage: (Number(formData.score) / Number(formData.maxScore)) * 100
    };

    // Optimistic update
    setRecords([newRecord, ...records]);
    setFormData(prev => ({ ...prev, score: "", testName: "" }));

    // API Call
    try {
      await api.addRecord(newRecord);
    } catch (error) {
      console.error("Failed to save record", error);
      alert("保存に失敗しました。リロードしてください。");
      loadRecords(); // Revert on error
    }
  };

  const handleDelete = async (id) => {
    if (confirm('この記録を削除してもよろしいですか？')) {
      // Optimistic update
      const prevRecords = [...records];
      setRecords(records.filter(r => r.id !== id));

      try {
        await api.deleteRecord(id);
      } catch (error) {
        console.error("Failed to delete record", error);
        alert("削除に失敗しました");
        setRecords(prevRecords); // Revert
      }
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["ID", "テスト名", "日付", "教科", "点数", "満点", "得点率"];
    const rows = records.map(r => [
      r.id, r.testName, r.date, r.subject, r.score, r.maxScore, r.percentage.toFixed(1)
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `study_records_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // CSV Import
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        // Skip header, parse lines
        const newRecords = lines.slice(1).filter(l => l.trim()).map(line => {
          const [id, testName, date, subject, score, maxScore] = line.split(',');
          return {
            id: id || Date.now().toString() + Math.random(),
            testName,
            date,
            subject,
            score: Number(score),
            maxScore: Number(maxScore),
            percentage: (Number(score) / Number(maxScore)) * 100
          };
        });
        setRecords(prev => [...newRecords, ...prev]);
        alert(`${newRecords.length}件のデータを読み込みました`);
      } catch (err) {
        alert('CSVの読み込みに失敗しました。フォーマットを確認してください。');
      }
    };
    reader.readAsText(file);
  };

  // Stats
  const stats = useMemo(() => {
    if (records.length === 0) return { avg: 0, count: 0, recent: 0 };
    const total = records.reduce((acc, r) => acc + r.percentage, 0);
    return {
      avg: (total / records.length).toFixed(1),
      count: records.length,
      recent: records[0].percentage.toFixed(1)
    };
  }, [records]);

  const formatDateJP = (dateString) => {
    if (!dateString) return "";
    // Try parsing as YYYY-MM-DD first to avoid timezone issues
    const ymd = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymd) {
      return `${ymd[1]}年${Number(ymd[2])}月${Number(ymd[3])}日`;
    }
    // Fallback to Date object parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // Chart Data Preparation
  const SUBJECT_COLORS = {
    "数学": "#667eea", // Blue
    "英語": "#f56565", // Red
    "国語": "#ed8936", // Orange
    "理科": "#48bb78", // Green
    "社会": "#ecc94b", // Yellow
    "その他": "#a0aec0" // Gray
  };

  const chartData = useMemo(() => {
    // Group by date
    const grouped = {};
    records.filter(r => r.score > -1).forEach(r => {
      const dateKey = r.date; // YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = { name: r.testName, fullDate: dateKey };
      }
      grouped[dateKey][r.subject] = r.percentage;
    });

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  }, [records]);

  return (
    <div className="max-w-6xl mx-auto p-6 pb-20">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-lg text-white"><TrendingUp size={28} /></span>
            学習記録トラッカー
          </h1>
          <p className="text-gray-500 mt-2 ml-1">日々の努力を可視化して、目標達成を目指しましょう</p>
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
            <div className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm bg-white text-gray-700 hover:bg-gray-50 border border-gray-200">
              <Upload size={18} /> CSV読込
            </div>
          </label>
          <Button variant="secondary" icon={Download} onClick={exportCSV}>CSV保存</Button>
        </div>
      </header>

      {/* Purpose Section */}
      <div className="mb-8">
        <div className="glass-panel p-6 border-l-4 border-indigo-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={100} />
          </div>
          <h2 className="text-lg font-bold text-indigo-800 mb-2 flex items-center gap-2">
            <Flag size={20} /> 学習の目的・目標
          </h2>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="ここになぜ勉強するのか、将来の夢や目標を入力しましょう（例：志望校合格、海外留学のため...）"
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-gray-700 placeholder-gray-300 resize-none overflow-hidden"
            style={{ minHeight: '5rem' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><TrendingUp size={18} /></div>
          <div>
            <p className="text-sm text-gray-500">平均得点率</p>
            <p className="text-2xl font-bold text-gray-800">{stats.avg}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><Calendar size={18} /></div>
          <div>
            <p className="text-sm text-gray-500">直近の成績</p>
            <p className="text-2xl font-bold text-gray-800">{stats.recent}%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><BookOpen size={18} /></div>
          <div>
            <p className="text-sm text-gray-500">記録数</p>
            <p className="text-2xl font-bold text-gray-800">{stats.count}回</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" /> 新しい記録
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <InputGroup
                label="テスト名"
                placeholder="例: 1学期中間テスト"
                value={formData.testName}
                onChange={e => setFormData({ ...formData, testName: e.target.value })}
              />
              <InputGroup
                label="実施日"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">教科</label>
                <select
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                >
                  {["数学", "英語", "国語", "理科", "社会", "その他"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="点数"
                  type="number"
                  placeholder="85"
                  value={formData.score}
                  onChange={e => setFormData({ ...formData, score: e.target.value })}
                />
                <InputGroup
                  label="満点"
                  type="number"
                  placeholder="100"
                  value={formData.maxScore}
                  onChange={e => setFormData({ ...formData, maxScore: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full justify-center mt-2 py-3">記録を追加</Button>
            </form>
          </div>
        </div>

        {/* Right Column: Graph & List */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Graph Section */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">教科別成績推移 (得点率 %)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  {Object.keys(SUBJECT_COLORS).map(subject => (
                    <Line
                      key={subject}
                      type="monotone"
                      dataKey={subject}
                      name={subject}
                      stroke={SUBJECT_COLORS[subject]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List Section */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">記録一覧</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-sm border-b border-gray-200">
                    <th className="pb-3 font-medium">日付</th>
                    <th className="pb-3 font-medium">テスト名</th>
                    <th className="pb-3 font-medium">教科</th>
                    <th className="pb-3 font-medium">点数 / 満点</th>
                    <th className="pb-3 font-medium">得点率</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-white/40 transition-colors">
                      <td className="py-4 text-sm">{formatDateJP(record.date)}</td>
                      <td className="py-4 font-medium">{record.testName}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold">
                          {record.subject}
                        </span>
                      </td>
                      <td className="py-4">{record.score} / {record.maxScore}</td>
                      <td className="py-4 font-bold text-indigo-600">{record.percentage.toFixed(1)}%</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        まだ記録がありません。「新しい記録」から追加してください。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
