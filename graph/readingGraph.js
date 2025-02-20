{
    const TIME_FRAME = 60000;
    const MARGIN = 10;
    const AXIS_WIDTH = 2;

    const LINE_WIDTH = 1;

    const MAX_VOLTAGE = 15;
    const MAX_CURRENT = 60;

    const VOLTAGE_COLOR = "blue";
    const CURRENT_COLOR = "red";

    const canvas = document.querySelector("#readingGraph");
    const ctx = canvas.getContext("2d");

    const graphHeight = canvas.height - MARGIN * 2;
    const graphWidth = canvas.width - MARGIN * 2;

    const readings = [];

    function readingToPosition(reading) {
        return {
            voltageY : (reading.voltage / MAX_VOLTAGE) * graphHeight + MARGIN,
            currentY : (reading.current / MAX_CURRENT) * graphHeight + MARGIN,
            x : ((TIME_FRAME - reading.time) / TIME_FRAME) * graphWidth + MARGIN
        }
    }

    function display() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black";
        ctx.lineWidth = AXIS_WIDTH;

        ctx.moveTo(MARGIN, MARGIN);
        ctx.lineTo(MARGIN, canvas.height - MARGIN);
        ctx.lineTo(canvas.width - MARGIN, canvas.height - MARGIN);
        ctx.stroke();


    }
}