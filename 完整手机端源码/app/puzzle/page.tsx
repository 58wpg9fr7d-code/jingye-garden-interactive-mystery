"use client";

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import "./puzzle.css";

type Vec3 = { x: number; y: number; z: number };
type EdgeKind = "vector" | "noise" | "die" | "pip" | "torn";
type Edge = { a: number; b: number; weight: number; primary: boolean; kind: EdgeKind; dashed?: boolean; targetIndex?: number };

const targets = [
  { pitch: 0, yaw: 0, roll: 18 * Math.PI / 180, digit: "4" },
  { pitch: 0, yaw: 90 * Math.PI / 180, roll: -27 * Math.PI / 180, digit: "8" },
  { pitch: -90 * Math.PI / 180, yaw: 0, roll: 36 * Math.PI / 180, digit: "6" },
  { pitch: 0, yaw: -90 * Math.PI / 180, roll: 11 * Math.PI / 180, digit: "6" },
  { pitch: 90 * Math.PI / 180, yaw: 0, roll: -32 * Math.PI / 180, digit: "8" },
];

const segmentPatterns: Record<string, string[]> = {
  "4": ["f", "g", "b", "c"],
  "8": ["a", "b", "c", "d", "e", "f", "g"],
  "6": ["a", "f", "g", "e", "d", "c"],
};

const segmentPositions: Record<string, [number, number, number, number]> = {
  a: [-0.55, -0.88, 0.55, -0.88],
  g: [-0.55, 0, 0.55, 0],
  d: [-0.55, 0.88, 0.55, 0.88],
  f: [-0.66, -0.78, -0.66, -0.08],
  b: [0.66, -0.78, 0.66, -0.08],
  e: [-0.66, 0.08, -0.66, 0.78],
  c: [0.66, 0.08, 0.66, 0.78],
};

function pseudo(index: number) {
  const value = Math.sin(index * 91.73 + 17.11) * 43758.5453;
  return value - Math.floor(value);
}

