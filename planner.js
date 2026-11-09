// Draw the notebook in logical coordinates so the artwork scales with the header.
(() => {
  const canvas = document.getElementById("planner");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(2, 2);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const ink = "#292526";

  function shape(path, fill, width = 2.4) {
    const outline = new Path2D(path);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill(outline);
    }
    if (width) {
      ctx.strokeStyle = ink;
      ctx.lineWidth = width;
      ctx.stroke(outline);
    }
  }

  function rounded(x, y, width, height, radius, color, weight = 2.5) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = weight;
    ctx.stroke();
  }

  function sparkle(x, y, size, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    shape("M0 -12 Q1 -2 10 0 Q1 2 0 12 Q-2 2 -10 0 Q-2 -2 0 -12Z", fill, 1.8);
    ctx.restore();
  }

  // Two pages and a violet back cover give the spiral pad its thickness.
  ctx.save();
  ctx.translate(175, 119);
  ctx.rotate(-0.14);
  rounded(-66, -72, 143, 153, 8, ink);
  rounded(-69, -75, 143, 153, 7, "#ad91d6");
  rounded(-72, -78, 143, 152, 6, "#e2d8c1");
  rounded(-74, -82, 143, 152, 6, "#fff9e8");
  shape("M-73 -48 H68", null, 2);
  for (const x of [-55, -30, -5, 20, 45]) {
    ctx.beginPath();
    ctx.arc(x, -66, 4.1, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
    const wire = new Path2D("M " + x + " -66 c -6 -1 -8 -14 -5 -21 c 2 -5 7 -4 9 1");
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4.5;
    ctx.stroke(wire);
  }
  for (const [row, y] of [-32, 0, 32].entries()) {
    rounded(-55, y, 16, 16, 2.5, row === 2 ? "#fff9e8" : "#c6afea", 2);
    if (row !== 2) {
      ctx.save();
      ctx.translate(-53, y + 1);
      shape("M1 6 l4 5 L16 -2", null, 2.7);
      ctx.restore();
    }
    const length = [44, 30, 42][row];
    shape("M-25 " + (y + 4) + " H" + length, null, 3);
    shape("M-25 " + (y + 12) + " H" + (length - 23), null, 1.6);
  }
  ctx.restore();

  // A sharpened pencil lies across the lower right corner.
  ctx.save();
  ctx.translate(254, 110);
  ctx.rotate(0.54);
  shape("M-8 -62 Q-8 -67 -3 -67 H3 Q8 -67 8 -62 V50 L0 72 L-8 50Z", "#ffbb76");
  shape("M-8 -61 Q-8 -67 -3 -67 H3 Q8 -67 8 -61 V-53 H-8Z", "#e9a4a8", 2);
  shape("M-8 -53 H8 V-43 H-8Z", "#f9edda", 2);
  shape("M3 -43 V48 L0 51", null, 1.5);
  shape("M-8 49 l4 -2 4 4 4 -4 4 2 -8 23Z", "#f5d6ad", 1.9);
  shape("M-3 63 Q0 64 3 63 L0 72Z", ink, 1.4);
  ctx.restore();

  sparkle(77, 47, 1.16, "#fff6db");
  sparkle(303, 147, .85, ink);
  sparkle(99, 182, .56, ink);
  shape("M293 35 l5 -7 M300 44 l9 -2 M284 29 l1 -7", null, 2.4);
  shape("M55 138 q13 -8 22 2 c9 12 -10 19 -11 10 c-1 -7 17 -11 26 -7", null, 1.8);
})();
