import { ethers } from "ethers";
import { useRef, useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi2";
function App() {
  const infoRef = useRef();
  const formRef = useRef();
  const addrRef = useRef();

  const checkBalance = async () => {
    const address = addrRef.current.value;
    const provider = new ethers.providers.JsonRpcProvider(
      import.meta.env.VITE_SEP_URL
    );

    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      return parseFloat(balanceInEth);
    } catch (error) {
      console.error(error);
      infoRef.current.innerText = "Error checking balance.";
      return null;
    }
  };

  const transferToken = async () => {
    try {
      const amount = "10000"; // 10,000 tokens
      const provider = new ethers.providers.JsonRpcProvider(
        import.meta.env.VITE_SEP_URL
      );
      const wallet = new ethers.Wallet(
        import.meta.env.VITE_PRIVATE_KEY,
        provider
      );
      const tokenAddress = "0x461EE06C804937E94E91180e5cDb18E36d2fF685";
      const erc20Abi = [
        {
          constant: false,
          inputs: [
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
          ],
          name: "transfer",
          outputs: [{ name: "", type: "bool" }],
          type: "function",
          stateMutability: "nonpayable",
        },
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [{ name: "", type: "uint8" }],
          type: "function",
          stateMutability: "view",
        },
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, wallet);
      const decimals = await contract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);
      const tx = await contract.transfer(addrRef.current.value, amountInWei);
      await tx.wait();
      // console.log("DFfdfd");
      infoRef.current.innerText = "Transaction successful!";
    } catch (error) {
      console.error(error);
      infoRef.current.innerText = "Transaction failed.";
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const sent = localStorage.getItem("sent");
    if (addrRef.current.value !== "") {
      if (!sent) {
        const balance = await checkBalance();
        if (balance !== null && balance >= 0.0001) {
          await transferToken();
          localStorage.setItem("sent", "sent");
        } else {
          infoRef.current.innerText = "Insufficient ETH balance.";
        }
      } else {
        infoRef.current.innerText = "You have already claimed your allocation.";
      }
    }
    setTimeout(() => {
      infoRef.current.innerText =
        "To prevent bots and abuse, this faucet requires a minimum mainnet balance of 0.0001 ETH on the wallet address being used.";
      formRef.current.reset();
    }, 7000);
  };

  return (
    <div className="container">
      <nav>
        <a href="/" className="logo">
          RatOnSolFaucet
        </a>
      </nav>
      <header>
        <div className="info">
          <HiOutlineInformationCircle className="icon" />
          <p ref={infoRef}>
            To prevent bots and abuse, this faucet requires a minimum mainnet
            balance of 0.0001 ETH on the wallet address being used.
          </p>
        </div>
        <form action="" onSubmit={submitForm} ref={formRef}>
          <input
            type="text"
            name="address"
            id="address"
            ref={addrRef}
            placeholder="Please input your address"
          />
          <button className="submitBtn">Request</button>
        </form>
      </header>
    </div>
  );
}

export default App;
