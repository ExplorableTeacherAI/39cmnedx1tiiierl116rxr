import { type ReactElement } from "react";
import { StackLayout, StepLayout, Step } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineFormula,
} from "@/components/atoms";
import { useVar } from "@/stores";
import {
    getVariableInfo,
    numberPropsFromDefinition,
} from "../variables";

// ── Step Visualization: Continuous Points ────────────────────────────────────

function ContinuousPointsViz() {
    const N = useVar("numSteps", 5) as number;

    // Define endpoints
    const p0 = { x: 1, y: 1 };
    const p1 = { x: 8, y: 6 };

    // Calculate interpolated points
    const points = [];
    for (let step = 0; step <= N; step++) {
        const t = N === 0 ? 0 : step / N;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        points.push({ x, y, t });
    }

    const gridSize = 10;
    const cellSize = 36;
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <div className="flex flex-col items-center gap-3">
            <svg width={width} height={height} className="border border-border rounded-lg bg-card shadow-sm">
                {/* Grid */}
                {Array.from({ length: gridSize + 1 }, (_, i) => (
                    <g key={i}>
                        <line
                            x1={i * cellSize}
                            y1={0}
                            x2={i * cellSize}
                            y2={height}
                            stroke="hsl(220, 30%, 92%)"
                            strokeWidth={1}
                        />
                        <line
                            x1={0}
                            y1={i * cellSize}
                            x2={width}
                            y2={i * cellSize}
                            stroke="hsl(220, 30%, 92%)"
                            strokeWidth={1}
                        />
                    </g>
                ))}

                {/* True line */}
                <line
                    x1={p0.x * cellSize}
                    y1={(gridSize - p0.y) * cellSize}
                    x2={p1.x * cellSize}
                    y2={(gridSize - p1.y) * cellSize}
                    stroke="hsl(220, 30%, 70%)"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                />

                {/* Interpolated points (continuous) */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x * cellSize}
                            cy={(gridSize - p.y) * cellSize}
                            r={6}
                            fill="hsl(150, 80%, 45%)"
                            stroke="white"
                            strokeWidth={2}
                        />
                        <text
                            x={p.x * cellSize + 10}
                            y={(gridSize - p.y) * cellSize - 8}
                            fill="hsl(150, 80%, 35%)"
                            fontSize="9"
                        >
                            ({p.x.toFixed(1)}, {p.y.toFixed(1)})
                        </text>
                    </g>
                ))}

                {/* Endpoints */}
                <circle
                    cx={p0.x * cellSize}
                    cy={(gridSize - p0.y) * cellSize}
                    r={8}
                    fill="hsl(220, 90%, 56%)"
                    stroke="white"
                    strokeWidth={2}
                />
                <circle
                    cx={p1.x * cellSize}
                    cy={(gridSize - p1.y) * cellSize}
                    r={8}
                    fill="hsl(280, 70%, 60%)"
                    stroke="white"
                    strokeWidth={2}
                />
            </svg>
            <p className="text-xs text-muted-foreground text-center">
                Continuous points along the line (decimal coordinates)
            </p>
        </div>
    );
}

// ── Step Visualization: Rounded to Grid ────────────────────────────────────

