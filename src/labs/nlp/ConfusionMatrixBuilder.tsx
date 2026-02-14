import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getMetrics(tp: number, fp: number, fn: number, tn: number) {
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const accuracy = (tp + tn) / (tp + fp + fn + tn);
    const f1 = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
    return { precision, recall, accuracy, f1 };
}

export function ConfusionMatrixBuilder() {
    const [threshold, setThreshold] = useState(0.5);
    // Example: simulate confusion matrix values based on threshold
    // (In real use, these would come from model predictions)
    const tp = Math.round(80 * threshold + 10);
    const fp = Math.round(20 * (1 - threshold) + 5);
    const fn = Math.round(15 * (1 - threshold) + 5);
    const tn = Math.round(85 * threshold + 10);
    const { precision, recall, accuracy, f1 } = getMetrics(tp, fp, fn, tn);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Confusion Matrix Builder</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    Adjust the threshold to see how the confusion matrix and metrics change.
                </div>
                <div className="flex items-center gap-4 mb-4">
                    <span>Threshold:</span>
                    <input
                        type="range"
                        min={0.1}
                        max={0.9}
                        step={0.01}
                        value={threshold}
                        onChange={e => setThreshold(Number(e.target.value))}
                        className="w-40 mx-2"
                    />
                    <span>{(threshold * 100).toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="font-semibold mb-1">Confusion Matrix</div>
                        <table className="border text-xs">
                            <thead>
                                <tr><th></th><th>Predicted +</th><th>Predicted -</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Actual +</td><td className="font-bold text-green-700">{tp}</td><td className="text-orange-700">{fn}</td></tr>
                                <tr><td>Actual -</td><td className="text-orange-700">{fp}</td><td className="font-bold text-green-700">{tn}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="font-semibold mb-1">Metrics</div>
                        <ul className="text-xs">
                            <li>Precision: <b>{(precision * 100).toFixed(1)}%</b></li>
                            <li>Recall: <b>{(recall * 100).toFixed(1)}%</b></li>
                            <li>Accuracy: <b>{(accuracy * 100).toFixed(1)}%</b></li>
                            <li>F1 Score: <b>{(f1 * 100).toFixed(1)}%</b></li>
                        </ul>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">
                    Tradeoff: Increasing threshold usually increases precision but may lower recall.
                </div>
            </CardContent>
        </Card>
    );
}
