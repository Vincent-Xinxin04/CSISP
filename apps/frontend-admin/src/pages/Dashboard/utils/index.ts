export const getActivityType = (type: string) => {
  const typeMap: Record<string, string> = {
    attendance: 'info',
    homework: 'success',
    notification: 'warning',
    course: 'error',
  };
  return typeMap[type] || 'default';
};

export const formatActivityTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
};