function RoundedPointsViz() {
    const N = useVar("numSteps", 5) as number;

    // Define endpoints
    const p0 = { x: 1, y: 1 };
    const p1 = { x: 8, y: 6 };

    // Calculate interpolated points and round them
    const points = [];
    const roundedSet = new Set<string>();
    for (let step = 0; step <= N; step++) {
        const t = N === 0 ? 0 : step / N;
        const x = p0.x + (p1.x - p0.x) * t;
        const y = p0.y + (p1.y - p0.y) * t;
        const rx = Math.round(x);
        const ry = Math.round(y);
        points.push({ x, y, rx, ry, t });
        roundedSet.add(`${rx},${ry}`);
    }

    const gridSize = 10;
    const cellSize = 36;
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <div className="flex flex-col items-center gap-3">
            <svg width={width} height={height} className="border border-border rounded-lg bg-card shadow-sm">
                {/* Grid with highlighted cells */}
                {Array.from({ length: gridSize }, (_, row) =>
                    Array.from({ length: gridSize }, (_, col) => {
                        const isHighlighted = roundedSet.has(`${col},${gridSize - 1 - row}`);
                        return (
                            <rect
                                key={`${col}-${row}`}
                                x={col * cellSize}
                                y={row * cellSize}
                                width={cellSize}
                                height={cellSize}
                                fill={isHighlighted ? "hsl(220, 90%, 85%)" : "transparent"}
                                stroke="hsl(220, 30%, 92%)"
                                strokeWidth={1}
                            />
                        );
                    })
                )}

                {/* True line */}
                <line
                    x1={p0.x * cellSize}
                    y1={(gridSize - p0.y) * cellSize}
                    x2={p1.x * cellSize}
                    y2={(gridSize - p1.y) * cellSize}
                    stroke="hsl(220, 30%, 70%)"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                />

                {/* Arrows from continuous to rounded */}
                {points.map((p, i) => (
                    <line
                        key={`arrow-${i}`}
                        x1={p.x * cellSize}
                        y1={(gridSize - p.y) * cellSize}
                        x2={(p.rx + 0.5) * cellSize}
                        y2={(gridSize - p.ry - 0.5) * cellSize}
                        stroke="hsl(40, 90%, 50%)"
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                        markerEnd="url(#arrowhead)"
                    />
                ))}

                {/* Arrow marker definition */}
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                    >
                        <polygon points="0 0, 6 3, 0 6" fill="hsl(40, 90%, 50%)" />
                    </marker>
                </defs>

                {/* Continuous points (smaller, faded) */}
                {points.map((p, i) => (
                    <circle
                        key={`cont-${i}`}
                        cx={p.x * cellSize}
                        cy={(gridSize - p.y) * cellSize}
                        r={4}
                        fill="hsl(150, 80%, 45%)"
                        opacity={0.5}
                    />
                ))}

                {/* Rounded points in cell centers */}
                {Array.from(roundedSet).map((key) => {
                    const [rx, ry] = key.split(',').map(Number);
                    return (
                        <circle
                            key={key}
                            cx={(rx + 0.5) * cellSize}
                            cy={(gridSize - ry - 0.5) * cellSize}
                            r={8}
                            fill="hsl(220, 90%, 56%)"
                            stroke="white"
                            strokeWidth={2}
                        />
                    );
                })}
            </svg>
            <p className="text-xs text-muted-foreground text-center">
                Points rounded to nearest grid cells (integers)
            </p>
        </div>
    );
}

// ── Step Visualization: Diagonal Distance ────────────────────────────────────

