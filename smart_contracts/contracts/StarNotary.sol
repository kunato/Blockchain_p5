pragma solidity ^0.4.23;

import "./ERC721Token.sol";

contract StarNotary is ERC721Token {

    struct Star {
        string name;
        string cent;
        string dec;
        string mag;
        string story;
    }
    Star[] public stars;

    mapping(uint256 => Star) public tokenIdToStarInfo;

    mapping(uint256 => uint256) public starsForSale;
    event starClaimed(uint256 token);

    function compareString(string str1, string str2) view private returns (bool){
        if(keccak256(str1) == keccak256(str2)){
            return true;
        }
        else{
            return false;
        }
    }

    function checkIfStarExist(string _cent, string _dec, string _mag) view public returns (bool) {
        for (uint i = 0; i < stars.length; i++) {
            if(compareString(stars[i].dec,_dec) && compareString(stars[i].mag, _mag) && compareString(stars[i].cent,_cent)){
                return true;
            }
        }
        return false;
    }

    function createStar(string _name, string _story, string _cent, string _dec, string _mag, uint256 _tokenId) external returns (uint256) { 
        require(!checkIfStarExist(_cent, _dec, _mag), "Star coordinate duplicates.");
        Star memory newStar = Star(_name, _cent, _dec, _mag, _story);
        
        tokenIdToStarInfo[_tokenId] = newStar;
        stars.push(newStar);
        ERC721Token.mint(_tokenId);
        emit starClaimed(_tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender, "No permission to put star on sale");

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0, "Star not found");

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);

        require(msg.value >= starCost, "Value must be more than starCost");

        clearPreviousStarState(_tokenId);

        transferFromHelper(starOwner, msg.sender, _tokenId);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }

        starOwner.transfer(starCost);
    }

    function clearPreviousStarState(uint256 _tokenId) private {
        //clear approvals 
        tokenToApproved[_tokenId] = address(0);

        //clear being on sale 
        starsForSale[_tokenId] = 0;
    }

    function tokenIdToStarInfo(uint256 _tokenId) external view returns (string,string,string,string,string) {
        Star storage star = tokenIdToStarInfo[_tokenId];
        return (star.name,star.story,star.cent,star.dec,star.mag);
    } 

}