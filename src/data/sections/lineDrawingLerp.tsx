import { type ReactElement } from "react";
import { StackLayout, SplitLayout } from "@/components/layouts";
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

// ── Interactive Lerp Demo ────────────────────────────────────────────────────

/**
 * Visual demonstration of linear interpolation between two points.
 * Shows how t parameter controls the position along the line.
 */
function LerpVisualization() {
    const t = useVar("lerpT", 0.5) as number;

    // Define our two points
    const p0 = { x: 50, y: 250 };
    const p1 = { x: 350, y: 80 };

    // Calculate interpolated point
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const px = lerp(p0.x, p1.x, t);
    const py = lerp(p0.y, p1.y, t);

    const width = 400;
    const height = 300;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg
                width={width}
                height={height}
                className="border border-border rounded-lg bg-card shadow-sm"
            >
                {/* Background grid */}
                {Array.from({ length: 9 }, (_, i) => (
                    <line
                        key={`v${i}`}
                        x1={i * 50}
                        y1={0}
                        x2={i * 50}
                        y2={height}
                        stroke="hsl(220, 30%, 92%)"
                        strokeWidth={1}
                    />
                ))}
                {Array.from({ length: 7 }, (_, i) => (
                    <line
                        key={`h${i}`}
                        x1={0}
                        y1={i * 50}
                        x2={width}
                        y2={i * 50}
                        stroke="hsl(220, 30%, 92%)"
                        strokeWidth={1}
                    />
                ))}

                {/* Line between points */}
                <line
                    x1={p0.x}
                    y1={p0.y}
                    x2={p1.x}
                    y2={p1.y}
                    stroke="hsl(220, 30%, 70%)"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                />

                {/* Filled portion of line (from p0 to current point) */}
                <line
                    x1={p0.x}
                    y1={p0.y}
                    x2={px}
                    y2={py}
                    stroke="hsl(220, 90%, 56%)"
                    strokeWidth={3}
                />

                {/* Point A (start) */}
                <circle
                    cx={p0.x}
                    cy={p0.y}
                    r={10}
                    fill="hsl(220, 90%, 56%)"
                    stroke="white"
                    strokeWidth={2}
                />
                <text
                    x={p0.x - 25}
                    y={p0.y + 5}
                    fill="hsl(220, 90%, 40%)"
                    fontSize="14"
                    fontWeight="600"
                >
                    A
                </text>

                {/* Point B (end) */}
                <circle
                    cx={p1.x}
                    cy={p1.y}
                    r={10}
                    fill="hsl(280, 70%, 60%)"
                    stroke="white"
                    strokeWidth={2}
                />
                <text
                    x={p1.x + 15}
                    y={p1.y + 5}
                    fill="hsl(280, 70%, 45%)"
                    fontSize="14"
                    fontWeight="600"
                >
                    B
                </text>

                {/* Current interpolated point */}
                <circle
                    cx={px}
                    cy={py}
                    r={12}
                    fill="hsl(150, 80%, 45%)"
                    stroke="white"
                    strokeWidth={3}
                />

                {/* t value display */}
                <text
                    x={px}
                    y={py - 20}
                    textAnchor="middle"
                    fill="hsl(150, 80%, 35%)"
                    fontSize="13"
                    fontWeight="600"
                >
                    t = {t.toFixed(2)}
                </text>

                {/* Progress bar at bottom */}
                <rect
                    x={30}
                    y={height - 25}
                    width={width - 60}
                    height={8}
                    rx={4}
                    fill="hsl(220, 30%, 90%)"
                />
                <rect
                    x={30}
                    y={height - 25}
                    width={(width - 60) * t}
                    height={8}
                    rx={4}
                    fill="hsl(220, 90%, 56%)"
                />

                {/* Labels on progress bar */}
                <text
                    x={30}
                    y={height - 30}
                    fill="hsl(220, 30%, 50%)"
                    fontSize="11"
                >
                    t = 0
                </text>
                <text
                    x={width - 50}
                    y={height - 30}
                    fill="hsl(220, 30%, 50%)"
                    fontSize="11"
                >
                    t = 1
                </text>
            </svg>
        </div>
    );
}

