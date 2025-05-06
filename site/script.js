const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function basic_line(x) {
    return Math.tan(x);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// constants
let zoom = 20;

// example
let points = [];
// only 20 points for now
for (let i = 0; i < 200; i++) {
    let x = (i - 100) / (devicePixelRatio * 2);
    points[i] = new Point(x, basic_line(x));
}

function draw_loop(delta) {
    // render grid lines
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.globalAlpha = 0.2;

    for(let i = 0; i < canvas.width; i += (canvas.height / 32) * devicePixelRatio) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for(let i = 0; i < canvas.height * 1.5; i += (canvas.height / 32) * devicePixelRatio) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }

    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    //ctx.moveTo(points[0].x * 20 + canvas.width / 2, points[0].y * 20 + canvas.height / 2);
    points.forEach(point => {
        // translate point to fit within window
        let t_x = point.x * zoom + canvas.width / 2;
        let t_y = canvas.height / 2 - point.y * zoom;

        ctx.lineTo(t_x, t_y);
    });
    ctx.stroke();
}

let old_time = performance.now();
function draw_event() {
    let now = performance.now();
    let delta = now - old_time;
    old_time = now;

    draw_loop(delta);
}

requestAnimationFrame(draw_event);


// fix canvas
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

window.addEventListener("resize", () => {
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
});

window.addEventListener("wheel", (e) => {
    console.log(e.deltaY)
    if(e.deltaY < 0) {
        zoom -= 0.05;
    } else if (e.deltaY > 0) {
        zoom += 0.05;
    }
})