type TraversalExplanationProps = {
  startNode: string;
  visited: string[];
  traversedEdges: Set<string>;
  experts: {
    name: string;
    skills: string[];
    matchingSkills: string[];
    relevanceScore: number;
  }[];
};

export function TraversalExplanation({
  startNode,
  visited,
  traversedEdges,
  experts,
}: TraversalExplanationProps) {
  if (!startNode || visited.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Start the traversal to see step-by-step semantic reasoning
      </p>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <ol className="space-y-3 list-decimal pl-5">
        {visited.map((concept, idx) => {
          // Find parent edge
          const incoming = Array.from(traversedEdges).find(e =>
            e.endsWith(`-${concept}`)
          );
          const parent = incoming ? incoming.split('-')[0] : null;

          // Experts affected by this concept
          const affectedExperts = experts.filter(e =>
            e.skills.some(skill =>
              skill.toLowerCase().includes(concept.toLowerCase()) ||
              concept.toLowerCase().includes(skill.toLowerCase())
            )
          );

          return (
            <li key={concept}>
              <div className="space-y-1">
                <p>
                  <strong>{concept}</strong>
                  {idx === 0 && (
                    <span className="text-muted-foreground">
                      {' '}— starting concept (domain query)
                    </span>
                  )}
                </p>

                {parent && (
                  <p className="text-muted-foreground">
                    ↳ Reached from <strong>{parent}</strong> via ontology
                    <em> parent → child</em> relation
                  </p>
                )}

                {affectedExperts.length > 0 ? (
                  <div className="mt-1">
                    <p className="text-muted-foreground">
                      👥 Experts influenced by this concept:
                    </p>
                    <ul className="list-disc list-inside ml-3">
                      {affectedExperts.map(expert => (
                        <li key={expert.name}>
                          <strong>{expert.name}</strong>
                          {' '}matched via skills:{' '}
                          <span className="italic">
                            {expert.matchingSkills.join(', ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No direct expert skill match at this step
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
