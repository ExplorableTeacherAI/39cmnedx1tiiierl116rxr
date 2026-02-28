import { type ReactElement, useState } from "react";
import { StackLayout, GridLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
} from "@/components/atoms";

// ── Shared Types and Utilities ────────────────────────────────────────────────

interface Point {
    x: number;
    y: number;
}

// Fixed line endpoints for comparison
const p0: Point = { x: 1, y: 1 };
const p1: Point = { x: 7, y: 5 };

// ── Basic Line (Our Algorithm) ────────────────────────────────────────────────

function BasicLineViz() {
    const gridSize = 9;
    const cellSize = 28;

    // Our algorithm
    const dx = Math.abs(p1.x - p0.x);
    const dy = Math.abs(p1.y - p0.y);
    const N = Math.max(dx, dy);

    const cells: Point[] = [];
    const seen = new Set<string>();

    for (let step = 0; step <= N; step++) {
        const t = N === 0 ? 0 : step / N;
        const x = Math.round(p0.x + (p1.x - p0.x) * t);
        const y = Math.round(p0.y + (p1.y - p0.y) * t);
        const key = `${x},${y}`;
        if (!seen.has(key)) {
            seen.add(key);
            cells.push({ x, y });
        }
    }

    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <svg width={width} height={height} className="border border-border rounded-lg bg-card">
            {Array.from({ length: gridSize }, (_, row) =>
                Array.from({ length: gridSize }, (_, col) => {
                    const isCell = cellSet.has(`${col},${gridSize - 1 - row}`);
                    return (
                        <rect
                            key={`${col}-${row}`}
                            x={col * cellSize}
                            y={row * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={isCell ? "hsl(220, 90%, 75%)" : "transparent"}
                            stroke="hsl(220, 30%, 90%)"
                            strokeWidth={1}
                        />
                    );
                })
            )}
            <line
                x1={p0.x * cellSize + cellSize / 2}
                y1={(gridSize - 1 - p0.y) * cellSize + cellSize / 2}
                x2={p1.x * cellSize + cellSize / 2}
                y2={(gridSize - 1 - p1.y) * cellSize + cellSize / 2}
                stroke="hsl(220, 90%, 40%)"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
            />
            <circle cx={p0.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p0.y) * cellSize + cellSize / 2} r={6} fill="hsl(220, 90%, 56%)" stroke="white" strokeWidth={2} />
            <circle cx={p1.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p1.y) * cellSize + cellSize / 2} r={6} fill="hsl(280, 70%, 60%)" stroke="white" strokeWidth={2} />
        </svg>
    );
}

// ── Supercover Line ────────────────────────────────────────────────────────

