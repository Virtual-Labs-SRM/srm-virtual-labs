import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const exampleText = "The quick brown fox jumps over the lazy dog.";
const exampleAttention = [0.05, 0.1, 0.2, 0.15, 0.25, 0.1, 0.05, 0.05, 0.05];

function getAttention(text: string): number[] {
    // For demo: assign higher attention to 'fox', 'jumps', 'lazy', 'dog'
    const words = text.split(" ");
    return words.map((w, i) => (w.match(/fox|jumps|lazy|dog/i) ? 0.25 : 0.05));
}

export function AttentionHeatmap() {
    const [input, setInput] = useState(exampleText);
    const words = input.split(" ");
    const attention = getAttention(input);
    const maxAttn = Math.max(...attention);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Attention Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-2 text-sm text-muted-foreground">
                    Enter a sentence to see which words a transformer model might focus on.
                </div>
                <textarea
                    className="w-full border rounded p-2 mb-3 text-sm"
                    rows={2}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <div className="flex flex-wrap gap-1">
                    {words.map((word, i) => (
                        <span
                            key={i}
                            style={{
                                background: `rgba(37,99,235,${attention[i] / maxAttn})`,
                                color: attention[i] / maxAttn > 0.5 ? '#fff' : '#222',
                                borderRadius: 4,
                                padding: '2px 6px',
                                fontWeight: attention[i] / maxAttn > 0.5 ? 700 : 400,
                                transition: 'background 0.2s',
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                    Darker blue = higher attention weight
                </div>
            </CardContent>
        </Card>
    );
}
