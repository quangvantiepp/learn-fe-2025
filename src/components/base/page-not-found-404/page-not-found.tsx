import React from "react";
import styled from "@emotion/styled";
import page404 from "../../../assets/images/404-page-not-found.svg";

// Container chính
const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
  font-family: "Arial", sans-serif;
`;

// Container cho ảnh để kiểm soát kích thước và cắt ảnh
const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 32px;
  overflow: hidden;
  position: relative;
`;

// Styling cho ảnh bên trong container
const ErrorImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const ErrorTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
`;

const GoBackButton = styled.button`
  background-color: #0066ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0052cc;
  }
`;

const NotFoundPage: React.FC = () => {
  const handleGoBack = () => {
    // Go back to the previous page in history
    window.history.back();
  };

  return (
    <NotFoundContainer>
      <ImageContainer>
        <ErrorImage src={page404} alt="404 Error Illustration" />
      </ImageContainer>
      <ErrorTitle>Something gone wrong!</ErrorTitle>
      <ErrorMessage>The page you were looking for doesn't exist</ErrorMessage>
      <GoBackButton onClick={handleGoBack}>Go Back</GoBackButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
