const getEl = (input) => {
  return document.querySelector(input);
};

const reset = getEl('.form__reset');
const form = getEl('.form');
const all = getEl('.all');
const positive = getEl('.positive');
const negative = getEl('.negative');
const search = getEl('.search');
const searchLabel = getEl('.search__label');
const searchLabelIcon = getEl('.search__label i');
const searchGroup = getEl('.search__group');
const searchInput = getEl('.search__input');
const resultImage = getEl('.contact__image');

//TODO refactor

const addStatistics = (stat, value) => {
  stat.innerHTML = value;
};
const getStats = () => {
  fetch('/stats')
    .then((res) => res.json())
    .then((res) => {
      addStatistics(positive, res.pos);
      addStatistics(negative, res.neg);
      addStatistics(all, res.pos + res.neg);
    });
};
window.addEventListener('DOMContentLoaded', () => {
  getStats();
});

reset.addEventListener('click', () => {
  form.reset();
});

//get from data from user
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

form.addEventListener('submit', (ev) => {
  const data = getData(ev);
  fetch('/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res.qrcodeUrl);
      form.reset();
      notify(res.patientName, res.qrcodeUrl);
    });
});

searchInput.addEventListener('keyup', (ev) => {
  validateSearch(ev);
});
searchInput.addEventListener('paste', (ev) => {
  validateSearch(ev);
});

const validateSearch = (ev) => {
  let regEx = new RegExp(/[A-Z]{1}[0-9]{8}[A-Z]{1}/);
  let val = ev.target.value.trim();
  if (regEx.test(val)) {
    searchLabelIcon.classList.remove('fa-times');
    searchLabelIcon.classList.add('fa-play');
  } else {
    searchLabelIcon.classList.remove('fa-play');
    searchLabelIcon.classList.add('fa-times');
  }
};

//#region  notifications

const notify = (patientName, destination, isError) => {
  Toastify({
    text: `${patientName} added successfully! Download PDF`,
    duration: 20000,
    destination,
    newWindow: true,
    close: true,
    gravity: 'top', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: 'linear-gradient(to right, #00b09b, #96c93d)',
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};
try {
  const notifyUserFound = (patientName, destination, isError) => {
    Toastify({
      text: `${patientName} added successfully! Download PDF`,
      selector: resultImage,
      duration: 200000,
      destination,
      newWindow: true,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: 'linear-gradient(to right, #00b09b, #96c93d)',
        position: 'absolute',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  };
  notifyUserFound('HI', 'HI');
} catch (error) {
  console.log(error);
}

//#endregion

//Animate search input

const closeSearch = () => {
  searchInput.style.width = '0%';
  searchGroup.style.width = '60px';
  searchInput.style.paddingLeft = '0px';
  searchLabelIcon.style.transform = 'rotate(0deg)';
  searchInput.value = '';
  setTimeout(() => {
    searchLabelIcon.classList.remove('fa-times');
    searchLabelIcon.classList.add('fa-search');
  }, 200);
};

const openSearch = () => {
  if (searchLabelIcon.classList.value.includes('fa-times')) {
    return closeSearch();
  }
  if (searchLabelIcon.classList.value.includes('fa-play')) {
    let val = searchInput.value.trim();
    fetch('/patient', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: val,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        notify(res.patient_name, `/me/${res.patient_id}`);
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  searchGroup.style.width = '80%';
  searchLabelIcon.style.transform = 'rotate(360deg)';
  searchInput.style.width = '100%';
  searchInput.style.paddingLeft = '25px';
  setTimeout(() => {
    searchLabelIcon.classList.remove('fa-search');
    searchLabelIcon.classList.add('fa-times');
  }, 400);
};
searchLabel.addEventListener('click', (ev) => {
  openSearch(ev);
});

searchInput.addEventListener('focusout', () => {
  if (searchInput.value.trim() === '') {
    closeSearch();
  }
});