/**
 * Visual showing how lerp works on a single number line
 */
function NumberLineLerp() {
    const t = useVar("lerpT", 0.5) as number;

    const a = 2;
    const b = 8;
    const result = a + (b - a) * t;

    const width = 380;
    const height = 80;
    const lineY = 40;
    const startX = 30;
    const endX = width - 30;
    const scale = (endX - startX) / 10; // 0-10 number line

    const aX = startX + a * scale;
    const bX = startX + b * scale;
    const resultX = startX + result * scale;

    return (
        <svg width={width} height={height} className="mx-auto">
            {/* Number line */}
            <line
                x1={startX}
                y1={lineY}
                x2={endX}
                y2={lineY}
                stroke="hsl(220, 30%, 80%)"
                strokeWidth={2}
            />

            {/* Tick marks */}
            {Array.from({ length: 11 }, (_, i) => (
                <g key={i}>
                    <line
                        x1={startX + i * scale}
                        y1={lineY - 5}
                        x2={startX + i * scale}
                        y2={lineY + 5}
                        stroke="hsl(220, 30%, 70%)"
                        strokeWidth={1}
                    />
                    <text
                        x={startX + i * scale}
                        y={lineY + 20}
                        textAnchor="middle"
                        fill="hsl(220, 30%, 50%)"
                        fontSize="10"
                    >
                        {i}
                    </text>
                </g>
            ))}

            {/* Point a */}
            <circle cx={aX} cy={lineY} r={6} fill="hsl(220, 90%, 56%)" />
            <text x={aX} y={lineY - 12} textAnchor="middle" fill="hsl(220, 90%, 40%)" fontSize="12" fontWeight="600">
                a = {a}
            </text>

            {/* Point b */}
            <circle cx={bX} cy={lineY} r={6} fill="hsl(280, 70%, 60%)" />
            <text x={bX} y={lineY - 12} textAnchor="middle" fill="hsl(280, 70%, 45%)" fontSize="12" fontWeight="600">
                b = {b}
            </text>

            {/* Result point */}
            <circle cx={resultX} cy={lineY} r={8} fill="hsl(150, 80%, 45%)" stroke="white" strokeWidth={2} />
            <text x={resultX} y={lineY - 15} textAnchor="middle" fill="hsl(150, 80%, 35%)" fontSize="11" fontWeight="600">
                {result.toFixed(1)}
            </text>
        </svg>
    );
}

// ── Exported Section Blocks ─────────────────────────────────────────────────────

