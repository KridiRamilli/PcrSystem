const getEl = (input) => {
  return document.querySelector(input);
};

const reset = getEl('.form__reset');
const form = getEl('.form');
const submit = getEl('.submit');

reset.addEventListener('click', () => {
  form.reset();
});

const getData = (ev) => {
  ev.preventDefault();
  const patientData = {};
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].name === 'sex') {
      patientData[form.elements[i].name] = form.elements.namedItem('sex')[0]
        .checked
        ? 'M'
        : 'F';
    } else {
      if (form.elements[i].name) {
        patientData[form.elements[i].name] = form.elements[i].value;
      }
    }
  }
  console.log(patientData);
  return patientData;
};

form.addEventListener('submit', (ev) => getData(ev));
