import { Rec } from "../types";

interface HeatmapProps {
  data: Rec[];
}

export default function ConfidenceHeatmap({ data }: HeatmapProps) {
  const categories = Array.from(new Set(data.map((d) => d.predicted_category)));
  const heatData = categories.map((cat) => {
    const values = data.filter((d) => d.predicted_category === cat).map((d) => d.confidence);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { category: cat, confidence: avg };
  });

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-4">
      <h3 className="text-lg font-bold mb-2">🟢 Confidence Heatmap</h3>
      <div className="flex flex-col gap-2">
        {heatData.map((d) => (
          <div key={d.category} className="flex items-center gap-2">
            <div className="w-32">{d.category}</div>
            <div className="h-4 flex-1 rounded-full" style={{
              background: `linear-gradient(to right, #EF4444, #10B981 ${Math.round(d.confidence * 100)}%, #ddd 0%)`
            }} />
            <div className="w-12 text-right">{Math.round(d.confidence * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
