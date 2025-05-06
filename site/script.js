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
const colors = ["#29ABE2", "#DD5193", "#8152A2", "#E6842A", "#13A177", "#B40F20"];

// variables
let dark_mode = false;

function draw_loop(delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(dark_mode) {
        ctx.beginPath();
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /*
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(camera.x, camera.y, 30, 0, Math.PI * 2);
    ctx.fill()
*/


    // render grid lines
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = (dark_mode ? "rgba(255, 255, 255, 0.5)" : "#181818");
    ctx.globalAlpha = 0.1;

    
    for (let i = 0; i < canvas.width; i += ((innerHeight / 32) * devicePixelRatio)) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }

    for (let i = 0; i < canvas.height; i += ((innerHeight / 32) * devicePixelRatio)) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
        

    /*for (let i = -camera.x; i < camera.x; i += ((innerHeight / 32) * devicePixelRatio)) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, camera.x);
    }*/


    /*
    cool 3d effect

    for(let i = -camera.x; i < camera.x; i += 12) {
        ctx.moveTo(i * zoom, 0);
        ctx.lineTo(i, innerWidth * zoom)
    }

    for(let i = -camera.y; i < camera.y; i += 12) {
        ctx.moveTo(0, i * zoom);
        ctx.lineTo(innerHeight * zoom, i)
    }
        */

    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(camera.x, camera.y);

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

    for(const equation of [...document.getElementsByClassName("equations")]) {
        if (equation.line?.points) {
            ctx.beginPath();
            ctx.strokeStyle = equation.line.color;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";

            for(const coord of equation.line.points) {
                // translate point to fit within window
                const t_x = coord.x * zoom + canvas.width / 2;
                const t_y = canvas.height / 2 - coord.y * zoom;

                ctx.lineTo(t_x, t_y);
            }

            ctx.stroke();
        }
    }

    ctx.restore()
}

let old_time = performance.now();
function draw_event() {
    const now = performance.now();
    const delta = now - old_time;
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

const target_zoom = zoom;
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

setInterval(() => {
    console.log(camera.x, camera.y);
}, 1e2)

update_zoom();

let target_x = 0;
let target_y = 0;
let cam_vel_x = 0;
let cam_vel_y = 0;
const cam_damp = 0.8;

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

            const points_l = [];
            const n_points = canvas.width * zoom;
            const range = canvas.width / zoom;

            for (let i = 0; i < n_points; i++) {
                const x = (i / n_points * devicePixelRatio * range) - range / 2;
                const res = math.compile(equation.value).evaluate({ x: x });

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
    const elm = document.createElement("input");
    elm.type = "text";
    elm.className = "equations";
    
    if(dark_mode) {
        elm.classList.add("equations-dark")
    }

    document.getElementById("panel").appendChild(elm);

    update_equations([elm]);
})

document.getElementById("dark-mode").addEventListener("click", (e) => {
    dark_mode = !dark_mode;

    if(dark_mode) {
        document.getElementById("panel").classList.add("panel-dark");
        document.getElementById("title").classList.add("title-dark");
        document.getElementById("add-equation").classList.add("add-equation-dark");

        for(const elm of [...document.getElementsByClassName("equations")]) {
            console.log(elm, elm.classList)
            elm.classList.add("equations-dark");
        }
    } else {
        document.getElementById("panel").classList.remove("panel-dark");
        document.getElementById("title").classList.remove("title-dark");
        document.getElementById("add-equation").classList.remove("add-equation-dark");

        for(const elm of [...document.getElementsByClassName("equations")]) {
            elm.classList.remove("equations-dark");
        }
    }
})