import { StarknetChainId } from '../constants';
import { BigNumberish } from '../utils/num';
import { DeployAccountContractPayload, InvocationsDetails } from './lib';

export interface InvocationsSignerDetails extends Required<InvocationsDetails> {
  walletAddress: string;
  chainId: StarknetChainId;
}

export interface DeclareSignerDetails {
  classHash: string;
  senderAddress: BigNumberish;
  chainId: StarknetChainId;
  maxFee: BigNumberish;
  version: BigNumberish;
  nonce: BigNumberish;
  compiledClassHash?: string;
}

export type DeployAccountSignerDetails = Required<DeployAccountContractPayload> &
  Required<InvocationsDetails> & {
    contractAddress: BigNumberish;
    chainId: StarknetChainId;
  };
