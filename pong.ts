
function pong(){
    /*
      The main code of the game is seperated from this pong function as I wanted to the user to click on the svg before the game is allowed to start.
      As I wanted for certain texts to be displayed on the svg, I created new svg Elems of text type through the use of the mainText() and subText().
      When this fucntion runs the svg would be observing for a mousedown event and end directly after a mouseup event.
      Once a mousedown has occured within the svg, the code will then hide the text elements by setting its fontsize to 0 and aftewards calls game(pongtitle,pongSub).
      The game() function would store most of the functionality of the pong game from initialising the paddle, ball and scores as well as controling the player paddle, ai opponent padddle and the balls physics.
      pongTitle and pongSUb would be passed down into game function as they represent the text element hidden which would later be modified to output the winner of the game
    */
    const
      svg = document.getElementById("canvas")!
  
    // creating the intro text
    let
      pongTitle = mainText(svg,"Click anywhere to start a game"),
      pongSub = subText(svg,"Score up to 11 to win")
    
    // To start the game the svg would need to obeserve for a mouseclick and would not observe any further mouseclick
    Observable.fromEvent<MouseEvent>(svg,"mousedown").takeUntil(Observable.fromEvent<MouseEvent>(svg,"mouseup"))
      .subscribe(()=>{
        // hides the text before the game starts
        pongTitle.attr("font-size",0)
        pongSub.attr("font-size",0)
        // game() would store most of the code which allows the pong game to run
        game(pongTitle,pongSub)
      })
  
}

