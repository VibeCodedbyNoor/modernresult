export interface PortalProps {
  isDemo?: boolean;
  schoolName?: string;
  logoUrl?: string | null;
  onSearch?: (params: SearchParams) => Promise<any>;
  searchFields?: string[];
  demoResult?: any;
}

export interface SearchParams {
  rollNumber?: string;
  studentName?: string;
  fatherName?: string;
  className?: string;
}

export const SEARCH_FIELD_LABELS: Record<string, string> = {
  roll_number: 'Roll Number',
  student_name: 'Student Name',
  father_name: 'Father Name',
};

export const SEARCH_FIELD_PLACEHOLDERS: Record<string, string> = {
  roll_number: 'Enter roll number',
  student_name: 'Enter student name',
  father_name: 'Enter father name',
};
