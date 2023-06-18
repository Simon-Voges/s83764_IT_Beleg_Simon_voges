"use strict";

document.addEventListener("DOMContentLoaded", function () { // event listener der wartet bis DOM content fertig geladen ist befor das script gestartet wird
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    p.setModelandView(m, v); // model und view sind eigenschaften der Presenter instanz(bearbeitung)
    v.setHandler();
});




//################# Model #################

class Model {
    constructor() {

     }
    
     setPresenter(p) {
        this.p =p;
     }





    //frage aufrufen
}

//################## Controller ##############

class Presenter {
    constructor() {
        this.correctAnswers = 0;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.currentCategory = null;
        this.categoryScores = {}; 
    }
    setModelandView(m, v) {
        this.m = m;
        this.v = v;
    }



    loadCategory(category) {
        this.currentCategory = category; 
        this.currentQuestions = questions[category];
        this.currentQuestionIndex = 0;
        this.categoryScores[this.currentCategory] = 0; 

        if (!this.categoryScores[category]) {
            this.categoryScores[category] = 0;
        }
        shuffleQuestions();
        console.log("loadQuestions was called with category: " + category);
        this.loadQuestion();

        document.getElementById('statistics').style.display = 'none';

        document.getElementById('fragendisplay').style.display = 'block';
        document.getElementById('buttons').style.display ='block';
    }

    loadQuestion(){
        console.log("loadQuestion was called for index: " + this.currentQuestionIndex);
        let questionText = this.currentQuestions[this.currentQuestionIndex].text;
        this.v.renderText(questionText);
        let answers = this.currentQuestions[this.currentQuestionIndex].answers;
        this.v.inscribeAnswerButton(answers);
        this.v.setAnswerButtonHandlers();
    }

// in your Presenter class
loadExtern() {
    xhrHandler().then(question_array => {
        console.log("Before updating current questions: ", this.currentQuestions);
        this.currentCategory = 'extern';
        this.currentQuestions = question_array; 
        this.currentQuestionIndex = 0;
        this.categoryScores[this.currentCategory] = 0; 
        console.log("After updating current questions: ", this.currentQuestions);

        if (!this.categoryScores['extern']) {
            this.categoryScores['extern'] = 0;
        }

        console.log("loadQuestions was called with category: extern");
        this.loadQuestion();

        document.getElementById('statistics').style.display = 'none';
        document.getElementById('fragendisplay').style.display = 'block';
        document.getElementById('buttons').style.display ='block';
    });
}

handleAnswer(answerIndex) {
    let currentQuestion = this.currentQuestions[this.currentQuestionIndex];
    let selectedAnswer = currentQuestion.answers[answerIndex];

    let buttons = document.querySelectorAll('.button');
    if (selectedAnswer.value === 1) {
        this.categoryScores[this.currentCategory]++;
        this.v.updateScore(this.categoryScores[this.currentCategory], this.currentQuestions.length);
        buttons[answerIndex].style.backgroundColor = 'green';
    } else {
        buttons[answerIndex].style.backgroundColor = 'red';
    }

    // Use setTimeout to reset the color of the buttons after 1 second (1000 milliseconds)
    setTimeout(() => {
        buttons.forEach(button => {
            button.style.backgroundColor = '';  // reset color
        });

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.v.displayStatistics(this.categoryScores[this.currentCategory], this.currentQuestions.length);
            if (this.currentCategory === 'extern') {
                this.loadExtern();
            }
        } else {
            // Load the next question after an additional delay of 1 second
            setTimeout(() => {
                this.loadQuestion();
            }, 1000);
        }
    }, 1000);
}

}

    





//############### View ###############

class View {
    constructor(p) {
        this.p = p;
        this.handlers = [];


    }

    setHandler() {
        document.getElementById('mathe').addEventListener('click', () => {this.p.loadCategory('mathe'); });  
        document.getElementById('internettech').addEventListener('click', () => {this.p.loadCategory('internettech'); });  
        document.getElementById('allgemein').addEventListener('click', () => {this.p.loadCategory('allgemein'); });
        document.getElementById('rest').addEventListener('click', () => {this.p.loadExtern(); });   


    }


    setAnswerButtonHandlers() {
        let answerButtons = document.querySelectorAll('.button');
        
        // first, remove all previous handlers
        answerButtons.forEach((button, index) => {
            let handler = this.handlers[index];
            if (handler) {
                button.removeEventListener('click', handler);
            }
        });

        // reset handlers
        this.handlers = [];

        // then, set new handlers
        answerButtons.forEach((button, index) => {
            let handler = () => {
                this.p.handleAnswer(index);
            };

            this.handlers.push(handler);  // save handler to remove it later
            button.addEventListener('click', handler);
        });
    }
    



    resetCategorySelection() {
        document.getElementById("quiz-auswahl").style.display = "none";
        document.getElementById("category-selection").style.display = "block";
        document.getElementById("start").style.display = "block";

        for(const category in this.p.categoryPlayed) {
            const optionElement = document.querySelector(`#category option[value="${category}"]`);
            if (this.p.categoryPlayed[category]) {
                optionElement.setAttribute ("disabled","disabled");
                optionElement.style.display="none"; 
            }
        }

        document.getElementById("category").value =""; 

    }

    displayStatistics(correct, total) {
        const statsElement = document.getElementById('statistics'); // You need to create this HTML element
        statsElement.innerHTML = `You answered correctly ${correct} out of ${total} questions.`;
        
        // Hide quiz elements and show statistics screen
        document.getElementById('fragendisplay').style.display = 'none';
        document.getElementById('buttons').style.display ='none';
        statsElement.style.display = 'block';
    }

