export function isNetworkError(error: any): boolean {
  return (
    !navigator.onLine ||
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.name === 'TypeError' ||
    error?.cause?.code === 'ENOTFOUND' ||
    error?.cause?.code === 'ECONNREFUSED'
  );
}

export function getNetworkErrorMessage(error: any): string {
  if (!navigator.onLine) {
    return 'インターネット接続が切断されています。接続を確認してください。';
  }
  
  if (isNetworkError(error)) {
    return 'ネットワークエラーが発生しました。接続を確認してください。';
  }
  
  return 'サーバーとの通信に失敗しました。しばらく後に再試行してください。';
}

export async function retryRequest<T>(
  requestFn: () => Promise<T>, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      if (isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}