function game(pongTitle:Elem,pongSub:Elem){
  /*
    -- Declaring Constant Vaiables --
    We intialize several vairables which would stay constant throughout the entire pong game
    such as the canvas of the pongame, the speed of ball, scorelimit to win the game, speed of ai paddle and etc
  */
  const 
    // the canvas would be called by using svg
    svg = document.getElementById("canvas")!,

    // observes a mousemove within the canvas
    mousemove = Observable.fromEvent<MouseEvent>(svg,"mousemove"),
    // Allows us to obtain the boundaries of the canvas
    svgBounds = svg.getBoundingClientRect(),

    // The number of scores for the game to end
    scoreLimit = 11,
    // The speed of the moving ball in the x direction
    ballSpeed = 7,
    // Base movespeed of the ai paddle
    aiSpeed = 3,
    // The line which seperates the player and the ai paddle
    seperator = new Elem(svg,'line')
      .attr('x1', 300).attr('x2',300)
      .attr('y1',0).attr('y2',600)
      .attr('stroke', 'white').attr("stroke-dasharray",10),
    bounceSound = new Audio("bounce.wav"),
    wallSound = new Audio("wall.wav"),
    scoreSound = new Audio("score.wav"),
    backSound = new Audio("background.mp3"),
    ballPositions =[150,300,450],
    randomIndex = () => Math.floor(Math.random() * Math.floor(3))

  

  /*
    -- Declaring Mutable Variables --
    In here we would declare variables which would be changed and modified throughout the entire code.
    This would incluede the Elems which represents the player paddle, ai paddle,ball, and scores
    As well as a boolean flag which is used to identify if a the ball movement and ai movement should be paused for 1 second before allowing it to move
  */
  let
    // creates a player paddle
    player = paddles(svg,25,"player"),
    // creates a ai paddle
    opponent = paddles(svg,570,"ai"),
    // creates the ball
    ball = new Elem(svg,"circle")
    .attr('cx', 300).attr('cy',ballPositions[randomIndex()])
    .attr('r',8).attr('fill',"white").attr("id","ball"),
    //pause falg
    pause = true,
    // Position of the playerscore will be at the index x positon of 150
    playerScore = score(svg,150),
    // Position of the aiScore will be at the index x positon of 150
    aiScore = score(svg,430)

  /*
    -- One second timer to unpause the game--
    Originally the game would have its pause flag is through, what this flag does that it allows the subscriptions of the obesevables 
    observing the ball movement , paddle movement and ai movement to ignored thus not allowng its variables to be changed.
    By implementing ths small segement of the code, it allows us to take 1 second for any observables can carry out their subscriptions
  */
  Observable.interval(1000).takeUntil(Observable.interval(2000))
    .subscribe(()=>{pause = false})

  /*
    -- Observing the End of the Game --
    We would know that the game would end whenever the score obtained by either the ai or the player is == to the scoreLimit.
    All of the other observables running within the function should also stop observing.
    To achieve this we use another observable to observe whether or not any of the scores is == to the scoreLimit, we will be able to use this observable
    to trigger the takeUnitl() function as defined within the Observable interface.
    Be able to trigger the takeUntil() function would allow us to stop other the other observable from observing.

    Once the game has ended, we would want to output the result of the game, and this can be achieve by subscribing whenever this specific event occurs.
    IF this event occurs, we would want to display its output as a result, thorugh setting its font size to it original value as well as hiding the other svg Elements such as the paddles, seperators and ball.
    The text of pongTitle and pongSub would then be modified through the use of setScore() which sets the text Element's textContent.
    pongTitle would either display "YOU WIN" or "YOU LOSE" , determined by whether the score of player is greater than or lesser than the score of the opposing ai repsectively.
    pongSUb will now simply display "F5 to Play Again".
    
  */
  const endGame = 
    Observable.interval(15)
    .map(({})=>({pScore:(Number(getText(playerScore))),aScore:(Number(getText(aiScore)))}))
    .filter(({pScore,aScore})=> pScore === scoreLimit || aScore === scoreLimit)
  
  const endAction = endGame.subscribe(()=>{
    //Removes the paddles ball and seperator
    player.elem.remove()
    opponent.elem.remove()
    seperator.elem.remove()
    ball.elem.remove()
    
    // Outputs the result
    pongTitle.attr("font-size",40)
    if (Number(getText(playerScore))>Number(getText(aiScore))){
      setText(pongTitle,"YOU WIN")
    }
    else{
      setText(pongTitle,"YOU LOSE")
    }
    // Allows the subtex to reappear
    pongSub.attr("font-size",15)
    setText(pongSub,"F5 to play again")
  
    // Make the music fade away for every 300 milisecond interval 
    Observable.interval(200).subscribe(()=>{backSound.volume -= 0.001})
    // Complete the observable 3 seconds after its subscription as well as pausing the background music
    Observable.interval(3000).subscribe(()=>{backSound.pause();endAction()})
    
  })

  /*
    -- Background Music --
    The background music will continue to play if nothing is being played and the game has not yet ended
  */ 
 
  Observable.interval(15).takeUntil(endGame)
  .subscribe(()=>{
    backSound.play()
  })

  /*
     -- Moving the Player Paddle -- 
    We would want the centre of the paddle to follow the movement of our mouse whenever it hovers over the canvas.
    This would be achieve by observing for every mouse move within the canvas, we would map the offset of our mouse's clientY coordinates and set them
    such that they would represent the position of current location of the mouse as it moves within the canvas.

    We are required to offset the position of clientY as clientY represents the y coordinates of the mouse within the entire HTML documents, not within the canvas itself.
    We are also required to filter which positions of the mouse would be mapped such that they do not exceed the upper and lower boundaries of the canvas.

    As the event passes through our filter position the event would then be subsricbbed such that the position of our paddle would be updated.
  */

    mousemove.takeUntil(endGame)
      // obtains the position of y where y is the position of the mouse subtracted by the position of the canvas and half the height paddle
      .map(({clientY}) => ({ y: clientY - svgBounds.top - Number(player.attr("height"))/2 }))
      // y will allow us to make the mouse follow the center of the paddle
      // Ignore events where y would make the player rect go out of bounds
      .filter(({y})=> y > 0 && y < 520)
      // update the value of the paddle
      .subscribe(({y}) =>{
      //when the game is finished
        if(!pause)
          player.attr("y",y)
      }
    )

  /*
    -- Observing Ball Movement --
    We know that we are only able to set objects to a specific position within the svg canvas.
    The concept behind a moving object is simply incrementing the position of the object by a certain value repeatedly within a certain time
    This would be achieve by Observable.interval() to allow an event to occur every several miliseconds
    
    For each every several miliseconds as stated by the argument within the Observable.interval(),each event will undergo mapping and filtering
    to see if any handling is required for a within that specific event interval.

    Mapping would allow us to pass down the balls attribute data as arguments.
    Filtering would allow us to check if those arguments fullfills a certain condition for that event to be handled

    The events which would be handled would be ball movement,ball collision with paddle, ball collision with boundaries , and ball scoring
    
    Handling each event would be undergone by subsribing the desired changes to the balls attribute
  */



    let 
      speed = ballSpeed * randomDirection(),
      ySpeed = randomSpeed() * randomDirection()

    // ballMove will Observe events every 15 miliseconds until endGame is observabe is triggered
    const ballMove = Observable.interval(15).takeUntil(endGame)
    
    // -- Moving the ball at every interval of the Event --
    // For every ballMove, we would look into the HTML Element of the ball by using getElementById to obtain the svgElement with that specific id
    ballMove.map(()=>({ball:document.getElementById("ball")!}))
      // It can then be used to obtain the current x and y positions of the HTMLElement
      .map(({ball})=>({ball,xPos:Number(ball.getAttribute("cx")),yPos:Number(ball.getAttribute("cy"))}))
      // And allow its position to be readjusted based on the current speed and ySpeed of the ball
      .subscribe(({ball,xPos,yPos})=>{
        if (!pause){
          ball.setAttribute("cx",String(xPos+speed))
          ball.setAttribute("cy",String(yPos+ySpeed))
        }
      })
    

    /*
       -- A function which observes an collision event with any paddle --
    */
    function bouncePaddle(current:string):void{
      // For ballMove being observed, we would look into the the HTML Elements of the ball as well as the paddle with the attribute id of current
      const mapping =ballMove.map(()=>({ball:document.getElementById("ball")!,current:document.getElementById(current)!}))
        // Through mapping those HTMLElements we can further obtain the:
        .map(({ball,current})=>({ 
          // the svg element with the id of ball
          ball,
          // The width of the current paddle
          width : Number(current.getAttribute("width")),
          // The height of the current paddle
          height : Number(current.getAttribute("height")),
          // The current ball x position within the svg
          xBall : Number(ball.getAttribute("cx")),
          // The current ball y position within the svg 
          yBall : Number(ball.getAttribute("cy")),
          // The current paddles x position within the svg
          xCurrent : Number(current.getAttribute("x")), 
          // The current paddles y position within the svg
          yCurrent : Number(current.getAttribute("y"))
        }))
      
      // Allows the ball to bounce upwards if it collides with the upper 45% of the paddles
      mapping.filter(({width,height,xBall,yBall,xCurrent,yCurrent})=> 
          // we can then use filter to see if the ball has intersected the x range of the current paddle
          (xCurrent<xBall && xBall <= xCurrent + width) 
            && 
          // and also to see if the ball has intersected with the starting y of the current paddle up to the 45% value
          (yCurrent <yBall && yBall < yCurrent + height*0.45))
        // if the ball fullfill the conditions stated by filter thus it means the ball has collided with the paddle and action is required
        .subscribe(()=>{
          bounceSound.play()
          // Thus,we should then reverse the direction of the ball 
          speed = -1*speed
          // as well as change its y direction
          ySpeed = -1*(randomSpeed()+1)
        })
        
      // Allows the ball to bounce horizontally if it collides with the paddles centre 10%
      mapping.filter(({width,height,xBall,yBall,xCurrent,yCurrent})=> 
          // we can then use filter to see if the ball has intersected the x range of the current paddle
          (xCurrent<xBall && xBall <= xCurrent + width) 
            && 
          // and also to see if the ball has intersected with the starting 45% y value of the paddle up to the 55% y value of the paddle
          ( yCurrent + height*0.45 <= yBall && yBall <= yCurrent + height*0.55))
        // if the ball fullfill the conditions stated by filter thus it means the ball has collided with the paddle and action is required
        .subscribe(()=>{
          bounceSound.play()
          // Thus,we should then reverse the direction of the ball 
          speed = -1*speed
          // as well as change its y direction
          ySpeed = randomSpeed() * randomDirection()
        })
      
      mapping.filter(({width,height,xBall,yBall,xCurrent,yCurrent})=> 
        // we can then use filter to see if the ball has intersected the x range of the current paddle
        (xCurrent<xBall && xBall <= xCurrent + width) 
          && 
        //  and also to see if the ball has intersected with the starting 55% y value of the paddle up to the maximum y value of the paddle
        ( yCurrent + height*0.55 <yBall && yBall <yCurrent + height ))
      // if the ball fullfill the conditions stated by filter thus it means the ball has collided with the paddle and action is required
      .subscribe(()=>{
        bounceSound.play()
        // Thus,we should then reverse the direction of the ball 
        speed = -1*speed
        // as well as change its y direction
        ySpeed = randomSpeed()+1
      })


      
    }

    bouncePaddle("player")  // Observing collsion with player paddle
    bouncePaddle("ai")      // Observing collsion with ai paddle

    /*
      -- Handles the collision of the ball with the upper bounds and lower bounds of the canvas -- 
    */

    // For ballMove being observed, we would look into the the HTML Elements of the ball
    ballMove.map(()=>({ball:document.getElementById("ball")!}))
      // We would then pass down its x and y position as arguments
      .map(({ball})=>({ball,xBall:Number(ball.getAttribute("cx")),yBall:Number(ball.getAttribute("cy"))}))
      // and check if the positon of the ball intersects with the upper and lower bounds of the canvas
      .filter(({xBall,yBall})=>
        ( 0 >= yBall && (xBall >= 0 && xBall <= 600)) || ( 600 <= yBall && (xBall >= 0 && xBall <= 600))
      )
      // if it does we would handle it by
      .subscribe(()=>{
        wallSound.play() // play an audio file as stated by wallSound
        // reversing the y direction of the ball to make it bounce in the opposite y direction
        ySpeed = -1*ySpeed
      })

    /* 
      -- Handles the scoring when the balls exceeds the left and right boundaries of the canvas -- 
    */

    // For ballMove being observed, we would look into the the HTML Elements of the ball , player paddle and ai paddle
    ballMove.map(()=>({ball:document.getElementById("ball")!,playerPaddle:document.getElementById("player")!,aiPaddle:document.getElementById("ai")!}))
      // We would then pass down their attributes as arguments
      .map(({ball,playerPaddle,aiPaddle})=>({ball,playerPaddle,aiPaddle,xBall:Number(ball.getAttribute("cx"))}))
      // and check whether the ball position has exceed the left or right bounds of the canvas
      .filter(({xBall})=>
        (xBall < 0)||(xBall>600)
      )
      // If it does then:
      .subscribe(({ball,xBall,playerPaddle,aiPaddle})=>{
        scoreSound.play() // play a audio file as stated by scoreSound
        // we reset the position of the ball
        ball.setAttribute("cx","300")
        ball.setAttribute("cy",String(ballPositions[randomIndex()]))
        // and reset the position of the paddles
        playerPaddle.setAttribute("y","260"),
        aiPaddle.setAttribute("y","260")
        ySpeed = randomSpeed() * randomDirection()
        // increment the scoring of the player or ai depending on where the ball currently lies
        xBall > 600 ? setText (playerScore, Number(getText(playerScore)) + 1) : setText( aiScore, Number(getText(aiScore)) + 1 )
        // allow the game to be paused thus no subscriptions of moving the ball occurs
        pause = true
        // and unpause the game after a 1 second interval
        Observable.interval(1000).takeUntil(Observable.interval(2000)).subscribe(()=>{pause = false})
      })
    

    
  /*
      -- Movement of AI paddle towards the ball --
      For the ai paddle to bounce the ball, we must track the postion of the ball and adjust the position 
      of the paddle such that the paddle is actually chasing after the y position of the ball.
      This way we would avoid the ai paddle from having a 100% win rate :P
  */
    // aiMove will Observe events every 15 miliseconds until endGame is observabe is triggered
    const aiMove = Observable.interval(20).takeUntil(endGame)

    // Handles moving torwards the ball when the paddle is above the ball
    // For ballMove being observed, we would look into the the HTML Elements of ball and the ai paddle
    aiMove.map(()=>({ball:document.getElementById("ball")!,aiPaddle:document.getElementById("ai")!}))
    // And map the ball attribute of x y and paddle attribute of height as arguments
    .map(({ball,aiPaddle})=>({
      paddle:aiPaddle,
      yBall : Number(ball.getAttribute("cy")),
      yPaddle: Number(aiPaddle.getAttribute("y")),
      height: Number(aiPaddle.getAttribute("height")),
    }))
    // We then check if the centre of the paddle is lesser then the position of the ball
    .filter(({yBall,yPaddle,height}) => yPaddle + height/2 < yBall)
    // We then check if move the paddle torwards the ball will it exceed or intersect with its upper or lower limit
    .filter(({yPaddle,height}) => 
      (yPaddle + aiSpeed >= 0) && (yPaddle + aiSpeed < 600 - height)
    )
    // If both checks pass:
    .subscribe(({paddle,yPaddle})=>{
      if(!pause){
      // We would then move the paddle torwards the ball when the pause declaration is false
      paddle.setAttribute("y",String(yPaddle+aiSpeed))
      }
    })

    // Handles moving torwards the ball when the paddle is below the ball
    // For ballMove being observed, we would look into the the HTML Elements of ball and the ai paddle
    aiMove.map(()=>({ball:document.getElementById("ball")!,aiPaddle:document.getElementById("ai")!}))
    // And map the ball attribute of x y and paddle attribute of height as arguments
    .map(({ball,aiPaddle})=>({
      paddle:aiPaddle,
      yBall : Number(ball.getAttribute("cy")),
      yPaddle: Number(aiPaddle.getAttribute("y")),
      height: Number(aiPaddle.getAttribute("height")),
    }))
    // We then check if the centre of the paddle is greater then the position of the ball
    .filter(({yBall,yPaddle,height}) => yPaddle + height/2 > yBall)
    // We then check if move the paddle torwards the ball will it exceed or intersect with its upper or lower limit
    .filter(({yPaddle,height}) => 
      (yPaddle - aiSpeed >= 0) && (yPaddle - aiSpeed < 600 - height)
    )
     // If both checks pass:
    .subscribe(({paddle,yPaddle})=>{
      if(!pause){
        // We would then move the paddle torwards the ball when the pause declaration is false
        paddle.setAttribute("y",String(yPaddle-aiSpeed))
      }
    })
  


    
}

// the following simply runs your pong function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    pong();
  }
