import React from "react";
import "./VerticalAdBanner.css";

export const VerticalAdBanner = () => {
  const originalImages = [
    "https://images.pexels.com/photos/15486347/pexels-photo-15486347.jpeg",
    "https://images.pexels.com/photos/27953851/pexels-photo-27953851.jpeg",
    "https://images.pexels.com/photos/12737797/pexels-photo-12737797.jpeg",
    "https://images.pexels.com/photos/17321123/pexels-photo-17321123.jpeg",
  ];

  // Nhân đôi mảng hình ảnh để tạo cảm giác lặp vô tận (Infinite Scroll)
  const adImages = [...originalImages, ...originalImages];

  return (
    <div className="vertical-ad-container">
      <div className="ad-badge">Tài trợ</div>

      <div className="marquee-track">
        <div className="marquee-content">
          {adImages.map((src, index) => (
            <div key={index} className="ad-card">
              <img
                src={src}
                alt={`Quảng cáo món ngon ${index}`}
                className="ad-image"
              />
              <div className="ad-overlay">
                <span className="ad-text">Khám phá ngay</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
