"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [
    { amount: 200, date: "2019-11-18T21:31:17.178Z" },
    { amount: 455.23, date: "2019-12-23T07:42:02.383Z" },
    { amount: -306.5, date: "2020-01-28T09:15:04.904Z" },
    { amount: 25000, date: "2020-04-01T10:17:24.185Z" },
    { amount: -642.21, date: "2020-05-08T14:11:59.604Z" },
    { amount: -133.9, date: "2020-05-27T17:01:17.194Z" },
    { amount: 79.97, date: "2024-01-14T18:49:59.371Z" },
    { amount: 1300, date: "2024-01-18T12:01:20.894Z" },
  ],
  interestRate: 1.2, // %
  pin: 1111,

  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [
    { amount: 5000, date: "2019-11-01T13:15:33.035Z" },
    { amount: 3400, date: "2019-11-30T09:48:16.867Z" },
    { amount: -150, date: "2019-12-25T06:04:23.907Z" },
    { amount: -790, date: "2020-01-25T14:18:46.235Z" },
    { amount: -3210, date: "2020-02-05T16:33:06.386Z" },
    { amount: -1000, date: "2020-04-10T14:43:26.374Z" },
    { amount: 8500, date: "2024-01-14T18:49:59.371Z" },
    { amount: -30, date: "2024-01-18T12:01:20.894Z" },
  ],
  interestRate: 1.5,
  pin: 2222,

  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Handling Dates
const calcDaysPast = (date1, date2) =>
  Math.trunc(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

const dateFormated = function (date) {
  const [year, month, day, hours, minutes, seconds] = [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, 0),
    `${date.getDate()}`.padStart(2, 0),
    `${date.getHours()}`.padStart(2, 0),
    `${date.getMinutes()}`.padStart(2, 0),
    `${date.getSeconds()}`.padStart(2, 0),
  ];
  const today = new Date();
  const daysPast = calcDaysPast(date, today);
  let options = {
    hour: "numeric",
    minute: "numeric",
    second: "2-digit",
    month: "2-digit",
    year: "numeric",
    day: "2-digit",
  };
  if (daysPast > 7)
    return new Intl.DateTimeFormat(currentAccount.locale, options).format(date);
  else {
    options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    const time = new Intl.DateTimeFormat(currentAccount.locale, options).format(
      date
    );

    if (daysPast === 0) return `Today, ${time}`;

    if (daysPast === 1) return `Yesterday, ${time}`;
    else return `${daysPast} days ago, ${time}`;
  }
};

// Handling movements
const localizedMovement = function (movement, account) {
  const options = { style: "currency", currency: account.currency };
  return new Intl.NumberFormat(account.locale, options).format(movement);
};
// Generate Usernames

accounts.forEach(function (account) {
  account.username = account.owner
    .toLowerCase()
    .split(" ")
    .reduce((accumulator, word) => accumulator + word[0], "");
});

const displayMovements = function (account, sorted = false) {
  containerMovements.innerHTML = "";
  account[sorted ? "sortedMovements" : "movements"].forEach(function (
    movement,
    index
  ) {
    const movementType = movement.amount < 0 ? "withdrawal" : "deposit";
    const movementDate = new Date(movement.date);
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movementType}">${
      index + 1
    } ${movementType.toUpperCase()}</div>
      <div class="movements__date">${dateFormated(movementDate)}</div>
    <div class="movements__value">${localizedMovement(
      movement.amount,
      account
    )}</div>
  </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce(function (accumulator, current) {
    return accumulator + current.amount;
  }, 0);
  account.balance = balance;
  labelBalance.textContent = `${localizedMovement(account.balance, account)}`;
};

const calcDisplaySumIn = function (account) {
  const sumIn = account.movements
    .filter((movement) => movement.amount > 0)
    .reduce((acc, move) => acc + move.amount, 0);
  labelSumIn.textContent = `${localizedMovement(sumIn, account)}`;
};

const calcDisplaySumOut = function (account) {
  const sumOut = account.movements
    .filter((movement) => movement.amount < 0)
    .reduce((acc, move) => acc + move.amount, 0);
  labelSumOut.textContent = `${localizedMovement(Math.abs(sumOut), account)}`;
};

