/**
 * Map Sequencer Response to common interface response
 * Intersection (sequencer response ∩ (∪ rpc responses))
 */
import {
  CallContractResponse,
  DeclareContractResponse,
  DeployContractResponse,
  EstimateFeeResponse,
  EstimateFeeResponseBulk,
  GetBlockResponse,
  GetTransactionReceiptResponse,
  GetTransactionResponse,
  InvokeFunctionResponse,
  Sequencer,
  StateUpdateResponse,
  TransactionSimulationResponse,
} from '../../types';
import { toBigInt } from '../num';
import { parseSignature } from '../stark';
import { ResponseParser } from '.';

export class SequencerAPIResponseParser extends ResponseParser {
  public parseGetBlockResponse(res: Sequencer.GetBlockResponse): GetBlockResponse {
    return {
      ...res,
      new_root: res.state_root,
      parent_hash: res.parent_block_hash,
      transactions: Object.values(res.transactions)
        .map((value) => 'transaction_hash' in value && value.transaction_hash)
        .filter(Boolean) as Array<string>,
    };
  }

  public parseGetTransactionResponse(
    res: Sequencer.GetTransactionResponse
  ): GetTransactionResponse {
    return {
      ...res,
      calldata: 'calldata' in res.transaction ? (res.transaction.calldata as Array<string>) : [],
      contract_class:
        'contract_class' in res.transaction ? (res.transaction.contract_class as any) : undefined,
      entry_point_selector:
        'entry_point_selector' in res.transaction
          ? res.transaction.entry_point_selector
          : undefined,
      max_fee: 'max_fee' in res.transaction ? (res.transaction.max_fee as string) : undefined,
      nonce: res.transaction.nonce as string,
      sender_address:
        'sender_address' in res.transaction
          ? (res.transaction.sender_address as string)
          : undefined,
      signature:
        'signature' in res.transaction ? parseSignature(res.transaction.signature) : undefined,
      transaction_hash:
        'transaction_hash' in res.transaction ? res.transaction.transaction_hash : undefined,
      version: 'version' in res.transaction ? (res.transaction.version as string) : undefined,
    };
  }

  public parseGetTransactionReceiptResponse(
    res: Sequencer.TransactionReceiptResponse
  ): GetTransactionReceiptResponse {
    return {
      transaction_hash: res.transaction_hash,
      status: res.status,
      messages_sent: res.l2_to_l1_messages as any, // TODO: parse
      events: res.events as any,
      ...('block_hash' in res && { block_hash: res.block_hash }),
      ...('block_number' in res && { block_number: res.block_number }),
      ...('actual_fee' in res && { actual_fee: res.actual_fee }),
      ...('transaction_index' in res && { transaction_index: res.transaction_index }),
      ...('execution_resources' in res && { execution_resources: res.execution_resources }),
      ...('l1_to_l2_consumed_message' in res && {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        l1_to_l2_consumed_message: res['l1_to_l2_consumed_message'],
      }),
      ...('transaction_failure_reason' in res && {
        transaction_failure_reason: res.transaction_failure_reason,
      }),
    };
  }

  public parseFeeEstimateResponse(res: Sequencer.EstimateFeeResponse): EstimateFeeResponse {
    if ('overall_fee' in res) {
      let gasInfo = {};

      try {
        gasInfo = {
          gas_consumed: toBigInt(res.gas_usage),
          gas_price: toBigInt(res.gas_price),
        };
      } catch {
        // do nothing
      }

      return {
        overall_fee: toBigInt(res.overall_fee),
        ...gasInfo,
      };
    }
    return {
      overall_fee: toBigInt(res.amount),
    };
  }

  public parseFeeEstimateBulkResponse(
    res: Sequencer.EstimateFeeResponseBulk
  ): EstimateFeeResponseBulk {
    return [].concat(res as []).map((item: Sequencer.EstimateFeeResponse) => {
      if ('overall_fee' in item) {
        let gasInfo = {};

        try {
          gasInfo = {
            gas_consumed: toBigInt(item.gas_usage),
            gas_price: toBigInt(item.gas_price),
          };
        } catch {
          // do nothing
        }

        return {
          overall_fee: toBigInt(item.overall_fee),
          ...gasInfo,
        };
      }
      return {
        overall_fee: toBigInt(item.amount),
      };
    });
  }

  public parseFeeSimulateTransactionResponse(
    res: Sequencer.TransactionSimulationResponse
  ): TransactionSimulationResponse {
    if ('overall_fee' in res.fee_estimation) {
      let gasInfo = {};

      try {
        gasInfo = {
          gas_consumed: toBigInt(res.fee_estimation.gas_usage),
          gas_price: toBigInt(res.fee_estimation.gas_price),
        };
      } catch {
        // do nothing
      }

      return {
        trace: res.trace,
        fee_estimation: {
          ...gasInfo,
          overall_fee: toBigInt(res.fee_estimation.overall_fee),
        },
      };
    }

    return {
      trace: res.trace,
      fee_estimation: {
        overall_fee: toBigInt(res.fee_estimation.amount),
      },
    };
  }

  public parseCallContractResponse(res: Sequencer.CallContractResponse): CallContractResponse {
    return {
      result: res.result,
    };
  }

  public parseInvokeFunctionResponse(
    res: Sequencer.AddTransactionResponse
  ): InvokeFunctionResponse {
    return {
      transaction_hash: res.transaction_hash,
    };
  }

  public parseDeployContractResponse(
    res: Sequencer.AddTransactionResponse
  ): DeployContractResponse {
    return {
      transaction_hash: res.transaction_hash,
      contract_address: res.address as string,
    };
  }

  public parseDeclareContractResponse(
    res: Sequencer.AddTransactionResponse
  ): DeclareContractResponse {
    return {
      transaction_hash: res.transaction_hash,
      class_hash: res.class_hash as string,
    };
  }

  public parseGetStateUpdateResponse(res: Sequencer.StateUpdateResponse): StateUpdateResponse {
    const nonces = Object.entries(res.state_diff.nonces).map(([contract_address, nonce]) => ({
      contract_address,
      nonce,
    }));
    const storage_diffs = Object.entries(res.state_diff.storage_diffs).map(
      ([address, storage_entries]) => ({ address, storage_entries })
    );

    return {
      ...res,
      state_diff: {
        ...res.state_diff,
        storage_diffs,
        nonces,
      },
    };
  }
}