function buildModel() {
  const points: Vec3[] = [];
  const edges: Edge[] = [];

  const addEdge = (a: Vec3, b: Vec3, kind: EdgeKind, weight = 1, primary = false, targetIndex?: number) => {
    const aIndex = points.push(a) - 1;
    const bIndex = points.push(b) - 1;
    edges.push({ a: aIndex, b: bIndex, kind, weight, primary, targetIndex });
  };

  targets.forEach((target, faceIndex) => {
    segmentPatterns[target.digit].forEach((segment, segmentIndex) => {
      const [x1, y1, x2, y2] = segmentPositions[segment];
      const intervals = [[0, 0.18], [0.27, 0.66], [0.76, 1]];
      intervals.forEach(([from, to], fragmentIndex) => {
        const lengthShift = (pseudo(faceIndex * 73 + segmentIndex * 19 + fragmentIndex * 11) - 0.5) * 0.14;
        const variedTo = Math.max(from + 0.1, Math.min(1, to + lengthShift));
        const seed = faceIndex * 101 + segmentIndex * 17 + fragmentIndex * 7;
        const localA = {
          x: x1 + (x2 - x1) * from + (pseudo(seed + 701) - 0.5) * 0.055,
          y: y1 + (y2 - y1) * from + (pseudo(seed + 733) - 0.5) * 0.07,
          z: -1.15 + pseudo(seed + 311) * 2.3,
        };
        const localB = {
          x: x1 + (x2 - x1) * variedTo + (pseudo(seed + 769) - 0.5) * 0.055,
          y: y1 + (y2 - y1) * variedTo + (pseudo(seed + 797) - 0.5) * 0.07,
          z: -1.15 + pseudo(seed + 487) * 2.3,
        };
        const a = inverseRotate(localA, target.pitch, target.yaw, target.roll);
        const b = inverseRotate(localB, target.pitch, target.yaw, target.roll);
        const aIndex = points.push(a) - 1;
        const bIndex = points.push(b) - 1;
        edges.push({
          a: aIndex,
          b: bIndex,
          weight: 0.72 + ((segmentIndex + fragmentIndex + faceIndex) % 3) * 0.12,
          primary: true,
          kind: "vector",
          dashed: pseudo(seed + 601) > 0.68,
          targetIndex: faceIndex,
        });
      });
    });
  });

  const primaryEdgeCount = edges.length;
  for (let index = 0; index < 260; index += 1) {
    const a = Math.floor(pseudo(index + 53) * points.length);
    const denseBundle = index < 178;
    const jump = denseBundle
      ? 1 + Math.floor(pseudo(index + 71) * 8)
      : 18 + Math.floor(pseudo(index + 71) * 58);
    const b = (a + jump) % points.length;
    edges.push({
      a,
      b,
      weight: denseBundle ? 0.1 + pseudo(index + 89) * 0.24 : 0.06 + pseudo(index + 89) * 0.12,
      primary: false,
      kind: "noise",
    });
  }

  // The die is not a separate diagram: five hinged faces are embedded in the
  // same fixed sculpture. Their different dihedral angles keep it half-open.
  const s = 0.62;
  const dieOffsetX = 3.35;
  const makeFace = (corners: [Vec3, Vec3, Vec3, Vec3], pipCount: number, colorIndex: number) => {
    for (let index = 0; index < 4; index += 1) {
      addEdge(corners[index], corners[(index + 1) % 4], "die", 1.25);
    }
    addEdge(corners[0], corners[2], "die", 0.28);
    const pipMap: Record<number, [number, number][]> = {
      1: [[0.5, 0.5]],
      2: [[0.28, 0.28], [0.72, 0.72]],
      3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
      4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
      5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    };
    const interpolate = (u: number, v: number) => ({
      x: corners[0].x * (1 - u) * (1 - v) + corners[1].x * u * (1 - v) + corners[2].x * u * v + corners[3].x * (1 - u) * v,
      y: corners[0].y * (1 - u) * (1 - v) + corners[1].y * u * (1 - v) + corners[2].y * u * v + corners[3].y * (1 - u) * v,
      z: corners[0].z * (1 - u) * (1 - v) + corners[1].z * u * (1 - v) + corners[2].z * u * v + corners[3].z * (1 - u) * v,
    });
    pipMap[pipCount].forEach(([u, v]) => {
      const p = interpolate(u, v);
      const du = interpolate(u + 0.075, v);
      const dv = interpolate(u, v + 0.075);
      const uVector = { x: du.x - p.x, y: du.y - p.y, z: du.z - p.z };
      const vVector = { x: dv.x - p.x, y: dv.y - p.y, z: dv.z - p.z };
      addEdge(
        { x: p.x - uVector.x, y: p.y - uVector.y, z: p.z - uVector.z },
        { x: p.x + uVector.x, y: p.y + uVector.y, z: p.z + uVector.z },
        "pip", 1.1, false, colorIndex,
      );
      addEdge(
        { x: p.x - vVector.x, y: p.y - vVector.y, z: p.z - vVector.z },
        { x: p.x + vVector.x, y: p.y + vVector.y, z: p.z + vVector.z },
        "pip", 1.1, false, colorIndex,
      );
    });
  };

  const center: [Vec3, Vec3, Vec3, Vec3] = [
    { x: dieOffsetX - s, y: -s, z: 0 }, { x: dieOffsetX + s, y: -s, z: 0 },
    { x: dieOffsetX + s, y: s, z: 0 }, { x: dieOffsetX - s, y: s, z: 0 },
  ];
  const flap = (edgeA: Vec3, edgeB: Vec3, extension: Vec3): [Vec3, Vec3, Vec3, Vec3] => [
    edgeA, edgeB,
    { x: edgeB.x + extension.x, y: edgeB.y + extension.y, z: edgeB.z + extension.z },
    { x: edgeA.x + extension.x, y: edgeA.y + extension.y, z: edgeA.z + extension.z },
  ];
  makeFace(center, 1, 0);
  makeFace(flap(center[0], center[1], { x: 0, y: -2 * s * Math.cos(58 * Math.PI / 180), z: 2 * s * Math.sin(58 * Math.PI / 180) }), 3, 2);
  makeFace(flap(center[2], center[3], { x: 0, y: 2 * s * Math.cos(43 * Math.PI / 180), z: -2 * s * Math.sin(43 * Math.PI / 180) }), 5, 4);
  makeFace(flap(center[3], center[0], { x: -2 * s * Math.cos(67 * Math.PI / 180), y: 0, z: -2 * s * Math.sin(67 * Math.PI / 180) }), 2, 1);
  makeFace(flap(center[1], center[2], { x: 2 * s * Math.cos(51 * Math.PI / 180), y: 0, z: 2 * s * Math.sin(51 * Math.PI / 180) }), 4, 3);

  // The absent sixth face survives only as a torn hinge and loose fibres.
  const tearOrigin = { x: dieOffsetX + s + 2 * s * Math.cos(51 * Math.PI / 180), y: 0.15, z: 2 * s * Math.sin(51 * Math.PI / 180) };
  for (let index = 0; index < 9; index += 1) {
    const offset = (index - 4) * 0.12;
    addEdge(
      { x: tearOrigin.x, y: tearOrigin.y + offset, z: tearOrigin.z + pseudo(index + 900) * 0.12 },
      { x: tearOrigin.x + 0.28 + pseudo(index + 930) * 0.35, y: tearOrigin.y + offset + (pseudo(index + 960) - 0.5) * 0.24, z: tearOrigin.z + (pseudo(index + 990) - 0.5) * 0.6 },
      "torn", 0.9,
    );
  }

  return { points, edges, primaryEdgeCount };
}