const calcDisplayInterest = function (account) {
  const interestSum = account.movements
    .filter((move) => move.amount > 0)
    .map((deposit) => (deposit.amount * account.interestRate) / 100)
    // interests below 1 euro are not included
    .filter((interest) => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${localizedMovement(interestSum, account)}`;
};

let currentAccount = undefined;
let timer;
let remainingTime;
let sorted = false;
const updateUI = function () {
  displayMovements(currentAccount, sorted);
  calcDisplayBalance(currentAccount);
  calcDisplaySumIn(currentAccount);
  calcDisplaySumOut(currentAccount);
  calcDisplayInterest(currentAccount);
};

const logOut = function () {
  containerApp.style.opacity = 0;
  labelWelcome.textContent = "Log in to get started";
  inputLoginUsername.blur();
};
const refreshCounter = function () {
  const options = { minute: "2-digit", second: "2-digit" };
  const counter = Intl.DateTimeFormat(currentAccount.locale, options).format(
    remainingTime
  );

  labelTimer.textContent = `You will be logged out in: ${counter}`;

  if (remainingTime == 0) {
    logOut();
  }
  remainingTime -= 1000;
};
const resetTimer = function () {
  remainingTime = new Date(1000 * 60 * 10);
  if (timer) {
    clearInterval(timer);
  }
  timer = setInterval(refreshCounter, 1000);
};
// Event Handler

btnLogin.addEventListener("click", function (event) {
  event.preventDefault();
  inputLoginUsername.blur();
  // date
  const now = new Date();

  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display welcome
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    const options = {
      hour: "numeric",
      minute: "numeric",
      month: "2-digit",
      year: "numeric",
      day: "2-digit",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // Display movements, balance, summaries

    updateUI();
    // Display UI
    containerApp.style.opacity = 100;
  } else {
    logOut();
  }
  //Clear the input fields
  inputLoginPin.value = "";
  inputLoginUsername.value = "";
  // (re)-set timer
  resetTimer();
});

btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const beneficiary = accounts.find(function (benef) {
    return benef.username === inputTransferTo.value;
  });
  if (
    amount > 0 &&
    beneficiary &&
    amount <= currentAccount.balance &&
    currentAccount !== beneficiary
  ) {
    const now = new Date();
    currentAccount.movements.push({ amount: -amount, date: now.toISOString() });
    beneficiary.movements.push({ amount: amount, date: now.toISOString() });
    updateUI();
  } else {
    console.log("unsuccessful");
  }
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();
  // reset timer
  resetTimer();
});

btnClose.addEventListener("click", function (event) {
  event.preventDefault();

  //Authentication
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    // Account Deletion
    const accountIndex = accounts.findIndex(function (account) {
      return account === currentAccount;
    });
    currentAccount = undefined;

    accounts.splice(accountIndex, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }
  // Flush and Lose Focus
  inputCloseUsername.value = inputClosePin.value = "";
  inputClosePin.blur();
});

btnLoan.addEventListener("click", function (event) {
  event.preventDefault();
  const amount = Number(inputLoanAmount.value);
  inputLoanAmount.value = "";
  inputLoanAmount.blur();
  const transaction = function () {
    const now = new Date();
    currentAccount.movements.push({ amount: amount, date: now.toISOString() });
    // Update the UI
    updateUI();
  };
  if (
    amount > 0 &&
    // The loan is granted only if there is any deposit greated than or equal to 10% of the amount requested
    currentAccount.movements.some((move) => move.amount >= amount * 0.1)
  ) {
    setTimeout(transaction, 5000);
  }
  // reset timer
  resetTimer();
});

btnSort.addEventListener("click", function () {
  if (sorted) {
    sorted = false;
    displayMovements(currentAccount, sorted);
  } else {
    currentAccount.sortedMovements = currentAccount.movements.slice();
    currentAccount.sortedMovements.sort(
      (firstMove, secondMove) => firstMove.amount - secondMove.amount
    );
    // currentAccount.sortedMovementsDates = currentAccount.movementsDates.slice();
    // currentAccount.sortedMovementsDates.sort(
    //   (firstMove, secondMove) => firstMove.index
    // );
    sorted = true;
    displayMovements(currentAccount, sorted);
  }
});
