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

class Line {
    constructor(i, points, color) {
        this.i = i;
        this.points = points;
        this.color = color;
    }
}
const camera = new Camera(canvas.width / 2, canvas.height / 2);

// constants
let zoom = 20;
let colors = ["#29ABE2", "#DD5193", "#8152A2", "#E6842A", "#13A177", "#B40F20"]

function draw_loop(delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(camera.x, camera.y);

    // render grid lines
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#181818";
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < canvas.width; i += ((innerHeight / 32) * devicePixelRatio)) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for (let i = 0; i < canvas.height; i += ((innerHeight / 32) * devicePixelRatio)) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }

    ctx.stroke();
    ctx.restore();
    /*
        ctx.beginPath();
        ctx.strokeStyle = "#181818";
        ctx.lineWidth = 4;
        ////ctx.moveTo(points[0].x * 20 + canvas.width / 2, points[0].y * 20 + canvas.height / 2);
        points.forEach(point => {
            point.points.forEach(coord => {
        //    // translate point to fit within window
            let t_x = coord.x * zoom + canvas.width / 2;
            let t_y = canvas.height / 2 - coord.y * zoom;
    
            ctx.lineTo(t_x, t_y);
            })
        });
        ctx.stroke();
        */

    [...document.getElementsByClassName("equations")].forEach(equation => {
        if (equation.line && equation.line.points) {
            ctx.beginPath();
            ctx.strokeStyle = equation.line.color;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";

            equation.line.points.forEach(coord => {
                // translate point to fit within window
                let t_x = coord.x * zoom + canvas.width / 2;
                let t_y = canvas.height / 2 - coord.y * zoom;

                ctx.lineTo(t_x, t_y);
            })

            ctx.stroke();
        }
    })

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

let target_zoom = zoom;
let zoom_vel = 0;
const zoom_speed = 0.0025;
const zoom_damp = 0.85;

window.addEventListener("wheel", (e) => {
    zoom_vel += -e.deltaY * zoom_speed;
});

function update_zoom() {
    zoom_vel *= zoom_damp;
    zoom *= 1 + zoom_vel;

    requestAnimationFrame(update_zoom);
}

update_zoom();

let target_x = 0;
let target_y = 0;
let cam_vel_x = 0;
let cam_vel_y = 0;
let cam_damp = 0.8;

canvas.addEventListener("mousedown", (e) => {
    let start_x = e.clientX;
    let start_y = e.clientY;

    function mouseMoveHandler(e) {
        target_x += (e.clientX - start_x);
        target_y += (e.clientY - start_y);
        start_x = e.clientX;
        start_y = e.clientY;
    }

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
    });
});

// i like rust snake case
function update_camera() {
    cam_vel_x = (target_x - camera.x) * 0.175;
    cam_vel_y = (target_y - camera.y) * 0.175;

    cam_vel_x *= cam_damp;
    cam_vel_y *= cam_damp;

    camera.x += cam_vel_x;
    camera.y += cam_vel_y;

    requestAnimationFrame(update_camera);
}

update_camera();

// capture equation field(s) (one for now)
function update_equations(elms) {
    [...elms].forEach((equation, i) => {
        equation.line = new Line();
        equation.line.color = colors[i % colors.length]; //`rgb(${[1,2,3].map(x=>Math.random()*256|0)})`;

        equation.addEventListener("input", (e) => {
            //points.splice(points.indexOf(equation.line), 1);

            let points_l = [];
            let n_points = 200;
            let range = 10;

            for (let i = 0; i < n_points; i++) {
                let x = (i / n_points * devicePixelRatio * range) - range / 2;
                let res = math.compile(equation.value).evaluate({ x: x });

                points_l.push(new Point(x, res));
            }

            equation.line.points = points_l;

            //points.push(equation.line);
        });
    })
}

update_equations(document.getElementsByClassName("equations"));

// add equation fields
document.getElementById("add-equation").addEventListener("click", () => {
    let elm = document.createElement("input");
    elm.type = "text";
    elm.className = "equations";

    document.getElementById("panel").appendChild(elm);

    update_equations([elm]);
})