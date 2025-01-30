// const BACKEND_URL = "https://coinitapp.onrender.com/api/v1";
const BACKEND_URL = "http://localhost:4000/api/v1";
let count = 0;
let usdt = 0;
let bnb = 0;
let bnbVal = 0;
let totalWithdrawal = 0;
let result = localStorage.getItem("token");
result = JSON.parse(result);
const api_url = `${BACKEND_URL}/deposit/${result.id}`;
$.ajax({
  type: "GET",
  url: api_url,
  headers: {
    Authorization: `Bearer ${result.accessToken}`,
  },
}).done((res) => {
  const { data } = res;
  count = data;

  document.getElementById("totalbal").innerHTML = `$${Number(count).toFixed(
    2
  )}`;
});

const api_exchange = `${BACKEND_URL}/exchange/${result.id}`;
$.ajax({
  type: "GET",
  url: api_exchange,
  headers: {
    Authorization: `Bearer ${result.accessToken}`,
  },
}).done((res) => {
  const { data, deposit } = res;
  bnb = deposit;
  usdt = res.usdt;

  if (data !== undefined && data != null) {
    document.getElementById("bnbval").innerHTML = bnb.toFixed(6);
  }
});

const withdrawal_api = `${BACKEND_URL}/withdrawal/${result.id}`;
let totalBnb = 0;
$.ajax({
  type: "GET",
  url: withdrawal_api,
  headers: {
    Authorization: `Bearer ${result.accessToken}`,
  },
}).done((res) => {
  const { deposit } = res;
  totalWithdrawal = deposit;
  bnbVal = bnb - totalWithdrawal;

  document.getElementById("bnbval").innerHTML = bnbVal.toFixed(6);
});
console.log(bnbVal);

async function bnbBalance() {
  // Retrieve BNB price from Binance API
  await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT")
    .then((response) => response.json())
    .then((data) => {
      const bnbPrice = parseFloat(data.price);
      // usdtAmount = bnbVal * bnbPrice;
      const usdtAmount = bnbPrice * (bnb - totalWithdrawal);
      const bnbbal = usdtAmount;
      document.getElementById("bnbbal").innerHTML = `$${bnbbal.toFixed(2)}`; // Display the equivalent USDT amount
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  // .catch((error) => {
  //   console.log("Error:", error);
  //   document.getElementById("bnbbal").textContent =
  //     "An error occurred while fetching the conversion rate.";
  // });
}

bnbBalance();

async function completebal() {
  // Retrieve BNB price from Binance API
  await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT")
    .then((response) => response.json())
    .then((data) => {
      const bnbPrice = parseFloat(data.price);
      // usdtAmount = bnbVal * bnbPrice;
      const usdtAmount = bnbPrice * (bnb - totalWithdrawal);
      let completebal = usdtAmount + count;
      document.getElementById(
        "completebal"
      ).innerHTML = `$${completebal.toFixed(2)}`;
      document.getElementById("bnbPrice").innerHTML = `$${bnbPrice.toFixed(2)}`;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

completebal();

function calculateUSDT() {
  // const bnbAmount = document.getElementById('bnbAmount').value;
  const usdt = document.getElementById("usdt").value;

  // Retrieve BNB price from Binance API
  fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT")
    .then((response) => response.json())
    .then((data) => {
      const bnbPrice = parseFloat(data.price);
      // const usdtAmount = bnbAmount * bnbPrice;
      const convertedAmount = usdt / bnbPrice;
      // document.getElementById('usdtAmount').textContent = usdtAmount.toFixed(2); // Display the equivalent USDT amount
      document.getElementById("bnb").value = convertedAmount.toFixed(6); // Display the equivalent BNB amount
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const swapUSDT = () => {
  const api_url = `${BACKEND_URL}/exchange`;
  var form = document.getElementById("htmlForm");
  var formData = new FormData(form);

  var bnb = $("#bnb").val();
  var usd = $("#usdt").val();
  if (bnb != "" && usd != "") {
    if (usd > count - usdt) {
      sweetAlert("Oops...", "Insufficient balance", "error");
    } else {
      $.ajax({
        type: "POST",
        url: api_url,
        contentType: false,
        processData: false,
        data: formData,
        headers: {
          Authorization: `Bearer ${result.accessToken}`,
        },
        beforeSend: function () {
          $("#submitbtn").html("<i class='fa fa-spinner'></i>");
          $("#submitbtn").attr("onclick", "");
        },
        success: function (data) {
          $("#submitbtn").attr("onclick", "swapUSDT()");

          if (data.success == true) {
            sweetAlert(
              "Bravo",
              "You have successfully traded USDT for BNB"
            ).then((result) => {
              window.location.href = "../app/index-2.html";
            });
          } else {
            sweetAlert("Oops...", data, "error");
            $("#submitbtn").html("Sign Me In");
          }
        },
      }).done((res) => {
        console, log(res);
      });
    }
  } else {
    sweetAlert("Oops...", "Invalid", "error");
  }
};

const withdrawal = () => {
  const api_url = `${BACKEND_URL}/withdrawal`;
  var form = document.getElementById("myForm");
  var formData = new FormData(form);

  var debit = $("#debit").val();
  var bnbAddress = $("#bnbAddress").val();

  if (debit !== "" && bnbAddress !== "") {
    if (debit > bnb) {
      sweetAlert("Oops...", "Insufficient balance", "error");
    } else {
      $.ajax({
        type: "POST",
        url: api_url,
        contentType: false,
        processData: false,
        data: formData,
        headers: {
          Authorization: `Bearer ${result.accessToken}`,
        },
        beforeSend: function () {
          $("#submitbtn").html("<i class='fa fa-spinner'></i>");
          $("#submitbtn").attr("onclick", "");
        },
        success: function (data) {
          $("#submitbtn").attr("onclick", "swapUSDT()");

          if (data.success == true) {
            sweetAlert(
              "Bravo",
              `You have successfully withdrew ${data.data.debit} BNB`
            ).then((result) => {
              window.location.href = "../app/index-2.html";
            });
          } else {
            sweetAlert("Oops...", data.message, "error");
            $("#submitbtn").html("Sign Me In");
          }
        },
      }).done((res) => {
        // console.log(res);
      });
    }
  } else {
    sweetAlert("Oops...", "Invalid", "error");
  }
};

// // Function to fetch cryptocurrency data
// async function fetchCryptoData() {
//   try {
//     const response = await fetch(
//       "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,litecoin,ripple"
//     );
//     const data = await response.json();
//     console.log(data);

//     // Output the data
//     const cryptoList = document.getElementById("crypto-list");
//     cryptoList.innerHTML = ""; // Clear previous data

//     data.forEach((crypto) => {
//       const cryptoItem = document.createElement("div");
//       cryptoItem.classList.add("crypto-item");
//       cryptoItem.innerHTML = `
//       <h2>${crypto.name} (${crypto.symbol.toUpperCase()})</h2>
//       <p>Current Price: $${crypto.current_price.toFixed(2)}</p>
//       <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
//     `;
//       cryptoList.appendChild(cryptoItem);
//     });
//   } catch (error) {
//     console.error("Error fetching cryptocurrency data:", error);
//   }
// }

// // Fetch cryptocurrency data initially
// fetchCryptoData();

// // Fetch cryptocurrency data every 5 seconds
// setInterval(fetchCryptoData, 5000);
