import { type ReactElement, useState, useCallback } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
} from "@/components/atoms";

// ── Interactive Grid Demo ────────────────────────────────────────────────────

interface Point {
    x: number;
    y: number;
}

/**
 * Interactive grid where users can click to set two endpoints
 * and see the line connecting them (as highlighted grid cells).
 */
function InteractiveGridDemo() {
    const gridSize = 12;
    const cellSize = 36;
    const [pointA, setPointA] = useState<Point>({ x: 2, y: 2 });
    const [pointB, setPointB] = useState<Point>({ x: 9, y: 8 });
    const [dragging, setDragging] = useState<'A' | 'B' | null>(null);

    // Calculate line cells using simple linear interpolation
    const getLineCells = useCallback((p0: Point, p1: Point): Point[] => {
        const cells: Point[] = [];
        const dx = Math.abs(p1.x - p0.x);
        const dy = Math.abs(p1.y - p0.y);
        const N = Math.max(dx, dy);

        for (let step = 0; step <= N; step++) {
            const t = N === 0 ? 0 : step / N;
            const x = Math.round(p0.x + (p1.x - p0.x) * t);
            const y = Math.round(p0.y + (p1.y - p0.y) * t);
            cells.push({ x, y });
        }
        return cells;
    }, []);

    const lineCells = getLineCells(pointA, pointB);
    const lineCellSet = new Set(lineCells.map(c => `${c.x},${c.y}`));

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
            setPointA({ x, y });
        } else if (dragging === 'B') {
            setPointB({ x, y });
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg
                width={width}
                height={height}
                className="border border-border rounded-lg bg-card shadow-sm cursor-crosshair select-none"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Grid cells */}
                {Array.from({ length: gridSize }, (_, y) =>
                    Array.from({ length: gridSize }, (_, x) => {
                        const isLineCell = lineCellSet.has(`${x},${y}`);
                        const isPointA = x === pointA.x && y === pointA.y;
                        const isPointB = x === pointB.x && y === pointB.y;

                        return (
                            <rect
                                key={`${x}-${y}`}
                                x={x * cellSize}
                                y={y * cellSize}
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
                                className="transition-colors duration-100"
                                onMouseDown={() => handleMouseDown(x, y)}
                                onMouseMove={() => handleMouseMove(x, y)}
                            />
                        );
                    })
                )}

                {/* True line overlay */}
                <line
                    x1={pointA.x * cellSize + cellSize / 2}
                    y1={pointA.y * cellSize + cellSize / 2}
                    x2={pointB.x * cellSize + cellSize / 2}
                    y2={pointB.y * cellSize + cellSize / 2}
                    stroke="hsl(220, 90%, 40%)"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    opacity={0.6}
                    pointerEvents="none"
                />

                {/* Endpoint markers */}
                <circle
                    cx={pointA.x * cellSize + cellSize / 2}
                    cy={pointA.y * cellSize + cellSize / 2}
                    r={8}
                    fill="hsl(220, 90%, 56%)"
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-grab"
                    onMouseDown={() => setDragging('A')}
                />
                <circle
                    cx={pointB.x * cellSize + cellSize / 2}
                    cy={pointB.y * cellSize + cellSize / 2}
                    r={8}
                    fill="hsl(280, 70%, 60%)"
                    stroke="white"
                    strokeWidth={2}
                    className="cursor-grab"
                    onMouseDown={() => setDragging('B')}
                />

                {/* Labels */}
                <text
                    x={pointA.x * cellSize + cellSize / 2}
                    y={pointA.y * cellSize + cellSize / 2 - 14}
                    textAnchor="middle"
                    fill="hsl(220, 90%, 40%)"
                    fontSize="12"
                    fontWeight="600"
                >
                    A ({pointA.x}, {pointA.y})
                </text>
                <text
                    x={pointB.x * cellSize + cellSize / 2}
                    y={pointB.y * cellSize + cellSize / 2 - 14}
                    textAnchor="middle"
                    fill="hsl(280, 70%, 45%)"
                    fontSize="12"
                    fontWeight="600"
                >
                    B ({pointB.x}, {pointB.y})
                </text>
            </svg>

            <p className="text-sm text-muted-foreground text-center max-w-md">
                Drag the endpoints A and B to see how the line is drawn on the grid.
                The highlighted cells show which grid squares the line passes through.
            </p>
        </div>
    );
}

// ── Exported Section Blocks ─────────────────────────────────────────────────────

export const lineDrawingIntroBlocks: ReactElement[] = [
    // ── Title ─────────────────────────────────────────────────────────────
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="block-intro-title" padding="lg">
            <EditableH1 id="h1-intro-title" blockId="block-intro-title">
                Line Drawing on a Grid
            </EditableH1>
        </Block>
    </StackLayout>,

    // ── Introduction text ─────────────────────────────────────────────────
    <StackLayout key="layout-intro-text" maxWidth="xl">
        <Block id="block-intro-text" padding="sm">
            <EditableParagraph id="para-intro-text" blockId="block-intro-text">
                How do computers draw straight lines? On a screen made of tiny squares (pixels),
                drawing a perfectly smooth line isn't straightforward. We need to decide which
                squares to color to create the illusion of a continuous line.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Why it matters ─────────────────────────────────────────────────────
    <StackLayout key="layout-intro-why" maxWidth="xl">
        <Block id="block-intro-why" padding="sm">
            <EditableH2 id="h2-intro-why" blockId="block-intro-why">
                Why Does This Matter?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-uses" maxWidth="xl">
        <Block id="block-intro-uses" padding="sm">
            <EditableParagraph id="para-intro-uses" blockId="block-intro-uses">
                Line drawing algorithms are everywhere! They're used in video games for drawing
                projectile paths, in graphics software for rendering shapes, and in mapping
                applications for calculating routes. Understanding how to draw lines on grids
                also helps us think about the relationship between continuous mathematics and
                discrete computation.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Interactive demo ─────────────────────────────────────────────────────
    <StackLayout key="layout-intro-demo-title" maxWidth="xl">
        <Block id="block-intro-demo-title" padding="sm">
            <EditableH2 id="h2-intro-demo-title" blockId="block-intro-demo-title">
                Try It Yourself
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-demo-text" maxWidth="xl">
        <Block id="block-intro-demo-text" padding="sm">
            <EditableParagraph id="para-intro-demo-text" blockId="block-intro-demo-text">
                Below is an interactive grid. Drag the two endpoints to see which grid cells
                are selected to represent the line. Notice how the algorithm chooses cells
                that best approximate a straight line between the points.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-demo" maxWidth="xl">
        <Block id="block-intro-demo" padding="md">
            <InteractiveGridDemo />
        </Block>
    </StackLayout>,

    // ── The challenge ─────────────────────────────────────────────────────
    <StackLayout key="layout-intro-challenge" maxWidth="xl">
        <Block id="block-intro-challenge" padding="sm">
            <EditableH2 id="h2-intro-challenge" blockId="block-intro-challenge">
                The Challenge
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-challenge-text" maxWidth="xl">
        <Block id="block-intro-challenge-text" padding="sm">
            <EditableParagraph id="para-intro-challenge-text" blockId="block-intro-challenge-text">
                The key question is: given two points on a grid, how do we determine which
                cells should be filled in? In the next section, we'll explore a simple and
                elegant solution using linear interpolation.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
