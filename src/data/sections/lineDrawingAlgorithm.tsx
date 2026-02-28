import { type ReactElement, useState, useCallback } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
} from "@/components/atoms";

// ── Full Algorithm Visualization ────────────────────────────────────────────────

interface Point {
    x: number;
    y: number;
}

/**
 * Complete interactive line drawing demonstration.
 * Shows the algorithm working in real-time with draggable endpoints.
 */
function AlgorithmDemo() {
    const gridSize = 14;
    const cellSize = 32;
    const [pointA, setPointA] = useState<Point>({ x: 2, y: 11 });
    const [pointB, setPointB] = useState<Point>({ x: 11, y: 3 });
    const [dragging, setDragging] = useState<'A' | 'B' | null>(null);
    const [showSteps, setShowSteps] = useState(true);

    // The actual line drawing algorithm
    const drawLine = useCallback((p0: Point, p1: Point): { cells: Point[], steps: { t: number, continuous: Point, rounded: Point }[] } => {
        const dx = Math.abs(p1.x - p0.x);
        const dy = Math.abs(p1.y - p0.y);
        const N = Math.max(dx, dy);

        const cells: Point[] = [];
        const steps: { t: number, continuous: Point, rounded: Point }[] = [];
        const seen = new Set<string>();

        for (let step = 0; step <= N; step++) {
            const t = N === 0 ? 0 : step / N;

            // Lerp to get continuous point
            const x = p0.x + (p1.x - p0.x) * t;
            const y = p0.y + (p1.y - p0.y) * t;

            // Round to get grid cell
            const rx = Math.round(x);
            const ry = Math.round(y);

            const key = `${rx},${ry}`;
            if (!seen.has(key)) {
                seen.add(key);
                cells.push({ x: rx, y: ry });
            }

            steps.push({
                t,
                continuous: { x, y },
                rounded: { x: rx, y: ry }
            });
        }

        return { cells, steps };
    }, []);

    const { cells, steps } = drawLine(pointA, pointB);
    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));

    // Calculate algorithm values for display
    const dx = Math.abs(pointB.x - pointA.x);
    const dy = Math.abs(pointB.y - pointA.y);
    const N = Math.max(dx, dy);

    const handleMouseDown = (x: number, y: number) => {
        const distA = Math.abs(x - pointA.x) + Math.abs(y - pointA.y);
        const distB = Math.abs(x - pointB.x) + Math.abs(y - pointB.y);

        if (distA <= 1) {
            setDragging('A');
        } else if (distB <= 1) {
            setDragging('B');
        } else if (distA < distB) {
            setPointA({ x, y });
            setDragging('A');
        } else {
            setPointB({ x, y });
            setDragging('B');
        }
    };

    const handleMouseMove = (x: number, y: number) => {
        if (dragging === 'A') {
            setPointA({ x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) });
        } else if (dragging === 'B') {
            setPointB({ x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) });
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Algorithm stats */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
                <div className="bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">A = </span>
                    <span className="font-mono font-semibold text-primary">({pointA.x}, {pointA.y})</span>
                </div>
                <div className="bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">B = </span>
                    <span className="font-mono font-semibold" style={{ color: "hsl(280, 70%, 55%)" }}>({pointB.x}, {pointB.y})</span>
                </div>
                <div className="bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">dx = </span>
                    <span className="font-mono font-semibold">{dx}</span>
                </div>
                <div className="bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">dy = </span>
                    <span className="font-mono font-semibold">{dy}</span>
                </div>
                <div className="bg-green-100 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">N = </span>
                    <span className="font-mono font-semibold text-green-700">{N}</span>
                </div>
                <div className="bg-blue-100 px-3 py-1.5 rounded-lg">
                    <span className="text-muted-foreground">Cells = </span>
                    <span className="font-mono font-semibold text-blue-700">{cells.length}</span>
                </div>
            </div>

            {/* Toggle for showing interpolation steps */}
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="rounded border-border"
                />
                <span className="text-muted-foreground">Show interpolation points</span>
            </label>

            <svg
                width={width}
                height={height}
                className="border border-border rounded-lg bg-card shadow-sm cursor-crosshair select-none"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Grid cells */}
                {Array.from({ length: gridSize }, (_, row) =>
                    Array.from({ length: gridSize }, (_, col) => {
                        const isLineCell = cellSet.has(`${col},${gridSize - 1 - row}`);
                        const isPointA = col === pointA.x && gridSize - 1 - row === pointA.y;
                        const isPointB = col === pointB.x && gridSize - 1 - row === pointB.y;

                        return (
                            <rect
                                key={`${col}-${row}`}
                                x={col * cellSize}
                                y={row * cellSize}
                                width={cellSize}
                                height={cellSize}
                                fill={
                                    isPointA ? "hsl(220, 90%, 56%)" :
                                    isPointB ? "hsl(280, 70%, 60%)" :
                                    isLineCell ? "hsl(220, 90%, 85%)" :
                                    "transparent"
                                }
                                stroke="hsl(220, 30%, 90%)"
                                strokeWidth={1}
                                className="transition-colors duration-75"
                                onMouseDown={() => handleMouseDown(col, gridSize - 1 - row)}
                                onMouseMove={() => handleMouseMove(col, gridSize - 1 - row)}
                            />
                        );
                    })
                )}

                {/* True mathematical line */}
                <line
                    x1={pointA.x * cellSize + cellSize / 2}
                    y1={(gridSize - 1 - pointA.y) * cellSize + cellSize / 2}
                    x2={pointB.x * cellSize + cellSize / 2}
                    y2={(gridSize - 1 - pointB.y) * cellSize + cellSize / 2}
                    stroke="hsl(220, 90%, 40%)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    opacity={0.5}
                    pointerEvents="none"
                />

                {/* Interpolation points (optional) */}
                {showSteps && steps.map((step, i) => (
                    <circle
                        key={i}
                        cx={step.continuous.x * cellSize + cellSize / 2}
                        cy={(gridSize - 1 - step.continuous.y) * cellSize + cellSize / 2}
                        r={4}
                        fill="hsl(150, 80%, 45%)"
                        opacity={0.7}
                        pointerEvents="none"
                    />
                ))}

                {/* Endpoint markers */}
                <circle
                    cx={pointA.x * cellSize + cellSize / 2}
                    cy={(gridSize - 1 - pointA.y) * cellSize + cellSize / 2}
                    r={10}
                    fill="hsl(220, 90%, 56%)"
                    stroke="white"
                    strokeWidth={3}
                    className="cursor-grab"
                    onMouseDown={() => setDragging('A')}
                />
                <text
                    x={pointA.x * cellSize + cellSize / 2}
                    y={(gridSize - 1 - pointA.y) * cellSize + cellSize / 2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    pointerEvents="none"
                >
                    A
                </text>

                <circle
                    cx={pointB.x * cellSize + cellSize / 2}
                    cy={(gridSize - 1 - pointB.y) * cellSize + cellSize / 2}
                    r={10}
                    fill="hsl(280, 70%, 60%)"
                    stroke="white"
                    strokeWidth={3}
                    className="cursor-grab"
                    onMouseDown={() => setDragging('B')}
                />
                <text
                    x={pointB.x * cellSize + cellSize / 2}
                    y={(gridSize - 1 - pointB.y) * cellSize + cellSize / 2 + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    pointerEvents="none"
                >
                    B
                </text>
            </svg>

            <p className="text-sm text-muted-foreground text-center max-w-lg">
                Drag points A and B around the grid. The algorithm calculates N = max(dx, dy),
                creates N+1 interpolation points, and rounds each to the nearest cell.
            </p>
        </div>
    );
}

