const connectWallet = document.querySelector('.connect-wallet');
const generateReferralForm = document.querySelector('.generate-referral-form');

let user;
let getUserDetails = [];

window.addEventListener('DOMContentLoaded', async () => {
  await connectDAPP();
})

const loadWeb3 = async () => {
    try {
        await ethereum.enable();

        if(!ethereum) return alert("Non-Ethereum browser detected. You should consider trying Metamask");
        web3 = new Web3(ethereum);
        // Get Network / chainId
        const _chainId = await ethereum.request({ method: 'eth_chainId' });
        if(parseInt(_chainId, 16) !== 1) return alert("Connect wallet to a main network");

        const _accounts = await ethereum.request({ method: 'eth_accounts' });
        user = web3.utils.toChecksumAddress(_accounts[0]);
        // user = "0x10f24fbc2a4addf445adf143beb5e4236319f50b";
        await settings();
    } catch (error) {
        console.log(error.message);
        return error.message;
    }       
}

const connectDAPP = async () => {
  await loadWeb3();
  connectWallet.innerHTML = `
    <a href="/" target="_blank">CONNECTED</a>
  `
}

const settings = async () => {
  getUserDetails = await (await fetch(`https://gasify-nodejs-backend.herokuapp.com/api/v1/referrer/findReferrerByAddress?user=${user}`)).json();
  if(getUserDetails.length <= 0) return;

  const _id = getUserDetails[0].referralID;
  generateReferralForm.innerHTML = `
      <p class="your-link">Your Referral Link</p>
      <input type="text" value=https://gasify-presale.netlify.app/?referralID=${_id} />
      <button type="submit" class="generate">PROCEED</button>
    `;
}

const postData = async (url = '', data = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

connectWallet.addEventListener('click', async e => {
  e.preventDefault();
  try {
    await connectDAPP();
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
})
  
generateReferralForm.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    if(getUserDetails.length > 0) {
      return window.location = `https://gasify-presale.netlify.app/?referralID=${getUserDetails[0].referralID}`;
    }

    const _url = `https://gasify-nodejs-backend.herokuapp.com/api/v1/referrer/addReferrer`;
    let result = await postData(_url, { user });
    console.log(result);
    const _referralLink = `https://gasify-presale.netlify.app/?referralID=${result.referralID}`
    generateReferralForm.innerHTML = `
      <p class="your-link">Your Referral Link</p>
      <input type="text" value=${_referralLink} />
      <button type="submit" class="generate">PROCEED</button>
    `;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
})