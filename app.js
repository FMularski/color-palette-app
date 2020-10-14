/* global selections */

const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const hexTexts = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');

let initialColors;


/* event listeners */

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
})

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    })
})

hexTexts.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    })
})

popup.addEventListener('transitionend', ()=>{
    const popupBox = popup.children[0];
    popupBox.classList.remove('active');
    popup.classList.remove('active');
})

/* functions  */
function generateHex() {
    const hex = chroma.random();
    return hex;
}

function fillDivsWithColors(){

    initialColors = [];

    colorDivs.forEach( div => {
        const generatedColor = generateHex();
        const hexH2 = div.children[0]; 

        initialColors.push(chroma(generatedColor).hex());
        
        hexH2.innerText = generatedColor;
        div.style.backgroundColor = generatedColor;

        checkTextContrast(generatedColor, hexH2);

        // initial color sliders

        const color = chroma(generatedColor);
        const sliders = div.querySelectorAll('.sliders input');
        
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);

    });
    resetInputs();
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();

    if ( luminance > 0.5)
        text.style.color = "black";
    else 
        text.style.color = "white";
}

function colorizeSliders(color, hue, brightness, saturation) {
    /* saturation */
    const noSaturation = color.set('hsl.s', 0);
    const fullSaturation = color.set('hsl.s', 1);
    const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0)}, ${scaleSaturation(1)})`;

    /* brightness */
    const midBrightness = color.set('hsl.l', 0.5);
    const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;

    /* hue */ 
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204,204 ,75),rgb(75, 204, 75),rgb(75, 204, 204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(event) {
    const index = event.target.getAttribute("data-bright") ||
    event.target.getAttribute("data-sat") ||
    event.target.getAttribute("data-hue");
    
    let sliders = event.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;

    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();

    // check contrast
    checkTextContrast(color, textHex);
    for ( icon of icons){
        checkTextContrast(color, icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }

        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }

        if(slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    })
}

function copyToClipboard(hex){
    const ta = document.createElement('textarea');
    ta.value = hex.innerText;
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

fillDivsWithColors();