function rotate(point: Vec3, pitch: number, yaw: number, roll: number): Vec3 {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.x * sinY + point.z * cosY;
  const cosX = Math.cos(pitch);
  const sinX = Math.sin(pitch);
  const y1 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;
  const cosZ = Math.cos(roll);
  const sinZ = Math.sin(roll);
  return { x: x1 * cosZ - y1 * sinZ, y: x1 * sinZ + y1 * cosZ, z: z2 };
}

function inverseRotate(point: Vec3, pitch: number, yaw: number, roll: number): Vec3 {
  const cosZ = Math.cos(-roll);
  const sinZ = Math.sin(-roll);
  const x1 = point.x * cosZ - point.y * sinZ;
  const y1 = point.x * sinZ + point.y * cosZ;
  const cosX = Math.cos(-pitch);
  const sinX = Math.sin(-pitch);
  const y2 = y1 * cosX - point.z * sinX;
  const z1 = y1 * sinX + point.z * cosX;
  const cosY = Math.cos(-yaw);
  const sinY = Math.sin(-yaw);
  return { x: x1 * cosY - z1 * sinY, y: y2, z: x1 * sinY + z1 * cosY };
}

function normalize(angle: number) {
  let value = angle % (Math.PI * 2);
  if (value > Math.PI) value -= Math.PI * 2;
  if (value < -Math.PI) value += Math.PI * 2;
  return value;
}

function angleDifference(a: number, b: number) {
  return Math.abs(normalize(a - b));
}

function targetCloseness(pitch: number, yaw: number, roll: number, index: number) {
  const target = targets[index];
  const distance = Math.hypot(angleDifference(pitch, target.pitch), angleDifference(yaw, target.yaw));
  const rollDistance = angleDifference(roll, target.roll);
  return Math.max(0, 1 - Math.hypot(distance, rollDistance * 0.8) / 2.35);
}

