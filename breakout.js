"use strict";
function breakout() {
    const svg = document.getElementById("canvasB");
    let title = mainText(svg, "Click anywhere to start a game"), sub = subText(svg, "Break all the blocks to win");
    Observable.fromEvent(svg, "mousedown").takeUntil(Observable.fromEvent(svg, "mouseup"))
        .subscribe(() => {
        title.attr("font-size", 0);
        sub.attr("font-size", 0);
        breakOutgame(title, sub);
    });
}
function breakOutgame(title, sub) {
    const svg = document.getElementById("canvasB"), mousemove = Observable.fromEvent(svg, "mousemove"), mousedown = Observable.fromEvent(svg, "mousedown"), mouseup = Observable.fromEvent(svg, "mouseup"), svgBounds = svg.getBoundingClientRect(), bounceSound = new Audio("bounce.wav"), wallSound = new Audio("wall.wav"), scoreSound = new Audio("score.wav"), backSound = new Audio("background.mp3");
    let speed = 3, xSpeed = 4, points = 0, hold = true, player = new Elem(svg, 'rect').attr('x', 260).attr('y', 570)
        .attr('width', 80).attr('height', 10).attr('fill', 'white'), ball = new Elem(svg, "circle")
        .attr('cx', 300).attr('cy', Number(player.attr("y")) - Number(player.attr("height")))
        .attr('r', 8).attr('fill', "white").attr("id", "ball"), startX = 5, startY = 55, arrayOfBlocks = [
        blocks(svg, startX, startY), blocks(svg, startX + 85, startY), blocks(svg, startX + 2 * 85, startY), blocks(svg, startX + 3 * 85, startY), blocks(svg, startX + 4 * 85, startY), blocks(svg, startX + 5 * 85, startY), blocks(svg, startX + 6 * 85, startY),
        blocks(svg, startX, startY + 25), blocks(svg, startX + 85, startY + 25), blocks(svg, startX + 2 * 85, startY + 25), blocks(svg, startX + 3 * 85, startY + 25), blocks(svg, startX + 4 * 85, startY + 25), blocks(svg, startX + 5 * 85, startY + 25), blocks(svg, startX + 6 * 85, startY + 25),
        blocks(svg, startX, startY + 2 * 25), blocks(svg, startX + 85, startY + 2 * 25), blocks(svg, startX + 2 * 85, startY + 2 * 25), blocks(svg, startX + 3 * 85, startY + 2 * 25), blocks(svg, startX + 4 * 85, startY + 2 * 25), blocks(svg, startX + 5 * 85, startY + 2 * 25), blocks(svg, startX + 6 * 85, startY + 2 * 25)
    ], numberOfBlocks = arrayOfBlocks.length;
    const endGame = Observable.interval(10)
        .map(({}) => ({ blocks: numberOfBlocks, ball: ball }))
        .filter(({ blocks, ball }) => blocks === 0 || Number(ball.attr("cy")) > 600);
    const endAction = endGame.subscribe(() => {
        player.elem.remove();
        ball.elem.remove();
        arrayOfBlocks.forEach(function (item) { item.elem.remove(); });
        title.attr("font-size", 40);
        setText(title, "Your score:" + points);
        sub.attr("font-size", 15);
        setText(sub, "F5 to play again");
        Observable.interval(200).subscribe(() => { backSound.volume -= 0.001; });
        Observable.interval(3000).subscribe(() => { backSound.pause(); endAction(); });
    });
    Observable.interval(10).takeUntil(endGame)
        .subscribe(() => {
        backSound.play();
    });
    mousemove.takeUntil(endGame)
        .map(({ clientX }) => ({ x: clientX - svgBounds.left - Number(player.attr("width")) / 2 }))
        .filter(({ x }) => x >= 0 && x <= 520)
        .subscribe(({ x }) => {
        player.attr("x", x);
    });
    mousemove.takeUntil(mousedown)
        .subscribe(() => {
        ball.attr("cx", Number(player.attr("x")) + Number(player.attr("width")) / 2);
    });
    const shoot = mousedown.takeUntil(endGame);
    shoot.filter(() => hold == true).subscribe(() => {
        hold = false;
        const ballMovement = Observable.interval(10).takeUntil(endGame);
        ballMovement.subscribe(() => {
            ball.attr("cy", Number(ball.attr("cy")) - speed);
            ball.attr("cx", Number(ball.attr("cx")) + xSpeed);
        });
        ballMovement.map(() => ({ xBall: Number(ball.attr("cx")) }))
            .filter(({ xBall }) => xBall <= 0 || xBall >= 600)
            .subscribe(() => {
            wallSound.play();
            xSpeed = xSpeed * -1;
        });
        ballMovement.map(() => ({ yBall: Number(ball.attr("cy")) }))
            .filter(({ yBall }) => yBall <= 0)
            .subscribe(() => {
            wallSound.play();
            speed = speed * -1;
        });
        ballMovement.map(() => ({
            xBall: Number(ball.attr("cx")),
            yBall: Number(ball.attr("cy")),
            width: Number(player.attr("width")),
            height: Number(player.attr("height")),
            xPaddle: Number(player.attr("x")),
            yPaddle: Number(player.attr("y"))
        }))
            .filter(({ width, height, xBall, yBall, xPaddle, yPaddle }) => (xPaddle < xBall && xBall < xPaddle + width)
            &&
                (yPaddle < yBall && yBall <= yPaddle + height))
            .subscribe(() => {
            bounceSound.play();
            speed = -1 * speed;
        });
    });
    Observable.interval(10).takeUntil(endGame).subscribe(() => {
        const blockCollision = Observable.fromArray(arrayOfBlocks).takeUntil(endGame);
        blockCollision.map(e => ({
            block: e,
            xPosition: Number(e.attr("x")),
            yPosition: Number(e.attr("y")),
            xBall: Number(ball.attr("cx")),
            yBall: Number(ball.attr("cy")),
            height: Number(e.attr("height")),
            width: Number(e.attr("width"))
        }))
            .filter(({ width, height, xBall, yBall, xPosition, yPosition }) => (xPosition < xBall && xBall <= xPosition + width)
            &&
                (yPosition < yBall && yBall < yPosition + height))
            .filter(({ block }) => block.attr("break") == "false")
            .subscribe(({ block }) => {
            scoreSound.play();
            numberOfBlocks -= 1;
            points += 100;
            block.attr("break", "true");
            block.elem.remove();
            speed = -1 * speed;
        });
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        breakout();
    };
//# sourceMappingURL=breakout.js.map