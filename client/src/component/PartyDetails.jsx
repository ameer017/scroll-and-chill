import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import ScrollChillNFT from "../util/ABIs/SCHILL.json";
import { Web3Context } from "../context/Web3Context"; // Adjust the path as necessary

const PartyDetails = () => {
  const { title } = useParams();
  const { provider, account } = useContext(Web3Context);
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [contract, setContract] = useState(null);
  const contractAddress = ScrollChillNFT.address;

  // Effect to set up the contract instance
  useEffect(() => {
    if (provider && account) {
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        ScrollChillNFT.abi,
        signer
      );
      setContract(contractInstance);
    }
  }, [provider, account]);

  // Function to fetch party details
//   const fetchPartyDetails = async () => {
//     if (!contract) return;

//     try {
//       const partyDetails = await contract.watchParties(title);
//       setParty({
//         title: partyDetails.title,
//         creator: partyDetails.creator,
//         time: partyDetails.time.toNumber(),
//         movieOptions: partyDetails.movieOptions,
//         votes: partyDetails.votes,
//       });
//     } catch (error) {
//       console.error("Error fetching party details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
const fetchPartyDetails = async () => {
    if (!contract) return;

    try {
        // Assuming you call the contract's method to fetch the watch party details
        const partyDetails = await contract.watchParties(title); // title here should correspond to the partyId

        // Now include the ID in the state
        setParty({
            id: title, // Set the ID (assuming title is the ID; adjust accordingly)
            title: partyDetails.title,
            creator: partyDetails.creator,
            time: partyDetails.time.toNumber(),
            movieOptions: partyDetails.movieOptions,
            votes: partyDetails.votes,
        });
    } catch (error) {
        console.error("Error fetching party details:", error);
    } finally {
        setLoading(false);
    }
};


  // Effect to fetch party details when contract and title are available
  useEffect(() => {
    if (contract && title) {
      fetchPartyDetails();
    }
  }, [contract, title]);

  // Function to join the watch party
  const joinParty = async () => {
    if (!contract) return;

    try {
      const tx = await contract.joinWatchParty(title);
      await tx.wait();
      alert("Joined the watch party!");
    } catch (error) {
      console.error("Error joining party:", error);
    }
  };

  // Function to vote for a movie
  const voteForMovie = async () => {
    if (!contract || !selectedMovie) return;

    try {
      const tx = await contract.voteForMovie(title, selectedMovie); // Use `title` instead of `partyId`
      await tx.wait();
      alert("Voted for movie!");
    } catch (error) {
      console.error("Error voting for movie:", error);
    }
  };

  // Function to format the date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="party-details-container p-8">
      {loading ? (
        <p>Loading party details...</p>
      ) : party ? (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-bold">{party.title}</h2>
          <p className="text-gray-600">Created by: {party.creator}</p>
          <p className="text-gray-600">Time: {formatDate(party.time)}</p>

          <h3 className="mt-4 font-semibold text-lg">Movie Options:</h3>
          <ul className="list-disc list-inside ml-4">
            {party.movieOptions.map((movie, index) => (
              <li key={index}>{movie}</li>
            ))}
          </ul>

          <h4 className="mt-6 font-semibold text-lg">Vote for a Movie:</h4>
          <select
            className="mt-2 p-2 border rounded"
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
          >
            <option value="">Select a Movie</option>
            {party.movieOptions.map((movie, index) => (
              <option key={index} value={movie}>
                {movie}
              </option>
            ))}
          </select>

          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            onClick={voteForMovie}
          >
            Submit Vote
          </button>

          <button
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={joinParty}
          >
            Join Watch Party
          </button>
        </div>
      ) : (
        <p>Watch party not found.</p>
      )}
    </div>
  );
};

export default PartyDetails;
