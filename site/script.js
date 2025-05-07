const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

class Point {
    constructor(x, y, isPOI = false) {
        this.x = x;
        this.y = y;

        this.isPOI = isPOI;
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

        this.POIs = [];
    }
}
const camera = new Camera(canvas.width / 2, canvas.height / 2);

// constants
const colors = ["#c74440", "#2d70b3", "#388c46", "#6042a6", "#fa7e19", "#000000"];

// variables
let dark_mode = false;
let zoom = 20;
let POI_render = null;

function draw_loop(delta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (dark_mode) {
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

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = dark_mode ? "rgba(255, 255, 255, 0.5)" : "#181818";
    ctx.globalAlpha = 0.1;

    const grid_spacing = 1; // 1 unit, adjust if wanted (maybe add a slider later)
    const pixel_spacing = grid_spacing * zoom;

    const offset_x = camera.x % pixel_spacing;
    const offset_y = camera.y % pixel_spacing;

    for (let x = offset_x; x <= canvas.width + pixel_spacing; x += pixel_spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let x = offset_x - pixel_spacing; x >= -pixel_spacing; x -= pixel_spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let y = offset_y; y <= canvas.height + pixel_spacing; y += pixel_spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    for (let y = offset_y - pixel_spacing; y >= -pixel_spacing; y -= pixel_spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();
    ctx.restore();

    // render grid lines
    /*
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
        

    ctx.stroke();
    ctx.restore();
    */

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

    for (const equation of [...document.getElementsByClassName("equations")]) {
        if (equation.line?.points) {
            // actual line
            ctx.beginPath();
            ctx.strokeStyle = equation.line.color;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";

            for (const coord of equation.line.points) {
                // translate point to fit within window
                const t_x = coord.x * zoom;
                const t_y = -coord.y * zoom;

                ctx.lineTo(t_x, t_y);
            }

            ctx.stroke();

            // draw POIs
            for (const poi of equation.line.POIs) {
                ctx.beginPath();
                ctx.fillStyle = dark_mode ? "#fff" : "#181818";
                const t_x = poi.x * zoom;
                const t_y = -poi.y * zoom;
                ctx.arc(t_x, t_y, 5 * (zoom / 30), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // render poi coordinates if hovered
    if (POI_render) {
        const t_x = POI_render.x * zoom;
        const t_y = -POI_render.y * zoom;
        ctx.beginPath();
        ctx.fillStyle = dark_mode ? "#fff" : "#000";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`[${POI_render.x.toFixed(4)}, ${POI_render.y.toFixed(4)}]`, t_x, t_y - (10 * (zoom / 30)) * devicePixelRatio);
    }

    ctx.restore();
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

update_zoom();

let target_x = 0;
let target_y = 0;
let cam_vel_x = 0;
let cam_vel_y = 0;
const cam_damp = 0.8;

canvas.addEventListener("mousedown", (e) => {
    let start_x = e.clientX;
    let start_y = e.clientY;

    function mouse_move(e) {
        target_x += (e.clientX - start_x);
        target_y += (e.clientY - start_y);
        start_x = e.clientX;
        start_y = e.clientY;
    }

    window.addEventListener('mousemove', mouse_move);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', mouse_move);
    });
});

window.addEventListener("mousemove", (e) => {
    POI_render = null;

    for (const eq of [...document.getElementsByClassName("equations")]) {
        for (const poi of eq.line.POIs) {
            const screen_x = poi.x * zoom + camera.x;
            const screen_y = -poi.y * zoom + camera.y;

            const hover_dist = 10 * (zoom / 30);

            if (Math.abs(screen_x - e.clientX * devicePixelRatio) < hover_dist && Math.abs(screen_y - e.clientY * devicePixelRatio) < hover_dist) {
                POI_render = poi;
                break;
            }
        }

        if (POI_render) break;
    }
})

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

        equation.addEventListener("input", () => {
            //points.splice(points.indexOf(equation.line), 1);

            const points_l = [];
            const n_points = canvas.width * devicePixelRatio;
            const range = canvas.width / zoom;

            try {
                if (equation.value.includes("x=")) {
                    const x_val = Number.parseFloat(equation.value.split("=")[1]);
                    for (let i = 0; i < n_points; i++) {
                        const y = (i / n_points * canvas.height * devicePixelRatio / zoom) - (canvas.height / (2 * zoom));
                        points_l.push(new Point(x_val, y));
                    }
                } else {
                    for (let i = 0; i < n_points; i++) {
                        const x = (i / n_points * range) - range / 2;
                        const res = math.compile(equation.value).evaluate({ x: x });

                        points_l.push(new Point(x, res));
                    }
                }
            } catch (err) {
                console.error(`error ${err}`);
            }

            equation.line.points = points_l;

            //points.push(equation.line);
            // find POI
            const equations = [...document.getElementsByClassName("equations")];
            for (const eq of equations) {
                if (eq.line) eq.line.POIs = [];
            }

            for (let i = 0; i < equations.length; i++) {
                for (let j = i + 1; j < equations.length; j++) {
                    const eq1 = equations[i];
                    const eq2 = equations[j];

                    if (eq1.line?.points && eq2.line?.points) {
                        try {
                            const f = (x) => math.compile(eq1.value).evaluate({ x: x });
                            const g = (x) => math.compile(eq2.value).evaluate({ x: x });

                            const pois = find_poi(f, g);

                            for (const poi of pois) {
                                const point = new Point(poi[0], poi[1], true);

                                eq1.line.POIs.push(point);
                                eq2.line.POIs.push(point);
                            }
                        } catch (err) { }
                    }
                }
            }
        });
    })
}

update_equations(document.getElementsByClassName("equations"));

// add equation fields
document.getElementById("add-equation").addEventListener("click", () => {
    const elm = document.createElement("input");
    elm.type = "text";
    elm.className = "equations";

    if (dark_mode) {
        elm.classList.add("equations-dark")
    }

    document.getElementById("panel").appendChild(elm);

    update_equations([elm]);
})

document.getElementById("dark-mode").addEventListener("click", (e) => {
    dark_mode = !dark_mode;

    if (dark_mode) {
        document.getElementById("panel").classList.add("panel-dark");
        document.getElementById("title").classList.add("title-dark");
        document.getElementById("add-equation").classList.add("add-equation-dark");

        for (const elm of [...document.getElementsByClassName("equations")]) {
            elm.classList.add("equations-dark");
        }
    } else {
        document.getElementById("panel").classList.remove("panel-dark");
        document.getElementById("title").classList.remove("title-dark");
        document.getElementById("add-equation").classList.remove("add-equation-dark");

        for (const elm of [...document.getElementsByClassName("equations")]) {
            elm.classList.remove("equations-dark");
        }
    }
})

function find_poi(f, g, x_range = [-10, 10], number_of_points = 10000, tol = 1e-6, max_iter = 100) {
    const diff = x => f(x) - g(x);

    function bisect(a, b) {
        if (diff(a) * diff(b) >= 0) return null;

        let iter = 0;
        while ((b - a) > tol && iter < max_iter) {
            const mid = (a + b) / 2;
            const f_mid = diff(mid);

            if (Math.abs(f_mid) < tol) return mid;

            if (diff(a) * f_mid < 0) {
                b = mid;
            } else {
                a = mid;
            }
            iter++;
        }

        return (a + b) / 2;
    }

    const x_vals = Array.from({ length: number_of_points }, (_, i) => x_range[0] + (i * (x_range[1] - x_range[0])) / (number_of_points - 1));

    const pois = [];
    const used_roots = new Set();

    for (let i = 0; i < x_vals.length - 1; i++) {
        const x1 = x_vals[i];
        const x2 = x_vals[i + 1];
        const f1 = diff(x1);
        const f2 = diff(x2);

        if (f1 * f2 <= 0) {
            const root = bisect(x1, x2);

            if (root !== null) {
                const r_root = Math.round(root / tol) * tol;

                if (!used_roots.has(r_root)) {
                    const y = f(root);

                    if (Math.abs(f(root) - g(root)) < tol) {
                        pois.push([root, y]);
                        used_roots.add(r_root);
                    }
                }
            }
        }
    }

    return pois.sort((a, b) => a[0] - b[0]);
}