export const lineDrawingLerpBlocks: ReactElement[] = [
    // ── Section Title ─────────────────────────────────────────────────────
    <StackLayout key="layout-lerp-title" maxWidth="xl">
        <Block id="block-lerp-title" padding="lg">
            <EditableH2 id="h2-lerp-title" blockId="block-lerp-title">
                The Secret Ingredient: Linear Interpolation
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-intro" maxWidth="xl">
        <Block id="block-lerp-intro" padding="sm">
            <EditableParagraph id="para-lerp-intro" blockId="block-lerp-intro">
                Before we draw lines on a grid, we need to understand a powerful concept called
                <strong> linear interpolation</strong>, often called "lerp" for short. It's a simple
                way to find any point along a line between two endpoints.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // ── Split: Explanation + Visualization ─────────────────────────────────
    <SplitLayout key="layout-lerp-main" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="block-lerp-formula" padding="sm">
                <EditableParagraph id="para-lerp-formula" blockId="block-lerp-formula">
                    The lerp formula is beautifully simple. To find a point between{" "}
                    <InlineFormula latex="a" colorMap={{ a: "#3b82f6" }} /> and{" "}
                    <InlineFormula latex="b" colorMap={{ b: "#a855f7" }} />, we use:
                </EditableParagraph>
            </Block>

            <Block id="block-lerp-equation" padding="sm">
                <div className="bg-secondary/30 rounded-lg p-4 text-center">
                    <InlineFormula
                        latex="\text{lerp}(a, b, t) = a + (b - a) \cdot t"
                        colorMap={{ a: "#3b82f6", b: "#a855f7", t: "#22c55e" }}
                    />
                </div>
            </Block>

            <Block id="block-lerp-explain-t" padding="sm">
                <EditableParagraph id="para-lerp-explain-t" blockId="block-lerp-explain-t">
                    The parameter{" "}
                    <InlineFormula latex="t" colorMap={{ t: "#22c55e" }} />{" "}
                    controls where we are along the line. When{" "}
                    <InlineFormula latex="t = 0" colorMap={{ t: "#22c55e" }} />, we're at point A.
                    When{" "}
                    <InlineFormula latex="t = 1" colorMap={{ t: "#22c55e" }} />, we're at point B.
                    For any value in between, we get a point along the line!
                </EditableParagraph>
            </Block>

            <Block id="block-lerp-scrubber" padding="sm">
                <EditableParagraph id="para-lerp-scrubber" blockId="block-lerp-scrubber">
                    Try changing t ={" "}
                    <InlineScrubbleNumber
                        varName="lerpT"
                        {...numberPropsFromDefinition(getVariableInfo("lerpT"))}
                        formatValue={(v) => v.toFixed(2)}
                    />{" "}
                    and watch the green point move between A and B. The formula gives us
                    a smooth, continuous path from start to finish.
                </EditableParagraph>
            </Block>
        </div>

        <Block id="block-lerp-viz" padding="sm">
            <LerpVisualization />
        </Block>
    </SplitLayout>,

    // ── Number line example ─────────────────────────────────────────────────
    <StackLayout key="layout-lerp-numberline-title" maxWidth="xl">
        <Block id="block-lerp-numberline-title" padding="sm">
            <EditableH2 id="h2-lerp-numberline" blockId="block-lerp-numberline-title">
                Lerp on a Number Line
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-numberline-text" maxWidth="xl">
        <Block id="block-lerp-numberline-text" padding="sm">
            <EditableParagraph id="para-lerp-numberline" blockId="block-lerp-numberline-text">
                Let's see lerp in action with simple numbers. If a = 2 and b = 8, the
                formula finds any point between them. Watch the green marker as you change t above:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-numberline-viz" maxWidth="xl">
        <Block id="block-lerp-numberline-viz" padding="md">
            <NumberLineLerp />
        </Block>
    </StackLayout>,

    // ── Extending to 2D ─────────────────────────────────────────────────────
    <StackLayout key="layout-lerp-2d-title" maxWidth="xl">
        <Block id="block-lerp-2d-title" padding="sm">
            <EditableH2 id="h2-lerp-2d" blockId="block-lerp-2d-title">
                Extending to 2D Points
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-2d-text" maxWidth="xl">
        <Block id="block-lerp-2d-text" padding="sm">
            <EditableParagraph id="para-lerp-2d" blockId="block-lerp-2d-text">
                The magic of lerp is that it works on anything — numbers, points, even colors!
                For 2D points, we simply apply lerp to both the x and y coordinates separately:
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-2d-formula" maxWidth="xl">
        <Block id="block-lerp-2d-formula" padding="sm">
            <div className="bg-secondary/30 rounded-lg p-4 text-center space-y-2">
                <InlineFormula
                    latex="x = x_0 + (x_1 - x_0) \cdot t"
                    colorMap={{ x: "#22c55e", t: "#22c55e" }}
                />
                <br />
                <InlineFormula
                    latex="y = y_0 + (y_1 - y_0) \cdot t"
                    colorMap={{ y: "#22c55e", t: "#22c55e" }}
                />
            </div>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-lerp-next" maxWidth="xl">
        <Block id="block-lerp-next" padding="sm">
            <EditableParagraph id="para-lerp-next" blockId="block-lerp-next">
                Now we have a way to find any point along a line. But how do we go from this
                continuous line to discrete grid cells? That's what we'll explore next!
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
