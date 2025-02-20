import { StarknetChainId } from '../constants';
import type {
  Call,
  CallContractResponse,
  ContractClass,
  DeclareContractResponse,
  DeclareContractTransaction,
  DeployAccountContractPayload,
  DeployAccountContractTransaction,
  DeployContractResponse,
  EstimateFeeResponse,
  EstimateFeeResponseBulk,
  GetBlockResponse,
  GetCodeResponse,
  GetTransactionReceiptResponse,
  GetTransactionResponse,
  Invocation,
  InvocationBulk,
  InvocationsDetailsWithNonce,
  InvokeFunctionResponse,
  Nonce,
  RPC,
  StateUpdateResponse,
  Storage,
  TransactionSimulationResponse,
  waitForTransactionOptions,
} from '../types';
import type { BigNumberish } from '../utils/num';
import { BlockIdentifier } from './utils';

export abstract class ProviderInterface {
  /**
   * Gets the Starknet chain Id
   *
   * @returns the chain Id
   */
  public abstract getChainId(): Promise<StarknetChainId>;

  /**
   * Calls a function on the Starknet contract.
   *
   * @param call transaction to be called
   * @param blockIdentifier block identifier
   * @returns the result of the function on the smart contract.
   */
  public abstract callContract(
    call: Call,
    blockIdentifier?: BlockIdentifier
  ): Promise<CallContractResponse>;

  /**
   * Gets the block information
   *
   * @param blockIdentifier block identifier
   * @returns the block object
   */
  public abstract getBlock(blockIdentifier: BlockIdentifier): Promise<GetBlockResponse>;

  /**
   * @deprecated The method should not be used
   */
  public abstract getCode(
    contractAddress: string,
    blockIdentifier?: BlockIdentifier
  ): Promise<GetCodeResponse>;

  /**
   * Gets the contract class of the deployed contract.
   *
   * @param contractAddress - contract address
   * @param blockIdentifier - block identifier
   * @returns Contract class of compiled contract
   */
  public abstract getClassAt(
    contractAddress: string,
    blockIdentifier?: BlockIdentifier
  ): Promise<ContractClass | RPC.ContractClass>;

  /**
   * Returns the class hash deployed under the given address.
   *
   * @param contractAddress - contract address
   * @param blockIdentifier - block identifier
   * @returns Class hash
   */
  public abstract getClassHashAt(
    contractAddress: string,
    blockIdentifier?: BlockIdentifier
  ): Promise<string>;

  /**
   * Returns the contract class deployed under the given class hash.
   *
   * @param classHash - class hash
   * @returns Contract class of compiled contract
   */
  public abstract getClassByHash(classHash: string): Promise<ContractClass | RPC.ContractClass>;

  /**
   * Gets the nonce of a contract with respect to a specific block
   *
   * @param contractAddress - contract address
   * @returns the hex nonce
   */
  public abstract getNonceForAddress(
    contractAddress: string,
    blockIdentifier?: BlockIdentifier
  ): Promise<Nonce>;

  /**
   * Gets the contract's storage variable at a specific key.
   *
   * @param contractAddress
   * @param key - from getStorageVarAddress('<STORAGE_VARIABLE_NAME>') (WIP)
   * @param blockIdentifier - block identifier
   * @returns the value of the storage variable
   */
  public abstract getStorageAt(
    contractAddress: string,
    key: BigNumberish,
    blockIdentifier?: BlockIdentifier
  ): Promise<Storage>;

  /**
   * Gets the transaction information from a tx id.
   *
   * @param txHash
   * @returns the transaction object { transaction_id, status, transaction, block_number?, block_number?, transaction_index?, transaction_failure_reason? }
   */
  public abstract getTransaction(transactionHash: BigNumberish): Promise<GetTransactionResponse>;

  /**
   * Gets the transaction receipt from a tx hash.
   *
   * @param txHash
   * @returns the transaction receipt object
   */
  public abstract getTransactionReceipt(
    transactionHash: BigNumberish
  ): Promise<GetTransactionReceiptResponse>;

  /**
   * Deploys a given compiled Account contract (json) to starknet
   *
   * @param payload payload to be deployed containing:
   * - compiled contract code
   * - constructor calldata
   * - address salt
   * @returns a confirmation of sending a transaction on the starknet contract
   */
  public abstract deployAccountContract(
    payload: DeployAccountContractPayload,
    details: InvocationsDetailsWithNonce
  ): Promise<DeployContractResponse>;

  /**
   * Invokes a function on starknet
   * @deprecated This method wont be supported as soon as fees are mandatory. Should not be used outside of Account class
   *
   * @param invocation the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce - optional nonce
   * - version - optional version
   * - maxFee - optional maxFee
   * @returns response from addTransaction
   */
  public abstract invokeFunction(
    invocation: Invocation,
    details: InvocationsDetailsWithNonce
  ): Promise<InvokeFunctionResponse>;