function SupercoverLineViz() {
    const gridSize = 9;
    const cellSize = 28;

    // Supercover algorithm: include ALL cells the line touches
    const cells: Point[] = [];
    const seen = new Set<string>();

    // More granular sampling to catch all cells
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 10;

    for (let step = 0; step <= steps; step++) {
        const t = steps === 0 ? 0 : step / steps;
        const x = p0.x + dx * t;
        const y = p0.y + dy * t;

        // Add both floor and ceil for cells the line passes through
        const fx = Math.floor(x);
        const cx = Math.ceil(x);
        const fy = Math.floor(y);
        const cy = Math.ceil(y);

        for (const px of [fx, cx]) {
            for (const py of [fy, cy]) {
                if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
                    const key = `${px},${py}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        cells.push({ x: px, y: py });
                    }
                }
            }
        }
    }

    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <svg width={width} height={height} className="border border-border rounded-lg bg-card">
            {Array.from({ length: gridSize }, (_, row) =>
                Array.from({ length: gridSize }, (_, col) => {
                    const isCell = cellSet.has(`${col},${gridSize - 1 - row}`);
                    return (
                        <rect
                            key={`${col}-${row}`}
                            x={col * cellSize}
                            y={row * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={isCell ? "hsl(150, 70%, 75%)" : "transparent"}
                            stroke="hsl(220, 30%, 90%)"
                            strokeWidth={1}
                        />
                    );
                })
            )}
            <line
                x1={p0.x * cellSize + cellSize / 2}
                y1={(gridSize - 1 - p0.y) * cellSize + cellSize / 2}
                x2={p1.x * cellSize + cellSize / 2}
                y2={(gridSize - 1 - p1.y) * cellSize + cellSize / 2}
                stroke="hsl(150, 70%, 35%)"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
            />
            <circle cx={p0.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p0.y) * cellSize + cellSize / 2} r={6} fill="hsl(220, 90%, 56%)" stroke="white" strokeWidth={2} />
            <circle cx={p1.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p1.y) * cellSize + cellSize / 2} r={6} fill="hsl(280, 70%, 60%)" stroke="white" strokeWidth={2} />
        </svg>
    );
}

// ── Orthogonal Steps (Grid Walking) ────────────────────────────────────────

function OrthogonalLineViz() {
    const gridSize = 9;
    const cellSize = 28;

    // Grid walking: only horizontal and vertical steps
    const cells: Point[] = [{ x: p0.x, y: p0.y }];
    let cx = p0.x;
    let cy = p0.y;

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const sx = dx > 0 ? 1 : -1;
    const sy = dy > 0 ? 1 : -1;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    // Modified Bresenham-style stepping (orthogonal only)
    let err = adx - ady;

    while (cx !== p1.x || cy !== p1.y) {
        const e2 = 2 * err;
        if (e2 > -ady && cx !== p1.x) {
            err -= ady;
            cx += sx;
            cells.push({ x: cx, y: cy });
        }
        if (e2 < adx && cy !== p1.y) {
            err += adx;
            cy += sy;
            cells.push({ x: cx, y: cy });
        }
    }

    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));
    const width = gridSize * cellSize;
    const height = gridSize * cellSize;

    return (
        <svg width={width} height={height} className="border border-border rounded-lg bg-card">
            {Array.from({ length: gridSize }, (_, row) =>
                Array.from({ length: gridSize }, (_, col) => {
                    const isCell = cellSet.has(`${col},${gridSize - 1 - row}`);
                    return (
                        <rect
                            key={`${col}-${row}`}
                            x={col * cellSize}
                            y={row * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={isCell ? "hsl(280, 70%, 80%)" : "transparent"}
                            stroke="hsl(220, 30%, 90%)"
                            strokeWidth={1}
                        />
                    );
                })
            )}
            {/* Draw path lines connecting cell centers */}
            {cells.slice(1).map((cell, i) => (
                <line
                    key={i}
                    x1={cells[i].x * cellSize + cellSize / 2}
                    y1={(gridSize - 1 - cells[i].y) * cellSize + cellSize / 2}
                    x2={cell.x * cellSize + cellSize / 2}
                    y2={(gridSize - 1 - cell.y) * cellSize + cellSize / 2}
                    stroke="hsl(280, 70%, 50%)"
                    strokeWidth={2}
                    opacity={0.6}
                />
            ))}
            <circle cx={p0.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p0.y) * cellSize + cellSize / 2} r={6} fill="hsl(220, 90%, 56%)" stroke="white" strokeWidth={2} />
            <circle cx={p1.x * cellSize + cellSize / 2} cy={(gridSize - 1 - p1.y) * cellSize + cellSize / 2} r={6} fill="hsl(280, 70%, 60%)" stroke="white" strokeWidth={2} />
        </svg>
    );
}

// ── Interactive Comparison ────────────────────────────────────────────────

function ComparisonCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-secondary/20 rounded-xl">
            <h4 className="font-semibold text-foreground text-center">{title}</h4>
            <div className="flex justify-center">{children}</div>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">{description}</p>
        </div>
    );
}

// ── Exported Section Blocks ─────────────────────────────────────────────────────

export const lineDrawingVariationsBlocks: ReactElement[] = [
    // ── Section Title ─────────────────────────────────────────────────────
    <StackLayout key="layout-var-title" maxWidth="xl">
        <Block id="block-var-title" padding="lg">
            <EditableH2 id="h2-var-title" blockId="block-var-title">
                Variations & Extensions
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-var-intro" maxWidth="xl">
        <Block id="block-var-intro" padding="sm">
            <EditableParagraph id="para-var-intro" blockId="block-var-intro">
                The interpolation algorithm we learned is just one approach. Depending on your
                needs, there are other ways to draw lines on grids. Here are three common
                variations compared side by side:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Grid Comparison ─────────────────────────────────────────────────────
    <StackLayout key="layout-var-grid" maxWidth="xl">
        <GridLayout columns={3} gap="md">
            <Block id="block-var-basic" padding="none">
                <ComparisonCard
                    title="Basic Line"
                    description="Our algorithm: interpolate and round. Clean, simple path from A to B."
                >
                    <BasicLineViz />
                </ComparisonCard>
            </Block>

            <Block id="block-var-supercover" padding="none">
                <ComparisonCard
                    title="Supercover Line"
                    description="Includes ALL cells the mathematical line touches. Good for collision detection."
                >
                    <SupercoverLineViz />
                </ComparisonCard>
            </Block>

            <Block id="block-var-orthogonal" padding="none">
                <ComparisonCard
                    title="Grid Walking"
                    description="Only horizontal and vertical steps. No diagonals. Used in some pathfinding."
                >
                    <OrthogonalLineViz />
                </ComparisonCard>
            </Block>
        </GridLayout>
    </StackLayout>,

    // ── When to use each ─────────────────────────────────────────────────────
    <StackLayout key="layout-var-when-title" maxWidth="xl">
        <Block id="block-var-when-title" padding="sm">
            <EditableH2 id="h2-var-when" blockId="block-var-when-title">
                When to Use Each Variation
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-var-when" maxWidth="xl">
        <Block id="block-var-when" padding="sm">
            <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <EditableH3 id="h3-var-basic" blockId="block-var-when">Basic Line (Interpolation)</EditableH3>
                    <EditableParagraph id="para-var-basic" blockId="block-var-when">
                        Best for: Drawing graphics, rendering shapes, simple path visualization.
                        This is the most common choice for general-purpose line drawing.
                    </EditableParagraph>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <EditableH3 id="h3-var-supercover" blockId="block-var-when">Supercover Line</EditableH3>
                    <EditableParagraph id="para-var-supercover" blockId="block-var-when">
                        Best for: Collision detection, line-of-sight calculations, raycasting.
                        Use when you need to know EVERY cell a line passes through.
                    </EditableParagraph>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                    <EditableH3 id="h3-var-orthogonal" blockId="block-var-when">Grid Walking (Orthogonal)</EditableH3>
                    <EditableParagraph id="para-var-orthogonal" blockId="block-var-when">
                        Best for: Pathfinding in games with 4-directional movement, maze navigation.
                        Use when diagonal movement isn't allowed.
                    </EditableParagraph>
                </div>
            </div>
        </Block>
    </StackLayout>,

    // ── Conclusion ─────────────────────────────────────────────────────
    <StackLayout key="layout-var-conclusion-title" maxWidth="xl">
        <Block id="block-var-conclusion-title" padding="sm">
            <EditableH2 id="h2-var-conclusion" blockId="block-var-conclusion-title">
                What You've Learned
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-var-conclusion" maxWidth="xl">
        <Block id="block-var-conclusion" padding="sm">
            <EditableParagraph id="para-var-conclusion" blockId="block-var-conclusion">
                Congratulations! You now understand how computers draw lines on grids. You've
                learned about linear interpolation, converting continuous coordinates to discrete
                cells, and seen different variations for different use cases. These fundamentals
                appear everywhere — from simple graphics to complex game engines.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-var-next" maxWidth="xl">
        <Block id="block-var-next" padding="md">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 text-center">
                <EditableParagraph id="para-var-next" blockId="block-var-next">
                    <strong>Want to explore more?</strong> Try implementing these algorithms yourself,
                    or explore topics like anti-aliasing (smoother lines) and 3D line drawing!
                </EditableParagraph>
            </div>
        </Block>
    </StackLayout>,
];