function DiagonalDistanceViz() {
    const p0 = { x: 1, y: 1 };
    const p1 = { x: 8, y: 6 };

    const dx = Math.abs(p1.x - p0.x);
    const dy = Math.abs(p1.y - p0.y);
    const N = Math.max(dx, dy);

    const gridSize = 10;
    const cellSize = 36;
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <div className="flex flex-col items-center gap-3">
            <svg width={width} height={height} className="border border-border rounded-lg bg-card shadow-sm">
                {/* Grid */}
                {Array.from({ length: gridSize + 1 }, (_, i) => (
                    <g key={i}>
                        <line
                            x1={i * cellSize}
                            y1={0}
                            x2={i * cellSize}
                            y2={height}
                            stroke="hsl(220, 30%, 92%)"
                            strokeWidth={1}
                        />
                        <line
                            x1={0}
                            y1={i * cellSize}
                            x2={width}
                            y2={i * cellSize}
                            stroke="hsl(220, 30%, 92%)"
                            strokeWidth={1}
                        />
                    </g>
                ))}

                {/* Horizontal distance (dx) */}
                <line
                    x1={p0.x * cellSize}
                    y1={(gridSize - p0.y) * cellSize + 20}
                    x2={p1.x * cellSize}
                    y2={(gridSize - p0.y) * cellSize + 20}
                    stroke="hsl(220, 90%, 56%)"
                    strokeWidth={3}
                />
                <text
                    x={(p0.x + p1.x) / 2 * cellSize}
                    y={(gridSize - p0.y) * cellSize + 40}
                    textAnchor="middle"
                    fill="hsl(220, 90%, 40%)"
                    fontSize="12"
                    fontWeight="600"
                >
                    dx = {dx}
                </text>

                {/* Vertical distance (dy) */}
                <line
                    x1={p1.x * cellSize + 20}
                    y1={(gridSize - p0.y) * cellSize}
                    x2={p1.x * cellSize + 20}
                    y2={(gridSize - p1.y) * cellSize}
                    stroke="hsl(280, 70%, 60%)"
                    strokeWidth={3}
                />
                <text
                    x={p1.x * cellSize + 40}
                    y={(gridSize - (p0.y + p1.y) / 2) * cellSize}
                    fill="hsl(280, 70%, 45%)"
                    fontSize="12"
                    fontWeight="600"
                >
                    dy = {dy}
                </text>

                {/* Endpoints */}
                <circle
                    cx={p0.x * cellSize}
                    cy={(gridSize - p0.y) * cellSize}
                    r={8}
                    fill="hsl(220, 90%, 56%)"
                    stroke="white"
                    strokeWidth={2}
                />
                <circle
                    cx={p1.x * cellSize}
                    cy={(gridSize - p1.y) * cellSize}
                    r={8}
                    fill="hsl(280, 70%, 60%)"
                    stroke="white"
                    strokeWidth={2}
                />

                {/* N = max label */}
                <text
                    x={width / 2}
                    y={30}
                    textAnchor="middle"
                    fill="hsl(150, 80%, 35%)"
                    fontSize="14"
                    fontWeight="600"
                >
                    N = max({dx}, {dy}) = {N}
                </text>
            </svg>
            <p className="text-xs text-muted-foreground text-center">
                We need {N + 1} points (N = {N} steps)
            </p>
        </div>
    );
}

// ── Exported Section Blocks ─────────────────────────────────────────────────────

