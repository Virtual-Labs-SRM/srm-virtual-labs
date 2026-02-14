import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simple 2D vector space explorer for demo
const initialDocs = [
    { id: 1, label: "Doc 1", x: 0.2, y: 0.7 },
    { id: 2, label: "Doc 2", x: 0.7, y: 0.3 },
    { id: 3, label: "Doc 3", x: 0.5, y: 0.5 },
];

export function VectorSpaceExplorer() {
    const [docs, setDocs] = useState(initialDocs);
    const [dragged, setDragged] = useState<number | null>(null);

    const handleDrag = (id: number, e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
        const svg = e.currentTarget.ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setDocs(docs => docs.map(doc => doc.id === id ? { ...doc, x, y } : doc));
    };

    // Calculate pairwise distances and similarity
    function euclidean(a: any, b: any) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }
    function similarity(d: number) {
        return 1 / (1 + d); // simple similarity: closer = higher
    }
    const pairs = [];
    for (let i = 0; i < docs.length; ++i) {
        for (let j = i + 1; j < docs.length; ++j) {
            const d = euclidean(docs[i], docs[j]);
            pairs.push({
                a: docs[i].label,
                b: docs[j].label,
                dist: d,
                sim: similarity(d),
            });
        }
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>VectorSpaceExplorer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    Drag the document points in 2D space. Distances represent similarity.
                </div>
                {/* Interactive distance/similarity table - moved to top */}
                <div className="mb-4">
                    <div className="font-semibold mb-1 text-sm">Pairwise Distance & Similarity</div>
                    <table className="text-xs border">
                        <thead>
                            <tr>
                                <th className="px-2">Doc A</th>
                                <th className="px-2">Doc B</th>
                                <th className="px-2">Distance</th>
                                <th className="px-2">Similarity (1/(1+d))</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pairs.map((p, i) => (
                                <tr key={i}>
                                    <td className="px-2">{p.a}</td>
                                    <td className="px-2">{p.b}</td>
                                    <td className="px-2">{p.dist.toFixed(3)}</td>
                                    <td className="px-2">{p.sim.toFixed(3)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-2 text-xs text-muted-foreground">
                        <b>How it works:</b> The closer two points are, the higher their similarity score.<br />
                        Similarity = 1 / (1 + distance)
                    </div>
                </div>
                <div className="flex justify-center w-full">
                    <svg
                        width="100%"
                        height="min(50vw, 400px)"
                        viewBox="0 0 1 1"
                        style={{ maxWidth: 400, minWidth: 260, aspectRatio: '1 / 1', border: '1px solid #ccc', background: '#f9f9ff', display: 'block' }}
                    >
                        {docs.map(doc => (
                            <circle
                                key={doc.id}
                                cx={doc.x}
                                cy={doc.y}
                                r={0.04}
                                fill="#2563eb"
                                stroke="#1e40af"
                                strokeWidth={0.01}
                                onMouseDown={() => setDragged(doc.id)}
                                onMouseUp={() => setDragged(null)}
                                onMouseMove={dragged === doc.id ? (e) => handleDrag(doc.id, e) : undefined}
                                style={{ cursor: "pointer" }}
                            />
                        ))}
                        {docs.map(doc => (
                            <text
                                key={doc.id + "_label"}
                                x={doc.x + 0.05}
                                y={doc.y}
                                fontSize={0.04}
                                fill="#222"
                            >
                                {doc.label}
                            </text>
                        ))}
                    </svg>
                </div>
                <div className="mt-3 text-xs text-muted-foreground text-center">
                    Distance between points (Euclidean) indicates how similar the documents are.
                </div>
            </CardContent>
        </Card>
    );
}
