import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const PartyDetails = () => {
  const { id } = useParams();
  const { contract, account } = useContext(Web3Context);
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieToVote, setMovieToVote] = useState("");
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchPartyDetails = async () => {
      if (!contract) return;

      setLoading(true);
      try {
        const partiesList = await contract.getAllParties();
        const partyData = partiesList.find((party) => party.id.toNumber() === parseInt(id));

        if (partyData) {
          const formattedParty = {
            id: partyData.id.toNumber(),
            title: partyData.title,
            partyTime: partyData.partyTime.toNumber(),
            host: partyData.host,
            active: partyData.active,
            partyClosed: partyData.partyClosed,
            winningMovie: partyData.winningMovie,
            movieOptions: partyData.movieOptions,
            votes: partyData.votes,
          };

          setParty(formattedParty);
          setIsHost(partyData.host.toLowerCase() === account.toLowerCase());
        } else {
          setError("Party not found.");
        }
      } catch (error) {
        console.error("Error fetching party details:", error);
        setError("Could not fetch party details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartyDetails();
  }, [contract, id, account]);

  const handleVote = async () => {
    if (!contract || !movieToVote) return;

    setLoadingVote(true);
    try {
      const transaction = await contract.voteForMovie(party.id, movieToVote);
      await transaction.wait();
      alert("Vote cast successfully!");
      setMovieToVote("");
    } catch (error) {
      console.error("Error voting for movie:", error);
      alert("Failed to cast vote. Please try again.");
    } finally {
      setLoadingVote(false);
    }
  };

  const handleCloseParty = async () => {
    if (!contract) return;

    setLoadingClose(true);
    try {
      const transaction = await contract.closeWatchParty(party.id);
      await transaction.wait();
      alert("Party closed successfully!");
    } catch (error) {
      console.error("Error closing party:", error);
      alert("Failed to close party. Please try again.");
    } finally {
      setLoadingClose(false);
    }
  };

  if (loading) {
    return <p>Loading party details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!party) {
    return <p>No party found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{party.title}</h1>
      <p className="text-gray-700">Host: {party.host}</p>
      <p className="text-gray-500">
        Party Time: {new Date(party.partyTime * 1000).toLocaleString()}
      </p>
      <p
        className={`font-bold ${
          party.active ? "text-green-500" : "text-red-500"
        }`}
      >
        Status: {party.active ? "Active" : "Closed"}
      </p>
      {party.winningMovie && (
        <p className="text-gray-500">
          Winning Movie: {party.winningMovie}
        </p>
      )}
      {party.movieOptions && party.movieOptions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Vote for a Movie:</h2>
          <select
            value={movieToVote}
            onChange={(e) => setMovieToVote(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Select a movie</option>
            {party.movieOptions.map((movie, index) => (
              <option key={index} value={movie}>
                {movie}
              </option>
            ))}
          </select>
          <button
            onClick={handleVote}
            disabled={loadingVote || !party.active || party.partyClosed}
            className={`ml-2 p-2 rounded bg-blue-500 text-white ${
              loadingVote ? "opacity-50" : ""
            }`}
          >
            {loadingVote ? "Voting..." : "Vote"}
          </button>
        </div>
      )}
      {isHost && party.active && (
        <div className="mt-4">
          <button
            onClick={handleCloseParty}
            disabled={loadingClose}
            className={`p-2 rounded bg-red-500 text-white ${
              loadingClose ? "opacity-50" : ""
            }`}
          >
            {loadingClose ? "Closing..." : "Close Party"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PartyDetails;
