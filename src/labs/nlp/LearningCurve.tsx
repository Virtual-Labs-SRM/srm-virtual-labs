import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getAccuracy(points: number) {
    // Simulate a learning curve: accuracy increases with more data, but plateaus
    return 0.5 + 0.45 * (1 - Math.exp(-points / 20));
}

export function LearningCurve() {
    const [dataPoints, setDataPoints] = useState(10);
    const accuracy = getAccuracy(dataPoints);
    const curve = Array.from({ length: 21 }, (_, i) => ({
        x: i * 5 + 5,
        y: getAccuracy(i * 5 + 5),
    }));

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Learning Curve</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    Add more data points to see how model accuracy improves.
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <span>Data points:</span>
                    <input
                        type="range"
                        min={5}
                        max={100}
                        step={1}
                        value={dataPoints}
                        onChange={e => setDataPoints(Number(e.target.value))}
                        className="w-40 mx-2"
                    />
                    <span>{dataPoints}</span>
                </div>
                <svg width="320" height="160" viewBox="0 0 100 1" style={{ border: "1px solid #ccc", background: "#f9f9ff" }}>
                    {/* Curve */}
                    <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={0.02}
                        points={curve.map(p => `${(p.x / 100) * 100},${1 - p.y}`).join(' ')}
                    />
                    {/* Current point */}
                    <circle
                        cx={(dataPoints / 100) * 100}
                        cy={1 - accuracy}
                        r={0.8}
                        fill="#f59e42"
                        stroke="#b45309"
                        strokeWidth={0.1}
                    />
                </svg>
                <div className="mt-3 text-xs text-muted-foreground">
                    Accuracy: <b>{(accuracy * 100).toFixed(1)}%</b> (plateaus as data increases)
                </div>
            </CardContent>
        </Card>
    );
}