    updateScore(correct, total) {
        const scoreElement = document.getElementById('answer_count'); // Use the 'answer_count' element to display the score
        scoreElement.textContent = `Correct answers: ${correct} / ${total}`;
    }
    

    inscribeAnswerButton (answers) {
        const buttons = document.querySelectorAll('.button');

        answers.forEach((answer, index) =>{
            if (buttons[index]) {
                buttons[index].textContent = answer.text; 
            } 
        }); 
    }

    

    checkEvent(event) {
        console.log(event.type);
        if (event.target.nodeName === "BUTTON") {
            const selectedIndex = Number(event.target.attributes.getNamedItem("number").value);
            this.p.handleAnswer(selectedIndex);
        }
    }


    renderText(text) {
        let questionDisplay = document.getElementById('fragendisplay');
        questionDisplay.innerHTML = ""; //clears the content of the div for each new question
        let p = document.createElement("p");
    
        if (this.p.currentCategory == 'mathe') {
            katex.render(text, p);
        } else {
            p.innerHTML = text;
        }
    
        questionDisplay.appendChild(p);
    }
 

}




function shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // Zufallsindex von 0 bis i
        // let t = array[i]; array[i] = array[j]; array[j] = t
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleQuestions(){
    shuffle(matheFragen);
    shuffle(internetTechnolgien);
    shuffle(allgemeinesWissen);
}




const matheFragen = 
[
    //1 
    {
        text: "2 + 7 * 4",
        answers: [{text:"30", value:1}, {text:"36", value:0},{text:"24", value:0}, {text:"34", value:0}]
    },
    // 2
    {
        text:"x^3 = 64",
        answers:[{text:"4", value:1}, {text:"3", value:0},{text:"5", value:0},{text:"2", value:0}]
    },
    // 3
    {
        text:"2x * 5 = 7x-3",
        answers:[{text:"-1", value:1}, {text:"1", value:0},{text:"3", value:0},{text:"-2", value:0}]
    },
    // 4
    {
        text:"x! + 5 = 29",
        answers:[{text:"4", value:1}, {text:"3", value:0},{text:"5", value:0},{text:"2", value:0}]
    },
    // 5
    {
        text:"(x^3 / 8) -2 = 13.625 ",
        answers:[{text:"5", value:1}, {text:"4", value:0},{text:"6", value:0},{text:"3", value:0}]
    },
    //6
    {
        text:"7x - 3 = 2x * 4",
        answers:[{text:"-3", value:1}, {text:"3", value:0},{text:"-2", value:0},{text:"2", value:0}]
    }
];

const internetTechnolgien = 
[
    //1
    {
        text:"Was ist ein SSL",
        answers:[{text:"Security certificate", value:1}, {text:"HTTP", value:0}, {text:"DSL", value:0}, {text:"Socket", value:0}]
    },
    //2
    {
        text:"Wofür steht HTML",
        answers:[{text:"Hypertext Markup Language", value:1}, {text:"Hyperlink Markup Language", value:0}, {text:"Hypertrack Markup Language", value:0}, {text:"Hypertool Markup Language", value:0}]
    },
    //3
    {
        text:"Wofür steht DNS?",
        answers:[{text:"Domain Name System", value:1}, {text:"Domain Network System", value:0}, {text:"Descriptive Name System", value:0}, {text:"Domain Net System", value:0}]
    },
    //4
    {
        text:"Wofür steht TLS?",
        answers:[{text:"Transport Layer Security", value:1}, {text:"Transport Layer System", value:0}, {text:"Text Layer Security", value:0}, {text:"Transport Level Securty", value:0}]
    },
    //5
    {
        text:"Wöfür steht HTTP?",
        answers:[{text:"Hype Transporting Prototype", value:1}, {text:"Hypertext Transporting Prototype", value:0}, {text:"Hyperscale Transport Protocol", value:0}, {text:"Hype Transport Protocol", value:0}]
    },
    //6
    {
        text:"Wofür Steht JS?",
        answers:[{text:"Javascript", value:1}, {text:"Java", value:0}, {text:"Javastyle", value:0}, {text:"Java Style", value:0}]
    }
]

const allgemeinesWissen = 
[
    //1
    {
        text:"Wie viele Oscars hat der erste Film der Herr der Ringe Serie bekommen?",
        answers:[{text:"4", value:1}, {text:"2", value:0}, {text:"6", value:0}, {text:"7", value:0}]
    },
    //2
    {
        text:"Welches Land gehört nicht zu Nord Amerika?",
        answers:[{text:"Argentinien", value:1}, {text:"Hawaii", value:0}, {text:"Kanada", value:0}, {text:"Mexico", value:0}]
    },
    //3
    {
        text:"Welches dieser Tiere ist kein Säugetier?",
        answers:[{text:"Schlange", value:1}, {text:"Bär", value:0}, {text:"Schwein", value:0}, {text:"Kuh", value:0}]
    },
    //4
    {
        text:"In welchem Jahresabstand findet die Fußball WM statt?",
        answers:[{text:"4 Jahre", value:1}, {text:"2 Jahre", value:0}, {text:"5 Jahre", value:0}, {text:"8 Jahre", value:0}]
    },
    //5
    {
        text:"Wie viele Menschen leben in Deutschland?",
        answers:[{text:"82 Millionen", value:1}, {text:"105 Millionen", value:0}, {text:"75 Millionen", value:0}, {text:"94 Millionen", value:0}]
    },
    //6
    {
        text:"Wie heißt die Hauptstadt von Spanien?",
        answers:[{text:"Madrid", value:1}, {text:"Barcelona", value:0}, {text:"Valencia", value:0}, {text:"Malaga", value:0}]
    }
]

const questions = {
    mathe: matheFragen,
    internettech: internetTechnolgien,
    allgemein: allgemeinesWissen
}