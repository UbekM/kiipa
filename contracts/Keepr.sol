// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Keepr
 * @dev Decentralized inheritance and secret-keeping protocol
 * @author Keepr Team
 */
contract Keepr is ReentrancyGuard, Pausable, Ownable {
  // Events
  event KeepCreated(
    uint256 indexed keepId,
    address indexed creator,
    address indexed recipient,
    string ipfsHash,
    uint256 unlockTime,
    KeepType keepType
  );

  event KeepClaimed(
    uint256 indexed keepId,
    address indexed recipient,
    uint256 claimedAt
  );

  event KeepCancelled(
    uint256 indexed keepId,
    address indexed creator,
    uint256 cancelledAt
  );

  event FallbackActivated(
    uint256 indexed keepId,
    address indexed fallbackRecipient,
    uint256 activatedAt
  );

  event RecipientChanged(
    uint256 indexed keepId,
    address indexed oldRecipient,
    address indexed newRecipient
  );

  // Structs
  struct Keep {
    uint256 id;
    address creator;
    address recipient;
    address fallbackRecipient;
    string ipfsHash;
    uint256 unlockTime;
    uint256 createdAt;
    KeepStatus status;
    KeepType keepType;
    string title;
    string description;
  }

  struct KeepMetadata {
    string title;
    string description;
    KeepType keepType;
    uint256 unlockTime;
    string recipientEmail;
    string fallbackEmail;
  }

  // Enums
  enum KeepStatus {
    Active,
    Claimed,
    Cancelled,
    Expired
  }

  enum KeepType {
    Secret,
    Document,
    Key,
    Inheritance
  }

  // State variables
  uint256 private _keepIds = 1; // Start from 1
  mapping(uint256 => Keep) public keeps;
  mapping(address => uint256[]) public userKeeps;
  mapping(address => uint256[]) public recipientKeeps;

  // Configuration
  uint256 public minUnlockDelay = 1 days;
  uint256 public maxUnlockDelay = 365 days;
  uint256 public claimWindow = 30 days;
  uint256 public platformFee = 0.001 ether;

  // Modifiers
  modifier onlyKeepCreator(uint256 keepId) {
    require(
      keeps[keepId].creator == msg.sender,
      "Only creator can perform this action"
    );
    _;
  }

  modifier onlyKeepRecipient(uint256 keepId) {
    require(
      keeps[keepId].recipient == msg.sender ||
        keeps[keepId].fallbackRecipient == msg.sender,
      "Only recipient can perform this action"
    );
    _;
  }

  modifier keepExists(uint256 keepId) {
    require(keeps[keepId].creator != address(0), "Keep does not exist");
    _;
  }

  modifier keepActive(uint256 keepId) {
    require(keeps[keepId].status == KeepStatus.Active, "Keep is not active");
    _;
  }

  modifier keepUnlocked(uint256 keepId) {
    require(
      block.timestamp >= keeps[keepId].unlockTime,
      "Keep is not yet unlocked"
    );
    _;
  }

  // Constructor
  constructor() Ownable(msg.sender) {
    // _keepIds starts at 1, so no need to increment
  }

  /**
   * @dev Create a new keep
   * @param recipient Primary recipient address
   * @param fallbackRecipient Fallback recipient address (optional)
   * @param ipfsHash IPFS hash of encrypted content
   * @param unlockTime When the keep becomes available
   * @param metadata Additional keep metadata
   */
  function createKeep(
    address recipient,
    address fallbackRecipient,
    string calldata ipfsHash,
    uint256 unlockTime,
    KeepMetadata calldata metadata
  ) external payable nonReentrant whenNotPaused {
    require(recipient != address(0), "Invalid recipient address");
    require(recipient != msg.sender, "Cannot create keep for yourself");
    require(bytes(ipfsHash).length > 0, "IPFS hash required");
    require(
      unlockTime > block.timestamp + minUnlockDelay,
      "Unlock time too soon"
    );
    require(
      unlockTime <= block.timestamp + maxUnlockDelay,
      "Unlock time too far"
    );
    require(msg.value >= platformFee, "Insufficient platform fee");

    uint256 keepId = _keepIds;
    _keepIds++;

    keeps[keepId] = Keep({
      id: keepId,
      creator: msg.sender,
      recipient: recipient,
      fallbackRecipient: fallbackRecipient,
      ipfsHash: ipfsHash,
      unlockTime: unlockTime,
      createdAt: block.timestamp,
      status: KeepStatus.Active,
      keepType: metadata.keepType,
      title: metadata.title,
      description: metadata.description
    });

    userKeeps[msg.sender].push(keepId);
    recipientKeeps[recipient].push(keepId);
    if (fallbackRecipient != address(0)) {
      recipientKeeps[fallbackRecipient].push(keepId);
    }

    emit KeepCreated(
      keepId,
      msg.sender,
      recipient,
      ipfsHash,
      unlockTime,
      metadata.keepType
    );
  }

  /**
   * @dev Claim a keep (primary recipient)
   * @param keepId ID of the keep to claim
   */
  function claimKeep(
    uint256 keepId
  )
    external
    nonReentrant
    keepExists(keepId)
    keepActive(keepId)
    keepUnlocked(keepId)
  {
    Keep storage keep = keeps[keepId];
    require(keep.recipient == msg.sender, "Only primary recipient can claim");

    keep.status = KeepStatus.Claimed;

    emit KeepClaimed(keepId, msg.sender, block.timestamp);
  }

  /**
   * @dev Activate fallback access (fallback recipient)
   * @param keepId ID of the keep to activate fallback for
   */
  function activateFallback(
    uint256 keepId
  )
    external
    nonReentrant
    keepExists(keepId)
    keepActive(keepId)
    keepUnlocked(keepId)
  {
    Keep storage keep = keeps[keepId];
    require(
      keep.fallbackRecipient == msg.sender,
      "Only fallback recipient can activate"
    );
    require(
      keep.recipient != address(0),
      "No primary recipient to fallback from"
    );

    // Check if primary recipient has claimed within claim window
    require(
      block.timestamp > keep.unlockTime + claimWindow,
      "Primary recipient still has time to claim"
    );

    keep.status = KeepStatus.Claimed;

    emit FallbackActivated(keepId, msg.sender, block.timestamp);
  }

  /**
   * @dev Cancel a keep (creator only)
   * @param keepId ID of the keep to cancel
   */
  function cancelKeep(
    uint256 keepId
  ) external nonReentrant onlyKeepCreator(keepId) keepActive(keepId) {
    Keep storage keep = keeps[keepId];
    require(
      block.timestamp < keep.unlockTime,
      "Cannot cancel after unlock time"
    );

    keep.status = KeepStatus.Cancelled;

    emit KeepCancelled(keepId, msg.sender, block.timestamp);
  }

  /**
   * @dev Change recipient of a keep (creator only, before unlock)
   * @param keepId ID of the keep
   * @param newRecipient New recipient address
   */
  function changeRecipient(
    uint256 keepId,
    address newRecipient
  ) external nonReentrant onlyKeepCreator(keepId) keepActive(keepId) {
    Keep storage keep = keeps[keepId];
    require(
      block.timestamp < keep.unlockTime,
      "Cannot change after unlock time"
    );
    require(newRecipient != address(0), "Invalid recipient address");
    require(newRecipient != keep.recipient, "Same recipient address");

    address oldRecipient = keep.recipient;
    keep.recipient = newRecipient;

    // Update recipient mappings
    _removeFromArray(recipientKeeps[oldRecipient], keepId);
    recipientKeeps[newRecipient].push(keepId);

    emit RecipientChanged(keepId, oldRecipient, newRecipient);
  }

  /**
   * @dev Get all keeps created by a user
   * @param user User address
   * @return Array of keep IDs
   */
  function getKeepsByCreator(
    address user
  ) external view returns (uint256[] memory) {
    return userKeeps[user];
  }

  /**
   * @dev Get all keeps where user is a recipient
   * @param user User address
   * @return Array of keep IDs
   */
  function getKeepsByRecipient(
    address user
  ) external view returns (uint256[] memory) {
    return recipientKeeps[user];
  }

  /**
   * @dev Get keep details
   * @param keepId ID of the keep
   * @return Keep struct
   */
  function getKeep(uint256 keepId) external view returns (Keep memory) {
    return keeps[keepId];
  }

  /**
   * @dev Check if a keep can be claimed by fallback recipient
   * @param keepId ID of the keep
   * @return True if fallback can be activated
   */
  function canActivateFallback(uint256 keepId) external view returns (bool) {
    Keep storage keep = keeps[keepId];
    return (keep.status == KeepStatus.Active &&
      block.timestamp >= keep.unlockTime + claimWindow &&
      keep.fallbackRecipient != address(0));
  }

  /**
   * @dev Get total number of keeps
   * @return Total count
   */
  function getTotalKeeps() external view returns (uint256) {
    return _keepIds - 1;
  }

  // Internal functions
  function _removeFromArray(uint256[] storage array, uint256 value) internal {
    for (uint256 i = 0; i < array.length; i++) {
      if (array[i] == value) {
        array[i] = array[array.length - 1];
        array.pop();
        break;
      }
    }
  }

  // Admin functions
  function setMinUnlockDelay(uint256 _minDelay) external onlyOwner {
    minUnlockDelay = _minDelay;
  }

  function setMaxUnlockDelay(uint256 _maxDelay) external onlyOwner {
    maxUnlockDelay = _maxDelay;
  }

  function setClaimWindow(uint256 _claimWindow) external onlyOwner {
    claimWindow = _claimWindow;
  }

  function setPlatformFee(uint256 _fee) external onlyOwner {
    platformFee = _fee;
  }

  function pause() external onlyOwner {
    _pause();
  }

  function unpause() external onlyOwner {
    _unpause();
  }

  function withdrawFees() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No fees to withdraw");

    (bool success, ) = payable(owner()).call{value: balance}("");
    require(success, "Withdrawal failed");
  }

  // Emergency functions
  function emergencyCancelKeep(uint256 keepId) external onlyOwner {
    require(keeps[keepId].creator != address(0), "Keep does not exist");
    keeps[keepId].status = KeepStatus.Cancelled;
    emit KeepCancelled(keepId, keeps[keepId].creator, block.timestamp);
  }

  // Receive function
  receive() external payable {
    // Accept ETH for platform fees
  }
}
