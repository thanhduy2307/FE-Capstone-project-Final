import React, { useState } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import { showSuccess } from '../../utils/alert.js';
import './lecturer-reviews.css';

const LecturerReviews = () => {
  const checklistItems = [
    { id: 1, name: "Tên đề tài phản ánh đúng định hướng", description: "Tên đề tài (project title) có phản ánh được định hướng thực hiện nghiên cứu và phát triển sản phẩm của nhóm SV?" },
    { id: 2, name: "Ngữ cảnh sản phẩm (Product Context)", description: "Ngữ cảnh (context) nơi sản phẩm được triển khai có được xác định cụ thể?" },
    { id: 3, name: "Problem Statement", description: "Mô tả rõ ràng là động lực cho việc ra đời của sản phẩm?" },
    { id: 4, name: "Main Actors", description: "Người dùng chính (main actors) có được xác định trong đề tài?" },
    { id: 5, name: "Main Flows", description: "Các luồng xử lý chính (main flows) và các chức năng chính (main usecases) của người dùng có được mô tả?" },
    { id: 6, name: "Customers / Sponsors", description: "Khách hàng/người tài trợ (customers/sponsors) của đề tài có được xác định?" },
    { id: 7, name: "Approach / Applied Technology", description: "Hướng tiếp cận (Approach), công nghệ áp dụng (applied technology) và các sản phẩm tạo ra (main deliverables) có được xác định và phù hợp?" },
    { id: 8, name: "Scope phù hợp", description: "Phạm vi đề tài (Scope) và độ lớn sản phẩm có khả thi và phù hợp cho nhóm (3-5) sv thực hiện trong 14 tuần? Có phân chia thành các gói packages để đánh giá?" },
    { id: 9, name: "Complexity phù hợp Capstone", description: "Độ phức tạp và tính kỹ thuật (Complexity/technicality) có đủ phù hợp với yêu cầu năng lực của 1 đề tài Capstone project?" },
    { id: 10, name: "Applicability & Feasibility", description: "Đề tài định hướng đến việc giải quyết các vấn đề thực tế (Applicability) và khả thi về mặt công nghệ (technologically feasible) trong giới hạn thời gian?" }
  ];

  // Mock assigned topics
  const assignedTheses = [
    { code: 'DT2024001', title: 'Phát triển ứng dụng AI cho giao thông' },
    { code: 'DT2024002', title: 'Quản lý kho hàng với ERP' },
    { code: 'DT2024003', title: 'Hệ thống đánh giá tự động đa ngôn ngữ' }
  ];

  // State to hold evaluations for each thesis
  // evaluations[thesisCode] = { scores: { questionId: 1|0|-1 }, result: 'Pass'|'Consider'|'Not Pass', comment: '' }
  const [evaluations, setEvaluations] = useState(() => {
    const initialState = {};
    assignedTheses.forEach(thesis => {
      initialState[thesis.code] = {
        scores: {},
        result: null,
        comment: ''
      };
    });
    return initialState;
  });

  const handleScoreChange = (thesisCode, questionId, score) => {
    setEvaluations(prev => ({
      ...prev,
      [thesisCode]: {
        ...prev[thesisCode],
        scores: {
          ...prev[thesisCode].scores,
          [questionId]: score
        }
      }
    }));
  };

  const handleResultChange = (thesisCode, result) => {
    setEvaluations(prev => ({
      ...prev,
      [thesisCode]: {
        ...prev[thesisCode],
        result
      }
    }));
  };

  const handleCommentChange = (thesisCode, comment) => {
    setEvaluations(prev => ({
      ...prev,
      [thesisCode]: {
        ...prev[thesisCode],
        comment
      }
    }));
  };

  const handleSaveAll = () => {
    console.log('Saved Evaluations:', evaluations);
    showSuccess('Đã lưu thành công tất cả đánh giá!');
  };

  return (
    <div className="lecturer-reviews">
      <div className="page-header">
        <div>
          <h1>Đánh Giá Phản Biện Hội Đồng</h1>
          <p className="page-subtitle">Bảng chấm điểm (Checklist) cho các đề tài được phân công</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={handleSaveAll}>Lưu Đánh Giá</Button>
        </div>
      </div>

      <Card>
        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="col-no">No</th>
                <th className="col-question">Question</th>
                {assignedTheses.map(thesis => (
                  <th key={thesis.code} className="col-thesis">
                    <div className="thesis-header-code">{thesis.code}</div>
                    <div className="thesis-header-title" title={thesis.title}>{thesis.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rows 1 to 10: Checklist */}
              {checklistItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center"><b>{index + 1}</b></td>
                  <td className="question-cell">
                    <div className="question-name">{item.name}</div>
                    <div className="question-desc">{item.description}</div>
                  </td>
                  {assignedTheses.map(thesis => {
                    const currentScore = evaluations[thesis.code]?.scores[item.id];
                    return (
                      <td key={`${thesis.code}-${item.id}`} className="score-cell">
                        <div className="matrix-scoring-options">
                          <button 
                            className={`matrix-score-btn pass ${currentScore === 1 ? 'selected' : ''}`}
                            onClick={() => handleScoreChange(thesis.code, item.id, 1)}
                            title="Pass"
                          >X</button>
                          <button 
                            className={`matrix-score-btn consider ${currentScore === 0 ? 'selected' : ''}`}
                            onClick={() => handleScoreChange(thesis.code, item.id, 0)}
                            title="Consider"
                          >O</button>
                          <button 
                            className={`matrix-score-btn not-pass ${currentScore === -1 ? 'selected' : ''}`}
                            onClick={() => handleScoreChange(thesis.code, item.id, -1)}
                            title="Not Pass"
                          >N/A</button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Row 11: Final Result */}
              <tr className="result-row">
                <td className="text-center"><b>11</b></td>
                <td><b>Kết quả đánh giá</b></td>
                {assignedTheses.map(thesis => {
                  const currentResult = evaluations[thesis.code]?.result;
                  return (
                    <td key={`result-${thesis.code}`} className="result-cell">
                      <select 
                        className={`result-dropdown ${currentResult === 'Pass' ? 'success' : currentResult === 'Not Pass' ? 'error' : currentResult === 'Consider' ? 'warning' : ''}`}
                        value={currentResult || ''}
                        onChange={(e) => handleResultChange(thesis.code, e.target.value)}
                      >
                        <option value="" disabled>-- Chọn --</option>
                        <option value="Pass">Pass</option>
                        <option value="Consider">Consider</option>
                        <option value="Not Pass">Not Pass</option>
                      </select>
                    </td>
                  );
                })}
              </tr>

              {/* Row 12: Comments */}
              <tr className="comment-row">
                <td className="text-center"><b>12</b></td>
                <td><b>Nhận xét/đánh giá</b></td>
                {assignedTheses.map(thesis => (
                  <td key={`comment-${thesis.code}`} className="comment-cell">
                    <textarea 
                      className="matrix-comment-input"
                      placeholder="Nhập nhận xét..."
                      value={evaluations[thesis.code]?.comment || ''}
                      onChange={(e) => handleCommentChange(thesis.code, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LecturerReviews;

