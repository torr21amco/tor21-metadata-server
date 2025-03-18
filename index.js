const express = require('express');
const app = express();
const { Web3 } = require('web3');
const cors = require('cors');

const contractAddress = '0xe81412a196c40112B87C9f3D47cfE71Dca949d2b';
const web3 = new Web3('https://polygon-rpc.com');
const contract = new web3.eth.Contract(abi, contractAddress);

app.use(express.json());
app.use(cors({ origin: ['https://opensea.io', 'https://polygonscan.com'] })); // Configurar CORS para OpenSea

app.get('/metadata/:tokenId', async (req, res) => {
  try {
    const tokenId = req.params.tokenId;

    // Obtener datos del contrato con los métodos correctos
    const entidad = await contract.methods.entidadPorNFT(tokenId).call().catch(err => { throw new Error(`entidadPorNFT falló: ${err.message}`); });
    const expiracion = await contract.methods.expiracionNFT(tokenId).call().catch(err => { throw new Error(`expiracionNFT falló: ${err.message}`); });
    const activo = await contract.methods.isActive(tokenId).call().catch(err => { throw new Error(`isActive falló: ${err.message}`); });
    const paquete = await contract.methods.tipoPaquete(tokenId).call().catch(err => { throw new Error(`tipoPaquete falló: ${err.message}`); });

    const currentTime = Math.floor(Date.now() / 1000);
    const estado = activo && currentTime <= expiracion ? "Activo" : "Expirado";
    const duracion = expiracion > currentTime ? `${Math.floor((expiracion - currentTime) / (24 * 60 * 60))} days` : "0 days";

    const metadata = {
      name: `TOR21 Shield NFT #${tokenId}`,
      description: "Protección web avanzada con TOR21 Shield NFT.",
      image: "https://tomato-gigantic-chimpanzee-961.mypinata.cloud/ipfs/bafkreig7wzrsevdtjmuap2guajvfhwb5bpj5sfqnppwrdq5zf4xncytqza",
      external_url: "https://tor21.com",
      attributes: [
        { trait_type: "Entidad", value: entidad },
        { trait_type: "Paquete", value: paquete.toString() },
        { trait_type: "Duración", value: duracion },
        { trait_type: "Estado", value: estado }
      ]
    };

    res.json(metadata);
  } catch (error) {
    console.error(`Error en metadata para tokenId ${tokenId}:`, error.message);
    res.status(500).json({ error: `Error al obtener metadata para tokenId ${tokenId}: ${error.message}` });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));