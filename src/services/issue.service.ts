import { googleSheet } from '@/lib/googleSheet';
import { getNextId } from '@/lib/autoIncrement';
import { SheetName, IssueStatus } from '@/constants/enums';
import { Issue, CreateIssueDTO, UpdateIssueDTO } from '@/types/issue';

const SHEET = SheetName.ISSUES;
const ID_FIELD = 'issue_id';

/**
 * Get all issues
 */
export const getAllIssues = async (): Promise<Issue[]> => {
  return googleSheet.getAll<Issue>(SHEET);
};

/**
 * Get issue by ID
 */
export const getIssueById = async (id: number): Promise<Issue | null> => {
  return googleSheet.getById<Issue>(SHEET, ID_FIELD, id);
};

/**
 * Get issues by rental ID
 */
export const getIssuesByRentalId = async (rentalId: number): Promise<Issue[]> => {
  return googleSheet.getByField<Issue>(SHEET, 'rental_id', rentalId);
};

/**
 * Get issues by status
 */
export const getIssuesByStatus = async (status: IssueStatus): Promise<Issue[]> => {
  return googleSheet.getByField<Issue>(SHEET, 'status', status);
};

/**
 * Get pending issues
 */
export const getPendingIssues = async (): Promise<Issue[]> => {
  return getIssuesByStatus(IssueStatus.PENDING);
};

/**
 * Create a new issue
 */
export const createIssue = async (data: CreateIssueDTO): Promise<Issue> => {
  const issueId = await getNextId(SHEET);
  const now = new Date().toISOString();

  const issue: Issue = {
    issue_id: issueId,
    rental_id: data.rental_id,
    title: data.title,
    description: data.description,
    media_url: data.media_url || '',
    status: IssueStatus.PENDING,
    created_at: now,
  };

  await googleSheet.append(SHEET, issue);
  return issue;
};

/**
 * Update issue
 */
export const updateIssue = async (id: number, data: UpdateIssueDTO): Promise<Issue | null> => {
  return googleSheet.update<Issue>(SHEET, ID_FIELD, id, data);
};

/**
 * Update issue status
 */
export const updateIssueStatus = async (id: number, status: IssueStatus): Promise<Issue | null> => {
  return updateIssue(id, { status });
};

/**
 * Mark issue as processing
 */
export const markIssueAsProcessing = async (id: number): Promise<Issue | null> => {
  return updateIssueStatus(id, IssueStatus.PROCESSING);
};

/**
 * Mark issue as done
 */
export const markIssueAsDone = async (id: number): Promise<Issue | null> => {
  return updateIssueStatus(id, IssueStatus.DONE);
};

/**
 * Delete issue
 */
export const deleteIssue = async (id: number): Promise<boolean> => {
  return googleSheet.delete(SHEET, ID_FIELD, id);
};
