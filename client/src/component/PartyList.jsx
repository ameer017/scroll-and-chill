import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const PartyList = () => {
  const { contract } = useContext(Web3Context);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const partyCount = 10;

  useEffect(() => {
    const fetchParties = async () => {
      const partiesList = [];

      try {
        for (let i = 1; i <= partyCount; i++) {
          try {
            const party = await contract.watchParties(i);
            console.log(party);
            if (party.active) {
              const partyData = {
                id: i,
                title: party.title,
                partyTime: party.partyTime.toNumber(),
                host: party.host,
                active: party.active,
                partyClosed: party.partyClosed,
              };
              partiesList.push(partyData);
            }
          } catch (err) {
            console.log(`Party with ID ${i} does not exist.`);
          }
        }

        setParties(partiesList);
      } catch (error) {
        console.error("Error fetching watch parties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, [contract]);

  const formatHost = (host) => {
    if (host.length > 20) {
      return `${host.slice(0, 4)}...${host.slice(-4)}`;
    }
    return host;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Watch Parties</h1>
      {loading ? (
        <p>Loading parties...</p>
      ) : parties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parties.map((party) => (
            <Link
              to={`/party-details/${party.title}`}
              key={party.id}
              className="block p-4 border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-lg font-semibold">{party.title}</h2>
              <p className="text-gray-700">
                Host: {formatHost(party.host)}
              </p>{" "}
              {/* Format host name */}
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
            </Link>
          ))}
        </div>
      ) : (
        <p>No more parties available.</p>
      )}
    </div>
  );
};

export default PartyList;
