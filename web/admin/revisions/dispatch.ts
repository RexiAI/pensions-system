/**
 * Refresh dispatch (T14): the computation runs in GitHub Actions, never in a serverless
 * request. The upstream response body is never returned or rendered: a failed dispatch is
 * a fixed reason code, so no GitHub API body or workflow log can reach the operator
 * (docs/SECURITY.md §Upstream Error Responses).
 */
export interface DispatchOptions {
  fetchImpl: typeof fetch;
  token: string;
  owner: string;
  repo: string;
  workflowFile: string;
  ref: string;
  apiBase?: string;
}

export type DispatchResult =
  | { ok: true }
  | { ok: false; reason: 'dispatch.failed' | 'dispatch.unauthorized' };

export const REFRESH_WORKFLOW_FILE = 'refresh-derived.yml';

export async function dispatchRefreshWorkflow(options: DispatchOptions): Promise<DispatchResult> {
  const base = options.apiBase ?? 'https://api.github.com';
  const url = `${base}/repos/${options.owner}/${options.repo}/actions/workflows/${options.workflowFile}/dispatches`;
  try {
    const response = await options.fetchImpl(url, {
      method: 'POST',
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${options.token}`,
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({ ref: options.ref }),
    });
    if (response.status === 204) return { ok: true };
    if (response.status === 401 || response.status === 403) return { ok: false, reason: 'dispatch.unauthorized' };
    return { ok: false, reason: 'dispatch.failed' };
  } catch {
    return { ok: false, reason: 'dispatch.failed' };
  }
}
