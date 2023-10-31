const firstForm = document.querySelector("#main-calcul");
const adjustForm = document.querySelector("#adjust-calcul");
const firstScoreArea = document.querySelector("#first-score");
const adjustBtn = document.querySelector(".adjust-btn");
const showResultBtn = document.querySelector(".show-result-btn");
const main = document.querySelector(".main");
const rate = document.querySelector(".rate");

let vehiculeScore = 0;
let energyScore = 0;
let kilometerScore = 0;
let yearScore = 0;
let passengerScore = 0;
let firstScore = 0;
let bonus = 0;
let oneVehiculeChecked = false;
let oneEnergyChecked = false;
let oneKilometerChecked = false;
let oneYearChecked = false;
let onePassengerChecked = false;

function init() {
  fetch("../data.json")
    .then((response) => response.json())
    .then((data) => {
      createRoot(data);
      getRates(data);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du fichier JSON : ", error);
    });

  function createRoot(data) {
    firstForm.innerHTML += `<fieldset id="vehicules">
    <legend>Type de véhicule</legend></fieldset>
    <fieldset id="energies">
    <legend>Énergie</legend></fieldset>
    <fieldset id="kilometers">
    <legend>Kilomètres parcourus par an</legend></fieldset>
    <fieldset id="years">
    <legend>Année de mise en service</legend></fieldset>`;
    adjustForm.innerHTML += `<fieldset id="passengers"><legend>Nombre de passagers</legend></fieldset>`;

    const vehiculesField = document.querySelector("#vehicules");
    const energiesField = document.querySelector("#energies");
    const kilometersField = document.querySelector("#kilometers");
    const yearsField = document.querySelector("#years");
    const passengersField = document.querySelector("#passengers");

    // création des input radio
    data.vehicules.forEach((vehicule) => {
      vehiculesField.innerHTML += `<label class="tooltip" for="${vehicule.category}"><span class="tooltiptext">${vehicule.weight}</span><input class="firstFieldinputs" type="radio" id="${vehicule.category}" name="vehicule" value="${vehicule.score}" />${vehicule.category}</label>`;
    });

    data.energies.forEach((energie) => {
      energiesField.innerHTML += `<label for="${energie.category}"><input class="firstFieldinputs" type="radio" id="${energie.category}" name="energie" value="${energie.score}" />${energie.category}</label>`;
    });

    data.kilometers.forEach((kilometer) => {
      kilometersField.innerHTML += `<label for="${kilometer.category}"><input class="firstFieldinputs" type="radio" id="${kilometer.category}" name="kilometer" value="${kilometer.score}" />${kilometer.category}</label>`;
    });

    data.years.forEach((year) => {
      yearsField.innerHTML += `<input class="firstFieldinputs" type="radio" id="${year.category}" name="year" value="${year.score}" /><label for="${year.category}">${year.category}</label>`;
    });
    data.passengers.forEach((passager) => {
      passengersField.innerHTML += `<input type="radio" id="${passager.number}" name="passenger" value="${passager.bonus}" /><label for="${passager.number}">${passager.number}</label>`;
    });
  }

  const vehiculesRadios = document.getElementsByName("vehicule");
  const energiesRadios = document.getElementsByName("energie");
  const kilometersRadios = document.getElementsByName("kilometer");
  const yearsRadios = document.getElementsByName("year");
  const passengersRadios = document.getElementsByName("passenger");

  // récupération des values
  firstForm.addEventListener("change", function () {
    for (let i = 0; i < vehiculesRadios.length; i++) {
      if (vehiculesRadios[i].checked === true) {
        vehiculeScore = vehiculesRadios[i].value;
        oneVehiculeChecked = true;
      }
    }
    for (let i = 0; i < energiesRadios.length; i++) {
      if (energiesRadios[i].checked === true) {
        energyScore = energiesRadios[i].value;
        oneEnergyChecked = true;
      }
    }
    for (let i = 0; i < kilometersRadios.length; i++) {
      if (kilometersRadios[i].checked === true) {
        kilometerScore = kilometersRadios[i].value;
        oneKilometerChecked = true;
      }
    }
    for (let i = 0; i < yearsRadios.length; i++) {
      if (yearsRadios[i].checked === true) {
        yearScore = yearsRadios[i].value;
        oneYearChecked = true;
      }
    }

    // calcum du score initial
    firstScore =
      parseFloat(vehiculeScore, 10) +
      parseFloat(energyScore, 10) +
      parseFloat(kilometerScore, 10) +
      parseFloat(yearScore, 10);

    if (
      oneVehiculeChecked &&
      oneEnergyChecked &&
      oneKilometerChecked &&
      oneYearChecked &&
      !onePassengerChecked
    ) {
      // quand tous les champs sont validés affichage du score initial et redirection vers affinement
      firstScoreArea.innerHTML = `<p class="bonus">Votre Score: ${firstScore}</p>`;
      adjustBtn.style.display = "initial";
    }
  });

  // récupération du nombre de passager pour affiner
  adjustForm.addEventListener("change", function () {
    for (let i = 0; i < passengersRadios.length; i++) {
      if (passengersRadios[i].checked === true) {
        passengerScore = passengersRadios[i].value;
        onePassengerChecked = true;
      }
      bonus = parseFloat(passengerScore, 10);
    }
    if (
      oneVehiculeChecked &&
      oneEnergyChecked &&
      oneKilometerChecked &&
      oneYearChecked &&
      onePassengerChecked
    ) {
      showResultBtn.style.display = "initial";
      // affichage score initial et bonus et redirection vers résultat final
      bonus < 0
        ? (firstScoreArea.innerHTML = `<p class="bonus">Votre Score: ${firstScore} Votre Bonus: ${bonus}</p>`)
        : (firstScoreArea.innerHTML = `<p class="bonus">Votre Score: ${firstScore} Votre Malus: ${bonus}</p>`);
      let tauxTrouve = getRateByScore(firstScore);
      if (tauxTrouve !== null) {
        return (tauxToUse = tauxTrouve);
      } else {
        console.log("Aucun taux correspondant trouvé.");
      }
    }
  });
  adjustBtn.addEventListener("click", showAdjustForm);
  showResultBtn.addEventListener("click", showResult);

  // pour ouvrir la seconde partie du formulaire
  function showAdjustForm() {
    adjustForm.style.display = "initial";
    firstForm.style.display = "none";
    showResultBtn.style.opacity = "1";
    adjustBtn.style.opacity = "0";
  }

  // affichage du résultat final
  function showResult() {
    main.style.display = "none";
    rate.style.display = "flex";
    let reelRate = tauxToUse + bonus;
    rate.innerHTML += `<div class="result-txt">Pour votre véhicule nous vous proposons un prêt à un taux initial de ${tauxToUse} puisque le bonus dû au nombre de passagers est de ${bonus} le taux réel sera de ${reelRate}</div>
    <div class="recap">Votre taux = <span class="reel-rate">${reelRate}%</span></div>`;
  }
  let ratesArr = [];
  function getRates(data) {
    for (let i = 0; i < data.rates.length; i++) {
      ratesArr.push(data.rates[i]);
    }
  }

  // calcul du taux selon la tranche dans laquelle est le score
  function getRateByScore(taux) {
    for (let i = 0; i < ratesArr.length; i++) {
      var rateObj = ratesArr[i];
      if (taux >= rateObj.min && taux <= rateObj.max) {
        return rateObj.rate;
      }
    }
    return null;
  }
}

init();
