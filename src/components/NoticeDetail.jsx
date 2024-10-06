import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import './NoticeDetail.css';

const NoticeDetail = () => {
  const { write_number } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await axios.get(`https://whippedb4.hyee34.site/community_detail/${write_number}`);
        setNotice(response.data);
      } catch (error) {
        console.error('Error fetching notice:', error);
      }
    };
    fetchNotice();
  }, [write_number]);

  if (!notice) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="notice-detail-container">
        <div className="notice-detail-content">
          <h2 className="notice-title">{notice[0].write_title}</h2>
          <div className="notice-meta">
            <p>작성자: {notice[0].userid}</p>
            <p>작성일자: {new Date(notice[0].write_date).toLocaleDateString()}</p>
            {/* <p>조회수: {notice[0].view_number}</p> */}
          </div>
          <div className="notice-body">
            <p>{notice[0].content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;