
function breakout(){
    /*
      The main code of the game is seperated from this breakout function as I wanted to the user to click on the svg before the game is allowed to start.
      As I wanted for certain texts to be displayed on the svg, I created new svg Elems of text type through the use of the mainText() and subText().
      When this fucntion runs the svg would be observing for a mousedown event and end directly after a mouseup event.
      Once a mousedown has occured within the svg, the code will then hide the text elements by setting its fontsize to 0 and aftewards calls game(title,sub).
      The game() function would store most of the functionality of the breakout game from the player baddle ,ball, blocks and score
      title and Sub would be passed down into game function as they represent the text element hidden which would later be modified to output score of the player
    */
   const
   svg = document.getElementById("canvasB")!

 // creating the intro text
 let
   title = mainText(svg,"Click anywhere to start a game"),
   sub = subText(svg,"Break all the blocks to win")
 
 // To start the game the svg would need to obeserve for a mouseclick and would not observe any further mouseclick
 Observable.fromEvent<MouseEvent>(svg,"mousedown").takeUntil(Observable.fromEvent<MouseEvent>(svg,"mouseup"))
   .subscribe(()=>{
     // hides the text before the game starts
     title.attr("font-size",0)
     sub.attr("font-size",0)
     // game() would store most of the code which allows the pong game to run
     breakOutgame(title,sub);
   })
}