export const lineDrawingDiscreteBlocks: ReactElement[] = [
    // ── Section Title ─────────────────────────────────────────────────────
    <StackLayout key="layout-discrete-title" maxWidth="xl">
        <Block id="block-discrete-title" padding="lg">
            <EditableH2 id="h2-discrete-title" blockId="block-discrete-title">
                From Continuous to Discrete
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-discrete-intro" maxWidth="xl">
        <Block id="block-discrete-intro" padding="sm">
            <EditableParagraph id="para-discrete-intro" blockId="block-discrete-intro">
                Now we know how to find any point along a line using lerp. But a grid only has
                whole-number coordinates — we can't color half a cell! Let's discover how to
                convert our smooth, continuous line into discrete grid cells.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Step-by-step explanation ─────────────────────────────────────────────
    <StackLayout key="layout-discrete-steps" maxWidth="xl">
        <StepLayout varName="discreteStep" revealLabel="Next Step" showProgress>
            {/* Step 1: The Problem */}
            <Step>
                <Block id="block-discrete-step1" padding="sm">
                    <EditableH2 id="h2-discrete-step1" blockId="block-discrete-step1">
                        Step 1: The Problem
                    </EditableH2>
                </Block>
                <Block id="block-discrete-step1-text" padding="sm">
                    <EditableParagraph id="para-discrete-step1" blockId="block-discrete-step1-text">
                        When we use lerp, we get points with decimal coordinates like (3.5, 2.7).
                        But grid cells only exist at whole numbers like (3, 2) or (4, 3). We need
                        a way to decide which cell each point belongs to.
                    </EditableParagraph>
                </Block>
            </Step>

            {/* Step 2: How Many Points? */}
            <Step>
                <Block id="block-discrete-step2" padding="sm">
                    <EditableH2 id="h2-discrete-step2" blockId="block-discrete-step2">
                        Step 2: How Many Points Do We Need?
                    </EditableH2>
                </Block>
                <Block id="block-discrete-step2-text" padding="sm">
                    <EditableParagraph id="para-discrete-step2" blockId="block-discrete-step2-text">
                        First, we need to figure out how many sample points to take. The answer
                        is the <strong>diagonal distance</strong>: the maximum of the horizontal
                        and vertical distances between our endpoints.
                    </EditableParagraph>
                </Block>
                <Block id="block-discrete-step2-formula" padding="sm">
                    <div className="bg-secondary/30 rounded-lg p-4 text-center">
                        <InlineFormula
                            latex="N = \max(|x_1 - x_0|, |y_1 - y_0|)"
                            colorMap={{ N: "#22c55e" }}
                        />
                    </div>
                </Block>
                <Block id="block-discrete-step2-viz" padding="md">
                    <DiagonalDistanceViz />
                </Block>
            </Step>

            {/* Step 3: Sample the Line */}
            <Step>
                <Block id="block-discrete-step3" padding="sm">
                    <EditableH2 id="h2-discrete-step3" blockId="block-discrete-step3">
                        Step 3: Sample the Line
                    </EditableH2>
                </Block>
                <Block id="block-discrete-step3-text" padding="sm">
                    <EditableParagraph id="para-discrete-step3" blockId="block-discrete-step3-text">
                        Now we use lerp to create N+1 evenly-spaced points along the line. Try
                        changing the number of steps:{" "}
                        <InlineScrubbleNumber
                            varName="numSteps"
                            {...numberPropsFromDefinition(getVariableInfo("numSteps"))}
                        />{" "}
                        to see how it affects the points.
                    </EditableParagraph>
                </Block>
                <Block id="block-discrete-step3-viz" padding="md">
                    <ContinuousPointsViz />
                </Block>
            </Step>

            {/* Step 4: Round to Grid */}
            <Step>
                <Block id="block-discrete-step4" padding="sm">
                    <EditableH2 id="h2-discrete-step4" blockId="block-discrete-step4">
                        Step 4: Round to Grid Cells
                    </EditableH2>
                </Block>
                <Block id="block-discrete-step4-text" padding="sm">
                    <EditableParagraph id="para-discrete-step4" blockId="block-discrete-step4-text">
                        Finally, we <strong>round</strong> each continuous point to its nearest
                        grid cell. This converts decimal coordinates to whole numbers. The orange
                        arrows below show each point snapping to its nearest cell:
                    </EditableParagraph>
                </Block>
                <Block id="block-discrete-step4-viz" padding="md">
                    <RoundedPointsViz />
                </Block>
            </Step>

            {/* Step 5: The Result */}
            <Step>
                <Block id="block-discrete-step5" padding="sm">
                    <EditableH2 id="h2-discrete-step5" blockId="block-discrete-step5">
                        That's It!
                    </EditableH2>
                </Block>
                <Block id="block-discrete-step5-text" padding="sm">
                    <EditableParagraph id="para-discrete-step5" blockId="block-discrete-step5-text">
                        And there we have it — a complete line drawing algorithm in three simple steps:
                    </EditableParagraph>
                </Block>
                <Block id="block-discrete-step5-summary" padding="sm">
                    <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                        <p className="text-foreground"><strong>1.</strong> Calculate N (diagonal distance)</p>
                        <p className="text-foreground"><strong>2.</strong> Create N+1 interpolation points using lerp</p>
                        <p className="text-foreground"><strong>3.</strong> Round each point to the nearest grid cell</p>
                    </div>
                </Block>
                <Block id="block-discrete-step5-next" padding="sm">
                    <EditableParagraph id="para-discrete-step5-next" blockId="block-discrete-step5-next">
                        In the next section, we'll put it all together into a complete working algorithm!
                    </EditableParagraph>
                </Block>
            </Step>
        </StepLayout>
    </StackLayout>,
];
