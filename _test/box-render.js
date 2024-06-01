const boxColors = [
    "rgba(61,176,1,0.7)",
    "rgba(2,199,224,0.7)",
    "rgba(252,211,23,0.7)",
    "rgba(177,47,234,0.7)",
    "rgba(190,24,71,0.7)",
    "rgba(255,0,0,0.8)",
];

class BoxRender {

    x;

    y;

    size;

    /**
     * 画布上下文
     */
    ctx;

    fillNum = 0;

    constructor(x, y, size, canvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = canvasRenderingContext2D;
    }

    line() {
        this.ctx.clearRect(this.x, this.y, this.size, this.size);
        this.ctx.strokeStyle = "#939393";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    fill() {
        this.line();
        this.ctx.fillStyle = boxColors[this.fillNum];
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
        this.fillNum = this.fillNum + 1;
    }

}

export {BoxRender};
