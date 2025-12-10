// Cấu hình SSL cho development
export const SSL_CONFIG = {
  // Bỏ qua SSL verification trong development
  ignoreSSL: import.meta.env.DEV,
  
  // Các domain được phép bỏ qua SSL
  allowedDomains: [
    'localhost',
    '127.0.0.1', 
    '10.0.2.2',
    'your-server-domain.com' // Thay bằng domain thực của bạn
  ],
  
  // Cấu hình cho axios
  axiosConfig: {
    httpsAgent: import.meta.env.DEV ? {
      rejectUnauthorized: false
    } : undefined
  }
};

// Hàm kiểm tra domain có được phép bỏ qua SSL không
export const isAllowedDomain = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname;
    return SSL_CONFIG.allowedDomains.some(allowed => 
      domain === allowed || domain.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}; 