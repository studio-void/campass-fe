import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PostFilesUploadSingleRequest {
  file: File;
  prefix?: string;
}

export interface PostFilesUploadSingleResponse {
  key: string;
  url: string;
}

export const postFilesUploadSingle = async (
  data: PostFilesUploadSingleRequest,
): Promise<PostFilesUploadSingleResponse | undefined> => {
  try {
    const formData = new FormData();
    formData.append('file', data.file);

    const queryParams = new URLSearchParams();
    if (data.prefix) {
      queryParams.append('prefix', data.prefix);
    }

    const url = `/files/upload/single${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await api.post<PostFilesUploadSingleResponse>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Failed to upload file:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to upload file.', {
        description: error.message,
      });
    } else {
      toast.error('Failed to upload file.', {
        description: 'An unknown error occurred.',
      });
    }
  }
};