// ── Pseudocode Display ────────────────────────────────────────────────────────

function PseudocodeDisplay() {
    return (
        <div className="bg-secondary/30 rounded-lg p-5 font-mono text-sm overflow-x-auto">
            <pre className="text-foreground leading-relaxed">
{`function drawLine(p0, p1):
    dx = |p1.x - p0.x|
    dy = |p1.y - p0.y|
    N = max(dx, dy)

    cells = []
    for step from 0 to N:
        t = step / N

        // Interpolate
        x = p0.x + (p1.x - p0.x) × t
        y = p0.y + (p1.y - p0.y) × t

        // Round to grid
        cells.add(round(x), round(y))

    return cells`}
            </pre>
        </div>
    );
}

// ── Exported Section Blocks ─────────────────────────────────────────────────────

export const lineDrawingAlgorithmBlocks: ReactElement[] = [
    // ── Section Title ─────────────────────────────────────────────────────
    <StackLayout key="layout-algo-title" maxWidth="xl">
        <Block id="block-algo-title" padding="lg">
            <EditableH2 id="h2-algo-title" blockId="block-algo-title">
                The Complete Algorithm
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-intro" maxWidth="xl">
        <Block id="block-algo-intro" padding="sm">
            <EditableParagraph id="para-algo-intro" blockId="block-algo-intro">
                Let's put everything together! Here's the complete line drawing algorithm
                that combines linear interpolation with rounding to draw lines on a grid.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Pseudocode ─────────────────────────────────────────────────────
    <StackLayout key="layout-algo-code-title" maxWidth="xl">
        <Block id="block-algo-code-title" padding="sm">
            <EditableH2 id="h2-algo-code" blockId="block-algo-code-title">
                The Algorithm
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-code" maxWidth="xl">
        <Block id="block-algo-code" padding="md">
            <PseudocodeDisplay />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-explain" maxWidth="xl">
        <Block id="block-algo-explain" padding="sm">
            <EditableParagraph id="para-algo-explain" blockId="block-algo-explain">
                The algorithm is remarkably simple: we calculate how many steps we need (N),
                then for each step we interpolate to find the continuous point and round it
                to the nearest grid cell. The key insight is using{" "}
                <InlineFormula latex="N = \max(|dx|, |dy|)" /> to ensure we never skip a cell.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Interactive Demo ─────────────────────────────────────────────────────
    <StackLayout key="layout-algo-demo-title" maxWidth="xl">
        <Block id="block-algo-demo-title" padding="sm">
            <EditableH2 id="h2-algo-demo" blockId="block-algo-demo-title">
                Interactive Demonstration
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-demo-text" maxWidth="xl">
        <Block id="block-algo-demo-text" padding="sm">
            <EditableParagraph id="para-algo-demo" blockId="block-algo-demo-text">
                Try the algorithm yourself! Drag the endpoints around and watch the algorithm
                work in real-time. Notice how the line always connects smoothly, even at
                steep angles.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-demo" maxWidth="xl">
        <Block id="block-algo-demo" padding="md">
            <AlgorithmDemo />
        </Block>
    </StackLayout>,

    // ── Why It Works ─────────────────────────────────────────────────────
    <StackLayout key="layout-algo-why-title" maxWidth="xl">
        <Block id="block-algo-why-title" padding="sm">
            <EditableH2 id="h2-algo-why" blockId="block-algo-why-title">
                Why This Works
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-why" maxWidth="xl">
        <Block id="block-algo-why" padding="sm">
            <EditableParagraph id="para-algo-why" blockId="block-algo-why">
                The magic is in choosing N correctly. By using the maximum of dx and dy,
                we ensure that between any two consecutive sample points, we move at most
                one cell in either direction. This guarantees a connected line with no gaps!
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-algo-beauty" maxWidth="xl">
        <Block id="block-algo-beauty" padding="sm">
            <EditableParagraph id="para-algo-beauty" blockId="block-algo-beauty">
                This approach — using linear interpolation instead of the traditional
                Bresenham's algorithm — is not only easier to understand but equally fast
                on modern computers. It's a beautiful example of how simple mathematics
                can solve practical problems elegantly.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
