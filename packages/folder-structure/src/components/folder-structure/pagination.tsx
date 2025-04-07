// src/components/FolderStructure/Pagination.tsx
import React from "react";
import { useDispatch } from "react-redux";
import styled from "@emotion/styled";
// import { setCurrentPage } from "../../store/slices/folderSlice";
import { setCurrentPage } from "../../store/slices/folder-slice";

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #eee;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  padding: 8px 12px;
  margin: 0 4px;
  background-color: ${(props) => (props.isActive ? "#1890ff" : "#f0f0f0")};
  color: ${(props) => (props.isActive ? "white" : "black")};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.isActive ? "#1890ff" : "#d9d9d9")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  previousPages?: number;
  nextPages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  previousPages = 2,
  nextPages = 2,
}) => {
  const dispatch = useDispatch();

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    // Previous pages
    for (
      let i = Math.max(1, currentPage - previousPages);
      i < currentPage;
      i++
    ) {
      pages.push(i);
    }

    // Current page
    pages.push(currentPage);

    // Next pages
    for (
      let i = currentPage + 1;
      i <= Math.min(totalPages, currentPage + nextPages);
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <PaginationContainer>
      <PageButton
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        First
      </PageButton>

      <PageButton
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Prev
      </PageButton>

      {getPageNumbers().map((page) => (
        <PageButton
          key={page}
          isActive={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </PageButton>
      ))}

      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </PageButton>

      <PageButton
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
      >
        Last
      </PageButton>
    </PaginationContainer>
  );
};
