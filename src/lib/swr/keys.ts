export const swrKeys = {
    conversations: (token: string) => ["/me/conversations", token] as const,
    friends: (token: string) => ["/me/friends", token] as const,
    friendRequests: (token: string) => ["/me/friend_requests", token] as const,

}