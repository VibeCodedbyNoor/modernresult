import { CLASS_SUBJECTS } from './classSubjects';

// Fixed demo marks for consistent display
const FIXED_MARKS: Record<string, number[]> = {
  '1st': [42, 85, 88, 90, 45, 48],
  '2nd': [88, 92, 85, 90, 95, 88, 48],
  '3rd': [90, 88, 92, 85, 94, 90, 47],
  '4th': [85, 90, 88, 92, 95, 88, 45, 48],
  '5th': [92, 85, 90, 88, 94, 92, 46, 49],
  '6th': [88, 92, 85, 90, 95, 88, 48, 47],
  '7th': [90, 88, 92, 85, 94, 90, 47, 48],
  '8th': [65, 68, 70, 65, 72, 68, 45, 48],
  '9th': [68, 70, 65, 72, 68, 70, 46, 47],
};

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C'];
const POSITIONS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export const generateDemoResult = (studentName: string, selectedClass: string) => {
  const classSubjects = CLASS_SUBJECTS[selectedClass as keyof typeof CLASS_SUBJECTS];
  if (!classSubjects) return null;

  const fixedMarks = FIXED_MARKS[selectedClass] || [];

  // Generate subjects with fixed marks
  const subjects = classSubjects.map((subjectConfig, index) => ({
    subject: subjectConfig.subject,
    obtained_marks: fixedMarks[index] || Math.floor(subjectConfig.total_marks * 0.85),
    total_marks: subjectConfig.total_marks
  }));

  // Calculate totals
  const totalObtained = subjects.reduce((sum, s) => sum + s.obtained_marks, 0);
  const totalMarks = subjects.reduce((sum, s) => sum + s.total_marks, 0);
  const percentageNum = Math.round((totalObtained / totalMarks) * 100);

  // Determine grade based on percentage
  let grade = 'F';
  if (percentageNum >= 90) grade = 'A+';
  else if (percentageNum >= 80) grade = 'A';
  else if (percentageNum >= 70) grade = 'B+';
  else if (percentageNum >= 60) grade = 'B';
  else if (percentageNum >= 50) grade = 'C+';
  else if (percentageNum >= 40) grade = 'C';

  // Determine remarks
  let remarks = 'Keep Working Hard';
  if (percentageNum >= 90) remarks = 'Outstanding Performance';
  else if (percentageNum >= 80) remarks = 'Excellent Performance';
  else if (percentageNum >= 70) remarks = 'Very Good';
  else if (percentageNum >= 60) remarks = 'Good Performance';
  else if (percentageNum >= 50) remarks = 'Satisfactory';

  // Generate a consistent position based on name hash
  const nameHash = studentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const position = POSITIONS[nameHash % 10];

  return {
    name: studentName,
    class: selectedClass,
    position,
    grade,
    percentage: `${percentageNum}%`,
    total_obtained: totalObtained,
    remarks,
    subjects
  };
};