export default function VectorPuzzlePage() {
  const modelCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef(buildModel());
  const rotationRef = useRef({ pitch: 0.62, yaw: -0.84, roll: 0.41 });
  const draggingRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  const [rotationLabel, setRotationLabel] = useState("θx 0.62 · θy −0.84 · θz 0.41");
  const [shadowState, setShadowState] = useState("实时投影");
  const [solved, setSolved] = useState<(string | null)[]>([null, null, null, null, null]);
  const [code, setCode] = useState("");
  const [lockState, setLockState] = useState("等待五个姿态");
  const [unlocked, setUnlocked] = useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [doorPhase, setDoorPhase] = useState<"closed" | "opening" | "open">("closed");

  selectedRef.current = selected;

  useEffect(() => {
    const modelCanvas = modelCanvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!modelCanvas || !shadowCanvas) return;

    const modelContext = modelCanvas.getContext("2d");
    const shadowContext = shadowCanvas.getContext("2d");
    if (!modelContext || !shadowContext) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      [modelCanvas, shadowCanvas].forEach((canvas) => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
      });
      draw();
    };

    const draw = () => {
      const style = getComputedStyle(document.documentElement);
      const foreground = style.getPropertyValue("--puzzle-ink").trim() || "#d8d5ca";
      const muted = style.getPropertyValue("--puzzle-muted").trim() || "#777b77";
      const accent = style.getPropertyValue("--puzzle-accent").trim() || "#d07d4c";
      const digitColors = [1, 2, 3, 4, 5].map((number) =>
        style.getPropertyValue(`--puzzle-digit-${number}`).trim() || foreground,
      );
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pitch = rotationRef.current.pitch;
      const yaw = rotationRef.current.yaw;
      const roll = rotationRef.current.roll;

      const modelWidth = modelCanvas.width / ratio;
      const modelHeight = modelCanvas.height / ratio;
      modelContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      modelContext.clearRect(0, 0, modelWidth, modelHeight);
      modelContext.save();
      modelContext.translate(modelWidth * 0.43, modelHeight / 2 + 12);

      const projected = modelRef.current.points.map((point) => rotate(point, pitch, yaw, roll));
      const scale = Math.min(modelWidth, modelHeight) * 0.11;
      const perspective = (point: Vec3) => {
        const cameraDistance = 7.2;
        const factor = cameraDistance / Math.max(3.8, cameraDistance - point.z);
        return { x: point.x * factor, y: point.y * factor };
      };
      const orderedEdges = [...modelRef.current.edges].sort((left, right) => {
        const leftDepth = projected[left.a].z + projected[left.b].z;
        const rightDepth = projected[right.a].z + projected[right.b].z;
        return leftDepth - rightDepth;
      });

      orderedEdges.forEach((edge) => {
        if (edge.kind === "torn") return;
        const a = projected[edge.a];
        const b = projected[edge.b];
        const screenA = perspective(a);
        const screenB = perspective(b);
        const depth = Math.max(0.16, Math.min(0.82, 0.46 + (a.z + b.z) * 0.08));
        modelContext.beginPath();
        modelContext.setLineDash(edge.dashed ? [3, 4] : []);
        modelContext.moveTo(screenA.x * scale, screenA.y * scale);
        modelContext.lineTo(screenB.x * scale, screenB.y * scale);
        modelContext.strokeStyle = edge.kind === "pip" && edge.targetIndex !== undefined
          ? digitColors[edge.targetIndex]
          : edge.kind === "torn" ? accent : foreground;
        modelContext.globalAlpha = edge.kind === "die" || edge.kind === "pip" ? 0.78 : depth * edge.weight;
        modelContext.lineWidth = edge.kind === "die" ? 1.25 : edge.kind === "pip" ? 1.65 : edge.primary ? 0.9 : 0.42;
        modelContext.stroke();
      });
      modelContext.setLineDash([]);

      projected.forEach((point, index) => {
        if (index % 5 !== 0) return;
        const screen = perspective(point);
        modelContext.beginPath();
        modelContext.arc(screen.x * scale, screen.y * scale, index % 15 === 0 ? 1.8 : 1.1, 0, Math.PI * 2);
        modelContext.fillStyle = index % 15 === 0 ? accent : foreground;
        modelContext.globalAlpha = 0.72;
        modelContext.fill();
      });
      modelContext.restore();

      const shadowWidth = shadowCanvas.width / ratio;
      const shadowHeight = shadowCanvas.height / ratio;
      shadowContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      shadowContext.clearRect(0, 0, shadowWidth, shadowHeight);
      shadowContext.save();
      shadowContext.translate(shadowWidth / 2, shadowHeight / 2);
      const shadowScale = Math.min(shadowWidth, shadowHeight) * 0.15;
      const closeness = targetCloseness(pitch, yaw, roll, selectedRef.current);
      const emergence = Math.max(0, Math.min(1, (closeness - 0.76) / 0.22));
      modelRef.current.edges.forEach((edge, index) => {
        if (edge.kind === "torn") return;
        const a = projected[edge.a];
        const b = projected[edge.b];
        const isTargetLine = edge.kind === "vector" && edge.targetIndex === selectedRef.current;
        const jitter = isTargetLine ? 0 : 2.4;
        shadowContext.beginPath();
        shadowContext.setLineDash(edge.dashed ? [3, 4] : []);
        shadowContext.moveTo(a.x * shadowScale + Math.sin(index * 0.8 + yaw) * jitter, a.y * shadowScale);
        shadowContext.lineTo(b.x * shadowScale, b.y * shadowScale + Math.cos(index + pitch) * jitter);
        shadowContext.strokeStyle = isTargetLine ? digitColors[selectedRef.current] : muted;
        shadowContext.globalAlpha = isTargetLine
          ? 0.035 + emergence * 0.52
          : (0.02 + edge.weight * 0.05) * (1 - emergence * 0.68);
        shadowContext.lineWidth = isTargetLine ? 0.62 : 0.38;
        shadowContext.stroke();
      });
      shadowContext.setLineDash([]);
      shadowContext.restore();

      setRotationLabel(`θx ${pitch.toFixed(2)} · θy ${yaw.toFixed(2)} · θz ${roll.toFixed(2)}`);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(modelCanvas);
    observer.observe(shadowCanvas);
    resize();
    const redraw = () => draw();
    window.addEventListener("puzzle-redraw", redraw);
    return () => {
      observer.disconnect();
      window.removeEventListener("puzzle-redraw", redraw);
    };
  }, []);

  function redraw() {
    window.dispatchEvent(new Event("puzzle-redraw"));
  }

  function rotateModel(deltaYaw: number, deltaPitch: number, deltaRoll = 0) {
    rotationRef.current.yaw = normalize(rotationRef.current.yaw + deltaYaw);
    rotationRef.current.pitch = normalize(rotationRef.current.pitch + deltaPitch);
    rotationRef.current.roll = normalize(rotationRef.current.roll + deltaRoll);
    redraw();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    draggingRef.current = true;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!draggingRef.current) return;
    const deltaX = event.clientX - pointerRef.current.x;
    const deltaY = event.clientY - pointerRef.current.y;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    rotateModel(deltaX * 0.011, deltaY * 0.011);
  }

  function selectTarget(index: number) {
    setSelected(index);
    selectedRef.current = index;
    const target = targets[index];
    rotationRef.current = { pitch: target.pitch, yaw: target.yaw, roll: target.roll };
    setShadowState("实时投影");
    redraw();
  }

  function recordPose() {
    const { pitch, yaw, roll } = rotationRef.current;
    const closeness = targetCloseness(pitch, yaw, roll, selected);
    if (closeness <= 0.92) {
      setShadowState("阴影尚未闭合");
      return;
    }
    const target = targets[selected];
    rotationRef.current = { pitch: target.pitch, yaw: target.yaw, roll: target.roll };
    const next = [...solved];
    next[selected] = target.digit;
    setSolved(next);
    setShadowState("姿态已记录");
    if (next.every(Boolean)) {
      setLockState("五个姿态已记录，等待密码验证");
      setKeypadOpen(true);
    }
    redraw();
  }

  function unlock() {
    if (code === "48668") {
      setKeypadOpen(false);
      setLockState("密码正确，门锁解除");
      setDoorPhase("opening");
      window.setTimeout(() => {
        setDoorPhase("open");
        setUnlocked(true);
        setLockState("门已开启");
      }, 1800);
    } else {
      setLockState("密码错误，请重新输入");
      setCode("");
    }
  }

  return (
    <main className="puzzle-page">
      <header className="puzzle-header">
        <div>
          <a href="/" className="puzzle-back">← 返回创作工作台</a>
          <p className="puzzle-kicker">思谬之馆 · 终局密室</p>
          <h1>无六骰<span>／</span>熵增立方</h1>
        </div>
        <div className="puzzle-reward"><small>首位解出者</small><strong>＋30</strong><span>镜值</span></div>
      </header>

      <section className="puzzle-console">
        <aside className="pose-panel">
          <p className="panel-label">骰面姿态记录器</p>
          <div className="pose-list">
            {targets.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`pose-button face-${index + 1}${selected === index ? " active" : ""}`}
                onClick={() => selectTarget(index)}
                aria-pressed={selected === index}
              >
                <span>{["⚀", "⚁", "⚂", "⚃", "⚄"][index]}</span>
                <b>{solved[index] ?? "未记录"}</b>
              </button>
            ))}
            <div className="missing-face"><span>×</span><b>第六面撕除</b></div>
          </div>
          <div className="vector-note">
            <span>5</span>个铰接骰面<br />
            <span>0</span>条共面数字线<br />
            <span>1</span>个不可拆分模型
          </div>
        </aside>

        <section className="model-panel">
          <div className="canvas-heading"><span>半展开骰体／破碎向量同体模型</span><code>{rotationLabel}</code></div>
          <canvas
            ref={modelCanvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { draggingRef.current = false; }}
            onPointerCancel={() => { draggingRef.current = false; }}
            aria-label="拖动旋转由大量细线构成的三维模型"
          />
          <div className="model-controls">
            <button type="button" onClick={() => rotateModel(0, -0.045)}>↑</button>
            <button type="button" onClick={() => rotateModel(-0.045, 0)}>←</button>
            <button type="button" onClick={() => rotateModel(0, 0, -0.045)}>↺</button>
            <button type="button" onClick={recordPose} className="record-button">记录姿态</button>
            <button type="button" onClick={() => rotateModel(0, 0, 0.045)}>↻</button>
            <button type="button" onClick={() => rotateModel(0.045, 0)}>→</button>
            <button type="button" onClick={() => rotateModel(0, 0.045)}>↓</button>
          </div>
        </section>

        <section className="shadow-panel">
          <div className="canvas-heading"><span>磨砂墙实时余影</span><code>{shadowState}</code></div>
          <canvas ref={shadowCanvasRef} aria-label="模型旋转后形成的实时阴影" />
          <p>碎片的位置从未改变。改变的只有观察方向。</p>
        </section>
      </section>

      <section className="cipher-strip">
        <div className="cipher-slots" aria-label="已经解出的五位密码">
          {solved.map((digit, index) => <span className={`digit-${index + 1}`} key={index}>{digit ?? "?"}</span>)}
        </div>
        <div className="lock-control">
          <label htmlFor="puzzle-code">五位密码</label>
          <div className="code-preview">{code ? "•".repeat(code.length) : "等待九键输入"}</div>
          <button type="button" onClick={() => setKeypadOpen(true)} disabled={!solved.every(Boolean) || unlocked}>打开九键</button>
        </div>
        <p className={lockState === "投影序列错误" ? "lock-state error" : "lock-state"}>{lockState}</p>
      </section>

      {unlocked && (
        <section className="talos-output">
          <p>NO.6／TALOS／AFTERIMAGE</p>
          <code>τ::Q⁻¹⟦48·668⟧ / ∫Ω p⃗(x,y,z)dV → Iθ ; ΔS↗ ; Iθ≠I₀</code>
        </section>
      )}

      {keypadOpen && !unlocked && (
        <section className="keypad-modal" role="dialog" aria-modal="true" aria-labelledby="keypad-title">
          <div className="keypad-card">
            <p className="panel-label">SECURITY GATE / 09</p>
            <h2 id="keypad-title">输入五位解锁密码</h2>
            <p className="keypad-hint">顺序来自五个姿态记录。密码不会显示在屏幕上。</p>
            <div className="keypad-display" aria-live="polite">{code.padEnd(5, "·")}</div>
            <div className="keypad-grid">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button key={digit} type="button" onClick={() => setCode((current) => `${current}${digit}`.slice(0, 5))}>{digit}</button>
              ))}
              <button type="button" className="keypad-muted" onClick={() => setCode("")}>清除</button>
              <button type="button" onClick={() => setCode((current) => `${current}0`.slice(0, 5))}>0</button>
              <button type="button" className="keypad-confirm" onClick={unlock} disabled={code.length !== 5}>确认</button>
            </div>
            <button type="button" className="keypad-cancel" onClick={() => setKeypadOpen(false)}>取消</button>
          </div>
        </section>
      )}

      {doorPhase !== "closed" && (
        <section className={`door-transition ${doorPhase}`} aria-live="assertive">
          <div className="transition-lines" />
          <div className="door-frame"><span>CASE // 48668</span><b>{doorPhase === "opening" ? "LOCK RELEASED" : "ACCESS GRANTED"}</b></div>
          <p>{doorPhase === "opening" ? "门缝正在扩大" : "你看见了门后的光"}</p>
        </section>
      )}
    </main>
  );
}
