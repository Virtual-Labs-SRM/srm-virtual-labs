export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-card/50 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-card border-2 border-border" />
        <span className="text-xs text-muted-foreground">Unvisited</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
        <span className="text-xs text-muted-foreground">Current</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-secondary" />
        <span className="text-xs text-muted-foreground">Visited</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-0.5 bg-primary" />
        <span className="text-xs text-muted-foreground">Traversed Edge</span>
      </div>
    </div>
  );
}
