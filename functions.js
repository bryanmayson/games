"use strict";
function paddles(svg, x, idName) {
    const paddle = new Elem(svg, 'rect').attr('x', x).attr('y', 260).attr('width', 10).attr('height', 80).attr('fill', 'white').attr("id", idName);
    return paddle;
}
function blocks(svg, x, y) {
    const paddle = new Elem(svg, 'rect').attr('x', x).attr('y', y).attr('width', 80).attr('height', 20).attr('fill', 'white').attr('break', "false");
    return paddle;
}
function score(svg, x) {
    let currentElem = new Elem(svg, "text")
        .attr('x', x).attr('y', 50)
        .attr("fill", "white").attr("font-size", 30)
        .attr("font-family", "Impact");
    setText(currentElem, "0");
    return currentElem;
}
function getText(targetScore) {
    return targetScore.elem.textContent;
}
function setText(targetScore, text) {
    targetScore.elem.textContent = String(text);
}
function mainText(svg, text) {
    let end = new Elem(svg, "text")
        .attr('x', 300).attr('y', 300).attr("font-size", 40).attr("text-anchor", "middle")
        .attr('fill', "white");
    setText(end, text);
    return end;
}
function subText(svg, text) {
    let restart = new Elem(svg, "text")
        .attr('x', 300).attr('y', 320).attr("font-size", 15).attr("text-anchor", "middle")
        .attr('fill', "white");
    setText(restart, text);
    return restart;
}
const randomDirection = () => 2 * Math.floor(Math.random() * Math.floor(2)) - 1;
const randomSpeed = () => Math.floor(Math.random() * Math.floor(3));
//# sourceMappingURL=functions.js.map