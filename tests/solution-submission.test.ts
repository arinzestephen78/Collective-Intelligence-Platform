import { describe, it, expect, beforeEach } from 'vitest';

// Mock Clarity types and functions
type Principal = string;
type Response<T, E> = { ok: T } | { err: E };

const mockContractCalls = {
  submissions: new Map<number, {
    challengeId: number;
    submitter: Principal;
    content: string;
    status: string;
  }>(),
  submissionCount: 0,
};

function submitSolution(challengeId: number, content: string): Response<number, never> {
  const submissionId = ++mockContractCalls.submissionCount;
  mockContractCalls.submissions.set(submissionId, {
    challengeId,
    submitter: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    content,
    status: 'pending',
  });
  return { ok: submissionId };
}

function evaluateSolution(submissionId: number, newStatus: string): Response<boolean, number> {
  const submission = mockContractCalls.submissions.get(submissionId);
  if (!submission) return { err: 404 };
  if (submission.status !== 'pending') return { err: 400 };
  submission.status = newStatus;
  mockContractCalls.submissions.set(submissionId, submission);
  return { ok: true };
}

function getSubmission(submissionId: number): Response<{
  challengeId: number;
  submitter: Principal;
  content: string;
  status: string;
}, number> {
  const submission = mockContractCalls.submissions.get(submissionId);
  if (!submission) return { err: 404 };
  return { ok: submission };
}

describe('Solution Submission Contract', () => {
  beforeEach(() => {
    mockContractCalls.submissions.clear();
    mockContractCalls.submissionCount = 0;
  });
  
  it('should submit a new solution', () => {
    const result = submitSolution(1, 'This is a test solution');
    expect(result).toEqual({ ok: 1 });
    expect(mockContractCalls.submissions.size).toBe(1);
  });
  
  it('should evaluate a pending solution', () => {
    submitSolution(1, 'This is a test solution');
    const result = evaluateSolution(1, 'accepted');
    expect(result).toEqual({ ok: true });
    expect(getSubmission(1)).toEqual({
      ok: {
        challengeId: 1,
        submitter: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        content: 'This is a test solution',
        status: 'accepted',
      },
    });
  });
  
  it('should fail to evaluate a non-existent solution', () => {
    const result = evaluateSolution(999, 'accepted');
    expect(result).toEqual({ err: 404 });
  });
  
  it('should fail to evaluate an already evaluated solution', () => {
    submitSolution(1, 'This is a test solution');
    evaluateSolution(1, 'accepted');
    const result = evaluateSolution(1, 'rejected');
    expect(result).toEqual({ err: 400 });
  });
});

