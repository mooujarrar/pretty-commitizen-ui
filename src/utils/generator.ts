import type { FormData } from '../types';

export const generateCommitMessage = (data: FormData, prefix?: string): string => {
  const { change_type, issue_number, message, reviewer1, reviewer2 } = data;
  
  let result = `${change_type}`;
  
  // Logic: Bug skips this. Others check if issue_number exists.
  if (change_type !== 'bug' && issue_number && issue_number.trim() !== '') {
    result += '#';
      // Add prefix only if it exists and isn't just whitespace
    if (prefix && prefix.trim() !== '') {
      result += `${prefix.trim()}-`;
    }
    
    result += issue_number.trim();
  }
  result += `; ${message.trim()} ;${reviewer1};${reviewer2}`;
  return result;
};