const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function basic_line(x) {
    return Math.sin(x);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Camera {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
const camera = new Camera(canvas.width / 2, canvas.height / 2);

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.save();
    ctx.translate(camera.x, camera.y);

    // render grid lines
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.globalAlpha = 0.1;

    for(let i = 0; i < canvas.width; i += ((canvas.height / 32) * devicePixelRatio)) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for(let i = 0; i < canvas.height; i += ((canvas.height / 32) * devicePixelRatio)) {
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

    ctx.restore()
}

let old_time = performance.now();
function draw_event() {
    let now = performance.now();
    let delta = now - old_time;
    old_time = now;

    draw_loop(delta);

    requestAnimationFrame(draw_event);
}

draw_event();


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
    if(e.deltaY < 0) {
        zoom += e.deltaY / 100;
    } else if (e.deltaY > 0) {
        zoom += e.deltaY / 100;
    }

    //console.log(~~zoom, ~~e.deltaY)
})

window.addEventListener("mousedown", (e) => {
    let startX = e.clientX;
    let startY = e.clientY;

    function mouseMoveHandler(e) {
        camera.x += (e.clientX - startX);
        camera.y += (e.clientY - startY);
        startX = e.clientX;
        startY = e.clientY;
    }

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
    });
})