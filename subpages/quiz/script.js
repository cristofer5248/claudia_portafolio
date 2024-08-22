var startButton = document.getElementById("start-btn");
var questionContainerElement = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const pquestionElement = document.getElementById("pquestion");
const answerButtonsElement = document.getElementById("answer-buttons");
let shuffledQuestions, currentQuestionIndex;
var nextButton = document.getElementById("next");
startButton.addEventListener("click", startGame);
nextButton.addEventListener("click", () => {
currentQuestionIndex++;
setNextQuestion()
})


function startGame() {
console.log("Started");
startButton.classList.add("hide");
shuffledQuestions = questions.sort(() => Math.random() - .5);
currentQuestionIndex = 0;
questionContainerElement.classList.remove("hide");
setNextQuestion();
}

function setNextQuestion() {
resetState();
showQuestion(shuffledQuestions[currentQuestionIndex])
}

function showQuestion(question) {
  questionElement.src = question.question;
  console.log(question.pregunta);
  pquestionElement.innerText = question.pregunta;
  question.answers.forEach(answer => {
  const button = document.createElement("button");
  button.innerText = answer.text;
  button.classList.add("btn");
  if(answer.correct) {
    button.dataset.correct = answer.correct
  }
  button.addEventListener("click", selectAnswer);
  answerButtonsElement.appendChild(button);
  })
}

var numCorrect = 0;

function resetState() {
  clearStatusClass(document.body)
  nextButton.classList.add('hide')
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
}


function selectAnswer(e) {
  const selectedButton = e.target
  const correct = selectedButton.dataset.correct
  setStatusClass(document.body, correct)
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct)
  })
  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide')
  } else {
    startButton.innerText = 'Restart';
    startButton.classList.remove('hide')
  }
}

function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
element.classList.add("correct")
} else {
 element.classList.add("wrong")   
  }
} 

function clearStatusClass(element) {
element.classList.remove("correct");
element.classList.remove("wrong");
}


const questions = [
 {
  question: "https://upload.wikimedia.org/wikipedia/en/8/89/Shaun_Murphy_Upper_Body.jpeg",
  pregunta: "Quien es?",
  answers: [
  {text: "Shaun" , correct: true},
  {text: "Glassman", correct: false},
  {text: "Marcus", correct: false},
  {text: "Park", correct: false}
  ]  
   
 },
{
  question: "https://hips.hearstapps.com/hmg-prod/images/unsaid-despite-everyone-elses-doubts-shaun-is-hopeful-that-news-photo-1596098199.jpg",
  pregunta: "Quien es?",
  answers: [
  {text: "Morgan" , correct: false},
  {text: "Lea", correct: true},
  {text: "Jordan", correct: false},
  {text: "Claire", correct: false}
  ]  
   
 },
  {
  question: "https://i.pinimg.com/736x/ae/ce/0a/aece0a9154a7dd67e1c485f43a91a2aa.jpg",
  pregunta: "Quien es?",
  answers: [
  {text: "Chainsaw" , correct: false},
  {text: "Goku", correct: false},
  {text: "Demon Slayer", correct: false},
  {text: "Pochita", correct: true}
  ]  
   
 },
   {
  question: "https://artisanhd.com/wp-content/uploads/2018/10/Francesco-Tonelli-Food-Photography-artisanhd.jpg",
  pregunta: "Cual comida prefiero?",
  answers: [
  {text: "McMuffin" , correct: true},
  {text: "Hamburger", correct: false},
  {text: "Cenas Mister Donnut", correct: false},
  {text: "Burritos", correct: false}
  ]  
   
 },
{
  question: "https://i.mydramalist.com/rNb5PD_7f.jpg",
  pregunta: "Quien es?",
  answers: [
  {text: "Kang Ji-Won	" , correct: false},
  {text: "Yoo Ji-Hyeok", correct: false},
  {text: "Park Min-Hwan", correct: true},
  {text: "Baek Eun-Ho", correct: false}
  ]  
   
 },
{
  question: "https://picoparkgame.com/assets/img/mode/world/1.png",
  pregunta: "Que juego es? volvamos a jugar por cierto xd",
  answers: [
  {text: "Super Mario" , correct: false},
  {text: "Piko Park", correct: true},
  {text: "Candy Crush", correct: false},
  {text: "Pacman", correct: false}
  ]  
   
 },
{
  question: "https://cdn.cdkeys.com/700x700/media/catalog/product/n/e/new_project_-_2023-05-01t124815.049.jpg",
  pregunta: "Que juego es?",
  answers: [
  {text: "Bleach" , correct: true},
  {text: "Dragon Ball", correct: false},
  {text: "Another", correct: false},
  {text: "Seven Deadly Sins", correct: false}
  ]  
   
 },
{
  question: 
  "https://i.pinimg.com/236x/df/4b/87/df4b87c4271badf40a3dc84f13933386.jpg",
  pregunta: "Quien es?",
  answers: [
  {text: "DARLING in the FRANXX" , correct: false},
  {text: "Tokyo Revengers", correct: false},
  {text: "Dragon Ball", correct: true},
  {text: "Dr. Stone", correct: false}
  ]  
   
 },
{
  question: "https://i.pinimg.com/236x/c7/ce/2c/c7ce2c987454feb5bde08c71ef243776.jpg",
  pregunta: "Quien es?",
  answers: [
  {text: "Bleach" , correct: false},
  {text: "Skate the Infinity", correct: false},
  {text: "One piece", correct: false},
  {text: "Jojo's Bizarre Adventure", correct: true}
  ]  
   
 }
];