// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Counter.sol";

contract ScrollChill is ERC721 {
    Counter private counter; 
    address public owner;
    IERC20 public rewardToken;

    struct WatchParty {
        string title;
        uint256 partyTime;
        address host;
        bool active;
        bool partyClosed;
        string[] movieOptions;
        mapping(address => bool) hasVoted;
        mapping(string => uint256) votes;
        string winningMovie;
    }

    mapping(uint256 => WatchParty) public watchParties;
    uint256 private _tokenIds;
    uint256 private partyIds; 

    event WatchPartyCreated(uint256 partyId, address host, string title, uint256 time);
    event VoteCast(uint256 partyId, string movieTitle, address voter);
    event WatchPartyClosed(uint256 partyId, string winningMovie);
    event NFTMinted(address to, uint256 tokenId);

    constructor(int256 initialCount, address _rewardToken) 
        ERC721("ScrollChillNFT", "SCNFT") 
    {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
        counter = new Counter(initialCount);
            }

    function incrementCounter() public {
        counter.increment();
    }

    function decrementCounter() public {
        counter.decrement();
    }

    function resetCounter() public {
        counter.reset();
    }

    function getCounterValue() public view returns (int256) {
        return counter.getCount();
    }

    // Watch party functions
    function createWatchParty(string memory _title, uint256 _partyTime, string[] memory _movieOptions) public {
        require(_partyTime > block.timestamp, "Party time must be in the future");

        partyIds++; // Increment party ID
        uint256 newPartyId = partyIds;

        WatchParty storage newParty = watchParties[newPartyId];
        newParty.title = _title;
        newParty.partyTime = _partyTime;
        newParty.host = msg.sender;
        newParty.active = true;
        newParty.partyClosed = false;
        newParty.movieOptions = _movieOptions;

        emit WatchPartyCreated(newPartyId, msg.sender, _title, _partyTime);
    }

    function voteForMovie(uint256 _partyId, string memory _movieTitle) public {
        WatchParty storage party = watchParties[_partyId];

        require(block.timestamp < party.partyTime, "Voting period is over");
        require(party.active, "This watch party is no longer active");
        require(!party.hasVoted[msg.sender], "You have already voted");

        party.votes[_movieTitle]++;
        party.hasVoted[msg.sender] = true;

        emit VoteCast(_partyId, _movieTitle, msg.sender);
    }

    function checkVotes(uint256 _partyId) public view returns (string memory movieTitle, uint256 voteCount) {
        WatchParty storage party = watchParties[_partyId];

        require(party.partyClosed, "Party must be closed to check results");

        return (party.winningMovie, party.votes[party.winningMovie]);
    }

    function closeWatchParty(uint256 _partyId) public {
        WatchParty storage party = watchParties[_partyId];

        require(msg.sender == party.host, "Only the host can close the party");
        require(party.active, "Party is already closed");

        party.active = false;
        party.partyClosed = true;

        string memory winningMovie = party.movieOptions[0];
        uint256 highestVotes = party.votes[winningMovie];

        for (uint256 i = 1; i < party.movieOptions.length; i++) {
            string memory currentMovie = party.movieOptions[i];
            uint256 currentVotes = party.votes[currentMovie];
            if (currentVotes > highestVotes) {
                winningMovie = currentMovie;
                highestVotes = currentVotes;
            }
        }

        party.winningMovie = winningMovie;

        emit WatchPartyClosed(_partyId, winningMovie);
    }

    function mintNFTForParty(address participant) internal returns (uint256) {
        _tokenIds++; // Increment your token ID counter
        uint256 newTokenId = _tokenIds;

        _mint(participant, newTokenId);
        emit NFTMinted(participant, newTokenId);
        
        return newTokenId;
    }

    function distributeRewards(address _host, address[] memory _participants, uint256 _rewardAmount) public {
        rewardToken.transfer(_host, _rewardAmount);

        for (uint256 i = 0; i < _participants.length; i++) {
            rewardToken.transfer(_participants[i], _rewardAmount / _participants.length);
        }
    }
}
