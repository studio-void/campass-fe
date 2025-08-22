import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import { useToken } from '../hooks/use-token'
import { api } from '../lib/api'

export interface DeleteLogoutResponse {
  message: string
  success: boolean
  timestamp: string
}

export const deleteAuthLogout = async (): Promise<
  DeleteLogoutResponse | undefined
> => {
  try {
    const response = await api.post<DeleteLogoutResponse>('/auth/logout')
    useToken.getState().saveToken(null)

    return response.data
  } catch (error) {
    console.error('Failed to get user:', error)

    if (error instanceof Response) {
      toast.error('로그아웃하는 데 실패했습니다.', {
        description: `Status: ${error.statusText || error.status}`,
      })
    } else if (isAxiosError(error)) {
      toast.error('로그아웃하는 데 실패했습니다.', {
        description: error.message,
      })
    } else {
      toast.error('로그아웃하는 데 실패했습니다.', {
        description: '알 수 없는 오류가 발생했습니다.',
      })
    }
  }
}
