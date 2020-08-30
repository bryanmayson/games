"use strict";
function pong() {
    const svg = document.getElementById("canvas");
    let pongTitle = mainText(svg, "Click anywhere to start a game"), pongSub = subText(svg, "Score up to 11 to win");
    Observable.fromEvent(svg, "mousedown").takeUntil(Observable.fromEvent(svg, "mouseup"))
        .subscribe(() => {
        pongTitle.attr("font-size", 0);
        pongSub.attr("font-size", 0);
        game(pongTitle, pongSub);
    });
}
function game(pongTitle, pongSub) {
    const svg = document.getElementById("canvas"), mousemove = Observable.fromEvent(svg, "mousemove"), svgBounds = svg.getBoundingClientRect(), scoreLimit = 11, ballSpeed = 7, aiSpeed = 3, seperator = new Elem(svg, 'line')
        .attr('x1', 300).attr('x2', 300)
        .attr('y1', 0).attr('y2', 600)
        .attr('stroke', 'white').attr("stroke-dasharray", 10), bounceSound = new Audio("bounce.wav"), wallSound = new Audio("wall.wav"), scoreSound = new Audio("score.wav"), backSound = new Audio("background.mp3"), ballPositions = [150, 300, 450], randomIndex = () => Math.floor(Math.random() * Math.floor(3));
    let player = paddles(svg, 25, "player"), opponent = paddles(svg, 570, "ai"), ball = new Elem(svg, "circle")
        .attr('cx', 300).attr('cy', ballPositions[randomIndex()])
        .attr('r', 8).attr('fill', "white").attr("id", "ball"), pause = true, playerScore = score(svg, 150), aiScore = score(svg, 430);
    Observable.interval(1000).takeUntil(Observable.interval(2000))
        .subscribe(() => { pause = false; });
    const endGame = Observable.interval(15)
        .map(({}) => ({ pScore: (Number(getText(playerScore))), aScore: (Number(getText(aiScore))) }))
        .filter(({ pScore, aScore }) => pScore === scoreLimit || aScore === scoreLimit);
    const endAction = endGame.subscribe(() => {
        player.elem.remove();
        opponent.elem.remove();
        seperator.elem.remove();
        ball.elem.remove();
        pongTitle.attr("font-size", 40);
        if (Number(getText(playerScore)) > Number(getText(aiScore))) {
            setText(pongTitle, "YOU WIN");
        }
        else {
            setText(pongTitle, "YOU LOSE");
        }
        pongSub.attr("font-size", 15);
        setText(pongSub, "F5 to play again");
        Observable.interval(200).subscribe(() => { backSound.volume -= 0.001; });
        Observable.interval(3000).subscribe(() => { backSound.pause(); endAction(); });
    });
    Observable.interval(15).takeUntil(endGame)
        .subscribe(() => {
        backSound.play();
    });
    mousemove.takeUntil(endGame)
        .map(({ clientY }) => ({ y: clientY - svgBounds.top - Number(player.attr("height")) / 2 }))
        .filter(({ y }) => y > 0 && y < 520)
        .subscribe(({ y }) => {
        if (!pause)
            player.attr("y", y);
    });
    let speed = ballSpeed * randomDirection(), ySpeed = randomSpeed() * randomDirection();
    const ballMove = Observable.interval(15).takeUntil(endGame);
    ballMove.map(() => ({ ball: document.getElementById("ball") }))
        .map(({ ball }) => ({ ball, xPos: Number(ball.getAttribute("cx")), yPos: Number(ball.getAttribute("cy")) }))
        .subscribe(({ ball, xPos, yPos }) => {
        if (!pause) {
            ball.setAttribute("cx", String(xPos + speed));
            ball.setAttribute("cy", String(yPos + ySpeed));
        }
    });
    function bouncePaddle(current) {
        const mapping = ballMove.map(() => ({ ball: document.getElementById("ball"), current: document.getElementById(current) }))
            .map(({ ball, current }) => ({
            ball,
            width: Number(current.getAttribute("width")),
            height: Number(current.getAttribute("height")),
            xBall: Number(ball.getAttribute("cx")),
            yBall: Number(ball.getAttribute("cy")),
            xCurrent: Number(current.getAttribute("x")),
            yCurrent: Number(current.getAttribute("y"))
        }));
        mapping.filter(({ width, height, xBall, yBall, xCurrent, yCurrent }) => (xCurrent < xBall && xBall <= xCurrent + width)
            &&
                (yCurrent < yBall && yBall < yCurrent + height * 0.45))
            .subscribe(() => {
            bounceSound.play();
            speed = -1 * speed;
            ySpeed = -1 * (randomSpeed() + 1);
        });
        mapping.filter(({ width, height, xBall, yBall, xCurrent, yCurrent }) => (xCurrent < xBall && xBall <= xCurrent + width)
            &&
                (yCurrent + height * 0.45 <= yBall && yBall <= yCurrent + height * 0.55))
            .subscribe(() => {
            bounceSound.play();
            speed = -1 * speed;
            ySpeed = randomSpeed() * randomDirection();
        });
        mapping.filter(({ width, height, xBall, yBall, xCurrent, yCurrent }) => (xCurrent < xBall && xBall <= xCurrent + width)
            &&
                (yCurrent + height * 0.55 < yBall && yBall < yCurrent + height))
            .subscribe(() => {
            bounceSound.play();
            speed = -1 * speed;
            ySpeed = randomSpeed() + 1;
        });
    }
    bouncePaddle("player");
    bouncePaddle("ai");
    ballMove.map(() => ({ ball: document.getElementById("ball") }))
        .map(({ ball }) => ({ ball, xBall: Number(ball.getAttribute("cx")), yBall: Number(ball.getAttribute("cy")) }))
        .filter(({ xBall, yBall }) => (0 >= yBall && (xBall >= 0 && xBall <= 600)) || (600 <= yBall && (xBall >= 0 && xBall <= 600)))
        .subscribe(() => {
        wallSound.play();
        ySpeed = -1 * ySpeed;
    });
    ballMove.map(() => ({ ball: document.getElementById("ball"), playerPaddle: document.getElementById("player"), aiPaddle: document.getElementById("ai") }))
        .map(({ ball, playerPaddle, aiPaddle }) => ({ ball, playerPaddle, aiPaddle, xBall: Number(ball.getAttribute("cx")) }))
        .filter(({ xBall }) => (xBall < 0) || (xBall > 600))
        .subscribe(({ ball, xBall, playerPaddle, aiPaddle }) => {
        scoreSound.play();
        ball.setAttribute("cx", "300");
        ball.setAttribute("cy", String(ballPositions[randomIndex()]));
        playerPaddle.setAttribute("y", "260"),
            aiPaddle.setAttribute("y", "260");
        ySpeed = randomSpeed() * randomDirection();
        xBall > 600 ? setText(playerScore, Number(getText(playerScore)) + 1) : setText(aiScore, Number(getText(aiScore)) + 1);
        pause = true;
        Observable.interval(1000).takeUntil(Observable.interval(2000)).subscribe(() => { pause = false; });
    });
    const aiMove = Observable.interval(20).takeUntil(endGame);
    aiMove.map(() => ({ ball: document.getElementById("ball"), aiPaddle: document.getElementById("ai") }))
        .map(({ ball, aiPaddle }) => ({
        paddle: aiPaddle,
        yBall: Number(ball.getAttribute("cy")),
        yPaddle: Number(aiPaddle.getAttribute("y")),
        height: Number(aiPaddle.getAttribute("height")),
    }))
        .filter(({ yBall, yPaddle, height }) => yPaddle + height / 2 < yBall)
        .filter(({ yPaddle, height }) => (yPaddle + aiSpeed >= 0) && (yPaddle + aiSpeed < 600 - height))
        .subscribe(({ paddle, yPaddle }) => {
        if (!pause) {
            paddle.setAttribute("y", String(yPaddle + aiSpeed));
        }
    });
    aiMove.map(() => ({ ball: document.getElementById("ball"), aiPaddle: document.getElementById("ai") }))
        .map(({ ball, aiPaddle }) => ({
        paddle: aiPaddle,
        yBall: Number(ball.getAttribute("cy")),
        yPaddle: Number(aiPaddle.getAttribute("y")),
        height: Number(aiPaddle.getAttribute("height")),
    }))
        .filter(({ yBall, yPaddle, height }) => yPaddle + height / 2 > yBall)
        .filter(({ yPaddle, height }) => (yPaddle - aiSpeed >= 0) && (yPaddle - aiSpeed < 600 - height))
        .subscribe(({ paddle, yPaddle }) => {
        if (!pause) {
            paddle.setAttribute("y", String(yPaddle - aiSpeed));
        }
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map