import { h, render } from 'https://esm.sh/preact';

const main = document.getElementById("app")
const backSound = document.getElementById("backsound");
backSound.volume = 0.01
const notif = document.getElementById("notifsound");

let isStart = false
let skin = "baby.png"
let hunger = 2
let fun = 2
let health = true
let poop = false
let energy = 2
let discipline = 3
let cycle = 0
let light = false
let justDigest = false
let isDisciplined = false

let healthPoint = 5
let dead = false

//actions
function getFeeded() {
    if(energy == 0 || isDisciplined) return
    hunger ++
    energy --
    recover()
    spoil(hunger)
    getSkin()
    updateDisplay()
}

function getFun() {
    if(energy == 0 || isDisciplined) return
    fun ++
    energy --
    recover()
    spoil(fun)
    getSkin()
    updateDisplay()
}

function getCleaned() {
    if(energy == 0 || isDisciplined) return
    poop = false
    energy --
    recover()
    getSkin()
    updateDisplay()
}

function getHealed() {
    health = true
    recover()
    getSkin()
    updateDisplay()
}

function getScolded() {
    if(isDisciplined) return
    discipline --
    isDisciplined = true
    getSkin()
    updateDisplay()
}

function doLight() {
    light = !light
    updateDisplay()
}

//evolution
function getHungry() {
    const r = Math.random() * 2
    if(r < 1 || hunger < 1) return
    hunger --
    justDigest = true
}

function getSad() {
    const r = Math.random() * 2
    if(r < 1 || fun < 1) return
    fun -= 1
}

function getPooped() {
    if(!justDigest || poop) return
    const r = Math.random() * 2
    if(r < 1 ) return
    poop = true
}

function getSick() {
    const healthScore = 12 - (hunger + fun + energy)
    const healthRatio = healthScore / 12
    const r = Math.random() * 2
    if(r < healthRatio || !health) return
    health = false
}

function recover() {
    if (healthPoint > 4) return
    healthPoint ++
}

function spoil(val) {
    if(val > 3) discipline ++
}

function getDead() {
    if (hunger == 0) {
        healthPoint --
    }
    if (fun == 0) {
        healthPoint --
    }
    if (poop) {
        healthPoint --
    }
    if (health) {
        healthPoint --
    }
    if (healthPoint < 1) {
        dead = true
        backSound.pause()
    }
}

function getEnergy() {
    if(!isNight()) return
    energy += light ? 1 : 2
    if(energy > 4) energy = 4
}

function getSkin() {
    let indisposed = 0
    skin = "ok.png"
    if(cycle > 20){
        skin = "happy.png"
    }
    if(hunger < 2){
        skin = "hungry.png"
        indisposed ++
    }
    if(fun < 2){
        skin = "sad.png"
        indisposed ++
    }
    if(!health){
        skin = "sick.png"
        indisposed ++
    }
    if(poop){
        skin = "poop.png"
        indisposed ++
    }
    if (indisposed > 1) {
        skin = "crying.png"
    }
    if (isDisciplined) {
        skin = "angry.png"
    }
    if (dead) {
        skin = "dead.png"
    }
}

function getScream() {
    if (hunger < discipline || fun < discipline || !health || poop) {
        notif.play()
    }
}
//------------------

function reset() {
    skin = "baby.png"
    hunger = 2
    fun = 2
    health = "healthy"
    poop = false
    energy = 2
    discipline = 2
    cycle = 0
    light = false
}

function isNight() {
    return cycle % 5 > 2
}

function setTime() {
    const j = cycle / 5
    const time = cycle % 5
    let p = ""
    switch (time) {
        case 0:
            p = "Aube"
            break;
        case 1:
            p = "Matin"
            break;
        case 2:
            p = "Midi"
            break;
        case 3:
            p = "Soir"
            break;
        case 4:
            p = "Nuit"
            break;
        default:
            break;
    }
    return {j,p}
}

function updateDisplay() {
    render(app(), main);
}

function start() {
    isStart = true
    reset()
    updateDisplay()
    setTimeout(runCycle, 5 * 1000 * 60)
    backSound.play()
}

function runCycle() {
    isDisciplined = false
    getHungry()
    getSad()
    getSick()
    getPooped()
    getEnergy()
    getDead()
    getSkin()
    getScream()
    if(!dead){
        setTimeout(runCycle, 5 * 1000 * 60)
    }
    cycle ++
    updateDisplay()
}

//Interface
function button(label, action) {
    return h("button", {onclick: action}, label)
}

function setImage() {
    if(!isStart || dead){
        return button("Start", start)
    }else{
        return h("img",{src: './assets/' + skin},'')
    }
}

function sumairi() {
    let sumairiClass = "sumairi "
    sumairiClass += isNight() ? "night " : ""
    sumairiClass += light ? "light " : ""
    const time = setTime()
    const timeDisplay = h("p", {class:"time"}, `Jour: ${time.j}, ${time.p}`)
    const energyDisplay = h("p", {class:"nrj"}, 'Energie:' + energy)
    return h('div', {class: sumairiClass}, [timeDisplay, energyDisplay, setImage()])
}

function menu() {
    const listMenu = [button("Nourrir", getFeeded), button("Jouer", getFun), button("Soigner", getHealed), button("Laver", getCleaned), button("Engueuler", getScolded), button("Lumière", doLight)]
    return h('div', {class:'menu'}, listMenu)
}

function app() {
    return h('div', {class:'app'}, [sumairi(), menu()])
}

render(app(), main);