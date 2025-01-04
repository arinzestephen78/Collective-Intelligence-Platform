import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  challenges: new Map<number, {
    creator: Principal;
    title: string;
    description: string;
    reward: number;
    status: string;
  }>(),
  challengeCount: 0,
};

function createChallenge(title: string, description: string, reward: number): Response<number, never> {
  const challengeId = ++mockContractCalls.challengeCount;
  mockContractCalls.challenges.set(challengeId, {
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    title,
    description,
    reward,
    status: 'open',
  });
  return { ok: challengeId };
}

function closeChallenge(challengeId: number): Response<boolean, number> {
  const challenge = mockContractCalls.challenges.get(challengeId);
  if (!challenge) return { err: 404 };
  if (challenge.status !== 'open') return { err: 400 };
  challenge.status = 'closed';
  mockContractCalls.challenges.set(challengeId, challenge);
  return { ok: true };
}

function getChallenge(challengeId: number): Response<{
  creator: Principal;
  title: string;
  description: string;
  reward: number;
  status: string;
}, number> {
  const challenge = mockContractCalls.challenges.get(challengeId);
  if (!challenge) return { err: 404 };
  return { ok: challenge };
}

describe('Challenge Manager Contract', () => {
  beforeEach(() => {
    mockContractCalls.challenges.clear();
    mockContractCalls.challengeCount = 0;
  });
  
  it('should create a new challenge', () => {
    const result = createChallenge('Test Challenge', 'This is a test challenge', 1000);
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.challenges.size).toBe(1);
  });
  
  it('should close an open challenge', () => {
    createChallenge('Test Challenge', 'This is a test challenge', 1000);
    const result = closeChallenge(1);
    expect(result).toEqual({ ok: true });
    expect(getChallenge(1)).toEqual({
      ok: {
        creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        title: 'Test Challenge',
        description: 'This is a test challenge',
        reward: 1000,
        status: 'closed',
      },
    });
  });
  
  it('should fail to close a non-existent challenge', () => {
    const result = closeChallenge(999);
    expect(result).toEqual({ err: 404 });
  });
  
  it('should fail to close an already closed challenge', () => {
    createChallenge('Test Challenge', 'This is a test challenge', 1000);
    closeChallenge(1);
    const result = closeChallenge(1);
    expect(result).toEqual({ err: 400 });
  });
});

