import { NextRequest } from 'next/server';
import { getAllIssues, getIssueById, getIssuesByRentalId, getIssuesByStatus, createIssue, updateIssue } from '@/services/issue.service';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/response';
import { CreateIssueDTO, UpdateIssueDTO } from '@/types/issue';
import { IssueStatus } from '@/constants/enums';

/**
 * GET /api/issues - Get issues
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rentalId = searchParams.get('rental_id');
    const status = searchParams.get('status');
    const issueId = searchParams.get('issue_id');

    if (issueId) {
      const issue = await getIssueById(parseInt(issueId, 10));
      return successResponse(issue);
    }

    let issues;

    if (rentalId) {
      issues = await getIssuesByRentalId(parseInt(rentalId, 10));
    } else if (status) {
      issues = await getIssuesByStatus(status as IssueStatus);
    } else {
      issues = await getAllIssues();
    }

    return successResponse(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/issues - Create a new issue
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateIssueDTO = await request.json();

    // Validate required fields
    if (!body.rental_id || !body.title || !body.description) {
      return errorResponse('Missing required fields: rental_id, title, description');
    }

    const issue = await createIssue(body);
    return createdResponse(issue, 'Issue reported successfully');
  } catch (error) {
    console.error('Error creating issue:', error);
    if (error instanceof Error) {
      return errorResponse(error.message);
    }
    return serverErrorResponse();
  }
}

/**
 * PUT /api/issues - Update issue
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issue_id');

    if (!issueId) {
      return errorResponse('issue_id is required');
    }

    const body: UpdateIssueDTO = await request.json();
    const id = parseInt(issueId, 10);

    const issue = await updateIssue(id, body);

    if (!issue) {
      return errorResponse('Issue not found');
    }

    return successResponse(issue, 'Issue updated successfully');
  } catch (error) {
    console.error('Error updating issue:', error);
    return serverErrorResponse();
  }
}
