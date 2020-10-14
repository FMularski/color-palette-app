/* global selections */

const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const hexTexts = document.querySelectorAll('.color h2');


function generateHex() {
    // const letters = '0123456789ABCDEF';
    // let hex = '#';
    // for(let i = 0; i < 6; i++){
    //     hex += letters[Math.floor(Math.random() * 16)];
    // }

    // return hex;
    const hex = chroma.random();
    return hex;
}

function fillDivsWithColors(){
    colorDivs.forEach( div => {
        let generatedColor = generateHex();
        div.children[0].innerText = generatedColor;
        div.style.backgroundColor = generatedColor;
    })
}

fillDivsWithColors();