// Fixed subjects and total marks for each class
export interface SubjectConfig {
  subject: string;
  total_marks: number;
}

export const CLASS_SUBJECTS: Record<string, SubjectConfig[]> = {
  '1st': [
    { subject: 'English', total_marks: 50 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'GK', total_marks: 50 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '2nd': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '3rd': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '4th': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Grammar', total_marks: 50 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '5th': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Grammar', total_marks: 50 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '6th': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Grammar', total_marks: 50 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '7th': [
    { subject: 'English', total_marks: 100 },
    { subject: 'Science', total_marks: 100 },
    { subject: 'Maths', total_marks: 100 },
    { subject: 'Urdu', total_marks: 100 },
    { subject: 'Islamyat', total_marks: 100 },
    { subject: 'Social Studies', total_marks: 100 },
    { subject: 'Grammar', total_marks: 50 },
    { subject: 'Nazira', total_marks: 50 },
  ],
  '8th': [
    { subject: 'English', total_marks: 75 },
    { subject: 'Urdu', total_marks: 75 },
    { subject: 'Maths', total_marks: 75 },
    { subject: 'Physics', total_marks: 75 },
    { subject: 'Biology', total_marks: 75 },
    { subject: 'Chemistry', total_marks: 75 },
    { subject: 'Pakistan Studies', total_marks: 50 },
    { subject: 'Islamyat', total_marks: 50 },
  ],
  '9th': [
    { subject: 'English', total_marks: 75 },
    { subject: 'Urdu', total_marks: 75 },
    { subject: 'Maths', total_marks: 75 },
    { subject: 'Physics', total_marks: 75 },
    { subject: 'Biology', total_marks: 75 },
    { subject: 'Chemistry', total_marks: 75 },
    { subject: 'Pakistan Studies', total_marks: 50 },
    { subject: 'Islamyat', total_marks: 50 },
  ],
};

// Get total marks for a class
export const getClassTotalMarks = (className: string): number => {
  const subjects = CLASS_SUBJECTS[className] || [];
  return subjects.reduce((sum, subject) => sum + subject.total_marks, 0);
};

// Match obtained marks from webhook with fixed total marks
export const mergeSubjectsWithTotalMarks = (
  className: string,
  obtainedMarks: Array<{ subject: string; obtained_marks: number }>
) => {
  const fixedSubjects = CLASS_SUBJECTS[className] || [];

  return fixedSubjects.map((fixedSubject) => {
    const obtained = obtainedMarks.find(
      (om) => om.subject.toLowerCase() === fixedSubject.subject.toLowerCase()
    );

    return {
      subject: fixedSubject.subject,
      total_marks: fixedSubject.total_marks,
      obtained_marks: obtained ? obtained.obtained_marks : 0,
    };
  });
};
