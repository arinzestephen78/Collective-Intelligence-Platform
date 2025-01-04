import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  nfts: new Map<number, Principal>(),
  tokenUris: new Map<number, string>(),
  tokenIdNonce: 0,
};

function mint(recipient: Principal, tokenUri: string): Response<number, never> {
  const tokenId = ++mockContractCalls.tokenIdNonce;
  mockContractCalls.nfts.set(tokenId, recipient);
  mockContractCalls.tokenUris.set(tokenId, tokenUri);
  return { ok: tokenId };
}

function transfer(tokenId: number, sender: Principal, recipient: Principal): Response<boolean, number> {
  if (!mockContractCalls.nfts.has(tokenId)) return { err: 404 };
  if (mockContractCalls.nfts.get(tokenId) !== sender) return { err: 403 };
  mockContractCalls.nfts.set(tokenId, recipient);
  return { ok: true };
}

function getOwner(tokenId: number): Response<Principal, number> {
  const owner = mockContractCalls.nfts.get(tokenId);
  if (!owner) return { err: 404 };
  return { ok: owner };
}

function getTokenUri(tokenId: number): Response<string, number> {
  const uri = mockContractCalls.tokenUris.get(tokenId);
  if (!uri) return { err: 404 };
  return { ok: uri};
}

function getLastTokenId(): Response<number, never> {
  return { ok: mockContractCalls.tokenIdNonce };
}

describe('Idea NFT Contract', () => {
  beforeEach(() => {
    mockContractCalls.nfts.clear();
    mockContractCalls.tokenUris.clear();
    mockContractCalls.tokenIdNonce = 0;
  });
  
  it('should mint a new NFT', () => {
    const result = mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/token/1');
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.nfts.size).toBe(1);
    expect(mockContractCalls.tokenUris.size).toBe(1);
  });
  
  it('should transfer an NFT', () => {
    mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/token/1');
    const result = transfer(1, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(getOwner(1)).toEqual({ ok: 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' });
  });
  
  it('should get the token URI', () => {
    mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/token/1');
    const result = getTokenUri(1);
    expect(result).toEqual({ ok: 'https://example.com/token/1' });
  });
  
  it('should fail to transfer a non-existent NFT', () => {
    const result = transfer(999, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 404 });
  });
  
  it('should fail to transfer an NFT from a non-owner', () => {
    mint('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'https://example.com/token/1');
    const result = transfer(1, 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 403 });
  });
});

