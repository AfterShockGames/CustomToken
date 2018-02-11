pragma solidity ^0.4.8;

contract Migrations {
  address public owner;

  // A function with the signature `last_completed_migration()`, returning a uint, is required.
  uint public last_completed_migration;

  modifier restricted() {
    if (msg.sender == owner) {
        _;
    }
  }

  function Migrations() public {
    owner = msg.sender;
  }

  // A function with the signature `setCompleted(uint)` is required.
  function setCompleted(uint completed) restricted public {
    last_completed_migration = completed;
  }

  function upgrade(address _newAddress) restricted public {
    Migrations upgraded = Migrations(_newAddress);
    upgraded.setCompleted(last_completed_migration);
  }
}