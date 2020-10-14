/* global selections */

const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const hexTexts = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const lockButtons = document.querySelectorAll('.lock');
const closeAdjustButtons = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');

let initialColors;

/* local storage object */
let savedPalettes = [];


/* event listeners */

generateButton.addEventListener('click', fillDivsWithColors);

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

adjustButtons.forEach( (button, index) => {
    button.addEventListener('click', () => {
        openAdjustPanel(index);
    })
})

closeAdjustButtons.forEach( (button, index) => {
    button.addEventListener('click', () => {
        closeAdjustPanel(index);
    })
})

lockButtons.forEach((button, index) => {
    button.addEventListener('click', () =>{
        lockColor(index);
    })
})

/* functions  */
function generateHex() {
    const hex = chroma.random();
    return hex;
}

function lockColor(index){
    colorDivs[index].classList.toggle('locked');
    lockButtons[index].firstChild.classList.toggle('fa-lock-open');
    lockButtons[index].firstChild.classList.toggle('fa-lock');
}

function fillDivsWithColors(){

    initialColors = [];

    colorDivs.forEach( div => {
        const generatedColor = generateHex();
        const hexH2 = div.children[0]; 

        if( div.classList.contains('locked')){
            initialColors.push(hexH2.innerText);
            return;
        } else {
            initialColors.push(chroma(generatedColor).hex());    
        }

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
    
    adjustButtons.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButtons[index]);
    })
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

function openAdjustPanel(index){
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustPanel(index){
    sliderContainers[index].classList.remove('active');
}

/* local storage operations */
const saveButton = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryButton = document.querySelector('.library');
const closeLibraryButton = document.querySelector('.close-library');

saveButton.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryButton.addEventListener('click', openLibrary);
closeLibraryButton.addEventListener('click', closeLibrary);

function openPalette(event){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(event){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(event){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    hexTexts.forEach(hex => {
        colors.push(hex.innerText);
    });


    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }

    const paletteObj = {name: name, colors: colors, nr: paletteNr};
    savedPalettes.push(paletteObj);

    saveToLocal(paletteObj);
    saveInput.value = "";

    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');

    paletteObj.colors.forEach(color => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });

    const paletteButton = document.createElement('button');
    paletteButton.classList.add('pick-palette-button');
    paletteButton.classList.add(paletteObj.nr);
    paletteButton.innerText = 'Select';

    paletteButton.addEventListener('click', event => {
        closeLibrary();
        const paletteIndex = event.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index)=> {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);
        })
        resetInputs();
    })

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteButton);
    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');

            paletteObj.colors.forEach(color => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = color;
                preview.appendChild(smallDiv);
            });

            const paletteButton = document.createElement('button');
            paletteButton.classList.add('pick-palette-button');
            paletteButton.classList.add(paletteObj.nr);
            paletteButton.innerText = 'Select';

            paletteButton.addEventListener('click', event => {
                closeLibrary();
                const paletteIndex = event.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index)=> {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                })
                resetInputs();
            })

            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteButton);
            libraryContainer.children[0].appendChild(palette);
        })
    }

    
}

getLocal();
fillDivsWithColors();