
// Response type for getWisdomResponse
export type WisdomResponse = {
  answer: string;
  isFallback: boolean;
  isNetworkIssue?: boolean;
  isApiKeyIssue?: boolean;
  isDirectApiUsed?: boolean;
  errorDetails?: string;
}
