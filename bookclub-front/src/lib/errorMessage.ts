import axios from 'axios'

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

export const getErrorMessage = (error: unknown, defaultMessage = 'Failed in operation!'): string => {
    let message = defaultMessage;
    if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data as ApiErrorResponse;

        // Extract message based on your API's response structure
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (typeof responseData === 'object') {
          // Handles cases like { error: "..." } or { message: "..." }
          message = responseData.error ?? responseData.message ?? error.message;
        }
      } else if (error instanceof Error) {
        // Fallback for generic JavaScript errors
        message = error.message;
      }

      return message;
    }