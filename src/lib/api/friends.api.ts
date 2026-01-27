"use client";

import { apiFetch } from "@/lib/api/apiFetch";

export type FriendRequest = {
  sender_id: number;
  created_at: string;
};

export type FriendRequestsResponse = {
  status_code: number;
  friend_requests_ids: FriendRequest[];
};

export type BatchUsersResponse = {
  status_code: number;
  users: Array<{
    user_id: number;
    username: string;
    mail: string;
    date_of_birth: string;
    avatar_id: string | null;
  }>;
};

export type AcceptFriendRequestResponse = {
  status_code: number;
  message: string;
  user_id: number;
  sender_id: number;
};

export type RejectFriendRequestResponse = {
  status_code: number;
  message: string;
  user_id: number;
  sender_id: number;
};

export async function getFriendRequests(token: string) {
  return apiFetch("/me/friend_requests", {
    method: "GET",
    token,
  }) as Promise<FriendRequestsResponse>;
}

export async function batchUsers(token: string, userIds: number[]) {
  return apiFetch("/user/batch", {
    method: "POST",
    token,
    body: { user_id: userIds },
  }) as Promise<BatchUsersResponse>;
}

export async function acceptFriendRequest(token: string, senderId: number) {
  return apiFetch("/me/accept_friend_request", {
    method: "POST",
    token,
    body: { sender_id: senderId },
  }) as Promise<AcceptFriendRequestResponse>;
}

export async function rejectFriendRequest(token: string, senderId: number) {
  return apiFetch("/me/reject_friend_request", {
    method: "POST",
    token,
    body: { sender_id: senderId },
  }) as Promise<RejectFriendRequestResponse>;
}
