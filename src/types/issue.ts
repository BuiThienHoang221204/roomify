import { IssueStatus } from '@/constants/enums';

export interface Issue {
  issue_id: number;
  rental_id: number;
  title: string;
  description: string;
  media_url: string;
  status: IssueStatus;
  created_at: string;
  [key: string]: unknown;
}

export interface CreateIssueDTO {
  rental_id: number;
  title: string;
  description: string;
  media_url?: string;
  [key: string]: unknown;
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  media_url?: string;
  status?: IssueStatus;
  [key: string]: unknown;
}
