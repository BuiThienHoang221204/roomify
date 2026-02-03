import { NextRequest } from 'next/server';
import { getIssueById, updateIssue, deleteIssue } from '@/services/issue.service';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/response';
import { UpdateIssueDTO } from '@/types/issue';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/issues/[id] - Get issue by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const issue = await getIssueById(id);

    if (!issue) {
      return notFoundResponse('Issue not found');
    }

    return successResponse(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/issues/[id] - Update issue
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const body: UpdateIssueDTO = await request.json();
    const issue = await updateIssue(id, body);

    if (!issue) {
      return notFoundResponse('Issue not found');
    }

    return successResponse(issue, 'Issue updated successfully');
  } catch (error) {
    console.error('Error updating issue:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/issues/[id] - Delete issue
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await deleteIssue(id);

    if (!result) {
      return notFoundResponse('Issue not found');
    }

    return successResponse(null, 'Issue deleted successfully');
  } catch (error) {
    console.error('Error deleting issue:', error);
    return serverErrorResponse();
  }
}
