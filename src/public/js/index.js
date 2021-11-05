//UTILS
const $ = (selector, all) => {
  if (all) {
    return document.querySelectorAll(selector);
  }
  return document.querySelector(selector);
};

//#region  notifications
const notify = (msg = '', destination = '') => {
  const isError = msg.toLowerCase().includes('error');
  Toastify({
    text: msg,
    duration: 20000,
    destination,
    newWindow: true,
    close: true,
    gravity: 'top', // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: isError
        ? 'linear-gradient(to right, #D51D09, #8E2A0C)'
        : 'linear-gradient(to right, #00b09b, #96c93d)',
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};

const notifyPatientFound = (msg, destination) => {
  const isError = msg.toLowerCase().includes('error');
  msg = msg.replace(/Error/gi, '');
  Toastify({
    text: msg,
    selector: resultImage,
    className: 'search__result',
    duration: 10000,
    destination,
    newWindow: true,
    close: true,
    gravity: 'top', // `top` or `bottom`
    position: 'center', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: isError ? 'red' : '#fff',
      position: 'absolute',
      top: '0px',
      color: isError ? '#fff' : 'teal',
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};

//#endregion

//showing download popup automatically
const downloadFile = (blob, filename, ext) => {
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${ext}`;
  document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
  a.click();
  a.remove(); //We have no use of the elem afterwards
};

//ELEMENTS
const resetBtn = $('.form__reset');
const submitBtn = $('.form__submit');
const form = $('.form');
const all = $('.all');
const positive = $('.positive');
const negative = $('.negative');
const searchLabel = $('.search__label');
const searchLabelIcon = $('.search__label i');
const searchGroup = $('.search__group');
const searchInput = $('.search__input');
const resultImage = $('.contact__image');
const exportData = $('.stats__description div', true);
const uploadInput = $('.upload__input');

/* On load add stats */
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

resetBtn.addEventListener('click', () => {
  form.reset();
});

//get form data from user
const getData = (ev) => {
  ev.preventDefault();
  const elem = form.elements;
  const patientData = {};
  for (let i = 0; i < elem.length; i++) {
    if (elem[i].name === 'sex') {
      patientData[elem[i].name] = elem.namedItem('sex')[0].checked ? 'M' : 'F';
    } else {
      //remove inputs with empty values
      if (elem[i].name && elem[i].value.trim()) {
        patientData[elem[i].name] = elem[i].value;
      }
    }
  }
  return patientData;
};

form.addEventListener('submit', (ev) => {
  const file = uploadInput.files;
  ev.preventDefault();
  //don't make request for patient if file selected
  if (file.length > 0) {
    return uploadFile(file[0]);
  }
  const data = getData(ev);
  //Make sure all fields are filled
  if (Object.keys(data).length < 7) {
    notify('Error: Please fill all the required fields!');
    return;
  }
  fetch('/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.msg) {
        notify(res.msg);
        return;
      }
      form.reset();
      notify(
        `${res.patientName} added successfully! Download PDF`,
        res.qrcodeUrl
      );
    });
});

//validate search input for downloading pdf
searchInput.addEventListener('keyup', (ev) => {
  validateSearchIcon(ev);
});
searchInput.addEventListener('click', (ev) => {
  validateSearchIcon(ev);
});
searchInput.addEventListener('focus', (ev) => {
  setTimeout(() => {
    validateSearchIcon(ev);
  }, 1200);
});
searchInput.addEventListener('focusout', () => {
  if (searchInput.value.trim() === '') {
    closeSearch();
  }
});

const validateSearchIcon = (ev) => {
  let val = ev.target.value.trim().toUpperCase();
  if (validateSearchInput(val)) {
    searchLabelIcon.classList.remove('fa-times');
    searchLabelIcon.classList.add('fa-play');
  } else {
    searchLabelIcon.classList.remove('fa-play');
    searchLabelIcon.classList.add('fa-times');
  }
};
const validateSearchInput = (val) => {
  let regEx = new RegExp(/[A-Z]{1}[0-9]{8}[A-Z]{1}/);
  return regEx.test(val) || val === 'ALL';
};

//Animate search input
const openSearch = () => {
  searchGroup.style.width = '80%';
  searchLabelIcon.style.transform = 'rotate(360deg)';
  searchInput.style.width = '100%';
  searchInput.style.paddingLeft = '25px';
  setTimeout(() => {
    searchLabelIcon.classList.remove('fa-search');
    searchLabelIcon.classList.add('fa-times');
  }, 400);
};
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
const getPatient = (val) => {
  if (validateSearchInput(val)) {
    fetch('/search', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalId: val,
      }),
    })
      .then((res) => {
        return val === 'ALL' ? res.blob() : res.json();
      })
      .then((res) => {
        if (val === 'ALL') {
          return downloadFile(res, 'all', 'zip');
        }
        res.msg
          ? notifyPatientFound(`${val} ${res.msg}`)
          : notifyPatientFound(
              `${res.patient_name} tested, Download PDF!`,
              `/me/${res.patient_id}`
            );
      })
      .catch((err) => {
        notify('There was an error! Please try again');
        console.error(err);
      });
  }
};
searchLabel.addEventListener('click', (ev) => {
  let val = searchInput.value.trim().toUpperCase();
  if (searchLabelIcon.classList.value.includes('fa-times')) {
    return closeSearch();
  } else if (searchLabelIcon.classList.value.includes('fa-play')) {
    getPatient(val);
  } else {
    openSearch(ev);
  }
});

const downloadExcelData = (ev) => {
  const filter = ev.target.dataset.filter;
  fetch(`/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter,
    }),
  })
    .then((res) => res.blob())
    .then((res) => downloadFile(res, filter, 'xlsx'))
    .catch((err) => {
      console.error(err);
    });
};

//download excel file when clicking on stats value
Array.from(exportData, (el) => {
  el.addEventListener('click', (ev) => {
    downloadExcelData(ev);
  });
});

const uploadFile = (inputFile) => {
  const formData = new FormData();
  //name(file) should be the same in server side
  formData.append('file', inputFile);
  console.log(formData);
  //TODO Loader
  fetch('/uploadFile', {
    method: 'post',
    body: formData,
  })
    .then((res) => {
      //reset form validation
      form.removeAttribute('novalidate');
      uploadInput.value = '';
      submitBtn.innerHTML = `<i class="fa fa-file-medical"></i> Insert patient`;
      submitBtn.classList.remove('search__result');
      return res.json();
    })
    .then((res) => notify(res.msg))
    .catch((err) => console.log(err));
};

uploadInput.addEventListener('change', (ev) => {
  if (ev.target.files.length > 0) {
    let fileName = ev.target.files[0].name;
    //form can be submitted without filling other inputs
    form.setAttribute('novalidate', true);
    submitBtn.innerHTML = `<i class="fa fa-upload"></i> ${
      fileName.length > 15 ? fileName.slice(0, 12) + '...' : fileName
    }`;
    submitBtn.classList.add('search__result');
  }
});
