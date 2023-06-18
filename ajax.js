"use strict"

let question_array = Array();
let status = null;

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}



function xhrHandler() {
    var link = 'https://irene.informatik.htw-dresden.de:8888/api/quizzes/' + randomInt(2,33);
    return new Promise((resolve, reject) => {
        let xhr = getXhr();

        xhr.open('GET', link, true); 
        xhr.setRequestHeader("Authorization", "Basic " + btoa("test@gmail.com:secret"));

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 && status ==null) {
                question_array.push({
                    text: JSON.parse(xhr.responseText).text,
                    answers: [{
                        text: JSON.parse(xhr.responseText).options[0],
                        value: 1
                    }, {
                        text: JSON.parse(xhr.responseText).options[1],
                        value: 0
                    }, {
                        text: JSON.parse(xhr.responseText).options[2],
                        value: 0
                    }, {
                        text: JSON.parse(xhr.responseText).options[3],
                        value: 0
                    }]
                });
            }
        }
        xhr.send();
    


    function getXhr() {
        if (window.XMLHttpRequest) {
            let xhr = new XMLHttpRequest();
            return xhr;
        } else return false
    }

    xhr.onload = function(){
        if (xhr.status != 200) {
            //fehler
            console.log(`Fehler ${xhr.status}: ${xhr.statusText}`);
            status = '404'
            reject(new Error(`Fehler ${xhr.status}: ${xhr.statusText}`));

        } else {
            console.log(`Alles gut`); 
            resolve(question_array); 
        }

    };

    xhr.onerror = function() {
        console.error('There was a connection error');
    }
    });


    }