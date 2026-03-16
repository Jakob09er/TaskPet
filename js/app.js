// ===== TASKPET LANDING ANIMATION =====

const dog = document.getElementById("landingDog");
const rabbit = document.getElementById("landingRabbit");

let activePet = "dog";

// Wechsel zwischen Hund und Hase
function switchPet() {

  if (!dog || !rabbit) return;

  if (activePet === "dog") {
    dog.classList.remove("hero-pet-active");
    rabbit.classList.add("hero-pet-active");
    activePet = "rabbit";
  } else {
    rabbit.classList.remove("hero-pet-active");
    dog.classList.add("hero-pet-active");
    activePet = "dog";
  }

}

// alle 6 Sekunden wechseln
setInterval(switchPet, 6000);


// ===== BLINK ANIMATION =====

const dogBlink = "assets/dog_blink.png";
const dogIdle = "assets/dog_idle.png";

const rabbitBlink = "assets/rabbit_blink.png";
const rabbitIdle = "assets/rabbit_idle.png";

function randomBlink() {

  if (!dog || !rabbit) return;

  // zufällig Hund oder Hase blinzeln lassen
  const blinkDog = Math.random() > 0.5;

  if (blinkDog) {

    dog.src = dogBlink;

    setTimeout(() => {
      dog.src = dogIdle;
    }, 180);

  } else {

    rabbit.src = rabbitBlink;

    setTimeout(() => {
      rabbit.src = rabbitIdle;
    }, 180);

  }

}

// zufälliges Blinzeln
setInterval(() => {

  if (Math.random() > 0.4) {
    randomBlink();
  }

}, 3500);


// ===== FOOTER JAHR =====

const yearElement = document.getElementById("currentYear");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