  /**
   * Declares a given compiled contract (json) to starknet
   * @param transaction transaction payload to be deployed containing:
   * - compiled contract code
   * - sender address
   * - signature
   * @param details Invocation Details containing:
   * - nonce
   * - optional version
   * - optional maxFee
   * @returns a confirmation of sending a transaction on the starknet contract
   */
  public abstract declareContract(
    transaction: DeclareContractTransaction,
    details: InvocationsDetailsWithNonce
  ): Promise<DeclareContractResponse>;

  /**
   * Estimates the fee for a given INVOKE transaction
   * @deprecated Please use getInvokeEstimateFee or getDeclareEstimateFee instead. Should not be used outside of Account class
   *
   * @param invocation the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce - optional nonce
   * - version - optional version
   * @param blockIdentifier - (optional) block identifier
   * @param skipValidate - (optional) skip cairo __validate__ method
   * @returns the estimated fee
   */
  public abstract getEstimateFee(
    invocation: Invocation,
    details: InvocationsDetailsWithNonce,
    blockIdentifier: BlockIdentifier,
    skipValidate?: boolean
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimates the fee for a given INVOKE transaction
   *
   * @param invocation the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce - optional nonce
   * - version - optional version
   * @param blockIdentifier - (optional) block identifier
   * @param skipValidate - (optional) skip cairo __validate__ method
   * @returns the estimated fee
   */
  public abstract getInvokeEstimateFee(
    invocation: Invocation,
    details: InvocationsDetailsWithNonce,
    blockIdentifier?: BlockIdentifier,
    skipValidate?: boolean
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimates the fee for a given DECLARE transaction
   *
   * @param transaction transaction payload to be declared containing:
   * - compiled contract code
   * - sender address
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce
   * - version - optional version
   * - optional maxFee
   * @param blockIdentifier - (optional) block identifier
   * @param skipValidate - (optional) skip cairo __validate__ method
   * @returns the estimated fee
   */
  public abstract getDeclareEstimateFee(
    transaction: DeclareContractTransaction,
    details: InvocationsDetailsWithNonce,
    blockIdentifier?: BlockIdentifier,
    skipValidate?: boolean
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimates the fee for a given DEPLOY_ACCOUNT transaction
   *
   * @param transaction transaction payload to be deployed containing:
   * - classHash
   * - constructorCalldata
   * - addressSalt
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce
   * - version - optional version
   * - optional maxFee
   * @param blockIdentifier - (optional) block identifier
   * @param skipValidate - (optional) skip cairo __validate__ method
   * @returns the estimated fee
   */
  public abstract getDeployAccountEstimateFee(
    transaction: DeployAccountContractTransaction,
    details: InvocationsDetailsWithNonce,
    blockIdentifier?: BlockIdentifier,
    skipValidate?: boolean
  ): Promise<EstimateFeeResponse>;

  /**
   * Estimates the fee for a list of INVOKE transaction
   *
   * @param invocations the array of invocation and invocation details object containing:
   * - contractAddress - the address of the account
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * - nonce - optional nonce
   * - version - optional version
   * @param blockIdentifier - block identifier
   * @returns the estimated fee
   */
  public abstract getEstimateFeeBulk(
    invocations: InvocationBulk,
    blockIdentifier?: BlockIdentifier
  ): Promise<EstimateFeeResponseBulk>;

  /**
   * Wait for the transaction to be accepted
   * @param txHash - transaction hash
   * @param retryInterval - retry interval
   * @return GetTransactionReceiptResponse
   */
  public abstract waitForTransaction(
    txHash: BigNumberish,
    options?: waitForTransactionOptions
  ): Promise<GetTransactionReceiptResponse>;

  /**
   * Simulates the transaction and returns the transaction trace and estimated fee.
   *
   * @param invocation the invocation object containing:
   * - contractAddress - the address of the contract
   * - entrypoint - the entrypoint of the contract
   * - calldata - (defaults to []) the calldata
   * - signature - (defaults to []) the signature
   * @param details - optional details containing:
   * - nonce - optional nonce
   * - version - optional version
   * @param blockIdentifier - (optional) block identifier
   * @param skipValidate - (optional) skip cairo __validate__ method
   * @returns the transaction trace and estimated fee
   */
  public abstract getSimulateTransaction(
    invocation: Invocation,
    invocationDetails: InvocationsDetailsWithNonce,
    blockIdentifier?: BlockIdentifier,
    skipValidate?: boolean
  ): Promise<TransactionSimulationResponse>;

  /**
   * Gets the state changes in a specific block
   *
   * @param blockIdentifier - block identifier
   * @returns StateUpdateResponse
   */
  public abstract getStateUpdate(blockIdentifier?: BlockIdentifier): Promise<StateUpdateResponse>;
}
