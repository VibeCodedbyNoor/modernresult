interface DownloadResultCardProps {
  resultData: any;
  onCapture: (element: HTMLDivElement) => void;
}

const DownloadResultCard = ({ resultData, onCapture }: DownloadResultCardProps) => {
  const studentName = resultData.name || '';
  const className = resultData.class || '';
  const position = resultData.position || '';
  const obtainedTotal = resultData.total_obtained || 0;
  const percentage = resultData.percentage || '0%';
  const grade = resultData.grade || 'F';
  const remarks = resultData.remarks || '';
  const subjects = resultData.subjects || [];
  const totalMarks = subjects.reduce((sum: number, s: any) => sum + s.total_marks, 0);

  return (
    <div
      ref={(el) => el && onCapture(el)}
      className="fixed -left-[9999px] top-0"
      style={{ width: '1200px' }}
    >
      <div
        className="p-8 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '3px solid #00d4ff',
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: '#00d4ff' }}>
          <h2
            className="text-4xl font-bold mb-3"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              background: 'linear-gradient(135deg, #00d4ff, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
            }}
          >
            🦅 Academic Result
          </h2>
          <h3 className="text-2xl mb-2" style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}>
            Student Result Card
          </h3>
          <div className="flex justify-center gap-8 text-lg" style={{ color: '#e0e0e0' }}>
            <p><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Name:</span> {studentName}</p>
            <p><span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Class:</span> {className}</p>
            <p><span style={{ color: '#ec4899', fontWeight: 'bold' }}>Position:</span> {position} 🏆</p>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="mb-6">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #00d4ff' }}>
                <th
                  className="text-left py-3 px-4 text-lg"
                  style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Subject
                </th>
                <th
                  className="text-center py-3 px-4 text-lg"
                  style={{ color: '#a855f7', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Total
                </th>
                <th
                  className="text-center py-3 px-4 text-lg"
                  style={{ color: '#ec4899', fontFamily: 'Orbitron, sans-serif' }}
                >
                  Obtained
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject: any, index: number) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
                  }}
                >
                  <td className="py-2 px-4 font-medium" style={{ color: '#e0e0e0' }}>
                    {subject.subject}
                  </td>
                  <td className="text-center py-2 px-4" style={{ color: '#b0b0b0' }}>
                    {subject.total_marks}
                  </td>
                  <td className="text-center py-2 px-4 font-semibold" style={{ color: '#00d4ff' }}>
                    {subject.obtained_marks}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>
                <td
                  className="py-3 px-4 font-bold text-lg"
                  style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}
                >
                  TOTAL
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#a855f7' }}>
                  {totalMarks}
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#ec4899' }}>
                  {obtainedTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-lg p-4 text-center"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              border: '2px solid #a855f7',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
            }}
          >
            <div className="text-sm mb-1" style={{ color: '#b0b0b0' }}>Percentage ⭐</div>
            <div
              className="text-2xl font-bold"
              style={{ color: '#a855f7', fontFamily: 'Orbitron, sans-serif' }}
            >
              {percentage}
            </div>
          </div>
          <div
            className="rounded-lg p-4 text-center"
            style={{
              background: 'rgba(0, 212, 255, 0.15)',
              border: '2px solid #00d4ff',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            }}
          >
            <div className="text-sm mb-1" style={{ color: '#b0b0b0' }}>Grade ✓</div>
            <div
              className="text-2xl font-bold"
              style={{ color: '#00d4ff', fontFamily: 'Orbitron, sans-serif' }}
            >
              {grade}
            </div>
          </div>
          <div
            className="rounded-lg p-4 text-center"
            style={{
              background: 'rgba(236, 72, 153, 0.15)',
              border: '2px solid #ec4899',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
            }}
          >
            <div className="text-sm mb-1" style={{ color: '#b0b0b0' }}>Remarks ✨</div>
            <div
              className="text-xl font-bold"
              style={{ color: '#ec4899', fontFamily: 'Orbitron, sans-serif' }}
            >
              {remarks}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t-2" style={{ borderColor: '#00d4ff' }}>
          <p
            className="text-base"
            style={{
              color: '#00d4ff',
              fontFamily: 'Orbitron, sans-serif',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            }}
          >
            Generated by ResultPortal
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadResultCard;