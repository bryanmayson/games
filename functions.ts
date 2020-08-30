/*
    Functions.ts is a list of functions which could be used for both breakout and pong
*/

//-- Creating the paddles --
function paddles  (svg:HTMLElement,x:number,idName:string):Elem{
    /*
      paddles(svg,number) creates a new Elem of type rect at x position within an svg of type HTMLElement and returns it
      This function would be used to create the paddles for the player and the ai opponent
    */
    const paddle=new Elem(svg, 'rect').attr('x', x).attr('y',260).attr('width', 10).attr('height', 80).attr('fill', 'white').attr("id",idName);
    return paddle
}

function blocks  (svg:HTMLElement,x:number,y:number):Elem{
    /*
      paddles(svg,number) creates a new Elem of type rect at x position within an svg of type HTMLElement and returns it
      This function would be used to create the paddles for the player and the ai opponent
    */
    const paddle=new Elem(svg, 'rect').attr('x', x).attr('y',y).attr('width', 80).attr('height', 20).attr('fill', 'white').attr('break',"false");
    return paddle
}



// -- Creating the score counter -- 
function score (svg:HTMLElement,x:number): Elem{
  /*
    score(svg,number) creates a new Elem of type text at the x position within the svg of type HTMLElement and returns it
    This function would be used to create the score counter to keep track of the scores of player and ai displayed within the svg
  */
  let currentElem =new Elem(svg,"text")
          .attr('x', x).attr('y',50)
          .attr("fill","white").attr("font-size",30)
          .attr("font-family","Impact");
  // Initialise the score on the table to 0
  setText(currentElem,"0")
  return currentElem
}

function getText(targetScore:Elem):string{
  /*
    getScore(targetScore,text) extracts the textContent stored within the Elem defined by targetScore and returns that text
    This is a getter function which would be used mainly for obtaining the textContent of svg text elements
  */
  return targetScore.elem.textContent!
}

// Sets textContent of any text type Elem  
function setText(targetScore:Elem,text:any){
  /*
    setScore(targetScore,text) selectes an Elem defined by targetScore and set its text contents into the desired text
    This is a setter function which would be used in setting or changing the text of certain Elem (usually used for the text type svg)
  */
  targetScore.elem.textContent = String(text)
}

// A function which would be used to create a mainText in the centre of the svg (Would be used for creating the Intro title as well as outputing whether or not we win or lose)
function mainText(svg:HTMLElement,text:string){
    let end = new Elem(svg,"text")
      .attr('x',300).attr('y',300).attr("font-size",40).attr("text-anchor","middle")
      .attr('fill',"white")
    setText(end,text)
    return end
}

// A function which creates a subtext below the mainText also in the centre of the svg
function subText(svg:HTMLElement,text:string){
  let restart = new Elem(svg,"text")
    .attr('x', 300).attr('y',320).attr("font-size",15).attr("text-anchor","middle")
    .attr('fill',"white")
    setText(restart,text)
    return restart
}

// randomDirection: A function which would return 1 or -1
const randomDirection = () => 2*Math.floor(Math.random() * Math.floor(2))-1
// randomSpeed: a function which would return the either possible values 0 1 2 3
const randomSpeed = () => Math.floor(Math.random() * Math.floor(3))