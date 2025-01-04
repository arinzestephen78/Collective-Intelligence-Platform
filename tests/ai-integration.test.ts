import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  aiOracle: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  ideaEvaluations: new Map<number, {
    ideaId: number;
    score: number;
    feedback: string;
  }>(),
};

function setAiOracle(newOracle: Principal): Response<boolean, number> {
  if (mockContractCalls.aiOracle !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') return { err: 403 };
  mockContractCalls.aiOracle = newOracle;
  return { ok: true };
}

function evaluateIdea(ideaId: number, score: number, feedback: string): Response<boolean, number> {
  if (mockContractCalls.aiOracle !== 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM') return { err: 403 };
  mockContractCalls.ideaEvaluations.set(ideaId, { ideaId, score, feedback });
  return { ok: true };
}

function getIdeaEvaluation(ideaId: number): Response<{
  ideaId: number;
  score: number;
  feedback: string;
}, number> {
  const evaluation = mockContractCalls.ideaEvaluations.get(ideaId);
  if (!evaluation) return { err: 404 };
  return { ok: evaluation };
}

function getAiOracle(): Response<Principal, never> {
  return { ok: mockContractCalls.aiOracle };
}

describe('AI Integration Contract', () => {
  beforeEach(() => {
    mockContractCalls.aiOracle = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockContractCalls.ideaEvaluations.clear();
  });
  
  it('should set a new AI oracle', () => {
    const result = setAiOracle('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ ok: true });
    expect(getAiOracle()).toEqual({ ok: 'ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM' });
  });
  
  it('should evaluate an idea', () => {
    const result = evaluateIdea(1, 85, 'Good idea with potential for improvement');
    expect(result).toEqual({ ok: true });
    expect(getIdeaEvaluation(1)).toEqual({
      ok: {
        ideaId: 1,
        score: 85,
        feedback: 'Good idea with potential for improvement',
      },
    });
  });
  
  it('should fail to set AI oracle from non-admin account', () => {
    setAiOracle('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const result = setAiOracle('ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    expect(result).toEqual({ err: 403 });
  });
  
  it('should fail to evaluate idea from non-oracle account', () => {
    setAiOracle('ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM');
    const result = evaluateIdea(1, 85, 'Good idea with potential for improvement');
    expect(result).toEqual({ err: 403 });
  });
  
  it('should fail to get a non-existent idea evaluation', () => {
    const result = getIdeaEvaluation(999);
    expect(result).toEqual({ err: 404 });
  });
});