function breakOutgame(title:Elem,sub:Elem){
    /* 
        this function contains most of the breakout game's functionailty, from its player paddle movement, ballmovement as well as observing collision of the ball with everything
    */
    const 
    // the canvas would be called by using svg
    svg = document.getElementById("canvasB")!,
    // observes a mousemove within the canvas
    mousemove = Observable.fromEvent<MouseEvent>(svg,"mousemove"),
    // observes a mousedown within the canvas
    mousedown = Observable.fromEvent<MouseEvent>(svg,"mousedown"),
    // observes a mouseup within the canvas
    mouseup = Observable.fromEvent<MouseEvent>(svg,"mouseup"),
    // Allows us to obtain the boundaries of the canvas
    svgBounds = svg.getBoundingClientRect(),
    //Audio files for the soiund effect of the game
    bounceSound = new Audio("bounce.wav"),
    wallSound = new Audio("wall.wav"),
    scoreSound = new Audio("score.wav"),
    backSound = new Audio("background.mp3")

    let
    //speed of the ball in y direction
    speed = 3,
    xSpeed = 4,
    //The number of points earned by destorying a block
    points = 0,
    //a flag used to pause the game
    hold = true,
    //Player paddle
    player= new Elem(svg, 'rect').attr('x',260).attr('y',570)
            .attr('width', 80).attr('height', 10).attr('fill', 'white'),
    // creates the ball
    ball = new Elem(svg,"circle")
    .attr('cx', 300).attr('cy',Number(player.attr("y"))-Number(player.attr("height")))
    .attr('r',8).attr('fill',"white").attr("id","ball"),
    // Initial posiitons of the blocks
    startX=5,
    startY=55,
    // An array of generated blocks which the player should destory to score points
    arrayOfBlocks = [
        blocks(svg,startX,startY),blocks(svg,startX+85,startY),blocks(svg,startX+2*85,startY),blocks(svg,startX+3*85,startY),blocks(svg,startX+4*85,startY),blocks(svg,startX+5*85,startY),blocks(svg,startX+6*85,startY),
        blocks(svg,startX,startY+25),blocks(svg,startX+85,startY+25),blocks(svg,startX+2*85,startY+25),blocks(svg,startX+3*85,startY+25),blocks(svg,startX+4*85,startY+25),blocks(svg,startX+5*85,startY+25),blocks(svg,startX+6*85,startY+25),
        blocks(svg,startX,startY+2*25),blocks(svg,startX+85,startY+2*25),blocks(svg,startX+2*85,startY+2*25),blocks(svg,startX+3*85,startY+2*25),blocks(svg,startX+4*85,startY+2*25),blocks(svg,startX+5*85,startY+2*25),blocks(svg,startX+6*85,startY+2*25)
    ],
    // The number of block wihtin the game
    numberOfBlocks = arrayOfBlocks.length

    /*
        -- Observing the End of the Game --
        We would no the game would end once the ball has passed the lower canvas boundary or there are no more generated blocks remaining.
        This can be triggered by using an observable to check if whehter or not these conditions are  met for the game to end.
    */
   //The end of the game would be
    const endGame = 
        //Obsersiving every 10 milisecond interval
        Observable.interval(10)
        // we obtain the number of blocks and ball
        .map(({})=>({blocks:numberOfBlocks, ball:ball}))
        // check if the is either no more blocks remaining or the ball excceds the lower boundary of the canvas
        .filter(({blocks,ball})=> blocks === 0|| Number(ball.attr("cy"))>600)

    //Once the game has ended we carry out the following actions
    const endAction = endGame.subscribe(()=>{
        //Remove the paddle and ball
        player.elem.remove()
        ball.elem.remove()
        // remove each elem item within the array
        arrayOfBlocks.forEach(function(item){item.elem.remove()})
        
        // Output the score
        title.attr("font-size",40)
        setText(title,"Your score:" + points)
        // Allows the subtex to reappear
        sub.attr("font-size",15)
        setText(sub,"F5 to play again")
    
        // Make the music fade away for every 300 milisecond interval 
        Observable.interval(200).subscribe(()=>{backSound.volume -= 0.001})
        // Complete the observable 3 seconds after its subscription as well as pausing the background music
        Observable.interval(3000).subscribe(()=>{backSound.pause();endAction()})
        
    })

    /*
        -- Background Music --
        The background music will continue to play if nothing is being played and the game has not yet ended
    */ 
    Observable.interval(10).takeUntil(endGame)
    .subscribe(()=>{
        backSound.play()
    })

    /*
        -- Moving Player Paddle --
        We would want the centre of the paddle to follow the movement of our mouse whenever it hovers over the canvas.
        This would be achieve by observing for every mouse move within the canvas, we would map the offset of our mouse's clientX coordinates and set them
        such that they would represent the position of current location of the mouse as it moves within the canvas.

        We are required to offset the position of clientX as clientX represents the X coordinates of the mouse within the entire HTML documents, not within the canvas itself.
        We are also required to filter which positions of the mouse would be mapped such that they do not exceed the left and right boundaries of the canvas.

        As the event passes through our filter position the event would then be subsricbbed such that the position of our paddle would be updated.
    */
    mousemove.takeUntil(endGame)
      // obtains the position of y where y is the position of the mouse subtracted by the position of the canvas and half the height paddle
      .map(({clientX}) => ({ x: clientX - svgBounds.left - Number(player.attr("width"))/2 }))
      // y will allow us to make the mouse follow the center of the paddle
      // Ignore events where y would make the player rect go out of bounds
      .filter(({x})=> x >= 0 && x <= 520)
      // update the value of the paddle
      .subscribe(({x}) =>{
      //when the game is finished
          player.attr("x",x)
      }
    )
    /*
        --Ball follows the cetnre of the paddle before mouseclick --
        This small segement of the code is just allowing the ball to track the movement of the paddle such that it sticks to paddle until a mouseclick occurs
    */
    mousemove.takeUntil(mousedown)
        .subscribe(()=>{
            ball.attr("cx",Number(player.attr("x"))+Number(player.attr("width"))/2)
    })

    /*
        -- Shooting the ball right after mousedown --
        A mouseclick would release the ball from the paddle and allow it to move freely
    */
    const shoot = mousedown.takeUntil(endGame)
        shoot.filter(()=>hold==true).subscribe(()=>{
            hold=false
            /*
                -- Movement of the ball after being shot --
                We would now observe any events which occur with the ball after it has been shot
            */
            const ballMovement =Observable.interval(10).takeUntil(endGame)
            // Movinng the ball every interval
            ballMovement.subscribe(()=>{
                ball.attr("cy",Number(ball.attr("cy")) - speed)
                ball.attr("cx",Number(ball.attr("cx")) + xSpeed)
            })
            // When the ball collides with the left and right walls
            ballMovement.map(()=>({xBall:Number(ball.attr("cx"))}))
                .filter(({xBall})=> xBall <= 0 || xBall >= 600)
                .subscribe(()=>{
                    wallSound.play()
                    xSpeed = xSpeed * -1
                })
            // When the ball collides with the upper wall
            ballMovement.map(()=>({yBall:Number(ball.attr("cy"))}))
                .filter(({yBall})=> yBall <= 0)
                    .subscribe(()=>{
                        wallSound.play()
                        speed = speed *-1
            })
            /*
                --Coliison of the ball with the paddle --
                We would know if the ball and the paddle is collided by looking at whether the balls x and y coordinates intersects the x and y coodinates of the paddle within the svg.
                If this condition is met then it should be hanlded and allow the ball to move in the opposite y direction
            */ 
            // Maps every variable required to check if an collision occurs with a the player paddle
            ballMovement.map(()=>({
                // The x position of the ball
                xBall : Number(ball.attr("cx")),
                // The y posiotin of the ball
                yBall : Number(ball.attr("cy")),
                // The width of the current paddle
                width : Number(player.attr("width")),
                // The height of the current paddle
                height : Number(player.attr("height")),
                // The x position of the paddle
                xPaddle :Number(player.attr("x")),
                // The y positon of the padddle
                yPaddle : Number(player.attr("y"))
            }))
            // check the conditions for the ball to collide with the paddle
            .filter(({width,height,xBall,yBall,xPaddle,yPaddle})=>
                // we can then use filter to see if the ball has intersected the x range of the current paddle
                (xPaddle<xBall && xBall <xPaddle + width) 
                    && 
                // and also to see if the ball has intersected with the starting y of the current paddle up to the 45% value
                (yPaddle <yBall && yBall <= yPaddle + height))
            // if the ball fullfill the conditions stated by filter thus it means the ball has collided with the paddle and action is required
            .subscribe(()=>{
                    bounceSound.play()
                    // Thus,we should then reverse the direction of the ball 
                    speed = -1*speed
            }) 
           
    })
 
    /*
        -- Observing collision of the ball with the blocks --
        We would know if the ball and the blocks is collided by looking at whether the balls x and y coordinates intersects the x and y coodinates of the blocks within the svg.
        If this condition is met then it should be hanlded by removing that block from the canvas, reducing the number of blocks remaing and also reversing the y direciton of the ball.
    */
   // For every 10 milisecond interval until endGame
    Observable.interval(10).takeUntil(endGame).subscribe(()=>{
        // we observe the array of elems
        const blockCollision = Observable.fromArray(arrayOfBlocks).takeUntil(endGame)
        // and map each element
        blockCollision.map(e=>({
            // e would represent each block stored within arrayOfBlocks
            block:e,
            // x position of current elems  
            xPosition:Number(e.attr("x")) ,
            // y position of current elems   
            yPosition:Number(e.attr("y")) ,
            // The x position of the ball
            xBall : Number(ball.attr("cx")),
            // The y position of the ball
            yBall : Number(ball.attr("cy")),
            // The height of the current elem
            height : Number(e.attr("height")),
            // The width of the current elem
            width : Number(e.attr("width"))
        }))
        .filter(({width,height,xBall,yBall,xPosition,yPosition})=>
        // we can then use filter to see if the ball has intersected the x range of the current block
        (xPosition<xBall && xBall <=xPosition+ width) 
            && 
        // and also to see if the ball has intersected with the y range of the current block
        (yPosition <yBall && yBall < yPosition + height))
        // check if the block is broken
        .filter(({block})=>block.attr("break")=="false")
        // if the ball fullfill the conditions stated by filter thus it means the ball has collided with the paddle and action is required
        .subscribe(({block})=>{
        // play the sound of scoring
        scoreSound.play()
        // subtract number of blocks remaining
        numberOfBlocks -=1
        // add points
        points+=100
        // set attr of break to true
        block.attr("break","true")
        // remove the block from the svg
        block.elem.remove()
        // Thus,we should then reverse the direction of the ball 
        speed = -1*speed
        })   
    })
}


// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    breakout();
  }
