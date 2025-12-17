import { describe, it, expect } from 'vitest';
import { generateCommitMessage } from './generator';

// Mock data helper
const createData = (type: string, issue: string = '', msg: string = 'test msg') => ({
  change_type: type,
  issue_number: issue,
  message: msg,
  reviewer1: 'Alice',
  reviewer2: 'Bob'
});

describe('Commit Message Generator', () => {
  
  describe('Standard Prefix Scenarios (e.g. JIRA)', () => {
    const prefix = 'JIRA';
    
    it('should format a Feature with JIRA prefix correctly', () => {
      const data = createData('feat', '101', 'Add login');
      // Expected: feat#JIRA-101; Add login ;Alice;Bob
      expect(generateCommitMessage(data, prefix)).toBe('feat#JIRA-101; Add login ;Alice;Bob');
    });
    
    it('should format a Fix with JIRA prefix correctly', () => {
      const data = createData('fix', '202', 'Fix crash');
      expect(generateCommitMessage(data, prefix)).toBe('fix#JIRA-202; Fix crash ;Alice;Bob');
    });
    
    it('should IGNORE prefix and issue number for Bugs', () => {
      // Even if issue_number is provided in state, logic should drop it
      const data = createData('bug', '999', 'Internal fix');
      expect(generateCommitMessage(data, prefix)).toBe('bug; Internal fix ;Alice;Bob');
    });
  });
  
  describe('Missing / Empty Prefix Scenarios', () => {
    
    it('should format without hyphen if prefix is undefined', () => {
      const data = createData('feat', '123');
      // Expected: feat#123; ... (No JIRA-)
      expect(generateCommitMessage(data, undefined)).toBe('feat#123; test msg ;Alice;Bob');
    });
    
    it('should format without hyphen if prefix is empty string', () => {
      const data = createData('enh', '456');
      expect(generateCommitMessage(data, '')).toBe('enh#456; test msg ;Alice;Bob');
    });
    
    it('should format without hyphen if prefix is only whitespace', () => {
      const data = createData('feat', '789');
      expect(generateCommitMessage(data, '   ')).toBe('feat#789; test msg ;Alice;Bob');
    });
  });
  
  describe('Different Prefix Scenarios', () => {
    
    it('should handle a custom project prefix (e.g. A350)', () => {
      const data = createData('feat', '55');
      const prefix = 'A350';
      expect(generateCommitMessage(data, prefix)).toBe('feat#A350-55; test msg ;Alice;Bob');
    });
    
    it('should handle a long prefix', () => {
      const data = createData('feat', '1');
      const prefix = 'MY-SUPER-COOL-PROJECT';
      expect(generateCommitMessage(data, prefix)).toBe('feat#MY-SUPER-COOL-PROJECT-1; test msg ;Alice;Bob');
    });
  });
  
  describe('Maintenance & Docs (Optional Issue Numbers)', () => {
    const prefix = 'JIRA';
    
    it('should include issue info if provided for maint', () => {
      const data = createData('maint', '888');
      expect(generateCommitMessage(data, prefix)).toBe('maint#JIRA-888; test msg ;Alice;Bob');
    });
    
    it('should look clean if NO issue info provided for maint', () => {
      const data = createData('maint', '');
      // Should look like: maint; test msg ;Alice;Bob
      expect(generateCommitMessage(data, prefix)).toBe('maint; test msg ;Alice;Bob');
    });
  });
  
  describe('Sanitization & Edge Cases', () => {
    
    it('should trim whitespace from inputs', () => {
      const data = {
        change_type: 'feat',
        issue_number: '  123  ', // Extra spaces
        message: '  spaced message  ', // Extra spaces
        reviewer1: 'Alice',
        reviewer2: 'Bob'
      };
      const prefix = 'JIRA';
      
      // Logic should trim these
      expect(generateCommitMessage(data, prefix)).toBe('feat#JIRA-123; spaced message ;Alice;Bob');
    });
  });
});